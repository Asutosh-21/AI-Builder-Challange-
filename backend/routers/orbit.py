"""
Orbit Router
Orbital intelligence endpoints — nearby satellites, conjunction risk, spacecraft status.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter

from services import orbit_intel
from services.celestrak_client import fetch_active_tle
from services.orbital_params import get_orbital_params

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/orbit", tags=["orbit"])


@router.get("/status")
async def orbit_status():
    """Return current spacecraft orbital parameters."""
    return get_orbital_params()


@router.get("/nearby")
async def nearby_satellites(band_km: float = 50.0):
    """Return satellites within ±band_km altitude of APEX-7 with conjunction risk level."""
    params = get_orbital_params()
    target_alt = params["altitude_km"]
    nearby = orbit_intel.find_nearby(target_alt, band_km)
    risk = orbit_intel.conjunction_risk(nearby)
    return {
        "spacecraft_altitude_km": target_alt,
        "band_km": band_km,
        "conjunction_risk": risk,
        "nearby_count": len(nearby),
        "satellites": [s.model_dump() for s in nearby],
    }


@router.get("/conjunction-check")
async def conjunction_check():
    """Check conjunction risk for the current maneuver window."""
    params = get_orbital_params()
    target_alt = params["altitude_km"]
    nearby = orbit_intel.find_nearby(target_alt)
    risk = orbit_intel.conjunction_risk(nearby)
    return {
        "conjunction_risk": risk,
        "nearby_count": len(nearby),
        "spacecraft_altitude_km": target_alt,
        "recommendation": (
            "Proceed with planned maneuver — traffic density is nominal."
            if risk == "CLEAR"
            else f"Exercise caution — {len(nearby)} objects in proximity. Review conjunction geometry before burn."
            if risk == "CAUTION"
            else f"Maneuver AVOID recommended — {len(nearby)} objects in target altitude band. Delay maneuver window."
        ),
    }


@router.get("/refresh")
async def refresh_tle():
    """Force a refresh of the CelesTrak TLE cache."""
    records = fetch_active_tle(force_refresh=True)
    return {"status": "refreshed", "record_count": len(records)}
