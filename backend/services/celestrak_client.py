"""
CelesTrak Client
Fetches active satellite TLE data and computes current altitudes using sgp4.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional, Tuple

import httpx

logger = logging.getLogger(__name__)

TLE_URL = "https://celestrak.org/pub/TLE/active.txt"
CACHE_TTL_SECONDS = 3600  # 1 hour

_cache_data: Optional[List["TLERecord"]] = None
_cache_time: float = 0.0


@dataclass
class TLERecord:
    name: str
    norad_id: str
    tle_line1: str
    tle_line2: str
    altitude_km: Optional[float] = None
    inclination_deg: Optional[float] = None
    orbital_period_min: Optional[float] = None


def fetch_active_tle(force_refresh: bool = False) -> List[TLERecord]:
    """Fetch and parse active satellite TLE data from CelesTrak (cached hourly)."""
    global _cache_data, _cache_time

    now = time.time()
    if not force_refresh and _cache_data is not None and (now - _cache_time) < CACHE_TTL_SECONDS:
        return _cache_data

    logger.info("Fetching active TLE data from CelesTrak...")
    try:
        response = httpx.get(TLE_URL, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
        records = _parse_tle(response.text)
        logger.info("Parsed %d TLE records from CelesTrak", len(records))
    except Exception as exc:
        logger.error("CelesTrak fetch failed: %s", exc)
        if _cache_data:
            logger.warning("Returning stale cache (%d records)", len(_cache_data))
            return _cache_data
        return _get_fallback_tle()

    # Compute altitudes for LEO satellites only
    populated = []
    for rec in records:
        try:
            alt, inc, period = _compute_orbital_params(rec.tle_line1, rec.tle_line2)
            if alt is not None and 200 < alt < 2000:  # LEO only
                rec.altitude_km = round(alt, 1)
                rec.inclination_deg = round(inc, 2) if inc else None
                rec.orbital_period_min = round(period, 1) if period else None
                populated.append(rec)
        except Exception:
            continue

    logger.info("Retained %d LEO satellites after altitude filtering", len(populated))
    _cache_data = populated
    _cache_time = now
    return populated


def _parse_tle(text: str) -> List[TLERecord]:
    """Parse TLE three-line format into records."""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    records = []
    i = 0
    while i + 2 < len(lines):
        name_line = lines[i]
        line1 = lines[i + 1]
        line2 = lines[i + 2]
        if line1.startswith("1 ") and line2.startswith("2 "):
            norad_id = line1[2:7].strip()
            records.append(TLERecord(
                name=name_line.strip(),
                norad_id=norad_id,
                tle_line1=line1,
                tle_line2=line2,
            ))
            i += 3
        else:
            i += 1
    return records


def _compute_orbital_params(tle1: str, tle2: str) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    """Use sgp4 to propagate TLE to current epoch and extract altitude."""
    try:
        from sgp4.api import Satrec, jday

        sat = Satrec.twoline2rv(tle1, tle2)
        now = datetime.now(timezone.utc)
        jd, fr = jday(now.year, now.month, now.day, now.hour, now.minute, now.second + now.microsecond / 1e6)
        e, r, v = sat.sgp4(jd, fr)
        if e != 0:
            return None, None, None

        import math
        r_mag = math.sqrt(sum(x**2 for x in r))
        altitude = r_mag - 6371.0  # Earth radius in km

        # Inclination from TLE line 2 field (degrees)
        inclination = float(tle2[8:16].strip())

        # Mean motion (revs/day) from TLE line 2 → orbital period
        mean_motion = float(tle2[52:63].strip())
        period_min = (24 * 60) / mean_motion if mean_motion > 0 else None

        return altitude, inclination, period_min
    except Exception:
        return None, None, None


def _get_fallback_tle() -> List[TLERecord]:
    """Return a small set of well-known LEO satellites as fallback."""
    fallback = [
        TLERecord("ISS (ZARYA)", "25544", "", "", 408.0, 51.6, 92.8),
        TLERecord("TERRA", "25994", "", "", 705.0, 98.2, 98.9),
        TLERecord("AQUA", "27424", "", "", 705.0, 98.2, 98.9),
        TLERecord("LANDSAT 9", "49260", "", "", 705.0, 98.2, 98.9),
        TLERecord("STARLINK-1007", "44713", "", "", 550.0, 53.0, 95.5),
        TLERecord("STARLINK-1008", "44714", "", "", 550.0, 53.0, 95.5),
        TLERecord("STARLINK-1009", "44715", "", "", 549.0, 53.0, 95.5),
        TLERecord("STARLINK-2030", "47688", "", "", 551.0, 53.1, 95.5),
        TLERecord("PLANET LAB FLOCK", "43600", "", "", 505.0, 97.4, 94.8),
        TLERecord("CUBESAT-12", "46895", "", "", 522.0, 97.5, 95.1),
    ]
    return fallback
