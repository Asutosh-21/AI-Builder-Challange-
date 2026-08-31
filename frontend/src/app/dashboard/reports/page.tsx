"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { Button } from "@/components/enterprise/Button";
import { Alert } from "@/components/enterprise/Alert";
import {
  FileText,
  Download,
  Plus,
  Clock,
  CheckCircle,
  Loader2,
  AlertTriangle,
  BarChart2,
  Globe2,
  Sparkles,
  FileCheck,
  Calendar,
  Filter,
} from "lucide-react";
import { format, subDays } from "date-fns";

interface Report {
  id: string;
  title: string;
  type: "Anomaly Summary" | "Mission Status" | "Orbit Intel" | "AI Analysis";
  status: "Ready" | "Generating" | "Queued";
  generated: Date;
  anomalyCount: number;
  severity: "Critical" | "Mixed" | "Nominal";
  pages: number;
}

const DEMO_REPORTS: Report[] = [
  {
    id: "rpt-001",
    title: "Daily Anomaly Summary — APEX-7",
    type: "Anomaly Summary",
    status: "Ready",
    generated: new Date(),
    anomalyCount: 3,
    severity: "Critical",
    pages: 8,
  },
  {
    id: "rpt-002",
    title: "Mission Status Report — Week 14",
    type: "Mission Status",
    status: "Ready",
    generated: subDays(new Date(), 1),
    anomalyCount: 7,
    severity: "Mixed",
    pages: 12,
  },
  {
    id: "rpt-003",
    title: "Orbit Intelligence Summary",
    type: "Orbit Intel",
    status: "Ready",
    generated: subDays(new Date(), 2),
    anomalyCount: 0,
    severity: "Nominal",
    pages: 5,
  },
  {
    id: "rpt-004",
    title: "IBM Granite AI Analysis Log",
    type: "AI Analysis",
    status: "Ready",
    generated: subDays(new Date(), 3),
    anomalyCount: 12,
    severity: "Mixed",
    pages: 16,
  },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "Anomaly Summary": <AlertTriangle className="h-4 w-4 text-rose-400" />,
  "Mission Status": <Globe2 className="h-4 w-4 text-sky-400" />,
  "Orbit Intel": <BarChart2 className="h-4 w-4 text-violet-400" />,
  "AI Analysis": <Sparkles className="h-4 w-4 text-amber-400" />,
};

const SEVERITY_BADGE: Record<string, { variant: "danger" | "warning" | "success"; label: string }> = {
  Critical: { variant: "danger", label: "Critical" },
  Mixed: { variant: "warning", label: "Mixed" },
  Nominal: { variant: "success", label: "Nominal" },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [generating, setGenerating] = useState(false);

  function generateReport() {
    setGenerating(true);
    const newReport: Report = {
      id: `rpt-${Date.now()}`,
      title: "On-Demand Anomaly Report — " + format(new Date(), "MMM d HH:mm"),
      type: "Anomaly Summary",
      status: "Generating",
      generated: new Date(),
      anomalyCount: 2,
      severity: "Critical",
      pages: 0,
    };
    setReports((prev) => [newReport, ...prev]);
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === newReport.id ? { ...r, status: "Ready", pages: 9 } : r
        )
      );
      setGenerating(false);
    }, 3000);
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold text-white font-display">Reports</h1>
            <p className="text-sm text-slate-400">Incident audit reports, compliance exports, and AI analysis logs</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          loading={generating}
          onClick={generateReport}
        >
          Generate Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: reports.length, color: "text-cyan-400" },
          { label: "Ready", value: reports.filter((r) => r.status === "Ready").length, color: "text-emerald-400" },
          { label: "Critical Incidents", value: reports.filter((r) => r.severity === "Critical").length, color: "text-rose-400" },
          { label: "Total Anomalies", value: reports.reduce((s, r) => s + r.anomalyCount, 0), color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-[#091124]/80 border border-sky-900/50 p-4 text-center"
          >
            <div className={`text-2xl font-bold font-mono ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card hover>
              <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-[#0d1a36] border border-slate-700/50 flex-shrink-0">
                    {TYPE_ICONS[report.type]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-white truncate">{report.title}</span>
                      {report.status === "Generating" && (
                        <Badge variant="info" size="sm">
                          <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                          Generating
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(report.generated, "MMM d, HH:mm")}
                      </span>
                      <span>{report.type}</span>
                      {report.pages > 0 && <span>{report.pages} pages</span>}
                      {report.anomalyCount > 0 && (
                        <span>{report.anomalyCount} anomalies</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={SEVERITY_BADGE[report.severity].variant} size="sm">
                    {SEVERITY_BADGE[report.severity].label}
                  </Badge>
                  {report.status === "Ready" && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      Export
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Alert variant="info">
        <div className="text-xs">
          <strong>Export Formats:</strong> PDF, CSV, and JSON are supported. Reports include AI-generated summaries from IBM Granite, raw telemetry logs, and chain-of-custody audit trail.
        </div>
      </Alert>
    </div>
  );
}
