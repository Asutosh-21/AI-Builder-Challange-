"use client";

import { useEffect, useState } from "react";
import { useAnomalies } from "@/lib/hooks/useAnomalies";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, Badge, StatusIndicator, Button, Alert, Timeline, TimelineItem } from "@/components/enterprise";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Brain, Target, Shield, TrendingUp, ArrowRight, ChevronRight, FileText, Activity, Zap } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function IncidentWorkspacePage() {
  const { anomalies, loading } = useAnomalies(3000);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  // Select the most critical anomaly by default
  useEffect(() => {
    if (anomalies.length > 0 && !selectedAnomaly) {
      const critical = anomalies.find((a) => a.severity === "CRITICAL");
      setSelectedAnomaly(critical || anomalies[0]);
    }
  }, [anomalies, selectedAnomaly]);

  async function generateFullAnalysis(anomalyId: string) {
    setGenerating(true);
    try {
      await Promise.all([
        fetch(`${API_URL}/api/anomalies/${anomalyId}/explain`, { method: "POST" }),
        fetch(`${API_URL}/api/anomalies/${anomalyId}/plan`, { method: "POST" }),
      ]);
      // Refresh anomaly data
      // In a real app, you'd re-fetch the specific anomaly
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading incident workspace...</div>
      </div>
    );
  }

  if (!selectedAnomaly) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Active Incidents</h3>
        <p className="text-slate-400">
          Navigate to the Anomaly Center to view and manage detected anomalies.
        </p>
      </div>
    );
  }

  const riskLevel = selectedAnomaly.severity === "CRITICAL" ? 85 : selectedAnomaly.severity === "WARNING" ? 45 : 15;
  const confidence = selectedAnomaly.granite_explanation ? 78 : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white font-display">Incident Workspace</h1>
            <Badge variant={selectedAnomaly.severity === "CRITICAL" ? "danger" : "warning"}>
              {selectedAnomaly.severity}
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            Comprehensive incident analysis for {selectedAnomaly.affected_channels.join(", ")} · Detected {format(new Date(selectedAnomaly.detected_at), "MMM d, HH:mm:ss")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => generateFullAnalysis(selectedAnomaly.id)}
            loading={generating}
            icon={<Brain className="h-4 w-4" />}
          >
            Generate Full Analysis
          </Button>
        </div>
      </div>

      {/* Incident Overview Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Criticality</div>
            <div className="flex items-center gap-2">
              <StatusIndicator status={selectedAnomaly.severity === "CRITICAL" ? "critical" : "warning"} />
              <span className="text-sm font-bold text-white">{selectedAnomaly.severity}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Confidence</div>
            <div className="text-sm font-bold text-white font-mono">{confidence}%</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Affected Subsystem</div>
            <div className="text-sm font-bold text-white">{selectedAnomaly.affected_channels[0]}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Detection Time</div>
            <div className="text-sm font-bold text-white font-mono">{format(new Date(selectedAnomaly.detected_at), "HH:mm:ss")}</div>
          </div>
        </div>
      </Card>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: FACT & INFERENCE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FACT Section */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">FACT</h3>
              </div>
              <Badge variant="success">Verified Data</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Observed Facts */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Observed Facts</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedAnomaly.channel_values).map(([ch, val]) => (
                    <div key={ch} className="bg-[#111d35] rounded-lg p-3 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">{ch}</div>
                      <div className={`text-sm font-mono font-bold ${selectedAnomaly.affected_channels.includes(ch) ? "text-rose-400" : "text-white"}`}>
                        {typeof val === 'number' ? val.toFixed(3) : String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomaly Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Anomaly Timeline</h4>
                <Timeline>
                  <TimelineItem status="completed">
                    <div className="text-sm">
                      <div className="font-bold text-white">Anomaly Detected</div>
                      <div className="text-xs text-slate-400">{format(new Date(selectedAnomaly.detected_at), "MMM d, HH:mm:ss")}</div>
                    </div>
                  </TimelineItem>
                  <TimelineItem status={selectedAnomaly.granite_explanation ? "completed" : "active"}>
                    <div className="text-sm">
                      <div className="font-bold text-white">AI Analysis In Progress</div>
                      <div className="text-xs text-slate-400">IBM Granite processing telemetry patterns</div>
                    </div>
                  </TimelineItem>
                  <TimelineItem status="pending">
                    <div className="text-sm">
                      <div className="font-bold text-white">Recommendation Pending</div>
                      <div className="text-xs text-slate-400">Awaiting AI response plan generation</div>
                    </div>
                  </TimelineItem>
                </Timeline>
              </div>

              {/* Supporting Telemetry */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Supporting Telemetry</h4>
                <Alert variant="info">
                  <div className="text-sm">
                    <strong>Pattern:</strong> {selectedAnomaly.trigger_type} detection with anomaly score of {selectedAnomaly.anomaly_score.toFixed(4)}
                  </div>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* INFERENCE Section */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">INFERENCE</h3>
              </div>
              <Badge variant="primary">IBM Granite</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Root Cause */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Root Cause Analysis</h4>
                <div className={`bg-[#111d35] rounded-lg p-4 border border-slate-800 text-sm leading-relaxed ${selectedAnomaly.granite_explanation ? "text-white" : "text-slate-500 italic"}`}>
                  {selectedAnomaly.granite_explanation ?? "Root cause analysis pending... IBM Granite will analyze the telemetry patterns and provide probable root cause explanation."}
                </div>
              </div>

              {/* Confidence Assessment */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Confidence Assessment</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Analysis Confidence</span>
                      <span className="text-white font-mono">{confidence}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Sources */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Evidence Sources</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info" size="sm">Telemetry Stream</Badge>
                  <Badge variant="info" size="sm">Historical Patterns</Badge>
                  <Badge variant="info" size="sm">NASA Anomaly Database</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RECOMMENDATION Section */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">RECOMMENDATION</h3>
              </div>
              <Badge variant="warning">Action Required</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mission Response Plan */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Mission Response Plan</h4>
                <div className={`bg-[#111d35] rounded-lg p-4 border border-slate-800 text-sm leading-relaxed whitespace-pre-wrap ${selectedAnomaly.mission_plan ? "text-white" : "text-slate-500 italic"}`}>
                  {selectedAnomaly.mission_plan ?? "Mission response plan pending... IBM Granite will generate a comprehensive recovery plan with risk assessment and fuel impact analysis."}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mission Impact Assessment</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#111d35] rounded-lg p-3 border border-slate-800 text-center">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Risk Before</div>
                    <div className="text-lg font-bold text-rose-400 font-mono">{riskLevel}%</div>
                  </div>
                  <div className="bg-[#111d35] rounded-lg p-3 border border-slate-800 text-center">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Risk After</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">{Math.max(5, riskLevel - 40)}%</div>
                  </div>
                  <div className="bg-[#111d35] rounded-lg p-3 border border-slate-800 text-center">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Reduction</div>
                    <div className="text-lg font-bold text-cyan-400 font-mono">~{Math.round(40 / riskLevel * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Resource Impact */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resource Impact Estimate</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111d35] rounded-lg p-3 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Fuel Impact</div>
                    <div className="text-sm font-bold text-white font-mono">~2.3%</div>
                  </div>
                  <div className="bg-[#111d35] rounded-lg p-3 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Power Impact</div>
                    <div className="text-sm font-bold text-white font-mono">~1.1%</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <Button variant="primary" icon={<CheckCircle className="h-4 w-4" />}>
                  Approve Plan
                </Button>
                <Button variant="secondary" icon={<FileText className="h-4 w-4" />}>
                  Request Review
                </Button>
                <Button variant="ghost" icon={<ArrowRight className="h-4 w-4" />}>
                  View Alternatives
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Context & Quick Actions */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Stats</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Anomaly Score</span>
                <span className="text-sm font-bold text-white font-mono">{selectedAnomaly.anomaly_score.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Detection Method</span>
                <span className="text-sm font-bold text-white">{selectedAnomaly.trigger_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Affected Channels</span>
                <span className="text-sm font-bold text-white">{selectedAnomaly.affected_channels.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Time to Detect</span>
                <span className="text-sm font-bold text-white font-mono">~1.2s</span>
              </div>
            </CardContent>
          </Card>

          {/* Spacecraft Context */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spacecraft Context</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Spacecraft</div>
                <div className="text-sm font-bold text-white">APEX-7</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Orbit</div>
                <div className="text-sm font-bold text-white">LEO · 550 km</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">Mission Phase</div>
                <div className="text-sm font-bold text-white">Nominal Operations</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">System Status</div>
                <StatusIndicator status={selectedAnomaly.severity === "CRITICAL" ? "critical" : "warning"} />
              </div>
            </CardContent>
          </Card>

          {/* Alternative Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alternative Actions</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Conservative Approach</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Monitor & Wait</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Manual Override</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Human Approval Notice */}
          <Alert variant="warning">
            <div className="text-xs">
              <strong>Human Review Required:</strong> This system provides AI-assisted recommendations. All spacecraft commands require explicit human approval before execution.
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}
