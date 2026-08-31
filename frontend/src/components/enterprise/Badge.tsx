"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800/60 text-slate-300 border-slate-700/50",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-950/60 text-amber-400 border-amber-500/30",
    danger: "bg-rose-950/60 text-rose-400 border-rose-500/30",
    info: "bg-sky-950/60 text-sky-400 border-sky-500/30",
    primary: "bg-cyan-950/60 text-cyan-400 border-cyan-500/30",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
