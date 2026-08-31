"""
Telemetry Simulator
Generates realistic spacecraft sensor data with Gaussian noise.
Supports controlled anomaly injection for demo scenarios.
"""
from __future__ import annotations

import asyncio
import math
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Deque, Dict, Optional

import numpy as np

# ---------------------------------------------------------------------------
# Normal baseline ranges
# ---------------------------------------------------------------------------
BASELINES: Dict[str, float] = {
    "battery_voltage": 26.0,
    "solar_panel_temp": 20.0,
    "attitude_error": 0.2,
    "fuel_pressure": 210.0,
    "cpu_temp": 42.0,
    "comm_signal_strength": -75.0,
}

NOISE_STD: Dict[str, float] = {
    "battery_voltage": 0.3,
    "solar_panel_temp": 1.5,
    "attitude_error": 0.05,
    "fuel_pressure": 1.2,
    "cpu_temp": 1.0,
    "comm_signal_strength": 2.0,
}

# Normal ranges (min, max) — used for IF training and display
NORMAL_RANGES: Dict[str, tuple] = {
    "battery_voltage": (24.0, 28.0),
    "solar_panel_temp": (-20.0, 60.0),
    "attitude_error": (0.0, 0.5),
    "fuel_pressure": (200.0, 220.0),
    "cpu_temp": (30.0, 55.0),
    "comm_signal_strength": (-85.0, -65.0),
}


@dataclass
class AnomalyProfile:
    anomaly_type: str
    tick_count: int = 0
    max_ticks: int = 60


# Anomaly drift functions: returns (channel, delta_per_tick)
ANOMALY_DRIFTS: Dict[str, Dict[str, float]] = {
    "voltage_drop": {"battery_voltage": -0.12},
    "thermal_spike": {"solar_panel_temp": 1.2, "cpu_temp": 0.4},
    "attitude_drift": {"attitude_error": 0.08},
    "fuel_leak": {"fuel_pressure": -0.6},
    "comm_loss": {"comm_signal_strength": -0.8},
}


class TelemetrySimulator:
    """Singleton spacecraft telemetry simulator."""

    _instance: Optional["TelemetrySimulator"] = None

    def __new__(cls) -> "TelemetrySimulator":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialised = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialised:
            return
        self._initialised = True

        self._state: Dict[str, float] = dict(BASELINES)
        self._anomaly: Optional[AnomalyProfile] = None
        self._orbit_number: int = 1
        self._tick_total: int = 0
        self._history: Deque[Dict[str, Any]] = deque(maxlen=500)
        # Roughly 90-min orbit → 5400 ticks at 1 Hz
        self._ticks_per_orbit: int = 5400

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_tick(self) -> Dict[str, Any]:
        """Generate one telemetry frame at current simulated time."""
        self._tick_total += 1

        # Orbit tracking
        if self._tick_total % self._ticks_per_orbit == 0:
            self._orbit_number += 1

        # Apply anomaly drift
        if self._anomaly is not None:
            drifts = ANOMALY_DRIFTS.get(self._anomaly.anomaly_type, {})
            for channel, delta in drifts.items():
                self._state[channel] += delta
            self._anomaly.tick_count += 1
            if self._anomaly.tick_count >= self._anomaly.max_ticks:
                self._anomaly = None  # auto-clear after max ticks

        # Add Gaussian noise on top of drifted state
        values: Dict[str, float] = {}
        for ch, baseline in BASELINES.items():
            noise = float(np.random.normal(0, NOISE_STD[ch]))
            # Drift accumulates in _state; for normal channels reset toward baseline slowly
            if self._anomaly is None:
                self._state[ch] += (baseline - self._state[ch]) * 0.01  # mean-revert
            values[ch] = round(self._state[ch] + noise, 3)

        # Simulated altitude (starts at 550 km, slow decay)
        altitude_km = round(550.0 - (self._tick_total * 0.0001), 2)

        tick: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "orbit_number": self._orbit_number,
            "altitude_km": altitude_km,
            **values,
        }
        self._history.append(tick)
        return tick

    def inject_anomaly(self, anomaly_type: str) -> None:
        """Start injecting a controlled anomaly into the stream."""
        if anomaly_type not in ANOMALY_DRIFTS:
            raise ValueError(f"Unknown anomaly type: {anomaly_type}")
        self._anomaly = AnomalyProfile(anomaly_type=anomaly_type)

    def clear_anomaly(self) -> None:
        """Stop anomaly injection and begin mean-reversion."""
        self._anomaly = None

    @property
    def status(self) -> Dict[str, Any]:
        return {
            "running": True,
            "orbit_number": self._orbit_number,
            "tick_total": self._tick_total,
            "active_anomaly": self._anomaly.anomaly_type if self._anomaly else None,
            "anomaly_tick": self._anomaly.tick_count if self._anomaly else 0,
        }

    @property
    def history(self) -> list:
        return list(self._history)

    def generate_normal_data(self, n: int = 10_000) -> np.ndarray:
        """Generate n ticks of purely normal (no-anomaly) data for ML training."""
        rows = []
        for _ in range(n):
            row = [
                float(np.random.normal(BASELINES[ch], NOISE_STD[ch]))
                for ch in [
                    "battery_voltage",
                    "solar_panel_temp",
                    "attitude_error",
                    "fuel_pressure",
                    "cpu_temp",
                    "comm_signal_strength",
                ]
            ]
            rows.append(row)
        return np.array(rows)


# Module-level singleton
simulator = TelemetrySimulator()
