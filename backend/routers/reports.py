"""
Reports Router
Mission incident report generation.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter

from services.anomaly_log import anomaly_log
from services.orbital_params import get_orbital_params

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary")
async def generate_summary():
    """Generate a mission summary report from the current anomaly log."""
    history = anomaly_log.get_history()
    active = anomaly_log.get_active()
    orbital = get_orbital_params()

    critical_count = sum(1 for e in history if e.severity == "CRITICAL")
    warning_count = sum(1 for e in history if e.severity == "WARNING")
    resolved_count = sum(1 for e in history if e.status == "resolved")

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "spacecraft_id": "APEX-7",
        "orbital_params": orbital,
        "summary": {
            "total_anomalies": len(history),
            "active_anomalies": len(active),
            "critical_anomalies": critical_count,
            "warning_anomalies": warning_count,
            "resolved_anomalies": resolved_count,
            "mission_health": (
                "CRITICAL" if any(e.severity == "CRITICAL" for e in active)
                else "WARNING" if active
                else "NOMINAL"
            ),
        },
        "recent_events": [e.model_dump(mode="json") for e in history[:10]],
    }


@router.get("/incident/{event_id}")
async def incident_report(event_id: str):
    """Generate a detailed incident report for a specific anomaly."""
    from fastapi import HTTPException
    event = anomaly_log.get_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Anomaly event not found")

    orbital = get_orbital_params()

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "spacecraft_id": "APEX-7",
        "incident": event.model_dump(mode="json"),
        "orbital_context": orbital,
        "report_sections": {
            "anomaly_overview": {
                "severity": event.severity,
                "detection_time": event.detected_at.isoformat(),
                "affected_systems": event.affected_channels,
                "trigger_type": event.trigger_type,
                "anomaly_score": event.anomaly_score,
            },
            "root_cause_analysis": event.granite_explanation or "Pending Granite AI analysis.",
            "mission_response_plan": event.mission_plan or "Pending Granite AI mission plan.",
            "status": event.status,
        },
    }
