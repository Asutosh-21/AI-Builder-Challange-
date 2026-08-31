"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface TelemetryTick {
  timestamp: string;
  orbit_number: number;
  battery_voltage: number;
  solar_panel_temp: number;
  attitude_error: number;
  fuel_pressure: number;
  cpu_temp: number;
  comm_signal_strength: number;
  anomaly_injected?: string | null;
}

export interface TelemetryStreamState {
  ticks: TelemetryTick[];
  latest: TelemetryTick | null;
  connected: boolean;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_TICKS = 120; // 2-minute rolling window at 1 Hz

function makeFallbackTick(prev?: TelemetryTick): TelemetryTick {
  const base = prev ?? {
    timestamp: new Date().toISOString(),
    orbit_number: 14,
    battery_voltage: 26.2,
    solar_panel_temp: 28,
    attitude_error: 0.12,
    fuel_pressure: 211,
    cpu_temp: 42,
    comm_signal_strength: -74,
  };
  const jitter = (range: number) => (Math.random() - 0.5) * range;
  return {
    timestamp: new Date().toISOString(),
    orbit_number: base.orbit_number,
    battery_voltage:       Math.max(15, Math.min(32, base.battery_voltage + jitter(0.3))),
    solar_panel_temp:      Math.max(-30, Math.min(85, base.solar_panel_temp + jitter(1.5))),
    attitude_error:        Math.max(0, Math.min(5, base.attitude_error + jitter(0.06))),
    fuel_pressure:         Math.max(150, Math.min(240, base.fuel_pressure + jitter(1))),
    cpu_temp:              Math.max(20, Math.min(80, base.cpu_temp + jitter(0.8))),
    comm_signal_strength:  Math.max(-120, Math.min(-50, base.comm_signal_strength + jitter(2))),
    anomaly_injected: null,
  };
}

export function useTelemetryStream(): TelemetryStreamState {
  const [ticks, setTicks] = useState<TelemetryTick[]>([]);
  const [latest, setLatest] = useState<TelemetryTick | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestRef = useRef<TelemetryTick | null>(null);

  const appendTick = useCallback((tick: TelemetryTick) => {
    latestRef.current = tick;
    setLatest(tick);
    setTicks((prev) => {
      const next = [...prev, tick];
      return next.length > MAX_TICKS ? next.slice(next.length - MAX_TICKS) : next;
    });
  }, []);

  const startFallback = useCallback(() => {
    if (fallbackRef.current) return;
    fallbackRef.current = setInterval(() => {
      appendTick(makeFallbackTick(latestRef.current ?? undefined));
    }, 1000);
  }, [appendTick]);

  const stopFallback = useCallback(() => {
    if (fallbackRef.current) {
      clearInterval(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(`${API_URL}/api/telemetry/stream`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
        setError(null);
        stopFallback();
      };

      es.onmessage = (event) => {
        try {
          const tick: TelemetryTick = JSON.parse(event.data);
          appendTick(tick);
        } catch {
          // malformed tick — ignore
        }
      };

      es.onerror = () => {
        setConnected(false);
        setError("Telemetry stream unavailable — using simulated data");
        es.close();
        startFallback();
        // Retry connection every 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    // Seed with simulated data while connecting
    startFallback();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSourceRef.current?.close();
      stopFallback();
    };
  }, [appendTick, startFallback, stopFallback]);

  return { ticks, latest, connected, error };
}
