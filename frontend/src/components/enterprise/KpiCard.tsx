"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  sparkline?: ReactNode;
  status?: "normal" | "warning" | "critical";
  className?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  trend = "neutral",
  trendValue,
  icon,
  sparkline,
  status = "normal",
  className = "",
}: KpiCardProps) {
  const statusStyles = {
    normal: "border-sky-900/50",
    warning: "border-amber-500/50 bg-amber-950/10",
    critical: "border-rose-500/50 bg-rose-950/10",
  };

  const trendIcon = {
    up: <TrendingUp className="h-3 w-3 text-emerald-400" />,
    down: <TrendingDown className="h-3 w-3 text-rose-400" />,
    neutral: <Minus className="h-3 w-3 text-slate-400" />,
  };

  const trendColor = {
    up: "text-emerald-400",
    down: "text-rose-400",
    neutral: "text-slate-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-[#091124]/80 backdrop-blur-xl p-4 shadow-xl transition-all duration-200 hover:border-cyan-500/30 ${statusStyles[status]} ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">{icon}</div>}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{title}</div>
            {trendValue && (
              <div className={`flex items-center gap-1 text-[10px] font-mono ${trendColor[trend]}`}>
                {trendIcon[trend]}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
            {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
          </div>
        </div>
        {sparkline && <div className="h-8 w-24">{sparkline}</div>}
      </div>
    </motion.div>
  );
}
