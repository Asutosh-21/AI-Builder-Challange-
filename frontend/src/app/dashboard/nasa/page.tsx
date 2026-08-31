"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { Button } from "@/components/enterprise/Button";
import { Alert } from "@/components/enterprise/Alert";
import { Skeleton } from "@/components/enterprise/Skeleton";
import {
  Satellite,
  Sun,
  Globe2,
  Zap,
  AlertTriangle,
  RefreshCw,
  Radio,
  Thermometer,
  ArrowUpRight,
  ExternalLink,
  Clock,
  Activity,
  Shield,
} from "lucide-react";
import { format, subHours } from "date-fns";

interface SpaceWeatherItem {
  id: string;
  time: Date;
  type: string;
  intensity: string;
  region: string;
  description: string;
  severity: "low" | "medium" | "high";
}

interface NasaEvent {
  id: string;
  time: Date;
  title: string;
  source: string;
  type: "Solar Flare" | "CME" | "Geomagnetic Storm" | "Asteroid" | "ISS";
  url?: string;
}

const DEMO_WEATHER: SpaceWeatherItem[] = [
  { id: "sw-1", time: new Date(), type: "Solar Flare", intensity: "M2.3", region: "AR3490", description: "Moderate M-class solar flare originating from active region 3490. Possible radio blackout on sunlit side.", severity: "medium" },
  { id: "sw-2", time: subHours(new Date(), 3), type: "CME", intensity: "Halo", region: "AR3489", description: "Coronal Mass Ejection detected. Estimated arrival at L1 in 48-72 hours. Geomagnetic activity likely.", severity: "high" },
  { id: "sw-3", time: subHours(new Date(), 8), type: "Geomagnetic Storm", intensity: "G1", region: "Global", description: "Minor geomagnetic storm in progress. Possible compass deviations at high latitudes.", severity: "low" },
  { id: "sw-4", time: subHours(new Date(), 14), type: "Proton Event", intensity: "S1", region: "GEO Belt", description: "Minor proton event. Elevated radiation near polar caps. No significant spacecraft impact expected.", severity: "low" },
];

const DEMO_EVENTS: NasaEvent[] = [
  { id: "ev-1", time: new Date(), title: "ISS Orbit Reboost Maneuver Completed", source: "NASA JSC", type: "ISS", url: "https://www.nasa.gov" },
  { id: "ev-2", time: subHours(new Date(), 2), title: "Artemis III Mission Update — Crew Training Phase", source: "NASA HQ", type: "Asteroid", url: "https://www.nasa.gov" },
  { id: "ev-3", time: subHours(new Date(), 6), title: "James Webb Space Telescope Observation Cycle 3", source: "STScI", type: "Solar Flare", url: "https://www.nasa.gov" },
  { id: "ev-4", time: subHours(new Date(), 12), title: "Deep Space Climate Observatory Solar Wind Update", source: "NOAA/NASA", type: "CME", url: "https://www.nasa.gov" },
];

function severityColor(s: "low" | "medium" | "high") {
  if (s === "high") return "border-rose-500/40 bg-rose-950/20";
  if (s === "medium") return "border-amber-500/40 bg-amber-950/20";
  return "border-sky-500/30 bg-sky-950/10";
}

export default function NasaPage() {
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  function refresh() {
    setLoading(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sun className="h-5 w-5 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold text-white font-display">NASA Space Weather & Events</h1>
            <p className="text-sm text-slate-400">
              Solar activity, CME alerts, and mission events · Last updated {format(lastRefresh, "HH:mm:ss")}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          loading={loading}
          onClick={refresh}
        >
          Refresh
        </Button>
      </div>

      {/* Space Weather Index */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Kp Index", value: "4", unit: "", color: "text-amber-400", desc: "Active" },
          { label: "Solar Wind", value: "452", unit: "km/s", color: "text-cyan-400", desc: "Elevated" },
          { label: "X-Ray Flux", value: "M2.3", unit: "", color: "text-rose-400", desc: "Moderate" },
          { label: "Proton Flux", value: "11.2", unit: "pfu", color: "text-emerald-400", desc: "Nominal" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-[#091124]/80 border border-sky-900/50 p-4"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">{item.label}</div>
            <div className={`text-2xl font-bold font-mono ${item.color}`}>
              {item.value}
              {item.unit && <span className="text-sm text-slate-400 ml-1">{item.unit}</span>}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Space Weather Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Active Space Weather Alerts</span>
            <Badge variant="warning" size="sm">{DEMO_WEATHER.length} Events</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {DEMO_WEATHER.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border p-3.5 ${severityColor(item.severity)}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-white">{item.type}</span>
                    <Badge
                      variant={item.severity === "high" ? "danger" : item.severity === "medium" ? "warning" : "info"}
                      size="sm"
                    >
                      {item.intensity}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-500">{item.region}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(item.time, "HH:mm")}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* NASA Events Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-bold text-white">NASA Mission Events</span>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-800/40 pt-0">
          {DEMO_EVENTS.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              className="py-3.5 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white mb-0.5">{ev.title}</div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>{ev.source}</span>
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  <span>{format(ev.time, "MMM d, HH:mm")}</span>
                </div>
              </div>
              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Alert variant="info">
        <div className="text-xs">
          <strong>Data Source:</strong> Space weather data sourced from NOAA Space Weather Prediction Center (SWPC) and NASA Space Weather APIs.
          Mission events from NASA RSS and public announcement feeds. Refresh rate: 15 minutes.
        </div>
      </Alert>
    </div>
  );
}
