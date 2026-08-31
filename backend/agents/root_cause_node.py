"""
Root Cause Node
Second agent: calls IBM Granite to generate root cause explanation.
"""
from __future__ import annotations

import logging
from agents.state import AgentState

logger = logging.getLogger(__name__)


def root_cause_node(state: AgentState) -> AgentState:
    """Generate root cause explanation via Granite AI."""
    from services.granite_ai import generate_root_cause
    from schemas.anomaly import AnomalyEvent

    event_dict = state.get("anomaly_event", {})
    messages = state.get("messages", [])

    try:
        # Reconstruct a lightweight AnomalyEvent-like object
        class _EventProxy:
            def __init__(self, d):
                self.severity = d.get("severity", "WARNING")
                self.affected_channels = d.get("affected_channels", [])
                self.channel_values = d.get("channel_values", {})
                self.anomaly_score = d.get("anomaly_score", 0.0)
                self.detected_at = d.get("detected_at", "")
                self.granite_explanation = None

        proxy = _EventProxy(event_dict)
        explanation = generate_root_cause(proxy)
        messages.append(f"[ROOT_CAUSE] Generated explanation ({len(explanation)} chars)")
        return {**state, "root_cause": explanation, "messages": messages}
    except Exception as exc:
        logger.error("root_cause_node failed: %s", exc)
        return {**state, "root_cause": f"Root cause analysis unavailable: {exc}", "messages": messages}
