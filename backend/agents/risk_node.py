"""
Risk Node
Third agent: compute a numerical risk score and risk level label.
"""
from __future__ import annotations

import logging
from agents.state import AgentState

logger = logging.getLogger(__name__)

SEVERITY_SCORE = {"CRITICAL": 0.9, "WARNING": 0.55, "INFO": 0.2}


def risk_node(state: AgentState) -> AgentState:
    """Compute risk score from severity, channel values, and anomaly score."""
    event = state.get("anomaly_event", {})
    messages = state.get("messages", [])

    severity = event.get("severity", "INFO")
    if_score = abs(event.get("anomaly_score", 0.0))
    num_channels = len(event.get("affected_channels", []))

    base_score = SEVERITY_SCORE.get(severity, 0.2)
    # Blend in ML score and channel count
    risk_score = min(1.0, base_score + (if_score * 0.1) + (num_channels * 0.03))

    if risk_score >= 0.8:
        risk_level = "CRITICAL"
    elif risk_score >= 0.55:
        risk_level = "HIGH"
    elif risk_score >= 0.35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    requires_review = risk_score >= 0.55

    messages.append(
        f"[RISK] score={risk_score:.2f}, level={risk_level}, "
        f"requires_human_review={requires_review}"
    )

    return {
        **state,
        "risk_score": round(risk_score, 3),
        "risk_level": risk_level,
        "requires_human_review": requires_review,
        "messages": messages,
    }
