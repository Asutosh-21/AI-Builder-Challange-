"""
Telemetry Router
SSE stream, history, status, and anomaly injection endpoints.
"""
from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator

from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from services.telemetry_simulator import simulator
from services.anomaly_detector import detector
from services.anomaly_log import anomaly_log
from services.granite_ai import generate_root_cause, generate_mission_plan
from services.orbital_params import get_orbital_params, MISSION_OBJECTIVE

import json

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


async def _fire_granite_tasks(event):
    """Fire-and-forget: generate Granite explanation + plan for a detected anomaly."""
    try:
        explanation = await asyncio.get_event_loop().run_in_executor(
            None, generate_root_cause, event
        )
        anomaly_log.update_explanation(event.id, explanation)

        orbital = get_orbital_params()
        plan = await asyncio.get_event_loop().run_in_executor(
            None, lambda: generate_mission_plan(event, orbital, MISSION_OBJECTIVE)
        )
        anomaly_log.update_plan(event.id, plan)
        logger.info("Granite AI outputs generated for anomaly %s", event.id)
    except Exception as exc:
        logger.error("Granite task failed for anomaly %s: %s", event.id, exc)


async def _telemetry_generator() -> AsyncGenerator[dict, None]:
    """Yield one telemetry tick per second."""
    while True:
        tick = simulator.generate_tick()

        # Run anomaly detection
        anomaly_event = detector.evaluate(tick)
        if anomaly_event is not None:
            # Avoid duplicate events: skip if identical severity on same channels < 30s ago
            recent_active = anomaly_log.get_active()
            is_duplicate = any(
                set(e.affected_channels) == set(anomaly_event.affected_channels)
                and e.severity == anomaly_event.severity
                and (anomaly_event.detected_at - e.detected_at).total_seconds() < 30
                for e in recent_active
            )
            if not is_duplicate:
                anomaly_log.add(anomaly_event)
                asyncio.create_task(_fire_granite_tasks(anomaly_event))
                logger.info("Anomaly detected: %s (%s)", anomaly_event.id, anomaly_event.severity)

        yield {"data": json.dumps(tick)}
        await asyncio.sleep(1.0)


@router.get("/stream")
async def telemetry_stream():
    """Server-Sent Events endpoint — streams one telemetry tick per second."""
    return EventSourceResponse(_telemetry_generator())


@router.get("/history")
async def telemetry_history():
    """Return last 500 telemetry ticks for chart initialization."""
    return {"history": simulator.history}


@router.get("/status")
async def telemetry_status():
    """Return simulator state."""
    return simulator.status


class InjectRequest(BaseModel):
    anomaly_type: str


@router.post("/inject")
async def inject_anomaly(body: InjectRequest):
    """Inject a controlled anomaly into the telemetry stream."""
    simulator.inject_anomaly(body.anomaly_type)
    return {"status": "injected", "anomaly_type": body.anomaly_type}


@router.post("/clear")
async def clear_anomaly():
    """Clear any active anomaly injection."""
    simulator.clear_anomaly()
    return {"status": "cleared"}
