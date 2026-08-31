"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Radio, Battery, Thermometer, Compass, Fuel, Cpu, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { SatelliteItem } from "./LiveSatellitesTable";

interface SatelliteDetailModalProps {
  satellite: SatelliteItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SatelliteDetailModal({ satellite, isOpen, onClose }: SatelliteDetailModalProps) {
  if (!isOpen || !satellite) return null;

  const isAnomaly = satellite.status === "Anomaly";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl rounded-2xl bg-[#091124] border border-sky-800/60 p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sky-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Satellite className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-mono text-white">{satellite.id}</h2>
                  <span className="text-xs text-slate-400">({satellite.name})</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAnomaly
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {satellite.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">NORAD ID: 48271 · Orbit Band: {satellite.orbit}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Telemetry Diagnostics Grid */}
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Battery className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Battery Bus</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">{satellite.battery}</div>
                <div className="text-[10px] text-emerald-400 font-mono">Nominal range: 24-28V</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                  <span>Solar Array Temp</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">{satellite.temp}</div>
                <div className="text-[10px] text-slate-400 font-mono">Limit: 80°C</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Altitude</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">{satellite.altitude}</div>
                <div className="text-[10px] text-slate-400 font-mono">Mean altitude</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Radio className="h-3.5 w-3.5 text-sky-400" />
                  <span>Orbital Velocity</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">{satellite.velocity}</div>
                <div className="text-[10px] text-slate-400 font-mono">SGP4 computed</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Fuel className="h-3.5 w-3.5 text-purple-400" />
                  <span>Hydrazine Fuel</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">84.2%</div>
                <div className="text-[10px] text-emerald-400 font-mono">212 kPa Pressure</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-sky-900/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Cpu className="h-3.5 w-3.5 text-rose-400" />
                  <span>Flight Computer</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">38°C</div>
                <div className="text-[10px] text-emerald-400 font-mono">Load: 14%</div>
              </div>

            </div>

            {/* AI Assessment */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>AI Subsystem Assessment</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Telemetry streams are synchronized via SSE at 1 Hz. Orbital decay is within expected margins (&lt;0.02 km/day). No imminent conjunction conflicts detected in the immediate 90-minute pass window.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-sky-900/40">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Close
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-500/20 transition-colors"
            >
              Open Live Telemetry Stream
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}