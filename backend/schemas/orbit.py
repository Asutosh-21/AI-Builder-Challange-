from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class SatelliteRecord(BaseModel):
    name: str
    norad_id: str
    altitude_km: float
    inclination_deg: float
    orbital_period_min: float
    risk_flag: str = "NONE"  # NONE / LOW / MEDIUM / HIGH
