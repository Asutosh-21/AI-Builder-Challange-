"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTelemetryStream } from "@/lib/hooks/useTelemetryStream";
import { useAnomalies } from "@/lib/hooks/useAnomalies";
import { KpiCard } from "@/components/enterprise/KpiCard";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { StatusIndicator } from "@/components/enterprise/StatusIndicator";
import { Skeleton, SkeletonCard } from "@/components/enterprise/Skeleton";
import { KpiMetricsStrip } from "@/components/dashboard/KpiMetricsStrip";
import { AiInsightsCard } from "@/components/dashboard/AiInsightsCard";
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import { LiveSatellitesTable } from "@/components/dashboard/LiveSatellitesTable";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { OrbitGlobeCanvas } from "@/components/3d/OrbitGlobeCanvas";
import {
  Activity,
  Battery,
  Thermometer,
  Compass,
  Fuel,
  Radio,
  Cpu,
  AlertTriangle,
  ShieldCheck,
  Orbit,
  Zap,
  Clock,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function injectAnomaly(type: string) {
  fetch(`${API_URL}/api/telemetry/inject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anomaly_type: type }),
  }).catch(() => {});
}

function clearAnomalies() {
  fetch(`${API_URL}/api/telemetry/clear`, { method: "POST" }).catch(() => {});
}

export default function DashboardPage() {
  const { latest, connected } = useTelemetryStream();
  const { anomalies } = useAnomalies(3000);

  const activeCount = anomalies.filter((a) => a.status === "active").length;
  const criticalCount = anomalies.filter((a) => a.status === "active" && a.severity === "CRITICAL").length;
  const missionStatus = criticalCount > 0 ? "critical" : activeCount > 0 ? "warning" : "nominal";

  type KpiStatus = "normal" | "warning" | "critical";
  type KpiTrend = "up" | "down" | "neutral";

  const kpis = useMemo(() => {
    if (!latest) return null;
    const s = (val: boolean, val2: boolean): KpiStatus => val ? "critical" : val2 ? "warning" : "normal";
    const t = (up: boolean, down: boolean): KpiTrend => up ? "up" : down ? "down" : "neutral";
    return [
      {
        title: "Battery Voltage",
        value: latest.battery_voltage.toFixed(1),
        unit: "V",
        icon: <Battery className="h-4 w-4" />,
        status: s(latest.battery_voltage < 22, latest.battery_voltage < 24),
        trend: t(false, latest.battery_voltage < 25),
        trendValue: `${latest.battery_voltage.toFixed(1)}V`,
      },
      {
        title: "Solar Array Temp",
        value: latest.solar_panel_temp.toFixed(0),
        unit: "°C",
        icon: <Thermometer className="h-4 w-4" />,
        status: s(latest.solar_panel_temp > 75, latest.solar_panel_temp > 60),
        trend: t(latest.solar_panel_temp > 60, false),
        trendValue: `${latest.solar_panel_temp.toFixed(0)}°C`,
      },
      {
        title: "Attitude Error",
        value: latest.attitude_error.toFixed(3),
        unit: "deg",
        icon: <Compass className="h-4 w-4" />,
        status: s(latest.attitude_error > 2, latest.attitude_error > 1),
        trend: t(latest.attitude_error > 0.5, false),
        trendValue: `±${latest.attitude_error.toFixed(3)}°`,
      },
      {
        title: "Fuel Pressure",
        value: latest.fuel_pressure.toFixed(0),
        unit: "kPa",
        icon: <Fuel className="h-4 w-4" />,
        status: s(latest.fuel_pressure < 175, latest.fuel_pressure < 190),
        trend: t(false, latest.fuel_pressure < 200),
        trendValue: `${latest.fuel_pressure.toFixed(0)} kPa`,
      },
      {
        title: "CPU Temp",
        value: latest.cpu_temp.toFixed(0),
        unit: "°C",
        icon: <Cpu className="h-4 w-4" />,
        status: s(latest.cpu_temp > 68, latest.cpu_temp > 58),
        trend: t(latest.cpu_temp > 50, false),
        trendValue: `${latest.cpu_temp.toFixed(0)}°C`,
      },
      {
        title: "Comm Signal",
        value: latest.comm_signal_strength.toFixed(0),
        unit: "dBm",
        icon: <Radio className="h-4 w-4" />,
        status: s(latest.comm_signal_strength < -100, latest.comm_signal_strength < -90),
        trend: t(false, latest.comm_signal_strength < -85),
        trendValue: `${latest.comm_signal_strength.toFixed(0)} dBm`,
      },
    ];
  }, [latest]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ── Mission Status Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white font-display">Mission Control</h1>
            <StatusIndicator status={missionStatus} size="sm" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sky-950/50 border border-sky-800/40 text-[10px] font-mono text-slate-400">
              <Clock className="h-3 w-3 text-cyan-400" />
              <span>{latest ? format(new Date(latest.timestamp), "HH:mm:ss") : "—"} UTC</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sky-950/50 border border-sky-800/40 text-[10px] font-mono text-slate-400">
              <Orbit className="h-3 w-3 text-emerald-400" />
              <span>Orbit #{latest?.orbit_number ?? "—"}</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            APEX-7 · LEO 550 km · {connected ? (
              <span className="text-emerald-400">Stream Active ✓</span>
            ) : (
              <span className="text-amber-400">Demo Mode</span>
            )}
          </p>
        </div>

        {/* Demo Anomaly Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mr-1">Demo:</span>
          {[
            { label: "⚡ Voltage", type: "voltage_drop" },
            { label: "🌡 Thermal", type: "thermal_spike" },
            { label: "🎯 Attitude", type: "attitude_drift" },
            { label: "💧 Fuel Leak", type: "fuel_leak" },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => injectAnomaly(btn.type)}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#091124] border border-sky-800/50 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-all"
            >
              {btn.label}
            </button>
          ))}
          <button
            onClick={clearAnomalies}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/60 transition-all"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>

      {/* ── 6 KPI Cards ── */}
      {kpis ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <KpiCard
                title={kpi.title}
                value={kpi.value}
                unit={kpi.unit}
                icon={kpi.icon}
                status={kpi.status}
                trend={kpi.trend}
                trendValue={kpi.trendValue}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Anomaly Summary ── */}
      {activeCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 ${
            criticalCount > 0
              ? "bg-rose-950/30 border-rose-500/40"
              : "bg-amber-950/30 border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${criticalCount > 0 ? "text-rose-400 blink-critical" : "text-amber-400"}`} />
              <div>
                <div className="text-sm font-bold text-white">
                  {criticalCount > 0 ? `${criticalCount} Critical Anomaly` : `${activeCount} Active Warning`}
                  {activeCount > 1 ? "s" : ""} Detected
                </div>
                <div className="text-xs text-slate-400">
                  {anomalies.filter((a) => a.status === "active" && a.affected_channels.length > 0)
                    .slice(0, 1)
                    .map((a) => `Affected: ${a.affected_channels.join(", ")}`)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {anomalies.filter((a) => a.status === "active").slice(0, 3).map((a) => (
                <Badge key={a.id} variant={a.severity === "CRITICAL" ? "danger" : "warning"} size="sm">
                  {a.severity}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Fleet KPI Strip ── */}
      <KpiMetricsStrip anomaliesCount={activeCount} />

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 3D Globe */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Orbit className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Space Situational Awareness</span>
                </div>
                <Badge variant="info" size="sm">Live Tracking</Badge>
              </div>
            </CardHeader>
            {/* height + position:relative = the anchor the canvas needs */}
            <div style={{ height: 340, position: "relative" }}>
              <OrbitGlobeCanvas />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <AiInsightsCard />
        </div>
      </div>

      {/* ── Tables Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <LiveSatellitesTable />
        </div>
        <div className="space-y-5">
          <RecentAlertsTable />
        </div>
      </div>

      {/* ── Upcoming Events ── */}
      <UpcomingEventsCard />
    </div>
  );
}
