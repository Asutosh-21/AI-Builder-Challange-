"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

interface AlertProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({ children, variant = "info", dismissible = false, onDismiss, className = "" }: AlertProps) {
  const variantConfig = {
    info: {
      icon: <Info className="h-4 w-4" />,
      bgColor: "bg-sky-950/60",
      borderColor: "border-sky-500/30",
      textColor: "text-sky-400",
      iconColor: "text-sky-400",
    },
    success: {
      icon: <CheckCircle className="h-4 w-4" />,
      bgColor: "bg-emerald-950/60",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
      iconColor: "text-emerald-400",
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: "bg-amber-950/60",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
      iconColor: "text-amber-400",
    },
    danger: {
      icon: <AlertCircle className="h-4 w-4" />,
      bgColor: "bg-rose-950/60",
      borderColor: "border-rose-500/30",
      textColor: "text-rose-400",
      iconColor: "text-rose-400",
    },
  };

  const config = variantConfig[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-xl border ${config.bgColor} ${config.borderColor} p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>
        <div className={`flex-1 text-sm ${config.textColor}`}>{children}</div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
