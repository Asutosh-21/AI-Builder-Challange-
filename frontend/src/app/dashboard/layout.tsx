"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Sparkles,
  Globe2,
  MessageSquare,
  FileText,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Satellite,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, label: "Mission Control", match: (p: string) => p === "/dashboard" },
  { key: "telemetry", href: "/dashboard", icon: Activity, label: "Live Telemetry", match: (p: string) => p === "/dashboard" },
  { key: "alerts", href: "/dashboard/alerts", icon: AlertTriangle, label: "Anomaly Center", match: (p: string) => p.startsWith("/dashboard/alerts") },
  { key: "workspace", href: "/dashboard/incident-workspace", icon: Sparkles, label: "Incident Workspace", match: (p: string) => p.startsWith("/dashboard/incident-workspace") },
  { key: "copilot", href: "/dashboard/copilot", icon: Globe, label: "Mission Planner", match: (p: string) => p.startsWith("/dashboard/copilot") },
  { key: "incident-copilot", href: "/dashboard/incident-copilot", icon: MessageSquare, label: "AI Copilot", match: (p: string) => p.startsWith("/dashboard/incident-copilot") },
  { key: "orbit", href: "/dashboard/orbit", icon: Globe2, label: "Orbit Intel", match: (p: string) => p.startsWith("/dashboard/orbit") },
  { key: "nasa", href: "/dashboard/nasa", icon: Satellite, label: "NASA Data", match: (p: string) => p.startsWith("/dashboard/nasa") },
  { key: "reports", href: "/dashboard/reports", icon: FileText, label: "Reports", match: (p: string) => p.startsWith("/dashboard/reports") },
  { key: "settings", href: "/dashboard/settings", icon: Settings, label: "Settings", match: (p: string) => p.startsWith("/dashboard/settings") },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#030c1a]">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <AnimatePresence initial={false}>
          <motion.aside
            key="sidebar"
            initial={false}
            animate={{ width: sidebarCollapsed ? 56 : 220 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="relative flex-shrink-0 border-r border-sky-900/40 bg-[#071224]/90 backdrop-blur-xl hidden lg:flex flex-col"
          >
            {/* Nav Items */}
            <nav className="flex-1 py-3 space-y-0.5 overflow-hidden">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(pathname);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full" />
                    )}
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"}`} />
                    <AnimatePresence initial={false}>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </nav>

            {/* Collapse Toggle */}
            <div className="py-3 px-2 border-t border-sky-900/30">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all text-xs"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
