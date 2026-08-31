"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useTelemetryStream, TelemetryTick } from "@/lib/hooks/useTelemetryStream";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { StatusIndicator } from "@/components/enterprise/StatusIndicator";
import {
  Battery,
  Thermometer,
  Compass,
  Fuel,
  Radio,
  Cpu,
  Activity,
  RotateCcw,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChannelConfig {
  key: keyof TelemetryTick;
  label: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  warnLow?: number;
  warnHigh?: number;
  critLow?: number;
  critHigh?: number;
}

const CHANNELS: ChannelConfig[] = [
  { key: "battery_voltage",       label: "Battery Voltage",    unit: "V",    color: "#00d4ff", icon: <Battery    className="h-3.5 w-3.5" />, min: 15, max: 32,  warnLow: 24,  critLow: 20  },
  { key: "solar_panel_temp",      label: "Solar Array Temp",   unit: "°C",   color: "#f59e0b", icon: <Thermometer className="h-3.5 w-3.5" />, min: -30, max: 90, warnHigh: 60, critHigh: 80 },
  { key: "attitude_error",        label: "Attitude Error",     unit: "deg",  color: "#a78bfa", icon: <Compass    className="h-3.5 w-3.5" />, min: 0, max: 6,   warnHigh: 1,  critHigh: 2  },
  { key: "fuel_pressure",         label: "Fuel Pressure",      unit: "kPa",  color: "#34d399", icon: <Fuel       className="h-3.5 w-3.5" />, min: 140, max: 250, warnLow: 190, critLow: 175 },
  { key: "cpu_temp",              label: "CPU Temperature",    unit: "°C",   color: "#fb923c", icon: <Cpu        className="h-3.5 w-3.5" />, min: 20, max: 85,  warnHigh: 58, critHigh: 68 },
  { key: "comm_signal_strength",  label: "Comm Signal Strength", unit: "dBm", color: "#38bdf8", icon: <Radio     className="h-3.5 w-3.5" />, min: -125, max: -45, warnLow: -90, critLow: -100 },
];

function getChannelStatus(val: number, ch: ChannelConfig): "nominal" | "warning" | "critical" {
  if ((ch.critLow !== undefined && val < ch.critLow) || (ch.critHigh !== undefined && val > ch.critHigh)) return "critical";
  if ((ch.warnLow !== undefined && val < ch.warnLow) || (ch.warnHigh !== undefined && val > ch.warnHigh)) return "warning";
  return "nominal";
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-[#0d1a36]/95 border border-sky-800/60 px-3 py-2 text-xs font-mono shadow-2xl">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="text-white font-bold">{payload[0]?.value?.toFixed(3)} {unit}</div>
    </div>
  );
};

export default function TelemetryPage() {
  const { ticks, latest, connected } = useTelemetryStream();

  const chartData = useMemo(
    () =>
      ticks.slice(-60).map((t) => ({
        ...t,
        time: format(new Date(t.timestamp), "HH:mm:ss"),
      })),
    [ticks]
  );

  function injectAnomaly(type: string) {
    fetch(`${API_URL}/api/telemetry/inject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomaly_type: type }),
    }).catch(() => {});
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white font-display">Live Telemetry</h1>
            <StatusIndicator status={connected ? "nominal" : "warning"} size="sm"
              label={connected ? "Stream Active" : "Demo Mode"} />
          </div>
          <p className="text-sm text-slate-400">
            APEX-7 · 6 channels · 1 Hz · {chartData.length} data points loaded
          </p>
        </div>

        {/* Demo injection */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">Simulate:</span>
          {[
            { label: "Voltage Drop", t: "voltage_drop" },
            { label: "Thermal Spike", t: "thermal_spike" },
            { label: "Attitude Drift", t: "attitude_drift" },
            { label: "Fuel Leak", t: "fuel_leak" },
            { label: "Comm Loss", t: "comm_loss" },
          ].map((b) => (
            <button
              key={b.t}
              onClick={() => injectAnomaly(b.t)}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-[#091124] border border-sky-800/50 text-slate-400 hover:border-amber-500/40 hover:text-amber-300 transition-all font-medium"
            >
              {b.label}
            </button>
          ))}
          <button
            onClick={() => fetch(`${API_URL}/api/telemetry/clear`, { method: "POST" }).catch(() => {})}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/60 transition-all font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Latest values strip */}
      {latest && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {CHANNELS.map((ch) => {
            const val = latest[ch.key] as number;
            const status = getChannelStatus(val, ch);
            return (
              <div
                key={ch.key}
                className={`rounded-xl border p-3 text-center ${
                  status === "critical"
                    ? "bg-rose-950/30 border-rose-500/40"
                    : status === "warning"
                    ? "bg-amber-950/30 border-amber-500/40"
                    : "bg-[#091124]/80 border-sky-900/40"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1.5" style={{ color: ch.color }}>
                  {ch.icon}
                </div>
                <div className="text-[10px] text-slate-400 mb-0.5 truncate">{ch.label}</div>
                <div className={`text-sm font-bold font-mono ${
                  status === "critical" ? "text-rose-400" : status === "warning" ? "text-amber-400" : "text-white"
                }`}>
                  {val.toFixed(2)}<span className="text-[10px] text-slate-500 ml-0.5">{ch.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts 2×3 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHANNELS.map((ch) => {
          const latestVal = latest ? (latest[ch.key] as number) : null;
          const status = latestVal !== null ? getChannelStatus(latestVal, ch) : "nominal";
          return (
            <Card key={ch.key} variant={status === "critical" ? "critical" : status === "warning" ? "warning" : "default"}>
              <CardHeader className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: ch.color }}>{ch.icon}</span>
                  <span className="text-xs font-bold text-white">{ch.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {status !== "nominal" && (
                    <Badge
                      variant={status === "critical" ? "danger" : "warning"}
                      size="sm"
                    >
                      {status.toUpperCase()}
                    </Badge>
                  )}
                  <span className="text-sm font-bold font-mono text-white">
                    {latestVal?.toFixed(2) ?? "—"}
                    <span className="text-[10px] text-slate-400 ml-0.5">{ch.unit}</span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 px-3">
                {/* Fixed-height wrapper prevents ResponsiveContainer collapse */}
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 6, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,138,0.3)" />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "#475569", fontSize: 9, fontFamily: "DM Mono, monospace" }}
                        tickLine={false}
                        interval={Math.floor(chartData.length / 5)}
                      />
                      <YAxis
                        domain={[ch.min, ch.max]}
                        tick={{ fill: "#475569", fontSize: 9, fontFamily: "DM Mono, monospace" }}
                        tickLine={false}
                        axisLine={false}
                        width={42}
                      />
                      <Tooltip content={<CustomTooltip unit={ch.unit} />} />
                      {ch.warnHigh !== undefined && (
                        <ReferenceLine y={ch.warnHigh} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.7} />
                      )}
                      {ch.critHigh !== undefined && (
                        <ReferenceLine y={ch.critHigh} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.9} />
                      )}
                      {ch.warnLow !== undefined && (
                        <ReferenceLine y={ch.warnLow} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.7} />
                      )}
                      {ch.critLow !== undefined && (
                        <ReferenceLine y={ch.critLow} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.9} />
                      )}
                      <Line
                        type="monotone"
                        dataKey={ch.key as string}
                        stroke={ch.color}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
