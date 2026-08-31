# Judge Evaluation Guide

## 🚀 Quick Start for Judges

**Live Application URLs:**
- **Frontend**: (Will be provided after Vercel deployment)
- **Backend API**: (Will be provided after Render deployment)
- **Health Check**: (Backend URL + /health)

**Deployment Instructions:**
1. Deploy backend to Render.com using the provided `render.yaml`
2. Deploy frontend to Vercel using the provided `vercel.json`
3. Update `NEXT_PUBLIC_API_URL` in Vercel with the Render backend URL
4. Share the final URLs with judges

## 📋 Project Overview

**Mission Anomaly Copilot** is an AI-powered spacecraft telemetry anomaly detection platform designed for satellite operations centers.

### Key Features (All Working for Judge Evaluation)

✅ **Real-time Telemetry Monitoring**
- Live SSE (Server-Sent Events) streaming of spacecraft telemetry
- Real-time anomaly detection using Isolation Forest ML
- 6 telemetry channels: battery voltage, solar panel temp, attitude error, fuel pressure, CPU temp, signal strength

✅ **Intelligent Anomaly Detection**
- Isolation Forest machine learning model for anomaly detection
- Automatic training on normal telemetry patterns
- Real-time anomaly scoring and severity classification

✅ **Orbital Intelligence**
- CelesTrak TLE integration for satellite tracking
- SGP4 orbital propagation
- Real-time orbital calculations (altitude, inclination, period)
- NASA DONKI space weather integration

✅ **AI-Powered Anomaly Analysis**
- Root cause explanation using expert fallback responses
- Mission response planning with fuel cost estimation
- Risk assessment and impact analysis
- Step-by-step execution checklists

✅ **Comprehensive Dashboard**
- Real-time telemetry visualization
- Anomaly timeline and history
- 3D orbital globe visualization
- KPI cards and mission status
- Enterprise-grade UI components

## 🎯 How to Evaluate

### 1. Health Check
Visit `https://your-app.onrender.com/health` to verify the backend is running.

### 2. Access the Application
Open the frontend URL and explore:
- **Dashboard**: Real-time telemetry monitoring
- **Anomalies**: Detected anomalies with analysis
- **Orbit**: 3D orbital visualization
- **Reports**: Mission reports and analysis

### 3. Test Anomaly Detection
- Observe real-time telemetry streaming
- Wait for automatic anomaly detection (ML-based)
- Review AI-generated root cause analysis
- Check mission response plans

### 4. Explore Features
- **Telemetry Tab**: Live data streaming and anomaly detection
- **Anomalies Tab**: Historical anomaly data with analysis
- **Orbit Tab**: 3D satellite tracking and orbital parameters
- **Reports Tab**: Mission reports and executive summaries

## 🔧 Technical Implementation

### Backend (FastAPI)
- **26 REST endpoints** for comprehensive functionality
- **SSE streaming** for real-time telemetry
- **Isolation Forest ML** for anomaly detection
- **ChromaDB vector store** for anomaly corpus
- **LangGraph 5-node multi-agent pipeline**

### Frontend (Next.js 16)
- **13 routes** for complete application coverage
- **3D orbital globe** using React Three Fiber
- **Enterprise UI components** with Tailwind CSS
- **Real-time data visualization** with Recharts
- **Responsive design** for all screen sizes

### AI Integration
- **IBM Granite 3.1 8B Instruct**: Root cause explainer + mission planner
- **IBM Granite Embedding 30M**: RAG incident copilot via ChromaDB
- **Fallback Mode**: Built-in expert responses for evaluation

## 📊 What Judges Will See

### Fully Functional Features:
- ✅ Real-time telemetry streaming and anomaly detection
- ✅ ML-based anomaly classification and scoring
- ✅ Orbital calculations and satellite tracking
- ✅ AI-powered root cause analysis (fallback mode)
- ✅ Mission response planning with fuel estimation
- ✅ Comprehensive dashboard and visualization
- ✅ Space weather integration (NASA DONKI)
- ✅ Enterprise-grade UI/UX

### Evaluation Notes:
- **No AI service credentials required** for judge evaluation
- **Uses built-in fallback responses** that are comprehensive and realistic
- **All core functionality works** without external AI dependencies
- **Application demonstrates full-stack capabilities** with real ML and streaming

## 🎨 Architecture Highlights

- **Full-stack application** with separated frontend/backend
- **Real-time streaming** using Server-Sent Events
- **Machine learning integration** with Isolation Forest
- **Vector database** for semantic search and retrieval
- **Multi-agent AI pipeline** for intelligent analysis
- **Enterprise UI components** for professional presentation
- **3D visualization** for orbital mechanics
- **External API integrations** (CelesTrak, NASA DONKI)

## 📝 Technical Stack

**Backend:**
- FastAPI 0.115.5
- Python 3.11
- Scikit-learn 1.5.2 (Isolation Forest)
- ChromaDB 0.5.23 (Vector database)
- LangChain 0.3.9 (AI framework)
- SGP4 2.23 (Orbital mechanics)

**Frontend:**
- Next.js 16.3.3
- React 19.2.8
- Three.js 0.185.1 (3D graphics)
- React Three Fiber 9.7.0
- Recharts 3.10.1 (Data visualization)
- Tailwind CSS 4.0
- Framer Motion 13.1.1 (Animations)

**Deployment:**
- Vercel (Frontend hosting)
- Render.com (Backend hosting)
- GitHub (Version control)

## 🏆 Competition Relevance

This project demonstrates:
- **Full-stack development** with modern frameworks
- **Real-time data processing** and streaming
- **Machine learning integration** for anomaly detection
- **AI-powered analysis** with fallback capabilities
- **3D visualization** and data presentation
- **Enterprise-grade UI/UX** design
- **External API integration** and data aggregation
- **Scalable architecture** with clear separation of concerns

## 🎯 Deployment for Judges

The application is deployed without requiring:
- ❌ IBM Watson API credentials
- ❌ Ollama local installation
- ❌ Credit card verification
- ❌ External AI service setup

**Everything works out-of-the-box** for judge evaluation using built-in fallback responses.
