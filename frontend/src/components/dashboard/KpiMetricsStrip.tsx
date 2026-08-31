"use client";

import { motion } from "framer-motion";
import {
  Satellite,
  AlertTriangle,
  Globe2,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";

interface KpiMetricsStripProps {
  activeSatellitesCount?: number;
  anomaliesCount?: number;
  orbitalObjectsCount?: number;
  missionHealthPct?: number;
  dataLatencySec?: number;
}

export function KpiMetricsStrip({
  activeSatellitesCount = 12486,
  anomaliesCount = 7,
  orbitalObjectsCount = 18392,
  missionHealthPct = 98.7,
  dataLatencySec = 1.2,
}: KpiMetricsStripProps) {
  const METRICS = [
    {
      id: "active-sats",
      label: "Active Satellites",
      value: activeSatellitesCount.toLocaleString(),
      change: "2.4%",
      period: "vs. last hour",
      trend: "up",
      trendColor: "text-emerald-400",
      icon: Satellite,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
    },
    {
      id: "anomalies",
      label: "Anomalies Detected",
      value: anomaliesCount.toString(),
      change: "1 new",
      period: "immediate triage",
      trend: "up",
      trendColor: "text-rose-400",
      icon: AlertTriangle,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/30",
    },
    {
      id: "orbital-objects",
      label: "Orbital Objects",
      value: orbitalObjectsCount.toLocaleString(),
      change: "3.1%",
      period: "vs. last hour",
      trend: "up",
      trendColor: "text-cyan-400",
      icon: Globe2,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/10 border-sky-500/30",
    },
    {
      id: "mission-health",
      label: "Mission Health",
      value: `${missionHealthPct}%`,
      change: "Excellent",
      period: "fleet aggregate",
      trend: "up",
      trendColor: "text-emerald-400",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
    },
    {
      id: "data-latency",
      label: "Data Latency",
      value: `${dataLatencySec}s`,
      change: "0.3s",
      period: "vs. last hour",
      trend: "down",
      trendColor: "text-cyan-400",
      icon: Clock,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 my-6">
      {METRICS.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            className="group relative rounded-xl bg-[#091124]/80 border border-sky-900/50 p-4 shadow-lg backdrop-blur-xl hover:border-cyan-500/40 hover:shadow-cyan-500/5 transition-all duration-300"
          >
            {/* Top Row: Icon & Label */}
            <div className="flex items-center gap-3 mb-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${metric.iconBg}`}>
                <Icon className={`h-4 w-4 ${metric.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                {metric.label}
              </span>
            </div>

            {/* Value Display */}
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                {metric.value}
              </div>
            </div>

            {/* Bottom Row: Trend Badge */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              {metric.trend === "up" ? (
                <span className={`flex items-center font-medium ${metric.trendColor}`}>
                  ▲ {metric.change}
                </span>
              ) : (
                <span className={`flex items-center font-medium ${metric.trendColor}`}>
                  ▼ {metric.change}
                </span>
              )}
              <span className="text-slate-500 font-mono text-[10px] truncate">{metric.period}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}