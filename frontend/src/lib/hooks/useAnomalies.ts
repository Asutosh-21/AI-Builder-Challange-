"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface AnomalyEvent {
  id: string;
  detected_at: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  affected_channels: string[];
  channel_values: Record<string, number>;
  anomaly_score: number;
  trigger_type: string;
  status: "active" | "resolved";
  granite_explanation: string | null;
  mission_plan: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SEED_ANOMALIES: AnomalyEvent[] = [
  {
    id: "demo-001",
    detected_at: new Date(Date.now() - 120_000).toISOString(),
    severity: "CRITICAL",
    affected_channels: ["battery_voltage", "cpu_temp"],
    channel_values: {
      battery_voltage: 19.4,
      solar_panel_temp: 32.1,
      attitude_error: 0.22,
      fuel_pressure: 208.0,
      cpu_temp: 72.5,
      comm_signal_strength: -78.0,
    },
    anomaly_score: -0.42,
    trigger_type: "rule",
    status: "active",
    granite_explanation:
      "The battery bus voltage has dropped to 19.4 V — below the critical 20 V hard limit — while CPU temperature has risen to 72.5°C, approaching the 70°C threshold. This pattern is consistent with a power subsystem overload or degraded solar array output, possibly caused by a partial eclipse or cell degradation. The concurrent CPU thermal rise suggests higher-than-normal computational load, possibly a fault loop. Confidence: medium-high.",
    mission_plan:
      "Immediate Action: Enter safe mode to reduce power draw.\n1. Command SAFE_MODE to cut non-essential subsystems.\n2. Evaluate solar panel orientation — verify pointing angle within 5° of sun vector.\n3. Throttle onboard CPU processes — disable non-critical background tasks.\n4. Monitor battery voltage recovery trend over next 30 minutes.\n5. If voltage does not recover above 22 V within 30 minutes, initiate emergency battery charge protocol.\n\nEstimated fuel cost: 0.0% (no maneuver required).\nRisk if not addressed: HIGH — risk of permanent battery damage and loss of spacecraft control.",
  },
  {
    id: "demo-002",
    detected_at: new Date(Date.now() - 60_000).toISOString(),
    severity: "WARNING",
    affected_channels: ["comm_signal_strength"],
    channel_values: {
      battery_voltage: 26.1,
      solar_panel_temp: 29.8,
      attitude_error: 0.15,
      fuel_pressure: 212.0,
      cpu_temp: 44.0,
      comm_signal_strength: -97.5,
    },
    anomaly_score: -0.18,
    trigger_type: "ml",
    status: "active",
    granite_explanation:
      "Communication signal strength has degraded to -97.5 dBm, significantly below the nominal -65 to -85 dBm range and approaching the -100 dBm critical threshold. This is consistent with antenna misalignment, ground station handover gap, or atmospheric interference. Other telemetry channels remain nominal. Confidence: medium.",
    mission_plan: null,
  },
];

export function useAnomalies(pollInterval = 3000) {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(SEED_ANOMALIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchAnomalies = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/anomalies`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AnomalyEvent[] = await res.json();
      if (mountedRef.current) {
        setAnomalies(data.length > 0 ? data : SEED_ANOMALIES);
        setError(null);
      }
    } catch {
      // Backend unavailable — keep seed data, set soft error
      if (mountedRef.current) {
        setError("Backend unavailable — showing demo data");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, pollInterval);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchAnomalies, pollInterval]);

  const resolveAnomaly = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/api/anomalies/${id}/resolve`, { method: "POST" });
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
      );
    } catch {
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
      );
    }
  }, []);

  return { anomalies, loading, error, refetch: fetchAnomalies, resolveAnomaly };
}
