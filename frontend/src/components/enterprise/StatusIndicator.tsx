"use client";

import { motion } from "framer-motion";

interface StatusIndicatorProps {
  status: "nominal" | "warning" | "critical" | "info" | "offline";
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusIndicator({ status, label, size = "md", className = "" }: StatusIndicatorProps) {
  const statusConfig = {
    nominal: {
      color: "bg-emerald-400",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-950/60",
      pulse: "animate-pulse",
    },
    warning: {
      color: "bg-amber-400",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-950/60",
      pulse: "animate-pulse",
    },
    critical: {
      color: "bg-rose-400",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgColor: "bg-rose-950/60",
      pulse: "animate-pulse",
    },
    info: {
      color: "bg-sky-400",
      textColor: "text-sky-400",
      borderColor: "border-sky-500/30",
      bgColor: "bg-sky-950/60",
      pulse: "",
    },
    offline: {
      color: "bg-slate-400",
      textColor: "text-slate-400",
      borderColor: "border-slate-500/30",
      bgColor: "bg-slate-950/60",
      pulse: "",
    },
  };

  const config = statusConfig[status];
  const sizeStyles = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 rounded-full border font-mono font-semibold uppercase tracking-wider ${config.bgColor} ${config.borderColor} ${config.textColor} ${sizeStyles[size]} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.color} ${config.pulse}`} />
      {label || status}
    </motion.div>
  );
}
