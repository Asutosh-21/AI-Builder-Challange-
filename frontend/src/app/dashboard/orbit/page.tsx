"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { Button } from "@/components/enterprise/Button";
import { Alert } from "@/components/enterprise/Alert";
import { StatusIndicator } from "@/components/enterprise/StatusIndicator";
import { Skeleton } from "@/components/enterprise/Skeleton";
import { OrbitGlobeCanvas } from "@/components/3d/OrbitGlobeCanvas";
import {
  Globe2,
  Satellite,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  Radio,
  Compass,
  Clock,
  Layers,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OrbitStatus {
  altitude_km: number;
  inclination_deg: number;
  orbital_period_min: number;
  orbital_speed_kms: number;
  fuel_remaining_pct: number;
  mission_objective: string;
}

interface SatelliteRecord {
  name: string;
  norad_id: string;
  altitude_km: number;
  inclination_deg: number;
  orbital_period_min: number;
  risk_flag: string;
}

interface OrbitData {
  spacecraft: OrbitStatus;
  nearby: SatelliteRecord[];
  conjunction_risk: "CLEAR" | "CAUTION" | "AVOID";
  total_nearby: number;
}

const DEMO_DATA: OrbitData = {
  spacecraft: {
    altitude_km: 549.8,
    inclination_deg: 51.6,
    orbital_period_min: 95.6,
    orbital_speed_kms: 7.66,
    fuel_remaining_pct: 84.2,
    mission_objective: "Earth observation + atmospheric sensing",
  },
  nearby: [
    { name: "Starlink-2631", norad_id: "47848", altitude_km: 551.2, inclination_deg: 53.1, orbital_period_min: 95.8, risk_flag: "LOW" },
    { name: "OneWeb-031", norad_id: "47844", altitude_km: 547.5, inclination_deg: 50.8, orbital_period_min: 95.4, risk_flag: "LOW" },
    { name: "Cosmos-1408 DEB", norad_id: "52750", altitude_km: 545.1, inclination_deg: 82.5, orbital_period_min: 95.2, risk_flag: "HIGH" },
    { name: "SL-16 R/B Frag", norad_id: "49123", altitude_km: 553.6, inclination_deg: 71.0, orbital_period_min: 96.1, risk_flag: "MEDIUM" },
    { name: "LEMUR-2-VICTOR", norad_id: "44087", altitude_km: 548.9, inclination_deg: 51.2, orbital_period_min: 95.5, risk_flag: "LOW" },
    { name: "FLOCK-4E-29", norad_id: "43614", altitude_km: 550.4, inclination_deg: 52.4, orbital_period_min: 95.7, risk_flag: "LOW" },
    { name: "Spire-FM93", norad_id: "48901", altitude_km: 546.3, inclination_deg: 49.7, orbital_period_min: 95.3, risk_flag: "LOW" },
  ],
  conjunction_risk: "CAUTION",
  total_nearby: 7,
};

function riskColor(flag: string) {
  if (flag === "HIGH") return "text-rose-400 bg-rose-950/50 border-rose-500/40";
  if (flag === "MEDIUM") return "text-amber-400 bg-amber-950/50 border-amber-500/40";
  return "text-emerald-400 bg-emerald-950/50 border-emerald-500/40";
}

export default function OrbitPage() {
  const [data, setData] = useState<OrbitData>(DEMO_DATA);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orbit/nearby`);
      if (res.ok) setData(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  const riskBadge = {
    CLEAR: { variant: "success" as const, label: "CLEAR", icon: <ShieldCheck className="h-4 w-4" />, desc: "No significant conjunction threats in 2-orbit window" },
    CAUTION: { variant: "warning" as const, label: "CAUTION", icon: <AlertTriangle className="h-4 w-4" />, desc: "5-20 nearby objects — monitor maneuver window" },
    AVOID: { variant: "danger" as const, label: "AVOID", icon: <AlertTriangle className="h-4 w-4" />, desc: "High density traffic — delay maneuver execution" },
  };
  const risk = riskBadge[data.conjunction_risk];

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-sky-400" />
          <div>
            <h1 className="text-xl font-bold text-white font-display">Orbit Intelligence</h1>
            <p className="text-sm text-slate-400">CelesTrak TLE · sgp4 propagation · ±50 km altitude band</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          loading={loading}
          onClick={refresh}
        >
          Refresh TLE Data
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Globe — explicitly structured, no flex tricks */}
        <div className="lg:col-span-2">
          {/* Card header rendered manually to avoid flex/overflow conflicts */}
          <div className="rounded-2xl border border-sky-900/50 bg-[#091124]/80 shadow-xl backdrop-blur-xl overflow-hidden">
            {/* Header row */}
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                <span className="text-sm font-bold text-white">3D Orbital Map</span>
              </div>
              <Badge variant={risk.variant} size="sm">
                {risk.icon} {risk.label}
              </Badge>
            </div>
            {/* Canvas area — explicit pixel height, position relative so absolute child works */}
            <div style={{ height: 400, position: "relative" }}>
              <OrbitGlobeCanvas />
            </div>
          </div>
        </div>

        {/* Spacecraft Status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">APEX-7 Status</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Altitude", value: `${data.spacecraft.altitude_km.toFixed(1)} km`, icon: <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" /> },
                { label: "Inclination", value: `${data.spacecraft.inclination_deg.toFixed(1)}°`, icon: <Compass className="h-3.5 w-3.5 text-sky-400" /> },
                { label: "Orbital Period", value: `${data.spacecraft.orbital_period_min.toFixed(1)} min`, icon: <Clock className="h-3.5 w-3.5 text-violet-400" /> },
                { label: "Speed", value: `${data.spacecraft.orbital_speed_kms.toFixed(2)} km/s`, icon: <Radio className="h-3.5 w-3.5 text-emerald-400" /> },
                { label: "Fuel Remaining", value: `${data.spacecraft.fuel_remaining_pct.toFixed(1)}%`, icon: <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {item.icon}
                    {item.label}
                  </div>
                  <span className="text-sm font-bold font-mono text-white">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conjunction Risk */}
          <div className={`rounded-2xl border p-4 ${
            data.conjunction_risk === "AVOID" ? "bg-rose-950/30 border-rose-500/40"
            : data.conjunction_risk === "CAUTION" ? "bg-amber-950/30 border-amber-500/40"
            : "bg-emerald-950/30 border-emerald-500/40"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${
                data.conjunction_risk === "AVOID" ? "bg-rose-500/20 text-rose-400"
                : data.conjunction_risk === "CAUTION" ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {risk.icon}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Conjunction Risk: {risk.label}</div>
                <div className="text-[11px] text-slate-400">{data.total_nearby} objects in ±50 km band</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">{risk.desc}</p>
          </div>
        </div>
      </div>

      {/* Nearby Satellites Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-bold text-white">
                Nearby Objects ({data.nearby.length} within ±50 km altitude band)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800/50 text-[11px] font-mono text-slate-500">
                <th className="text-left px-4 py-3 font-normal">Name</th>
                <th className="text-left px-4 py-3 font-normal">NORAD ID</th>
                <th className="text-right px-4 py-3 font-normal">Altitude</th>
                <th className="text-right px-4 py-3 font-normal">Inclination</th>
                <th className="text-right px-4 py-3 font-normal">Period</th>
                <th className="text-center px-4 py-3 font-normal">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {data.nearby.map((sat, i) => (
                <motion.tr
                  key={sat.norad_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-white">{sat.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{sat.norad_id}</td>
                  <td className="px-4 py-3 text-right font-mono text-cyan-300">{sat.altitude_km.toFixed(1)} km</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300">{sat.inclination_deg.toFixed(1)}°</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300">{sat.orbital_period_min.toFixed(1)} min</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-lg border text-[10px] font-bold ${riskColor(sat.risk_flag)}`}>
                      {sat.risk_flag}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
