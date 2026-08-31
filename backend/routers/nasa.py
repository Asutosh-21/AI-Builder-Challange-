"""
NASA Space Weather Router
Solar flare alerts, CME events, geomagnetic storm data.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter

from services.nasa_client import get_solar_flares, get_cme_events, get_geomagnetic_storms

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/nasa", tags=["nasa"])


@router.get("/solar-flares")
async def solar_flares():
    """Return recent solar flare events from DONKI."""
    return {"flares": get_solar_flares()}


@router.get("/cme")
async def cme_events():
    """Return recent coronal mass ejection events."""
    return {"cme_events": get_cme_events()}


@router.get("/geomagnetic-storms")
async def geomagnetic_storms():
    """Return recent geomagnetic storm events."""
    return {"storms": get_geomagnetic_storms()}


@router.get("/space-weather")
async def space_weather():
    """Return consolidated space weather summary."""
    flares = get_solar_flares()
    cme = get_cme_events()
    storms = get_geomagnetic_storms()

    # Compute overall space weather severity
    max_severity = "NOMINAL"
    for f in flares:
        s = f.get("severity", "NOMINAL")
        if s == "CRITICAL":
            max_severity = "CRITICAL"
            break
        elif s == "WARNING" and max_severity != "CRITICAL":
            max_severity = "WARNING"
        elif s == "INFO" and max_severity == "NOMINAL":
            max_severity = "INFO"

    return {
        "overall_severity": max_severity,
        "flares": flares,
        "cme_events": cme,
        "geomagnetic_storms": storms,
        "mission_impact": (
            "No significant space weather impact expected."
            if max_severity in ("NOMINAL", "INFO")
            else "Elevated solar activity — monitor radiation belts and uplink quality."
            if max_severity == "WARNING"
            else "CRITICAL space weather event in progress — consider safe mode activation."
        ),
    }
