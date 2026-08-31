"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: "default" | "elevated" | "critical" | "warning" | "success";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", style, variant = "default", hover = false, onClick }: CardProps) {
  const variantStyles = {
    default: "bg-[#091124]/80 border-sky-900/50 hover:border-cyan-500/30",
    elevated: "bg-[#111d35] border-slate-700/50 shadow-lg",
    critical: "bg-rose-950/20 border-rose-500/50 shadow-rose-500/10",
    warning: "bg-amber-950/20 border-amber-500/50 shadow-amber-500/10",
    success: "bg-emerald-950/20 border-emerald-500/50 shadow-emerald-500/10",
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, borderColor: "rgba(0, 212, 255, 0.3)" } : {}}
      onClick={onClick}
      style={style}
      className={`rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-200 ${variantStyles[variant]} ${className} ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`p-4 border-b border-slate-800/50 ${className}`}>{children}</div>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`p-4 border-t border-slate-800/50 ${className}`}>{children}</div>;
}
