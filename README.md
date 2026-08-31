# Mission Anomaly Copilot

> *AI that detects spacecraft failures before they happen — and tells you exactly what to do.*

**IBM Bob AI Builders Challenge — August Edition: "Advance Space Exploration with AI"**

[![Built with IBM Granite](https://img.shields.io/badge/Built%20with-IBM%20Granite-0530ad?style=flat-square&logo=ibm)](https://www.ibm.com/watsonx)
[![Powered by watsonx.ai](https://img.shields.io/badge/Powered%20by-watsonx.ai-0530ad?style=flat-square&logo=ibm)](https://www.ibm.com/watsonx)
[![Built with IBM Bob](https://img.shields.io/badge/Dev%20Environment-IBM%20Bob-0530ad?style=flat-square&logo=ibm)](https://www.ibm.com/products/bob)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)

---

## Problem Statement

Spacecraft telemetry generates thousands of sensor readings per second across dozens of channels — battery voltage, thermal sensors, attitude control, propellant pressure, communications signal strength, and more. When anomalies occur, human operators face three critical problems:

1. **Signal vs. noise** — distinguishing a real failure signature from sensor noise in a continuous data stream is slow and error-prone
2. **Root cause ambiguity** — even when an anomaly is detected, determining *why* it happened (battery cell failure? attitude loss? solar array shadowing?) requires deep domain expertise and historical pattern-matching
3. **Decision latency** — the time between anomaly detection and a validated mission response plan can span hours; in orbit, that delay has mission-ending consequences

No existing tool closes all three gaps in a single, real-time interface. Mission Anomaly Copilot was built to solve exactly this.

---

## Solution Description

**Mission Anomaly Copilot** is a production-grade SaaS platform that ingests live-streaming spacecraft telemetry, detects anomalies using machine learning, and uses IBM Granite AI to:

- Explain the root cause in plain English with confidence levels
- Generate a structured mission recovery plan with step-by-step execution checklist
- Answer operator follow-up questions via a RAG-powered Incident Copilot grounded in historical anomaly data
- Surface orbital conjunction risks from live CelesTrak TLE satellite data

The platform covers the full decision-support loop:

```
RAW TELEMETRY → ANOMALY DETECTION → AI ROOT CAUSE → RISK ASSESSMENT → MISSION PLAN → HUMAN APPROVAL
```

Every recommended action is gated by a human approval checkpoint — the system never executes commands autonomously.

### Key Features

| Feature | Description |
|---|---|
| **Live SSE Telemetry** | 6-channel spacecraft sensor stream at 1 Hz with Gaussian noise simulation and 5 injectable anomaly scenarios |
| **Isolation Forest Detection** | scikit-learn ML model trained on 10,000 normal telemetry ticks, combined with rule-based hard-limit thresholds for immediate CRITICAL alerts |
| **Granite Root Cause Explainer** | IBM Granite 3.1 8B Instruct generates plain-English anomaly explanations from raw channel values — 3-5 sentences, cites evidence, states confidence level |
| **Mission Response Planner** | Granite generates a structured recovery plan: recommended action, estimated fuel cost, risk-if-no-action, mission success impact, and 5-step execution checklist |
| **RAG Incident Copilot** | LangChain + ChromaDB vector store over 31 historical anomaly documents (20 synthetic case studies + 11 NASA mission incident summaries); Granite answers follow-up questions with source citations |
| **Orbit Intelligence** | CelesTrak TLE feed parsed with sgp4 propagation; CLEAR/CAUTION/AVOID conjunction risk based on satellite density in ±50 km altitude band |
| **NASA Space Weather** | Live DONKI API integration for solar flares, CME events, and geomagnetic storm data with mission impact assessment |
| **LangGraph Agent Pipeline** | 5-node multi-agent pipeline: Detect → Root Cause → Risk Score → Action Plan → Human Review gate |

---

## AI Approach and Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                         │
│  Dashboard  │  Live Telemetry  │  Anomaly Center  │  AI Copilot     │
│  Orbit Intel │  Incident Workspace │  Reports      │  NASA Data      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ REST + SSE
┌──────────────────────────▼──────────────────────────────────────────┐
│                       BACKEND (FastAPI)                              │
│                                                                      │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐  │
│  │ Telemetry Engine │   │  Anomaly Engine  │   │  Orbit Intel    │  │
│  │ TelemetrySimulator│  │ IsolationForest  │   │ CelesTrak TLE   │  │
│  │ SSE Stream @1Hz  │──▶│ + Threshold Rules│   │ sgp4 propagation│  │
│  │ 5 Anomaly Modes  │   │ AnomalyLog       │   │ Conjunction Risk│  │
│  └─────────────────┘   └────────┬─────────┘   └─────────────────┘  │
│                                 │                                    │
│                    ┌────────────▼──────────────┐                    │
│                    │    LangGraph Agent Pipeline │                   │
│                    │  Detect → Root Cause →      │                   │
│                    │  Risk → Action → Human Gate │                   │
│                    └────────────┬──────────────┘                    │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────┐   │
│  │                   IBM Granite AI Layer                        │   │
│  │  WatsonxLLM (granite-3-1-8b-instruct)                        │   │
│  │  • Root cause explanation  • Mission response plan            │   │
│  │                                                               │   │
│  │  WatsonxEmbeddings (granite-embedding-30m-english)            │   │
│  │  • Corpus embedding  • RAG similarity search                  │   │
│  │                                                               │   │
│  │  ChromaDB vector store  │  LangChain ConversationalRAG        │   │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                     EXTERNAL DATA SOURCES                            │
│  CelesTrak TLE (active satellites)  │  NASA DONKI (space weather)   │
└─────────────────────────────────────────────────────────────────────┘
```

### IBM Granite Integration — 3 Distinct Layers

**Layer 1 — Inference: Root Cause Explainer**
- Model: `ibm/granite-3-1-8b-instruct` via `WatsonxLLM`
- Input: raw anomaly event (severity, channel values, anomaly score, timestamp)
- Output: 3-5 sentence plain-English explanation with physical root cause, telemetry evidence, and confidence level
- Triggered automatically (fire-and-forget async) on every new anomaly detection

**Layer 2 — Inference: Mission Response Planner**
- Model: `ibm/granite-3-1-8b-instruct` via `WatsonxLLM`
- Input: root cause summary + orbital parameters (altitude, inclination, fuel remaining) + mission objective
- Output: structured narrative with immediate action, fuel cost estimate, risk-if-no-action, success probability impact, and 3-5 step execution checklist
- Factored into the LangGraph Action Node in the multi-agent pipeline

**Layer 3 — Embeddings + Inference: RAG Incident Copilot**
- Embedding model: `ibm/granite-embedding-30m-english` via `WatsonxEmbeddings`
- Knowledge base: 31 documents (20 synthetic spacecraft anomaly case studies + 11 NASA mission incident summaries)
- Vector store: ChromaDB with persistent storage
- Chain: LangChain `ConversationalRetrievalChain` with per-session `ConversationBufferWindowMemory` (last 8 turns)
- Responses include source citations: `[TERRA-3 Solar Panel Anomaly 2022]` style chip references

### Anomaly Detection Pipeline

```python
# Training: 10,000 normal ticks generated at startup
normal_data = simulator.generate_normal_data(n=10_000)
detector = IsolationForest(contamination=0.05, random_state=42)
detector.fit(normal_data)

# Per-tick evaluation (1 Hz)
ml_score   = detector.decision_function(tick_vector)    # ML signal
rule_hits  = check_hard_limits(tick)                    # Rule signal
severity   = triage(ml_score, rule_hits, consecutive)  # CRITICAL / WARNING / INFO
```

### LangGraph Multi-Agent Pipeline

```
Detect Node  →  Root Cause Node  →  Risk Node  →  Action Node  →  Human Review Gate
   │               │ (Granite)          │               │ (Granite)       │
validates      generates           computes         generates         sets
anomaly        explanation         risk_score       mission plan      human_approved=False
event          via watsonx.ai      (0.0–1.0)        via watsonx.ai    (no auto-execute)
```

---

## Selected Challenge Theme

**"Advance Space Exploration with AI"** — IBM Bob AI Builders Challenge, August Edition

This project directly addresses multiple judge-listed solution areas:

| Solution Area | How it's covered |
|---|---|
| **Predictive Monitoring** | Isolation Forest ML detects anomaly patterns before they reach critical thresholds |
| **Mission Planning** | Granite generates complete mission recovery plans with maneuver recommendations and fuel estimates |
| **Decision Support** | FACT / INFERENCE / RECOMMENDATION three-panel workspace gives operators structured, evidence-grounded decision context |
| **Data Translation** | RAG Copilot translates historical NASA incident data into actionable answers for current anomalies |
| **Orbital Intelligence** | CelesTrak TLE + sgp4 propagation adds real-time conjunction risk to maneuver planning |

### Why This Wins

- **IBM Granite at 3 distinct layers** — not a chatbot wrapper; the LLM is the root cause analyst, the flight director, and the RAG responder simultaneously
- **Live data drama** — real-time SSE telemetry stream with injectable anomaly scenarios makes the demo immediately compelling
- **Real NASA corpus** — 11 real NASA mission incident summaries (Cassini, MRO, Deep Space 1, Galileo, Hubble, Voyager 1, JWST) ground the RAG copilot in actual mission history
- **Production-grade** — TypeScript strict, 0 build errors, ResizeObserver-aware 3D globe, responsive layout, Framer Motion animations
- **Human-in-the-loop** — every recommended action is gated by a mandatory human approval checkpoint; the system never commands spacecraft autonomously

---

## How IBM Bob Was Used

IBM Bob served as the **primary development environment** for the entire project — from architecture planning through implementation and debugging. Specific uses:

### Planning & Architecture
- Used Bob's **Plan mode** to break down the full project into 8 structured sub-tasks, each with expected outcomes, implementation todo lists, and relevant technical context
- Bob generated the complete `mission-anomaly-copilot-plan.md` specification document that drove all subsequent development
- Architecture decisions — LangGraph pipeline topology, ChromaDB + Granite embedding strategy, SSE telemetry pattern — were all designed collaboratively with Bob

### Code Generation
- **All 31 backend Python source files** were written by Bob: `main.py`, all service modules, all routers, all LangGraph agent nodes, Pydantic schemas, and data corpus files
- **All 13 Next.js frontend routes** were written or substantially redesigned by Bob: enterprise design system (`globals.css`), all dashboard pages, the 3D `OrbitGlobeCanvas` (Three.js), all enterprise components, and both custom React hooks
- Bob handled complex technical areas including: Three.js WebGL scene setup, LangChain `ConversationalRetrievalChain` with streaming, Isolation Forest training pipeline, SSE streaming with fallback simulation, and sgp4 orbital propagation

### Debugging
- Bob diagnosed and fixed the Three.js canvas layout issue (`position: relative` positioning chain, `display: block` on canvas element, `ResizeObserver` for sidebar-resize events)
- Bob fixed the `THREE.Object3D.position` read-only property error (switching from `Object.assign` to `.position.set()`)
- Bob resolved the Next.js SSR hydration mismatch caused by `Math.random()` in JSX render paths
- Bob diagnosed and fixed Recharts `ResponsiveContainer` collapsing to 0-height (fixed-height wrapper pattern)

### Skills & Modes Used
- **Agent mode** — primary development mode for all code generation and editing
- **Plan mode** — initial architecture design and task breakdown
- Bob's multi-file editing capabilities (`apply_diff`, `write_file`, `search_and_replace`) enabled surgical edits across the entire codebase

> **All development on this project was done exclusively inside IBM Bob.** No other IDE, code editor, or AI assistant was used.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TailwindCSS, Framer Motion, Recharts, Three.js |
| Backend | FastAPI (Python 3.13), uvicorn, python-dotenv |
| LLM | IBM Granite 3.1 8B Instruct via `langchain-ibm` + `ibm-watsonx-ai` |
| Embeddings | IBM Granite Embedding 30M via `WatsonxEmbeddings` |
| Vector Store | ChromaDB with persistent storage |
| RAG Chain | LangChain `ConversationalRetrievalChain` + `ConversationBufferWindowMemory` |
| Agent Pipeline | LangGraph `StateGraph` (5-node pipeline) |
| Anomaly Detection | scikit-learn `IsolationForest` + rule-based threshold engine |
| Telemetry | Simulated SSE stream (NumPy Gaussian noise) + 5 injectable anomaly modes |
| Orbit Data | CelesTrak TLE feed + `sgp4` library for orbital propagation |
| Space Weather | NASA DONKI API (solar flares, CME, geomagnetic storms) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- IBM watsonx.ai account with API key and Project ID

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your watsonx credentials:
#   WATSONX_API_KEY=your_key
#   WATSONX_PROJECT_ID=your_project_id

# Start the server
python -m uvicorn main:app --reload --port 8000
```

The backend will:
1. Train the Isolation Forest on 10,000 normal telemetry ticks
2. Load the 31-document anomaly corpus
3. Build the ChromaDB vector index (skips if already populated)
4. Fetch active satellite TLE data from CelesTrak

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Open `http://localhost:3000`

### Environment Variables

**Backend (`backend/.env`)**

```
WATSONX_API_KEY=           # IBM Cloud API key
WATSONX_PROJECT_ID=        # watsonx.ai project ID
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-3-1-8b-instruct
GRANITE_EMBEDDING_MODEL=ibm/granite-embedding-30m-english
CORS_ORIGINS=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```



## License

MIT — built for the IBM Bob AI Builders Challenge.

---

<p align="center">
  <strong>Built with IBM Granite · watsonx.ai · IBM Bob</strong><br/>
  <em>IBM Bob AI Builders Challenge — Advance Space Exploration with AI</em>
</p>
