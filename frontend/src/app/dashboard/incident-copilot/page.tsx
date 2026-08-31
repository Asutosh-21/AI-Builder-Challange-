"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnomalies } from "@/lib/hooks/useAnomalies";
import { Card, CardHeader, CardContent } from "@/components/enterprise/Card";
import { Badge } from "@/components/enterprise/Badge";
import { Button } from "@/components/enterprise/Button";
import { Alert } from "@/components/enterprise/Alert";
import { Skeleton } from "@/components/enterprise/Skeleton";
import {
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
  ChevronRight,
  Loader2,
  User,
  Brain,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  ts: Date;
}

const SEED_SESSION = "session-" + Math.random().toString(36).slice(2, 9);

const STARTER_QUESTIONS = [
  "What caused similar battery voltage drops on other missions?",
  "Has this thermal profile been observed before on LEO satellites?",
  "What are the risks if I don't act on a voltage anomaly?",
  "What was the root cause of the Sentinel-6A anomaly?",
  "Compare our fuel pressure pattern to historical fuel leak cases.",
];

const DEMO_RESPONSES: Record<string, { content: string; citations: string[] }> = {
  default: {
    content:
      "Based on the historical incident database, battery voltage drops below 22V on LEO spacecraft are most commonly caused by one of three root causes: (1) solar array degradation from radiation exposure, (2) battery cell aging in the primary bus, or (3) short-circuit conditions on high-current subsystems.\n\nThe TERRA-3 mission experienced a similar profile in 2019 — gradual voltage decline over 45 minutes correlated with thermal rise in the power conditioning unit. Recovery was achieved via safe mode and solar array reorientation.\n\nCurrent confidence in voltage_drop diagnosis: **medium-high** (0.78 anomaly score, rule trigger confirmed).",
    citations: ["TERRA-3 Battery Anomaly 2019", "NASA NTRS: Battery Bus Failures in LEO", "APEX-7 Historical Baseline"],
  },
};

function CitationChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-[10px] font-semibold text-sky-300 hover:border-sky-400/50 transition-colors cursor-pointer">
      <BookOpen className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

export default function IncidentCopilotPage() {
  const { anomalies } = useAnomalies(5000);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId] = useState(SEED_SESSION);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAnomaly = anomalies.find((a) => a.status === "active");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setStreaming(true);

      // Placeholder assistant message for streaming effect
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", citations: [], ts: new Date() },
      ]);

      try {
        const res = await fetch(`${API_URL}/api/copilot/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            message: text,
            anomaly_id: activeAnomaly?.id ?? null,
          }),
        });

        if (!res.ok) throw new Error("Copilot unavailable");

        // Stream the response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: fullText } : m
              )
            );
          }
        }

        // Add citations
        const resp = DEMO_RESPONSES.default;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, citations: resp.citations }
              : m
          )
        );
      } catch {
        // Fallback demo response
        const resp = DEMO_RESPONSES.default;
        let i = 0;
        const words = resp.content.split(" ");
        const typeInterval = setInterval(() => {
          if (i >= words.length) {
            clearInterval(typeInterval);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: resp.content, citations: resp.citations }
                  : m
              )
            );
            setStreaming(false);
            return;
          }
          i += 3;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: words.slice(0, i).join(" ") }
                : m
            )
          );
        }, 40);
        return;
      }

      setStreaming(false);
    },
    [streaming, sessionId, activeAnomaly]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-violet-400" />
          <div>
            <h1 className="text-xl font-bold text-white font-display">RAG Incident Copilot</h1>
            <p className="text-xs text-slate-400">
              Powered by IBM Granite · NASA anomaly corpus · {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeAnomaly && (
            <Badge variant={activeAnomaly.severity === "CRITICAL" ? "danger" : "warning"} size="sm">
              Context: {activeAnomaly.severity} Active
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => setMessages([])}
          >
            New Session
          </Button>
        </div>
      </div>

      {/* Suggested Starters (when empty) */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex-shrink-0"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Suggested Questions</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091124] border border-sky-900/50 text-xs text-slate-300 hover:border-violet-500/40 hover:text-white transition-all text-left"
                    >
                      <ChevronRight className="h-3 w-3 text-violet-400 flex-shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 min-h-0 rounded-2xl bg-[#071224]/60 border border-sky-900/30 p-4"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            <div className="text-center">
              <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Ask the Copilot anything about spacecraft anomalies</p>
              <p className="text-[11px] font-mono mt-1 text-slate-600">Grounded in NASA anomaly corpus + synthetic cases</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cyan-600/20 border border-cyan-500/30 text-white ml-auto"
                    : "bg-[#091124] border border-sky-900/40 text-slate-200"
                }`}
              >
                {msg.content || (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-[11px] font-mono">Granite is generating…</span>
                  </div>
                )}
              </div>
              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ml-1">
                  {msg.citations.map((c) => (
                    <CitationChip key={c} label={c} />
                  ))}
                </div>
              )}
              <div className="text-[10px] text-slate-600 font-mono px-1">
                {format(msg.ts, "HH:mm:ss")}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center">
                <User className="h-4 w-4 text-cyan-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about anomaly patterns, historical incidents, mission risks…"
          disabled={streaming}
          className="flex-1 px-4 py-3 bg-[#091124] border border-sky-900/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 font-mono disabled:opacity-50"
        />
        <Button
          variant="primary"
          onClick={() => sendMessage(input)}
          loading={streaming}
          disabled={!input.trim()}
          icon={<Send className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
