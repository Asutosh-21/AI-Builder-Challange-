"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface AlertItem {
  id: string;
  time: string;
  satellite: string;
  type: string;
  severity: "High" | "Medium" | "Low";
}

const DEFAULT_ALERTS: AlertItem[] = [
  { id: "alt-1", time: "10:24 AM", satellite: "SAT-2763", type: "Conjunction Risk", severity: "High" },
  { id: "alt-2", time: "09:47 AM", satellite: "DEB-1147", type: "Orbital Debris", severity: "Medium" },
  { id: "alt-3", time: "08:32 AM", satellite: "SAT-3987", type: "Signal Anomaly", severity: "Medium" },
];

interface RecentAlertsTableProps {
  alerts?: AlertItem[];
  onViewAll?: () => void;
}

export function RecentAlertsTable({ alerts = DEFAULT_ALERTS, onViewAll }: RecentAlertsTableProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#091124]/80 border border-sky-900/50 p-4 shadow-xl backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Recent Alerts</h3>
            <p className="text-[11px] text-slate-400 font-mono">Telemetry & Risk Stream</p>
          </div>
        </div>

        <Link
          href="/dashboard/alerts"
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sky-950/80 text-[11px] font-mono text-slate-400">
              <th className="pb-2 font-normal">Time</th>
              <th className="pb-2 font-normal">Satellite/Object</th>
              <th className="pb-2 font-normal">Type</th>
              <th className="pb-2 font-normal text-right">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-950/50">
            {alerts.map((alert) => {
              const isHigh = alert.severity === "High";
              const isMed = alert.severity === "Medium";

              return (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-mono text-slate-400 text-[11px]">{alert.time}</td>
                  <td className="py-2.5 font-mono font-bold text-white">{alert.satellite}</td>
                  <td className="py-2.5 text-slate-300 text-[11px]">{alert.type}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        isHigh
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                          : isMed
                          ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                          : "bg-sky-500/20 border border-sky-500/40 text-sky-300"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}