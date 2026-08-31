"""
NASA Space Weather / Events Client
Returns solar flare alerts, CME events, and Kp index data.
Falls back to realistic seed data when DONKI API is unreachable.
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List

import httpx

logger = logging.getLogger(__name__)

DONKI_BASE = "https://api.nasa.gov/DONKI"
_DEMO_KEY = "DEMO_KEY"  # public demo key (rate limited but sufficient)

_cache: Dict[str, Any] = {}
_cache_ttl = 1800  # 30 min


def _cached(key: str, fetcher):
    now = time.time()
    if key in _cache and (now - _cache[key]["ts"]) < _cache_ttl:
        return _cache[key]["data"]
    data = fetcher()
    _cache[key] = {"ts": now, "data": data}
    return data


def get_solar_flares() -> List[Dict[str, Any]]:
    def _fetch():
        try:
            r = httpx.get(
                f"{DONKI_BASE}/FLR",
                params={"api_key": _DEMO_KEY},
                timeout=8.0,
            )
            r.raise_for_status()
            events = r.json() or []
            return [
                {
                    "id": e.get("flrID", ""),
                    "begin_time": e.get("beginTime", ""),
                    "peak_time": e.get("peakTime", ""),
                    "class_type": e.get("classType", ""),
                    "source_location": e.get("sourceLocation", ""),
                    "instruments": [i.get("displayName", "") for i in e.get("instruments", [])],
                    "severity": _flare_severity(e.get("classType", "A")),
                }
                for e in events[-10:]
            ]
        except Exception as exc:
            logger.warning("DONKI solar flare fetch failed: %s", exc)
            return _FALLBACK_FLARES

    return _cached("flares", _fetch)


def get_geomagnetic_storms() -> List[Dict[str, Any]]:
    def _fetch():
        try:
            r = httpx.get(
                f"{DONKI_BASE}/GST",
                params={"api_key": _DEMO_KEY},
                timeout=8.0,
            )
            r.raise_for_status()
            events = r.json() or []
            return events[-5:]
        except Exception as exc:
            logger.warning("DONKI GST fetch failed: %s", exc)
            return _FALLBACK_GST

    return _cached("gst", _fetch)


def get_cme_events() -> List[Dict[str, Any]]:
    def _fetch():
        try:
            r = httpx.get(
                f"{DONKI_BASE}/CME",
                params={"api_key": _DEMO_KEY},
                timeout=8.0,
            )
            r.raise_for_status()
            events = r.json() or []
            return [
                {
                    "id": e.get("activityID", ""),
                    "start_time": e.get("startTime", ""),
                    "note": e.get("note", "")[:200],
                    "instruments": [i.get("displayName", "") for i in e.get("instruments", [])],
                }
                for e in events[-8:]
            ]
        except Exception as exc:
            logger.warning("DONKI CME fetch failed: %s", exc)
            return _FALLBACK_CME

    return _cached("cme", _fetch)


def _flare_severity(class_type: str) -> str:
    if class_type.startswith("X"):
        return "CRITICAL"
    elif class_type.startswith("M"):
        return "WARNING"
    elif class_type.startswith("C"):
        return "INFO"
    return "NOMINAL"


# ---------------------------------------------------------------------------
# Fallback seed data
# ---------------------------------------------------------------------------
_FALLBACK_FLARES = [
    {"id": "FL-2024-001", "begin_time": "2024-11-03T09:12Z", "peak_time": "2024-11-03T09:25Z",
     "class_type": "M2.3", "source_location": "N14W22", "instruments": ["GOES-16/EXIS"], "severity": "WARNING"},
    {"id": "FL-2024-002", "begin_time": "2024-11-05T14:48Z", "peak_time": "2024-11-05T15:01Z",
     "class_type": "C7.1", "source_location": "S08E05", "instruments": ["GOES-16/EXIS"], "severity": "INFO"},
    {"id": "FL-2024-003", "begin_time": "2024-11-07T22:33Z", "peak_time": "2024-11-07T22:47Z",
     "class_type": "X1.1", "source_location": "N22W15", "instruments": ["GOES-16/EXIS"], "severity": "CRITICAL"},
]

_FALLBACK_GST = [
    {"gstID": "GST-2024-001", "startTime": "2024-11-04T06:00Z", "allKpIndex": [{"kpIndex": 6, "observedTime": "2024-11-04T06:00Z"}]},
]

_FALLBACK_CME = [
    {"id": "CME-2024-A", "start_time": "2024-11-03T10:00Z", "note": "Partial halo CME observed following M2.3 flare. Earth-directed component detected.", "instruments": ["LASCO C2"]},
    {"id": "CME-2024-B", "start_time": "2024-11-07T23:00Z", "note": "Full halo CME associated with X1.1 flare. High confidence Earth-directed.", "instruments": ["LASCO C2", "STEREO-A/COR2"]},
]
