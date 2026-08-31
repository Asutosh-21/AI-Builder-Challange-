"use client";

import Link from "next/link";
import { Calendar, ArrowRight, Clock, Radio, SunMedium, Orbit } from "lucide-react";

interface EventItem {
  id: string;
  time: string;
  event: string;
  type: "Visibility" | "Update" | "Analysis";
}

const DEFAULT_EVENTS: EventItem[] = [
  { id: "ev-1", time: "Today 2:00 PM", event: "ISS Pass (NA Region)", type: "Visibility" },
  { id: "ev-2", time: "Today 6:00 PM", event: "Solar Activity Update", type: "Update" },
  { id: "ev-3", time: "Tomorrow 10:00 AM", event: "Orbital Debris Assessment", type: "Analysis" },
];

export function UpcomingEventsCard() {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#091124]/80 border border-sky-900/50 p-4 shadow-xl backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Upcoming Events</h3>
            <p className="text-[11px] text-slate-400 font-mono">Mission Flight Schedule</p>
          </div>
        </div>

        <Link
          href="/dashboard/nasa"
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View Calendar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sky-950/80 text-[11px] font-mono text-slate-400">
              <th className="pb-2 font-normal">Time</th>
              <th className="pb-2 font-normal">Event</th>
              <th className="pb-2 font-normal text-right">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-950/50">
            {DEFAULT_EVENTS.map((ev) => {
              const isVis = ev.type === "Visibility";
              const isUpd = ev.type === "Update";

              return (
                <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-mono text-slate-400 text-[11px]">{ev.time}</td>
                  <td className="py-2.5 font-medium text-white text-[12px]">{ev.event}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        isVis
                          ? "bg-blue-500/20 border border-blue-500/40 text-blue-300"
                          : isUpd
                          ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                          : "bg-teal-500/20 border border-teal-500/40 text-teal-300"
                      }`}
                    >
                      {ev.type}
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