"use client";

import { Sparkles, ArrowRight, AlertOctagon, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AiInsightsCardProps {
  onInspectConjunction?: () => void;
}

export function AiInsightsCard({ onInspectConjunction }: AiInsightsCardProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#091124]/80 border border-sky-900/50 p-4 shadow-xl backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Insights</h3>
            <p className="text-[11px] text-slate-400 font-mono">IBM Granite 3.1 & ML</p>
          </div>
        </div>

        <Link
          href="/dashboard/copilot"
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Insight Cards List */}
      <div className="flex-1 space-y-2.5">
        
        {/* 1. Conjunction Alert */}
        <div className="rounded-xl bg-slate-900/60 border border-rose-500/30 p-3 hover:border-rose-500/50 transition-colors shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
              <AlertOctagon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-rose-300">Potential Conjunction Alert</span>
                <button
                  onClick={onInspectConjunction}
                  className="px-2 py-0.5 text-[10px] font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-sm"
                >
                  View Details
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                <span className="font-mono text-cyan-300">SAT-2763</span> and <span className="font-mono text-rose-300">DEB-1147</span> will come within <strong className="text-white">2.1 km</strong> in 6 hours.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Orbital Anomaly Trend */}
        <div className="rounded-xl bg-slate-900/60 border border-sky-900/50 p-3 hover:border-sky-700/60 transition-colors shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0 mt-0.5">
              <Info className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-sky-300">Orbital Anomaly Trend</div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                Increased solar activity detected in GEO region. Currently monitoring 12 active objects.
              </p>
            </div>
          </div>
        </div>

        {/* 3. System Health */}
        <div className="rounded-xl bg-slate-900/60 border border-emerald-900/40 p-3 hover:border-emerald-700/60 transition-colors shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-300">System Health</div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                All telemetry pipelines and detection nodes operating normally with <strong className="text-white">99.9% uptime</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}