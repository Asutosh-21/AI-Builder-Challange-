"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Settings,
  UserCheck,
  ChevronDown,
  Sparkles,
  Zap,
  Clock,
  Search,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { CommandPalette } from "./CommandPalette";

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onInjectAnomaly?: (type: string) => void;
  onSelectSatellite?: (satId: string) => void;
}

export function Navbar({ activeTab, onTabChange, onInjectAnomaly, onSelectSatellite }: NavbarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streamActive, setStreamActive] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [utcTime, setUtcTime] = useState("");
  const [metSeconds, setMetSeconds] = useState(52430);

  // Global shortcut listener for ⌘K and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update real UTC clock & Mission Elapsed Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(" ").slice(4, 5)[0] + " UTC");
      setMetSeconds((prev) => prev + 1);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format MET seconds to T+ HH:MM:SS
  const formatMET = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `T+ ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-sky-950/60 bg-[#030712]/90 backdrop-blur-xl px-4 md:px-8 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          
          {/* Brand Logo & NASA Flight Clocks */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-3 group text-decoration-none">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/30 to-blue-600/30 p-0.5 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/30 group-hover:ring-cyan-400/60 transition-all duration-300">
                <Globe2 className="h-5 w-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
                <div className="absolute -inset-0.5 rounded-xl bg-cyan-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-sm md:text-base tracking-tight text-white">
                  <span>Mission Anomaly</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Copilot</span>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Space Intelligence OS</span>
              </div>
            </Link>

            {/* Flight Director Clocks (Linear + NASA console style) */}
            <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-sky-900/40 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>{utcTime || "00:00:00 UTC"}</span>
              </div>
              <div className="text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400">MET:</span> <span className="text-emerald-400 font-semibold">{formatMET(metSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Right: Command Trigger + Status Badge & Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Linear-style Command Palette ⌘K Trigger Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#091124] hover:bg-slate-800/80 border border-sky-900/50 hover:border-cyan-500/40 text-xs text-slate-300 transition-all shadow-sm group"
            >
              <Search className="h-3.5 w-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-[11px] text-slate-300">Quick Command</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-sky-950 text-cyan-400">
                ⌘K
              </kbd>
            </button>

            {/* Live Data Pulsing Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="pulse-live absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-emerald-400">Live Data</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-300/70 border-l border-emerald-500/30 pl-2">1.2s</span>
            </div>

            {/* Mission Control Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-full p-1 pl-2 pr-3 bg-[#091124] border border-sky-900/50 hover:border-cyan-500/40 transition-all shadow-sm"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white ring-1 ring-cyan-400/40 shadow-sm">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">Mission Control</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Copilot Active</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#091124]/95 border border-sky-800/40 p-2 shadow-2xl backdrop-blur-2xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-sky-950/60 mb-1">
                      <p className="text-xs font-medium text-white">Flight Director Console</p>
                      <p className="text-[11px] text-slate-400 font-mono">Operator ID: APEX-CTRL-01</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Telemetry Console</span>
                    </Link>
                    <Link
                      href="/dashboard/copilot"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Granite AI Planner</span>
                    </Link>
                    <Link
                      href="/dashboard/incident-copilot"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Zap className="h-3.5 w-3.5 text-purple-400" />
                      <span>RAG Incident Copilot</span>
                    </Link>
                    <div className="my-1 border-t border-sky-950/60" />
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors text-left"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      <span>System Settings</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#091124] border border-sky-800/50 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-sky-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Mission Configuration</h3>
                    <p className="text-xs text-slate-400">Space situational awareness parameters</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Live Telemetry Stream</div>
                    <div className="text-[11px] text-slate-400">SSE 1 Hz frequency polling</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={streamActive}
                    onChange={(e) => setStreamActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-cyan-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-semibold text-white mb-1">IBM Granite Model Endpoint</div>
                  <div className="text-[11px] font-mono text-cyan-400 bg-black/40 p-1.5 rounded border border-cyan-900/30">
                    ibm/granite-3-1-8b-instruct
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs font-semibold text-white mb-1">CelesTrak TLE Feed</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Active Catalog: 7,420 Active Payloads
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-sky-900/40">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-500/20 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onInjectAnomaly={onInjectAnomaly}
        onSelectSatellite={onSelectSatellite}
      />
    </>
  );
}