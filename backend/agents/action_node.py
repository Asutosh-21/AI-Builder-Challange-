"""
Action Node
Fourth agent: generates recommended action and mission plan via Granite.
"""
from __future__ import annotations

import logging
from agents.state import AgentState

logger = logging.getLogger(__name__)


def action_node(state: AgentState) -> AgentState:
    """Generate mission response plan and recommended action."""
    from services.granite_ai import generate_mission_plan
    from services.orbital_params import MISSION_OBJECTIVE

    event_dict = state.get("anomaly_event", {})
    orbital = state.get("orbital_params", {})
    messages = state.get("messages", [])

    class _EventProxy:
        def __init__(self, d, explanation):
            self.severity = d.get("severity", "WARNING")
            self.affected_channels = d.get("affected_channels", [])
            self.channel_values = d.get("channel_values", {})
            self.anomaly_score = d.get("anomaly_score", 0.0)
            self.granite_explanation = explanation

    proxy = _EventProxy(event_dict, state.get("root_cause", ""))

    try:
        plan = generate_mission_plan(proxy, orbital, MISSION_OBJECTIVE)
        messages.append(f"[ACTION] Mission plan generated ({len(plan)} chars)")

        # Extract recommended action: first sentence of plan
        first_sentence = plan.split(".")[0].strip() + "." if plan else "Initiate anomaly isolation protocol."
        return {**state, "mission_plan": plan, "recommended_action": first_sentence, "messages": messages}
    except Exception as exc:
        logger.error("action_node failed: %s", exc)
        return {
            **state,
            "recommended_action": "Initiate anomaly isolation — safe mode pending review.",
            "mission_plan": f"Mission plan generation failed: {exc}",
            "messages": messages,
        }
