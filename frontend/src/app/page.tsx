"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Activity, Brain, Globe2, MessageSquare, ShieldCheck,
  ArrowRight, Satellite, Radio, Sparkles, ChevronRight,
  Zap, Signal, Cpu, Shield, GitBranch, Database,
} from "lucide-react";

/* ── Static star field ─────────────────────────────────────────────────── */
const STARS = [
  {w:1,h:1,t:4.2,l:11.7,o:0.5},{w:2,h:1,t:8.9,l:54.3,o:0.7},{w:1,h:1,t:13.5,l:87.2,o:0.4},
  {w:1,h:2,t:19.1,l:32.6,o:0.3},{w:1,h:1,t:23.8,l:71.9,o:0.6},{w:2,h:2,t:28.4,l:6.5,o:0.3},
  {w:1,h:1,t:33.0,l:46.1,o:0.5},{w:1,h:1,t:37.6,l:93.8,o:0.4},{w:2,h:1,t:42.3,l:18.4,o:0.6},
  {w:1,h:1,t:46.9,l:62.7,o:0.3},{w:1,h:2,t:51.5,l:38.2,o:0.5},{w:1,h:1,t:56.1,l:79.5,o:0.4},
  {w:2,h:1,t:60.8,l:25.0,o:0.7},{w:1,h:1,t:65.4,l:50.3,o:0.3},{w:1,h:1,t:70.0,l:83.6,o:0.5},
  {w:1,h:2,t:74.7,l:14.9,o:0.4},{w:2,h:1,t:79.3,l:67.2,o:0.6},{w:1,h:1,t:83.9,l:41.5,o:0.3},
  {w:1,h:1,t:88.5,l:96.8,o:0.5},{w:2,h:2,t:93.2,l:22.1,o:0.4},{w:1,h:1,t:97.8,l:58.4,o:0.3},
  {w:1,h:1,t:6.3,l:75.9,o:0.6},{w:1,h:1,t:15.7,l:3.2,o:0.4},{w:2,h:1,t:24.1,l:44.7,o:0.5},
  {w:1,h:2,t:30.5,l:88.3,o:0.3},{w:1,h:1,t:38.9,l:19.6,o:0.6},{w:1,h:1,t:47.3,l:56.1,o:0.4},
  {w:2,h:1,t:55.7,l:72.4,o:0.5},{w:1,h:1,t:64.1,l:33.7,o:0.3},{w:1,h:1,t:72.5,l:5.0,o:0.6},
  {w:1,h:2,t:80.9,l:49.3,o:0.4},{w:2,h:2,t:89.3,l:85.6,o:0.5},{w:1,h:1,t:94.7,l:28.9,o:0.3},
  {w:1,h:1,t:2.1,l:64.2,o:0.5},{w:2,h:1,t:10.5,l:37.5,o:0.4},{w:1,h:1,t:18.9,l:91.8,o:0.6},
  {w:1,h:1,t:27.3,l:15.1,o:0.3},{w:1,h:2,t:35.7,l:59.4,o:0.5},{w:2,h:1,t:44.1,l:80.7,o:0.4},
  {w:1,h:1,t:52.5,l:23.0,o:0.6},{w:1,h:1,t:60.9,l:47.3,o:0.3},{w:1,h:2,t:69.3,l:69.6,o:0.5},
  {w:2,h:1,t:77.7,l:8.9,o:0.4},{w:1,h:1,t:86.1,l:34.2,o:0.6},{w:1,h:1,t:91.5,l:76.5,o:0.3},
  {w:1,h:1,t:1.3,l:42.8,o:0.5},{w:2,h:2,t:9.7,l:97.1,o:0.4},{w:1,h:1,t:17.1,l:26.4,o:0.6},
  {w:1,h:2,t:25.5,l:52.7,o:0.3},{w:1,h:1,t:33.9,l:78.0,o:0.5},{w:2,h:1,t:42.3,l:12.3,o:0.4},
  {w:1,h:1,t:50.7,l:63.6,o:0.6},{w:1,h:1,t:59.1,l:89.9,o:0.3},{w:1,h:2,t:67.5,l:36.2,o:0.5},
  {w:2,h:1,t:75.9,l:57.5,o:0.4},{w:1,h:1,t:84.3,l:82.8,o:0.6},{w:1,h:1,t:92.7,l:10.1,o:0.3},
  {w:1,h:1,t:3.5,l:29.4,o:0.5},{w:1,h:2,t:11.9,l:73.7,o:0.4},{w:2,h:1,t:20.3,l:48.0,o:0.6},
  {w:1,h:1,t:28.7,l:95.3,o:0.3},{w:1,h:1,t:37.1,l:21.6,o:0.5},{w:2,h:2,t:45.5,l:66.9,o:0.4},
  {w:1,h:1,t:53.9,l:43.2,o:0.6},{w:1,h:2,t:62.3,l:17.5,o:0.3},{w:1,h:1,t:70.7,l:61.8,o:0.5},
  {w:2,h:1,t:79.1,l:88.1,o:0.4},{w:1,h:1,t:87.5,l:4.4,o:0.6},{w:1,h:1,t:95.9,l:39.7,o:0.3},
  {w:1,h:1,t:5.1,l:83.0,o:0.5},{w:1,h:2,t:14.3,l:20.3,o:0.4},{w:2,h:1,t:22.7,l:55.6,o:0.6},
  {w:1,h:1,t:31.1,l:77.9,o:0.3},{w:1,h:1,t:39.5,l:32.2,o:0.5},{w:2,h:2,t:47.9,l:98.5,o:0.4},
  {w:1,h:1,t:56.3,l:24.8,o:0.6},{w:1,h:2,t:64.7,l:46.1,o:0.3},{w:1,h:1,t:73.1,l:70.4,o:0.5},
  {w:2,h:1,t:81.5,l:93.7,o:0.4},{w:1,h:1,t:89.9,l:16.0,o:0.6},{w:1,h:1,t:98.3,l:51.3,o:0.3},
];

