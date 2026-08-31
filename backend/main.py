"""
Mission Anomaly Copilot — FastAPI Backend
Entry point for the spacecraft telemetry anomaly detection platform.
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("=== Mission Anomaly Copilot Backend Starting ===")

    # 1. Train the Isolation Forest on normal telemetry data
    try:
        from services.telemetry_simulator import simulator
        from services.anomaly_detector import detector
        logger.info("Generating 10,000 normal telemetry ticks for Isolation Forest training...")
        normal_data = simulator.generate_normal_data(n=10_000)
        detector.train(normal_data)
        logger.info("Isolation Forest trained successfully")
    except Exception as exc:
        logger.error("Anomaly detector training failed: %s", exc)

    # 2. Load the anomaly corpus documents
    documents = []
    try:
        from services.corpus_loader import load_anomaly_corpus
        documents = load_anomaly_corpus()
        logger.info("Loaded %d corpus documents", len(documents))
    except Exception as exc:
        logger.error("Corpus loading failed: %s", exc)

    # 3. Build the ChromaDB vector index
    try:
        from services.vector_store import build_index
        build_index(documents)
        logger.info("Vector store ready")
    except Exception as exc:
        logger.error("Vector store build failed: %s", exc)

    # 4. Pre-fetch CelesTrak TLE data
    try:
        from services.celestrak_client import fetch_active_tle
        tle_records = fetch_active_tle()
        logger.info("CelesTrak TLE data ready: %d LEO satellites", len(tle_records))
    except Exception as exc:
        logger.warning("CelesTrak pre-fetch failed (non-fatal): %s", exc)

    logger.info("=== Backend ready — listening for requests ===")
    yield

    logger.info("=== Mission Anomaly Copilot Backend Shutting Down ===")


app = FastAPI(
    title="Mission Anomaly Copilot",
    description=(
        "AI-powered spacecraft telemetry anomaly detection and mission response planning. "
        "Powered by IBM Granite via watsonx.ai."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
from routers import telemetry, anomalies, copilot, orbit, reports, nasa  # noqa: E402

app.include_router(telemetry.router)
app.include_router(anomalies.router)
app.include_router(copilot.router)
app.include_router(orbit.router)
app.include_router(reports.router)
app.include_router(nasa.router)


@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "service": "Mission Anomaly Copilot",
        "version": "1.0.0",
        "ibm_granite": "ibm/granite-3-1-8b-instruct",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
