"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Globe2,
  MessageSquare,
  Satellite,
  FileText,
  Play,
  Zap,
  Radio,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Compass,
  CornerDownLeft,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectAnomaly?: (type: string) => void;
  onSelectSatellite?: (satId: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Spacecraft" | "Simulation" | "AI Diagnostics";
  icon: any;
  shortcut?: string;
  action: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function CommandPalette({ isOpen, onClose, onInjectAnomaly, onSelectSatellite }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const COMMANDS: CommandItem[] = [
    // Navigation
    { id: "nav-home", title: "Mission Control Overview", category: "Navigation", icon: LayoutDashboard, shortcut: "H", action: () => { router.push("/"); onClose(); } },
    { id: "nav-telemetry", title: "Live Telemetry Oscilloscopes", category: "Navigation", icon: Activity, shortcut: "T", action: () => { router.push("/dashboard"); onClose(); } },
    { id: "nav-alerts", title: "Anomaly War Room & Multi-Agent Matrix", category: "Navigation", icon: AlertTriangle, shortcut: "A", action: () => { router.push("/dashboard/alerts"); onClose(); } },
    { id: "nav-orbit", title: "Space Situational Awareness & Orbit Radar", category: "Navigation", icon: Globe2, shortcut: "O", action: () => { router.push("/dashboard/orbit"); onClose(); } },
    { id: "nav-copilot", title: "RAG Incident Copilot (NASA Archives)", category: "Navigation", icon: MessageSquare, shortcut: "C", action: () => { router.push("/dashboard/incident-copilot"); onClose(); } },
    { id: "nav-nasa", title: "NASA Space Weather & Natural Hazards", category: "Navigation", icon: Satellite, shortcut: "N", action: () => { router.push("/dashboard/nasa"); onClose(); } },
    { id: "nav-reports", title: "Incident Audit Reports & Compliance", category: "Navigation", icon: FileText, shortcut: "R", action: () => { router.push("/dashboard/reports"); onClose(); } },

    // Spacecraft Fleet
    { id: "sat-4521", title: "Inspect SAT-4521 (Starlink-G4 · LEO 550km)", category: "Spacecraft", icon: Satellite, action: () => { onSelectSatellite?.("SAT-4521"); onClose(); } },
    { id: "sat-2763", title: "Inspect SAT-2763 (Sentinel-6A · Conjunction Risk)", category: "Spacecraft", icon: Satellite, action: () => { onSelectSatellite?.("SAT-2763"); onClose(); } },
    { id: "sat-3987", title: "Inspect SAT-3987 (GPS-IIF-9 · MEO 20,200km)", category: "Spacecraft", icon: Satellite, action: () => { onSelectSatellite?.("SAT-3987"); onClose(); } },
    { id: "sat-5124", title: "Inspect SAT-5124 (OneWeb-031 · LEO 540km)", category: "Spacecraft", icon: Satellite, action: () => { onSelectSatellite?.("SAT-5124"); onClose(); } },
    { id: "sat-4891", title: "Inspect SAT-4891 (GOES-18 · GEO 35,786km)", category: "Spacecraft", icon: Satellite, action: () => { onSelectSatellite?.("SAT-4891"); onClose(); } },

    // Simulation
    { id: "sim-voltage", title: "Simulate Anomaly: Battery Voltage Sag", category: "Simulation", icon: Zap, action: () => { onInjectAnomaly ? onInjectAnomaly("voltage_drop") : fetch(`${API_URL}/api/telemetry/inject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_type: "voltage_drop" }) }); router.push("/dashboard/alerts"); onClose(); } },
    { id: "sim-thermal", title: "Simulate Anomaly: Solar Array Thermal Spike", category: "Simulation", icon: Zap, action: () => { onInjectAnomaly ? onInjectAnomaly("thermal_spike") : fetch(`${API_URL}/api/telemetry/inject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_type: "thermal_spike" }) }); router.push("/dashboard/alerts"); onClose(); } },
    { id: "sim-attitude", title: "Simulate Anomaly: Reaction Wheel Attitude Drift", category: "Simulation", icon: Compass, action: () => { onInjectAnomaly ? onInjectAnomaly("attitude_drift") : fetch(`${API_URL}/api/telemetry/inject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_type: "attitude_drift" }) }); router.push("/dashboard/alerts"); onClose(); } },
    { id: "sim-fuel", title: "Simulate Anomaly: Hydrazine Propellant Leak", category: "Simulation", icon: Zap, action: () => { onInjectAnomaly ? onInjectAnomaly("fuel_leak") : fetch(`${API_URL}/api/telemetry/inject`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomaly_type: "fuel_leak" }) }); router.push("/dashboard/alerts"); onClose(); } },
    { id: "sim-clear", title: "Clear All Active Simulated Anomalies", category: "Simulation", icon: RotateCcw, action: () => { fetch(`${API_URL}/api/telemetry/clear`, { method: "POST" }); onClose(); } },

    // AI Diagnostics
    { id: "ai-analyze", title: "Run Granite AI Anomaly Diagnostic Sweep", category: "AI Diagnostics", icon: Sparkles, action: () => { router.push("/dashboard/copilot"); onClose(); } },
    { id: "ai-copilot", title: "Ask Copilot: 'What caused similar battery issues?'", category: "AI Diagnostics", icon: MessageSquare, action: () => { router.push("/dashboard/incident-copilot"); onClose(); } },
  ];

  const filtered = COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl rounded-2xl bg-[#091124] border border-sky-800/60 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-sky-900/50 bg-[#050b18]">
              <Search className="h-4 w-4 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, search spacecraft, or trigger anomaly scenario..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none font-mono"
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                ESC
              </span>
            </div>

            {/* Commands List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-sky-950/40">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  No matching mission commands found.
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;

                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg border ${
                          isSelected ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300" : "bg-slate-900 border-sky-900/60 text-slate-400"
                        }`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.shortcut && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-cyan-300">
                            {item.shortcut}
                          </span>
                        )}
                        {isSelected && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#050b18] border-t border-sky-900/40 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">↵</kbd> Select</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-400">
                <Sparkles className="h-3 w-3" />
                <span>Mission Anomaly Copilot OS</span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}