/* ── Orbit ring SVG ────────────────────────────────────────────────────── */
function OrbitRingSVG() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Outer glow ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute w-[700px] h-[700px] rounded-full border border-cyan-500/10"
        style={{ boxShadow: "0 0 60px rgba(0,212,255,0.04) inset" }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        className="absolute w-[520px] h-[520px] rounded-full border border-sky-500/10"
        style={{ borderStyle: "dashed" }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute w-[340px] h-[340px] rounded-full border border-indigo-500/15"
      />
      {/* Satellite dot on outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute w-[700px] h-[700px] rounded-full"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.9)]" />
      </motion.div>
      {/* Satellite dot on middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        className="absolute w-[520px] h-[520px] rounded-full"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
      </motion.div>
      {/* Planet core */}
      <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-sky-900/80 to-indigo-950/80 border border-sky-700/30 shadow-[0_0_40px_rgba(0,212,255,0.15)]" />
      <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-sky-800/60 to-blue-950/60 border border-cyan-500/20" />
    </div>
  );
}

/* ── HUD telemetry ticker ──────────────────────────────────────────────── */
const TICKERS = [
  { label: "BAT", value: "26.4V", ok: true },
  { label: "TMP", value: "38°C", ok: true },
  { label: "ATT", value: "0.12°", ok: true },
  { label: "FUL", value: "84%", ok: true },
  { label: "SIG", value: "-74dBm", ok: true },
  { label: "CPU", value: "42°C", ok: true },
  { label: "ORB", value: "#14", ok: true },
  { label: "ALT", value: "549km", ok: true },
];

