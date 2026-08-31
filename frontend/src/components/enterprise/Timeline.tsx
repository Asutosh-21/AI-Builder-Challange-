"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className = "" }: TimelineProps) {
  return <div className={`relative space-y-4 ${className}`}>{children}</div>;
}

interface TimelineItemProps {
  children: ReactNode;
  status?: "pending" | "active" | "completed" | "error";
  className?: string;
}

export function TimelineItem({ children, status = "pending", className = "" }: TimelineItemProps) {
  const statusConfig = {
    pending: "bg-slate-700 border-slate-600",
    active: "bg-cyan-400 border-cyan-300 animate-pulse",
    completed: "bg-emerald-400 border-emerald-300",
    error: "bg-rose-400 border-rose-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative pl-6 ${className}`}
    >
      <div className={`absolute left-0 top-1 h-3 w-3 rounded-full border-2 ${statusConfig[status]}`} />
      <div className="absolute left-[5px] top-4 bottom-[-16px] w-0.5 bg-slate-800" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
