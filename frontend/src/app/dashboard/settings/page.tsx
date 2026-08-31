"use client";

import { Card, CardHeader, CardContent, Badge, Button, Alert } from "@/components/enterprise";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Database, Globe, Monitor, Palette, Keyboard, Save, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const settingsSections = [
    {
      id: "profile",
      title: "Profile Settings",
      icon: <User className="h-5 w-5" />,
      items: [
        { label: "Display Name", value: "Mission Operator", type: "text" },
        { label: "Email", value: "operator@space.mission", type: "email" },
        { label: "Role", value: "Flight Director", type: "readonly" },
      ],
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      icon: <Bell className="h-5 w-5" />,
      items: [
        { label: "Critical Anomalies", value: "enabled", type: "toggle" },
        { label: "Warning Alerts", value: "enabled", type: "toggle" },
        { label: "AI Analysis Complete", value: "enabled", type: "toggle" },
        { label: "Conjunction Warnings", value: "disabled", type: "toggle" },
        { label: "Daily Summary", value: "disabled", type: "toggle" },
      ],
    },
    {
      id: "security",
      title: "Security & Access",
      icon: <Shield className="h-5 w-5" />,
      items: [
        { label: "Two-Factor Authentication", value: "enabled", type: "toggle" },
        { label: "Session Timeout", value: "30 minutes", type: "select" },
        { label: "API Key Access", value: "restricted", type: "readonly" },
      ],
    },
    {
      id: "data",
      title: "Data & Storage",
      icon: <Database className="h-5 w-5" />,
      items: [
        { label: "Telemetry Retention", value: "90 days", type: "select" },
        { label: "Anomaly History", value: "1 year", type: "select" },
        { label: "Export Format", value: "CSV", type: "select" },
        { label: "Storage Used", value: "2.4 GB / 10 GB", type: "readonly" },
      ],
    },
    {
      id: "display",
      title: "Display & Appearance",
      icon: <Palette className="h-5 w-5" />,
      items: [
        { label: "Theme", value: "Dark Enterprise", type: "select" },
        { label: "Accent Color", value: "Cyan", type: "select" },
        { label: "Chart Density", value: "Medium", type: "select" },
        { label: "Animation Speed", value: "Normal", type: "select" },
      ],
    },
    {
      id: "system",
      title: "System Configuration",
      icon: <Monitor className="h-5 w-5" />,
      items: [
        { label: "Telemetry Refresh Rate", value: "1 Hz", type: "select" },
        { label: "Orbit Data Refresh", value: "15s", type: "select" },
        { label: "AI Model Temperature", value: "0.3", type: "select" },
        { label: "Max Token Limit", value: "400", type: "readonly" },
      ],
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display mb-1">Settings</h1>
          <p className="text-sm text-slate-400">
            Configure your mission control environment and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RotateCcw className="h-4 w-4" />}>
            Reset to Defaults
          </Button>
          <Button variant="primary" size="sm" icon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: settingsSections.indexOf(section) * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    {section.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{section.title}</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                      <div>
                        <div className="text-sm text-white">{item.label}</div>
                        {item.type === "readonly" && (
                          <div className="text-xs text-slate-500">System managed</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.type === "toggle" ? (
                          <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.value === "enabled" ? "bg-cyan-500" : "bg-slate-700"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${item.value === "enabled" ? "left-5" : "left-0.5"}`} />
                          </div>
                        ) : item.type === "select" ? (
                          <select className="bg-[#111d35] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500/50">
                            <option>{item.value}</option>
                          </select>
                        ) : item.type === "text" || item.type === "email" ? (
                          <input
                            type={item.type}
                            defaultValue={item.value}
                            className="bg-[#111d35] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500/50 w-40"
                          />
                        ) : (
                          <Badge variant="info" size="sm">{item.value}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Keyboard Shortcuts</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { shortcut: "Cmd/Ctrl + K", action: "Open Command Palette" },
              { shortcut: "Cmd/Ctrl + /", action: "Search" },
              { shortcut: "Cmd/Ctrl + B", action: "Toggle Sidebar" },
              { shortcut: "Esc", action: "Close Modal/Drawer" },
              { shortcut: "1-7", action: "Navigate to Dashboard Tabs" },
              { shortcut: "R", action: "Refresh Data" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-300">{item.action}</span>
                <kbd className="px-2 py-1 bg-[#111d35] border border-slate-700 rounded text-xs font-mono text-slate-400">
                  {item.shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Alert variant="info">
        <div className="text-sm">
          <strong>System Status:</strong> All services operational · Backend latency: 45ms · Database: Connected · AI Model: IBM Granite 3.1 8B Instruct
        </div>
      </Alert>
    </div>
  );
}
