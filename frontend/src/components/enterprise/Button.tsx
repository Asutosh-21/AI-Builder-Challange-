"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  icon,
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 text-slate-950 border-transparent shadow-[0_0_24px_rgba(0,212,255,0.35)] hover:shadow-[0_0_32px_rgba(0,212,255,0.6)]",
    secondary: "bg-[#111d35] text-slate-200 border-slate-700/50 hover:border-cyan-500/30",
    danger: "bg-rose-950/60 text-rose-400 border-rose-500/30 hover:bg-rose-950/80",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/80",
    ghost: "bg-transparent text-slate-300 border-transparent hover:bg-slate-800/40",
    outline: "bg-transparent text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/40",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </motion.button>
  );
}
