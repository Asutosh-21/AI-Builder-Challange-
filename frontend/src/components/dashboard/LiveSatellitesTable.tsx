"use client";

import { useState } from "react";
import { Satellite, ArrowRight, Radio, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export interface SatelliteItem {
  id: string;
  name: string;
  status: "Healthy" | "Monitoring" | "Anomaly";
  orbit: string;
  altitude: string;
  velocity: string;
  battery: string;
  temp: string;
}

const DEFAULT_SATELLITES: SatelliteItem[] = [
  { id: "SAT-4521", name: "Starlink-G4", status: "Healthy", orbit: "LEO", altitude: "550 km", velocity: "7.66 km/s", battery: "27.4 V", temp: "24°C" },
  { id: "SAT-3987", name: "GPS-IIF-9", status: "Monitoring", orbit: "MEO", altitude: "20,200 km", velocity: "3.87 km/s", battery: "25.8 V", temp: "38°C" },
  { id: "SAT-5124", name: "OneWeb-031", status: "Healthy", orbit: "LEO", altitude: "540 km", velocity: "7.68 km/s", battery: "26.9 V", temp: "19°C" },
  { id: "SAT-2763", name: "Sentinel-6A", status: "Anomaly", orbit: "LEO", altitude: "560 km", velocity: "7.64 km/s", battery: "21.2 V", temp: "78°C" },
  { id: "SAT-4891", name: "GOES-18", status: "Healthy", orbit: "GEO", altitude: "35,786 km", velocity: "3.07 km/s", battery: "28.1 V", temp: "22°C" },
];

interface LiveSatellitesTableProps {
  onSelectSatellite?: (sat: SatelliteItem) => void;
  onViewAll?: () => void;
}

export function LiveSatellitesTable({ onSelectSatellite, onViewAll }: LiveSatellitesTableProps) {
  const [satellites, setSatellites] = useState<SatelliteItem[]>(DEFAULT_SATELLITES);
  const [selectedId, setSelectedId] = useState<string>("SAT-4521");

  const handleRowClick = (sat: SatelliteItem) => {
    setSelectedId(sat.id);
    onSelectSatellite?.(sat);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-[#091124]/80 border border-sky-900/50 p-4 shadow-xl backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-950/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Satellite className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Satellites</h3>
            <p className="text-[11px] text-slate-400 font-mono">5 Active Constellations</p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sky-950/80 text-[11px] font-mono text-slate-400">
              <th className="pb-2 font-normal">Satellite</th>
              <th className="pb-2 font-normal">Status</th>
              <th className="pb-2 font-normal text-right">Orbit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-950/50">
            {satellites.map((sat) => {
              const isSelected = selectedId === sat.id;
              const isAnomaly = sat.status === "Anomaly";
              const isMonitoring = sat.status === "Monitoring";

              return (
                <tr
                  key={sat.id}
                  onClick={() => handleRowClick(sat)}
                  className={`group cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-cyan-500/10"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  {/* Satellite Name & Icon */}
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-900 border border-sky-900/60 text-slate-400 group-hover:text-cyan-400">
                        <Radio className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {sat.id}
                        </div>
                        <div className="text-[10px] text-slate-400 hidden sm:block">
                          {sat.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isAnomaly
                            ? "bg-rose-400 shadow-[0_0_6px_#ef4444] animate-ping"
                            : isMonitoring
                            ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                            : "bg-emerald-400 shadow-[0_0_6px_#10b981]"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-medium ${
                          isAnomaly
                            ? "text-rose-400 font-semibold"
                            : isMonitoring
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {sat.status}
                      </span>
                    </div>
                  </td>

                  {/* Orbit & Altitude */}
                  <td className="py-2.5 text-right font-mono">
                    <div className="text-white font-medium text-[11px]">{sat.orbit}</div>
                    <div className="text-[10px] text-slate-400">{sat.altitude}</div>
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