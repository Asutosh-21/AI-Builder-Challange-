"""
Orbital Parameters Service
Returns simulated orbital parameters for APEX-7 spacecraft.
Values evolve slowly over time to simulate orbital decay and fuel consumption.
"""
from __future__ import annotations

import math
import time
from typing import Dict, Any

# Epoch reference for slow orbital decay simulation
_START_TIME = time.time()

# Primary mission objective
MISSION_OBJECTIVE = (
    "Earth observation and atmospheric monitoring from low Earth orbit. "
    "Primary payload: multispectral imaging array targeting coastal erosion zones. "
    "Mission phase: nominal operations, Year 2 of 3."
)


def get_orbital_params() -> Dict[str, Any]:
    """Return current simulated orbital parameters for APEX-7."""
    elapsed_hours = (time.time() - _START_TIME) / 3600.0

    # Slow orbital decay: ~1 km per 30 hours
    altitude_km = round(550.0 - (elapsed_hours * 0.033), 1)
    altitude_km = max(altitude_km, 400.0)  # floor to ISS-altitude band

    # Fuel consumption: slow burn ~0.01% per hour
    fuel_remaining_pct = round(max(72.0 - (elapsed_hours * 0.01), 5.0), 1)

    # Inclination stays roughly constant
    inclination_deg = 51.64

    # Orbital period (approx. from altitude via Kepler's third law)
    # T = 2π * sqrt((R+h)^3 / (GM)) where GM=3.986e5 km³/s²
    R_EARTH = 6371.0
    GM = 3.986e5
    semi_major = R_EARTH + altitude_km
    orbital_period_min = round(2 * math.pi * math.sqrt(semi_major**3 / GM) / 60.0, 1)

    # Orbital speed: v = sqrt(GM / r)
    orbital_speed_kms = round(math.sqrt(GM / semi_major), 2)

    return {
        "spacecraft_id": "APEX-7",
        "altitude_km": altitude_km,
        "inclination_deg": inclination_deg,
        "orbital_period_min": orbital_period_min,
        "orbital_speed_kms": orbital_speed_kms,
        "fuel_remaining_pct": fuel_remaining_pct,
        "mission_objective": MISSION_OBJECTIVE,
    }
