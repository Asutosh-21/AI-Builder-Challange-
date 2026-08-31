"""
Anomaly Detector
Isolation Forest (ML) + rule-based hard limit checks.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

import numpy as np
from sklearn.ensemble import IsolationForest

from schemas.anomaly import AnomalyEvent, AnomalyStatus, Severity, TriggerType

logger = logging.getLogger(__name__)

CHANNELS = [
    "battery_voltage",
    "solar_panel_temp",
    "attitude_error",
    "fuel_pressure",
    "cpu_temp",
    "comm_signal_strength",
]

# Hard limits for CRITICAL rule-based alerts
HARD_LIMITS: Dict[str, tuple] = {
    "battery_voltage": (20.0, 30.0),   # (min, max)
    "solar_panel_temp": (-40.0, 85.0),
    "attitude_error": (-0.1, 5.0),
    "fuel_pressure": (175.0, 230.0),
    "cpu_temp": (20.0, 75.0),
    "comm_signal_strength": (-110.0, -50.0),
}

# WARNING threshold (slightly tighter)
WARNING_LIMITS: Dict[str, tuple] = {
    "battery_voltage": (22.0, 29.0),
    "solar_panel_temp": (-20.0, 75.0),
    "attitude_error": (-0.1, 2.0),
    "fuel_pressure": (185.0, 225.0),
    "cpu_temp": (25.0, 65.0),
    "comm_signal_strength": (-100.0, -55.0),
}


class AnomalyDetector:
    """Combined ML + rule-based anomaly detector."""

    def __init__(self) -> None:
        self._model: Optional[IsolationForest] = None
        self._trained = False
        # Consecutive ML-anomaly counter per channel (for WARNING hysteresis)
        self._consecutive_ml: int = 0

    def train(self, normal_data: np.ndarray) -> None:
        self._model = IsolationForest(
            contamination=0.05,
            random_state=42,
            n_estimators=100,
        )
        self._model.fit(normal_data)
        self._trained = True
        logger.info("AnomalyDetector trained on %d samples", len(normal_data))

    def score(self, tick: dict) -> float:
        """Return Isolation Forest anomaly score for one tick (-1 = anomalous, 1 = normal)."""
        if not self._trained or self._model is None:
            return 0.0
        vec = np.array([[tick.get(ch, 0.0) for ch in CHANNELS]])
        # decision_function: negative = more anomalous
        return float(self._model.decision_function(vec)[0])

    def check_thresholds(self, tick: dict) -> tuple[List[str], str]:
        """
        Returns (affected_channels, severity_level).
        severity_level = 'CRITICAL' | 'WARNING' | ''
        """
        critical_channels = []
        warning_channels = []
        for ch, (lo, hi) in HARD_LIMITS.items():
            val = tick.get(ch)
            if val is None:
                continue
            if val < lo or val > hi:
                critical_channels.append(ch)

        if critical_channels:
            return critical_channels, "CRITICAL"

        for ch, (lo, hi) in WARNING_LIMITS.items():
            val = tick.get(ch)
            if val is None:
                continue
            if val < lo or val > hi:
                warning_channels.append(ch)

        if warning_channels:
            return warning_channels, "WARNING"

        return [], ""

    def evaluate(self, tick: dict) -> Optional[AnomalyEvent]:
        """
        Evaluate a single telemetry tick.
        Returns AnomalyEvent if an anomaly is detected, else None.
        """
        rule_channels, rule_severity = self.check_thresholds(tick)
        ml_score = self.score(tick)
        is_ml_anomaly = ml_score < -0.05  # negative = anomalous region

        if is_ml_anomaly:
            self._consecutive_ml += 1
        else:
            self._consecutive_ml = 0

        # Determine final severity and trigger type
        if rule_severity == "CRITICAL":
            severity = Severity.CRITICAL
            trigger = TriggerType.RULE if not is_ml_anomaly else TriggerType.COMBINED
            affected = rule_channels
        elif rule_severity == "WARNING" or (is_ml_anomaly and self._consecutive_ml >= 3):
            severity = Severity.WARNING
            trigger = TriggerType.COMBINED if rule_channels else TriggerType.ML
            affected = rule_channels or [
                ch for ch in CHANNELS
                if tick.get(ch) is not None and (
                    tick[ch] < WARNING_LIMITS[ch][0] or tick[ch] > WARNING_LIMITS[ch][1]
                )
            ]
            if not affected:
                # ML anomaly with no specific channel — report top deviating channel
                deviations = {}
                from services.telemetry_simulator import BASELINES, NOISE_STD
                for ch in CHANNELS:
                    val = tick.get(ch)
                    if val is not None:
                        deviations[ch] = abs(val - BASELINES[ch]) / max(NOISE_STD[ch], 0.001)
                affected = [max(deviations, key=deviations.get)]  # type: ignore[arg-type]
        else:
            return None  # nominal

        channel_values = {ch: tick.get(ch) for ch in affected}

        return AnomalyEvent(
            id=str(uuid.uuid4()),
            detected_at=datetime.now(timezone.utc),
            severity=severity,
            affected_channels=affected,
            channel_values=channel_values,
            anomaly_score=round(ml_score, 4),
            trigger_type=trigger,
            status=AnomalyStatus.ACTIVE,
        )


# Module-level singleton
detector = AnomalyDetector()
