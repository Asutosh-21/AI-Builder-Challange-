"""
Orbit Intelligence Service
Proximity analysis and conjunction risk for APEX-7 spacecraft.
"""
from __future__ import annotations

import logging
from typing import List

from services.celestrak_client import TLERecord, fetch_active_tle
from services.orbital_params import get_orbital_params
from schemas.orbit import SatelliteRecord

logger = logging.getLogger(__name__)

# Altitude band for proximity check (±50 km)
ALTITUDE_BAND_KM = 50.0

CONJUNCTION_THRESHOLDS = {
    "CLEAR": 5,
    "CAUTION": 20,
    # > 20 = AVOID
}


def find_nearby(
    target_altitude_km: float | None = None,
    band_km: float = ALTITUDE_BAND_KM,
) -> List[SatelliteRecord]:
    """Return satellites within ±band_km of the target altitude."""
    if target_altitude_km is None:
        orbital = get_orbital_params()
        target_altitude_km = orbital["altitude_km"]

    tle_records: List[TLERecord] = fetch_active_tle()

    nearby: List[SatelliteRecord] = []
    for rec in tle_records:
        if rec.altitude_km is None:
            continue
        if abs(rec.altitude_km - target_altitude_km) <= band_km:
            nearby.append(
                SatelliteRecord(
                    name=rec.name,
                    norad_id=rec.norad_id,
                    altitude_km=rec.altitude_km,
                    inclination_deg=rec.inclination_deg or 0.0,
                    orbital_period_min=rec.orbital_period_min or 0.0,
                    risk_flag=_individual_risk(rec.altitude_km, target_altitude_km),
                )
            )

    # Sort by proximity
    nearby.sort(key=lambda s: abs(s.altitude_km - target_altitude_km))
    return nearby[:50]  # cap at 50 for response size


def conjunction_risk(nearby_satellites: List[SatelliteRecord]) -> str:
    n = len(nearby_satellites)
    if n < CONJUNCTION_THRESHOLDS["CLEAR"]:
        return "CLEAR"
    elif n <= CONJUNCTION_THRESHOLDS["CAUTION"]:
        return "CAUTION"
    else:
        return "AVOID"


def _individual_risk(sat_alt: float, spacecraft_alt: float) -> str:
    delta = abs(sat_alt - spacecraft_alt)
    if delta < 5:
        return "HIGH"
    elif delta < 20:
        return "MEDIUM"
    else:
        return "LOW"
