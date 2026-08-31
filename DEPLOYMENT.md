# Deployment Guide

## Project Structure
- **Frontend**: Next.js 16 application in `frontend/` directory
- **Backend**: FastAPI application in `backend/` directory

## AI Model Configuration

### Judge Evaluation Mode ⭐ RECOMMENDED FOR JUDGES
- **No API key required**
- **No service setup required**
- **Uses built-in fallback responses**
- **Environment variables**:
  ```
  USE_OLLAMA=false
  WATSONX_API_KEY=
  WATSONX_PROJECT_ID=
  ```
- **All features work**: Anomaly detection, telemetry, orbital calculations, dashboard
- **AI features**: Use pre-written expert fallback responses

### Local Development (Ollama) ⭐ FOR LOCAL TESTING
- **No API key required**
- **Requires Ollama installed locally**: https://ollama.com
- **Run IBM Granite model**: `ollama pull granite`
- **Environment variables**:
  ```
  USE_OLLAMA=true
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=granite
  ```

### Cloud Deployment (IBM Watson) ⭐ OPTIONAL AI ENHANCEMENT
- **IBM watsonx.ai API key required**
- **Free tier available on IBM Cloud** (requires credit card)
- **Environment variables**:
  ```
  USE_OLLAMA=false
  WATSONX_API_KEY=your_ibm_watsonx_api_key
  WATSONX_PROJECT_ID=your_ibm_project_id
  WATSONX_URL=https://us-south.ml.cloud.ibm.com
  GRANITE_MODEL_ID=ibm/granite-3-1-8b-instruct
  ```

**Important**: For judge evaluation, use fallback mode - no AI service needed!

## Deployment Platforms

### Vercel (Frontend) ⭐ RECOMMENDED
The frontend is deployed to Vercel using the following configuration:
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/.next`
- **Framework**: Next.js
- **Configuration**: `vercel.json`
- **Free Tier**: ✅ Available

### Backend Options

#### Option 1: Render.com (Recommended - Free Tier) ⭐
- **Build**: Python 3.11
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health` endpoint
- **Configuration**: `render.yaml`
- **Free Tier**: ✅ Available (with limitations)
- **URL**: https://render.com
- **AI**: Requires IBM Watson credentials

#### Option 2: Railway (Alternative)
- **Build**: Nixpacks with Python 3.11
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health` endpoint
- **Configuration**: `railway.json`
- **Free Tier**: ⚠️ Limited (may hit resource limits)
- **URL**: https://railway.app
- **AI**: Requires IBM Watson credentials

#### Option 3: Fly.io (Alternative)
- **Build**: Docker container
- **Configuration**: `backend/Dockerfile`
- **Free Tier**: ✅ Available (requires credit card)
- **URL**: https://fly.io
- **AI**: Requires IBM Watson credentials

## Environment Variables

### Frontend (Vercel) - For Judge Evaluation
Set these in Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Backend (Render.com) - For Judge Evaluation ⭐ RECOMMENDED
No API keys required - uses fallback mode:
```
USE_OLLAMA=false
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-3-1-8b-instruct
GRANITE_EMBEDDING_MODEL=ibm/granite-embedding-30m-english
CORS_ORIGINS=*
PORT=8000
```

### Backend (Local Development with Ollama)
For local development, you can use Ollama without API keys:
```
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=granite
CORS_ORIGINS=http://localhost:3000
```

## Deployment Steps for Judge Evaluation

### Step 1: Deploy Backend to Render.com (No API Keys Required)
1. Go to [render.com](https://render.com) and create a free account
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select `Asutosh-21/AI-Builder-Challange-`
4. Render will detect the `render.yaml` configuration automatically
5. ⚠️ **NO API KEYS NEEDED** - uses fallback mode for judge evaluation
6. Keep environment variables as configured in `render.yaml` (all empty values are fine)
7. Click "Create Web Service"
8. Wait for deployment and copy the backend URL (e.g., `https://your-app.onrender.com`)

**Note**: The backend will use built-in fallback responses - fully functional for judge evaluation!

### Alternative: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub repo
3. Select `Asutosh-21/AI-Builder-Challange-`
4. Railway will detect the Python project automatically
5. Set environment variables
6. Deploy and get the backend URL
⚠️ Note: Railway free tier has resource limits

### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and create a free account
2. Click "Add New Project" → "Import from GitHub"
3. Select `Asutosh-21/AI-Builder-Challange-`
4. Vercel will detect Next.js automatically
5. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key (optional)
   ```
6. Click "Deploy"
7. Wait for deployment and copy the frontend URL

### Step 3: Judge Evaluation URLs
You'll have:
- **Frontend URL**: `https://your-app.vercel.app` (for judges to access)
- **Backend URL**: `https://your-app.onrender.com` (API endpoint)
- **Health Check**: `https://your-app.onrender.com/health` (to verify backend is running)

## Local Development with Ollama

If you want to run the project locally using Ollama (no API keys needed):

### 1. Install Ollama
- Download from https://ollama.com
- Install and start Ollama

### 2. Pull the Granite Model
```bash
ollama pull granite
```

### 3. Configure Backend
Create `backend/.env`:
```
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=granite
CORS_ORIGINS=http://localhost:3000
```

### 4. Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Required Services

### For Judge Evaluation (Cloud Deployment):
- **No AI service required** - uses built-in fallback responses
- **Clerk**: For authentication (optional, can be removed if not needed)
- **ChromaDB**: Vector database (runs locally, no external service needed)

### For Enhanced AI (Optional):
- **IBM watsonx.ai**: For real-time AI models (Granite 3.1 8B Instruct & Embedding 30M)
- **Ollama**: For running IBM Granite models locally (no API key needed)

### Common Requirements:
- **ChromaDB**: Vector database (runs locally, no external service needed)
- **Clerk**: For authentication (optional, can be removed if not needed)

## Notes
- The backend automatically trains the Isolation Forest model on startup
- ChromaDB vector store is built from corpus documents on startup
- CelesTrak TLE data is pre-fetched on startup
- Health check endpoint: `https://your-backend-url.onrender.com/health` (or Railway URL)
- Render free tier spins down after 15 minutes of inactivity (may take 1-2 minutes to wake up)
- Railway free tier has resource limits - use Render for better free tier experience
- **For judge evaluation**: No AI service needed - uses built-in fallback responses
- **All core features work**: Anomaly detection, telemetry, orbital calculations, dashboard
- **AI features**: Pre-written expert fallback responses are comprehensive and realistic
