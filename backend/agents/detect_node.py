"""
Detect Node
First agent in the pipeline: validates the anomaly event and extracts key signals.
"""
from __future__ import annotations

import logging
from agents.state import AgentState

logger = logging.getLogger(__name__)


def detect_node(state: AgentState) -> AgentState:
    """Validate anomaly and mark detection complete."""
    event = state.get("anomaly_event", {})
    if not event:
        return {**state, "detected": False, "error": "No anomaly event provided"}

    severity = event.get("severity", "INFO")
    affected = event.get("affected_channels", [])
    score = event.get("anomaly_score", 0.0)

    messages = state.get("messages", [])
    messages.append(
        f"[DETECT] Anomaly confirmed. Severity={severity}, "
        f"Channels={affected}, IF_score={score:.4f}"
    )

    return {**state, "detected": True, "messages": messages}
