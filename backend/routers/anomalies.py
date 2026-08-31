"""
Anomaly Router
CRUD endpoints for anomaly events + Granite AI trigger endpoints.
"""
from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException

from schemas.anomaly import AnomalyEvent, AnomalyStatus
from services.anomaly_log import anomaly_log
from services.granite_ai import generate_root_cause, generate_mission_plan
from services.orbital_params import get_orbital_params, MISSION_OBJECTIVE

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])


@router.get("")
async def get_active_anomalies():
    """Return all currently active (unresolved) anomaly events."""
    return {"anomalies": [e.model_dump(mode="json") for e in anomaly_log.get_active()]}


@router.get("/history")
async def get_anomaly_history():
    """Return full anomaly event log (up to 100 events)."""
    return {"history": [e.model_dump(mode="json") for e in anomaly_log.get_history()]}


@router.get("/{event_id}")
async def get_anomaly(event_id: str):
    """Return a single anomaly event by ID."""
    event = anomaly_log.get_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Anomaly event not found")
    return event.model_dump(mode="json")


@router.post("/{event_id}/resolve")
async def resolve_anomaly(event_id: str):
    """Mark an anomaly event as resolved."""
    success = anomaly_log.resolve(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Anomaly event not found")
    return {"status": "resolved", "id": event_id}


@router.post("/{event_id}/explain")
async def explain_anomaly(event_id: str):
    """Trigger Granite root cause explanation for an anomaly."""
    event = anomaly_log.get_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Anomaly event not found")

    explanation = await asyncio.get_event_loop().run_in_executor(
        None, generate_root_cause, event
    )
    anomaly_log.update_explanation(event_id, explanation)
    event = anomaly_log.get_by_id(event_id)
    return event.model_dump(mode="json")


@router.post("/{event_id}/plan")
async def plan_anomaly(event_id: str):
    """Trigger Granite mission response plan for an anomaly."""
    event = anomaly_log.get_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Anomaly event not found")

    orbital = get_orbital_params()
    plan = await asyncio.get_event_loop().run_in_executor(
        None, lambda: generate_mission_plan(event, orbital, MISSION_OBJECTIVE)
    )
    anomaly_log.update_plan(event_id, plan)
    event = anomaly_log.get_by_id(event_id)
    return event.model_dump(mode="json")
