"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAnomalies } from "@/lib/hooks/useAnomalies";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { Button } from "@/components/enterprise/Button";
import { Alert } from "@/components/enterprise/Alert";
import { StatusIndicator } from "@/components/enterprise/StatusIndicator";
import { Timeline, TimelineItem } from "@/components/enterprise/Timeline";
import {
  Globe,
  Sparkles,
  Brain,
  Target,
  Activity,
  Fuel,
  Battery,
  Compass,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart2,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OrbitalParams {
  altitude_km: number;
  inclination_deg: number;
  fuel_remaining_pct: number;
  mission_objective: string;
  orbital_speed_kms: number;
}

const DEFAULT_ORBITAL: OrbitalParams = {
  altitude_km: 549.8,
  inclination_deg: 51.6,
  fuel_remaining_pct: 84.2,
  mission_objective: "Earth observation + atmospheric sensing (primary), orbital debris tracking (secondary)",
  orbital_speed_kms: 7.66,
};

const SCENARIOS = [
  {
    id: "conservative",
    label: "Conservative",
    desc: "Monitor and wait — minimum fuel cost, maximum time to resolution",
    fuel: "0.0%",
    time: "4-6 hours",
    risk: 72,
    riskAfter: 68,
    recommended: false,
  },
  {
    id: "standard",
    label: "Recommended",
    desc: "Safe mode + solar reorientation — balanced approach",
    fuel: "0.4%",
    time: "45 min",
    risk: 72,
    riskAfter: 28,
    recommended: true,
  },
  {
    id: "aggressive",
    label: "Aggressive",
    desc: "Full diagnostic mode + emergency charge — fastest but highest cost",
    fuel: "2.1%",
    time: "15 min",
    risk: 72,
    riskAfter: 12,
    recommended: false,
  },
];

export default function MissionPlannerPage() {
  const { anomalies } = useAnomalies(5000);
  const [orbital] = useState<OrbitalParams>(DEFAULT_ORBITAL);
  const [selectedScenario, setSelectedScenario] = useState("standard");
  const [planning, setPlanning] = useState(false);

  const activeAnomaly = anomalies.find((a) => a.status === "active" && a.severity === "CRITICAL")
    ?? anomalies.find((a) => a.status === "active")
    ?? anomalies[0];

  async function generatePlan() {
    if (!activeAnomaly) return;
    setPlanning(true);
    try {
      await fetch(`${API_URL}/api/anomalies/${activeAnomaly.id}/plan`, { method: "POST" });
    } catch {} finally {
      setPlanning(false);
    }
  }

  const chosen = SCENARIOS.find((s) => s.id === selectedScenario)!;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-sky-400" />
          <div>
            <h1 className="text-xl font-bold text-white font-display">Mission Response Planner</h1>
            <p className="text-sm text-slate-400">AI-assisted mission planning with risk visualization · IBM Granite 3.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Brain className="h-4 w-4" />}
            loading={planning}
            onClick={generatePlan}
            disabled={!activeAnomaly}
          >
            Generate AI Plan
          </Button>
        </div>
      </div>

      {!activeAnomaly ? (
        <Alert variant="success">
          <div className="text-sm">
            <strong>No Active Incidents</strong> — All systems nominal. Mission planning is in standby mode.
          </div>
        </Alert>
      ) : (
        <>
          {/* Active Anomaly Context Bar */}
          <div className={`rounded-2xl border p-4 ${
            activeAnomaly.severity === "CRITICAL" ? "bg-rose-950/30 border-rose-500/40" : "bg-amber-950/30 border-amber-500/40"
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${activeAnomaly.severity === "CRITICAL" ? "text-rose-400 blink-critical" : "text-amber-400"}`} />
                <div>
                  <div className="text-sm font-bold text-white">
                    Planning for: {activeAnomaly.severity} Anomaly — {activeAnomaly.affected_channels.join(", ")}
                  </div>
                  <div className="text-xs text-slate-400">
                    Detected {format(new Date(activeAnomaly.detected_at), "HH:mm:ss")} · Score: {activeAnomaly.anomaly_score.toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={activeAnomaly.severity === "CRITICAL" ? "danger" : "warning"} size="sm">
                  {activeAnomaly.severity}
                </Badge>
                <Link href="/dashboard/incident-workspace">
                  <Button variant="ghost" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Incident Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Scenario Comparison */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white">Response Scenario Comparison</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SCENARIOS.map((s) => (
                    <motion.div
                      key={s.id}
                      whileHover={{ scale: 1.005 }}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? "border-cyan-500/40 bg-cyan-950/20"
                          : "border-sky-900/40 bg-[#091124]/60 hover:border-sky-700/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{s.label}</span>
                            {s.recommended && <Badge variant="primary" size="sm">Recommended</Badge>}
                            {selectedScenario === s.id && <Badge variant="info" size="sm">Selected</Badge>}
                          </div>
                          <p className="text-xs text-slate-400 mb-3">{s.desc}</p>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <div className="text-slate-500 mb-0.5 font-mono uppercase tracking-wider text-[10px]">Fuel Cost</div>
                              <div className="font-bold font-mono text-white">{s.fuel}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-0.5 font-mono uppercase tracking-wider text-[10px]">Time to Resolve</div>
                              <div className="font-bold font-mono text-white">{s.time}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 mb-0.5 font-mono uppercase tracking-wider text-[10px]">Risk Reduction</div>
                              <div className="font-bold font-mono text-emerald-400">
                                {s.risk}% → {s.riskAfter}%
                              </div>
                            </div>
                          </div>
                          {/* Risk bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                              <span>Mission Risk After Action</span>
                              <span className="text-emerald-400">{s.riskAfter}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s.riskAfter}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  s.riskAfter > 50 ? "bg-rose-500" : s.riskAfter > 25 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Mission Plan */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-400" />
                      <span className="text-sm font-bold text-white">IBM Granite Mission Plan</span>
                    </div>
                    <Badge variant="primary" size="sm">AI Generated</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeAnomaly.mission_plan ? (
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-[#071224] rounded-xl p-4 border border-sky-900/30">
                      {activeAnomaly.mission_plan}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic text-center py-8">
                      <Brain className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      Click "Generate AI Plan" to get IBM Granite mission recommendations for the selected scenario.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Orbital Context */}
            <div className="space-y-4">
              {/* Orbital Parameters */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white">Orbital Parameters</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Altitude", value: `${orbital.altitude_km.toFixed(1)} km`, icon: <ArrowRight className="h-3.5 w-3.5 text-cyan-400" /> },
                    { label: "Inclination", value: `${orbital.inclination_deg.toFixed(1)}°`, icon: <Compass className="h-3.5 w-3.5 text-sky-400" /> },
                    { label: "Speed", value: `${orbital.orbital_speed_kms.toFixed(2)} km/s`, icon: <Activity className="h-3.5 w-3.5 text-emerald-400" /> },
                    { label: "Fuel", value: `${orbital.fuel_remaining_pct.toFixed(1)}%`, icon: <Fuel className="h-3.5 w-3.5 text-amber-400" /> },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400">{item.icon}{item.label}</div>
                      <span className="text-sm font-bold font-mono text-white">{item.value}</span>
                    </div>
                  ))}
                  {/* Fuel gauge */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Fuel Remaining</span>
                      <span className="text-amber-400">{orbital.fuel_remaining_pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                        style={{ width: `${orbital.fuel_remaining_pct}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mission Objective */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Mission Objective</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-300 leading-relaxed">{orbital.mission_objective}</p>
                </CardContent>
              </Card>

              {/* Execution Checklist */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Execution Checklist</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Timeline>
                    {[
                      "Enter spacecraft safe mode",
                      "Reorient solar arrays to sun vector",
                      "Throttle background CPU processes",
                      "Monitor voltage recovery (30 min)",
                      "Resume nominal operations",
                    ].map((step, i) => (
                      <TimelineItem key={i} status={i === 0 ? "active" : "pending"}>
                        <div className="text-xs text-slate-300">{step}</div>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </CardContent>
              </Card>

              <Alert variant="warning">
                <div className="text-xs">
                  <strong>Human Approval Required:</strong> All mission commands require explicit operator authorization before execution.
                </div>
              </Alert>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