function HudTicker() {
  return (
    <div className="flex items-center gap-0 overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="flex gap-6 whitespace-nowrap"
      >
        {[...TICKERS, ...TICKERS].map((t, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-500">{t.label}</span>
            <span className={t.ok ? "text-emerald-400" : "text-rose-400"}>{t.value}</span>
            <span className="text-slate-700 ml-2">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Feature cards data ────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Activity className="h-5 w-5" />, title: "Live Telemetry Stream", desc: "6 sensor channels streaming at 1 Hz via SSE. Charts update every second with anomaly highlight bands and threshold markers.", accent: "#00d4ff", glow: "shadow-cyan-500/20", border: "border-cyan-500/20 hover:border-cyan-400/50" },
  { icon: <Brain className="h-5 w-5" />, title: "Isolation Forest ML", desc: "scikit-learn Isolation Forest trained on 10,000 normal ticks detects statistical anomalies before they breach hard limits.", accent: "#818cf8", glow: "shadow-indigo-500/20", border: "border-indigo-500/20 hover:border-indigo-400/50" },
  { icon: <Sparkles className="h-5 w-5" />, title: "IBM Granite Root Cause", desc: "Granite 3.1 8B Instruct explains exactly what is failing, cites the telemetry evidence, and gives a confidence level.", accent: "#f59e0b", glow: "shadow-amber-500/20", border: "border-amber-500/20 hover:border-amber-400/50" },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Mission Response Planner", desc: "3 response scenarios with animated risk reduction bars, fuel cost estimates, and IBM Granite-generated step-by-step plans.", accent: "#10b981", glow: "shadow-emerald-500/20", border: "border-emerald-500/20 hover:border-emerald-400/50" },
  { icon: <MessageSquare className="h-5 w-5" />, title: "RAG Incident Copilot", desc: "LangChain + ChromaDB + Granite Embedding 30M. Every answer is grounded in NASA anomaly corpus with source citations.", accent: "#38bdf8", glow: "shadow-sky-500/20", border: "border-sky-500/20 hover:border-sky-400/50" },
  { icon: <Globe2 className="h-5 w-5" />, title: "CelesTrak Orbit Intel", desc: "Real live TLE data for 7,400 satellites. sgp4 propagation computes altitudes and flags conjunction risk in your maneuver band.", accent: "#a78bfa", glow: "shadow-violet-500/20", border: "border-violet-500/20 hover:border-violet-400/50" },
];

const STEPS = [
  { n: "01", label: "Raw Telemetry", sub: "6 channels · 1 Hz SSE", icon: <Signal className="h-4 w-4" />, color: "text-cyan-400" },
  { n: "02", label: "ML Detection", sub: "Isolation Forest score", icon: <Cpu className="h-4 w-4" />, color: "text-indigo-400" },
  { n: "03", label: "AI Inference", sub: "IBM Granite root cause", icon: <Sparkles className="h-4 w-4" />, color: "text-amber-400" },
  { n: "04", label: "Risk Assessment", sub: "3-scenario comparison", icon: <Shield className="h-4 w-4" />, color: "text-rose-400" },
  { n: "05", label: "Decision", sub: "Human-approved action", icon: <Zap className="h-4 w-4" />, color: "text-emerald-400" },
];

const IBM_LAYERS = [
  { n: "01", title: "Inference", model: "granite-3-1-8b-instruct", task: "Root cause explanation + mission planning", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/30", badge: "bg-amber-500/15 text-amber-300" },
  { n: "02", title: "Embeddings", model: "granite-embedding-30m", task: "NASA corpus vectorisation + semantic search", color: "from-sky-500/20 to-blue-500/10", border: "border-sky-500/30", badge: "bg-sky-500/15 text-sky-300" },
  { n: "03", title: "RAG Chain", model: "LangChain · ChromaDB", task: "Retrieval-augmented generation with citations", color: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30", badge: "bg-violet-500/15 text-violet-300" },
];

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="min-h-screen bg-[#020812] text-white overflow-x-hidden">

      {/* ── Deep space background ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(6,18,52,0.8)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(15,10,40,0.7)_0%,transparent_60%)]" />
        {/* Nebula blobs */}
        <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-600/[0.04] blur-[120px]" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.05] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-700/[0.04] blur-[80px]" />
        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: `${s.w}px`, height: `${s.h}px`, top: `${s.t}%`, left: `${s.l}%`, opacity: s.o }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#040d1e]/80 border border-sky-900/40 backdrop-blur-2xl shadow-2xl shadow-black/40">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-700/30 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Globe2 className="h-4 w-4 text-cyan-400" />
                <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight font-display">
                  Mission Anomaly <span className="text-cyan-400">Copilot</span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">Space Intelligence OS</div>
              </div>
            </div>

            {/* HUD ticker */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#071224]/80 border border-sky-900/30 w-64 overflow-hidden">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">LIVE</span>
              </div>
              <HudTicker />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/25 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                APEX-7 · NOMINAL
              </div>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30">
                Launch Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Orbit rings centred behind hero text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[700px] h-[700px]">
            <OrbitRingSVG />
          </div>
        </div>

        {/* Radial glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/[0.06] blur-[80px]" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 text-center max-w-4xl mx-auto">

          {/* Top pill badge */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#040d1e]/90 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 mb-10 backdrop-blur-xl shadow-lg shadow-cyan-500/10">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-[0.2em]">IBM BOB AI BUILDERS CHALLENGE</span>
            </div>
            <span className="w-px h-3 bg-sky-800" />
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Powered by IBM Granite + watsonx.ai</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-bold leading-[1.08] tracking-tight mb-6">
            <span className="block text-5xl sm:text-6xl lg:text-7xl text-white mb-2">AI that detects</span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              spacecraft failures
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl text-white/70 mt-1">before they happen.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto mb-12">
            Live telemetry · Isolation Forest anomaly detection · IBM Granite root cause AI ·
            RAG mission copilot · CelesTrak orbit intelligence.
          </motion.p>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white text-sm font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/50 hover:-translate-y-0.5">
              <Satellite className="h-4 w-4" />
              Launch Mission Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-sky-800/50 text-slate-300 text-sm font-medium hover:border-cyan-500/50 hover:text-white hover:bg-sky-950/30 transition-all duration-300">
              <GitBranch className="h-4 w-4" />
              View on GitHub
            </a>
          </motion.div>
        </motion.div>

        {/* HUD frame corners on hero */}
        <div className="absolute top-24 left-8 hidden xl:block">
          <div className="w-16 h-16 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-lg" />
          <div className="mt-2 text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest">MISSION CTRL</div>
        </div>
        <div className="absolute top-24 right-8 hidden xl:block text-right">
          <div className="w-16 h-16 border-r-2 border-t-2 border-cyan-500/30 rounded-tr-lg ml-auto" />
          <div className="mt-2 text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest">APEX-7 · LEO</div>
        </div>
        <div className="absolute bottom-16 left-8 hidden xl:block">
          <div className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest mb-2">550KM ORBIT</div>
          <div className="w-16 h-16 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-lg" />
        </div>
        <div className="absolute bottom-16 right-8 hidden xl:block text-right">
          <div className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest mb-2">SSE · 1HZ</div>
          <div className="w-16 h-16 border-r-2 border-b-2 border-cyan-500/30 rounded-br-lg ml-auto" />
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </motion.div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-6 border-y border-sky-900/25">
        <div className="absolute inset-0 bg-[#040d1e]/70 backdrop-blur-sm" />
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sky-900/20 rounded-2xl overflow-hidden border border-sky-900/30">
            {[
              { v: "< 1s", l: "Anomaly Detection", sub: "From sensor to alert" },
              { v: "6", l: "Telemetry Channels", sub: "Battery · Temp · Fuel · …" },
              { v: "3×", l: "IBM Granite Layers", sub: "Inference · Embed · RAG" },
              { v: "7,400+", l: "Orbital Objects", sub: "Live CelesTrak TLE feed" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-[#040d1e]/80 px-6 py-5 text-center">
                <div className="text-3xl font-bold font-mono text-white mb-1 tracking-tight">{s.v}</div>
                <div className="text-xs font-semibold text-slate-300 mb-0.5">{s.l}</div>
                <div className="text-[10px] text-slate-600 font-mono">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PIPELINE STEPS ═══════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-500 mb-3">Intelligence Pipeline</div>
            <h2 className="font-display text-3xl font-bold text-white">From Raw Signal to Command Decision</h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-800/50 to-transparent hidden lg:block" />

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {STEPS.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center group">
                  {/* Node */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl bg-[#040d1e] border border-sky-900/50 flex items-center justify-center mb-4 group-hover:border-sky-600/50 transition-all duration-300 shadow-lg ${step.color}`}>
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#020812] border border-sky-900/50 flex items-center justify-center">
                      <span className="text-[8px] font-bold font-mono text-slate-500">{step.n}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{step.label}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{step.sub}</div>
                  {/* Arrow between steps */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-7 -right-2 text-slate-700 hidden lg:block z-20">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURE CARDS ════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-500 mb-3">Core Capabilities</div>
            <h2 className="font-display text-3xl font-bold text-white mb-4">Built for Mission Operations</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
              Six distinct capabilities spanning the full anomaly response pipeline — from raw telemetry to human-approved command.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative rounded-2xl bg-[#040d1e]/80 border ${feat.border} p-6 transition-all duration-300 backdrop-blur-xl overflow-hidden`}>
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${feat.accent}08 0%, transparent 70%)` }} />
                {/* Icon */}
                <div className="relative z-10 inline-flex p-3 rounded-xl mb-5 border"
                  style={{ background: `${feat.accent}12`, borderColor: `${feat.accent}30`, color: feat.accent }}>
                  {feat.icon}
                </div>
                <h3 className="relative z-10 font-display font-bold text-white mb-2 text-base">{feat.title}</h3>
                <p className="relative z-10 text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${feat.accent}40, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IBM GRANITE SECTION ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,158,11,0.03)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-500 mb-3">IBM Granite Integration</div>
            <h2 className="font-display text-3xl font-bold text-white mb-4">Three Distinct AI Layers</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              Not a chatbot wrapper. IBM Granite powers three fundamentally different jobs in this system.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {IBM_LAYERS.map((layer, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className={`rounded-2xl bg-gradient-to-br ${layer.color} border ${layer.border} p-6 backdrop-blur-xl`}>
                <div className="flex items-start justify-between mb-5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${layer.badge}`}>
                    Layer {layer.n}
                  </span>
                  <span className="text-2xl font-black font-mono text-slate-800">{layer.n}</span>
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-1">{layer.title}</h3>
                <div className="text-[11px] font-mono text-slate-500 mb-3">{layer.model}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{layer.task}</p>
              </motion.div>
            ))}
          </div>

          {/* Granite model badge */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {["ibm/granite-3-1-8b-instruct", "ibm/granite-embedding-30m-english", "watsonx.ai · us-south"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-xl bg-[#040d1e] border border-amber-500/20 text-[10px] font-mono text-amber-400/70">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ DASHBOARD PREVIEW MOCKUP ════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-violet-500 mb-3">Live Interface</div>
            <h2 className="font-display text-3xl font-bold text-white mb-4">Mission Control Dashboard</h2>
          </motion.div>

          {/* Dashboard mockup frame */}
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="rounded-2xl border border-sky-900/40 bg-[#040d1e]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-sky-900/30 bg-[#020812]/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 rounded-lg bg-[#071224] border border-sky-900/30 text-[10px] font-mono text-slate-500 text-center">
                mission-anomaly-copilot.vercel.app/dashboard
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="p-4 space-y-3">
              {/* KPI strip */}
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { l: "Battery", v: "26.4V", c: "text-cyan-400", s: "nominal" },
                  { l: "Solar Temp", v: "38°C", c: "text-amber-400", s: "nominal" },
                  { l: "Attitude", v: "0.12°", c: "text-violet-400", s: "nominal" },
                  { l: "Fuel Pres.", v: "211kPa", c: "text-emerald-400", s: "nominal" },
                  { l: "CPU Temp", v: "42°C", c: "text-orange-400", s: "nominal" },
                  { l: "Comm Sig.", v: "-74dBm", c: "text-sky-400", s: "nominal" },
                ].map((k, i) => (
                  <div key={i} className="rounded-xl bg-[#071224] border border-sky-900/30 p-2.5 text-center">
                    <div className="text-[9px] text-slate-500 font-mono mb-1">{k.l}</div>
                    <div className={`text-xs font-bold font-mono ${k.c}`}>{k.v}</div>
                    <div className="mt-1 h-0.5 rounded-full bg-emerald-500/30" />
                  </div>
                ))}
              </div>

              {/* Charts row mock */}
              <div className="grid grid-cols-3 gap-2">
                {["#00d4ff", "#f59e0b", "#a78bfa"].map((color, i) => (
                  <div key={i} className="rounded-xl bg-[#071224] border border-sky-900/30 p-3 h-20 flex items-end gap-px overflow-hidden">
                    {Array.from({ length: 28 }).map((_, j) => {
                      const heights = [35,38,36,40,37,39,36,38,40,37,39,36,38,37,40,38,36,39,37,38,40,37,39,38,37,40,38,39];
                      return (
                        <div key={j} className="flex-1 rounded-sm opacity-70 transition-all"
                          style={{ height: `${heights[j % heights.length]}%`, background: color }} />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Alert banner */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
                <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-xs font-bold text-rose-300">CRITICAL · battery_voltage · 19.4V below 20V threshold · IBM Granite analysis ready</span>
                <span className="ml-auto text-[10px] font-mono text-rose-400/60">2m ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,212,255,0.05)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-500 mb-4">Ready to launch</div>
            <h2 className="font-display text-4xl font-bold text-white mb-5 leading-tight">
              Mission Control<br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">Awaits Your Command</span>
            </h2>
            <p className="text-slate-500 mb-10 leading-relaxed">
              Live telemetry starts immediately. Inject a simulated fault, watch IBM Granite respond in real time, approve the recovery plan.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link href="/dashboard"
                className="group flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-white text-sm font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/50 hover:-translate-y-0.5">
                <Radio className="h-4 w-4" />
                Open Mission Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Tech stack pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {["Next.js 16", "FastAPI", "IBM Granite 3.1", "LangChain", "ChromaDB", "CelesTrak", "scikit-learn", "Three.js"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-[#040d1e] border border-sky-900/30 text-[10px] font-mono text-slate-500">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-sky-900/25 py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
              <Globe2 className="h-3 w-3 text-cyan-400" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Mission Anomaly Copilot</span>
            <span className="text-slate-700">·</span>
            <span className="text-sm text-slate-600">IBM Bob AI Builders Challenge</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-700">
            <span>IBM Granite 3.1</span><span className="text-slate-800">·</span>
            <span>watsonx.ai</span><span className="text-slate-800">·</span>
            <span>LangChain + ChromaDB</span><span className="text-slate-800">·</span>
            <span>sgp4 · CelesTrak</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
