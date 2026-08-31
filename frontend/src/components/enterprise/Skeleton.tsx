"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string;
  height?: string;
}

export function Skeleton({ className = "", variant = "rectangular", width, height }: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
  };

  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-slate-800 ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#091124]/80 p-4 space-y-3">
      <Skeleton width="60%" height="20px" variant="text" />
      <Skeleton width="40%" height="16px" variant="text" />
      <Skeleton width="100%" height="60px" variant="rectangular" />
    </div>
  );
}
