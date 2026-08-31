"""
LangGraph Multi-Agent Pipeline
Detect → Root Cause → Risk → Action → Human Review

Full pipeline for processing an anomaly event through all AI agents.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


def _build_graph():
    """Build the LangGraph StateGraph. Lazy-loaded to handle missing dependency gracefully."""
    try:
        from langgraph.graph import StateGraph, END
        from agents.state import AgentState
        from agents.detect_node import detect_node
        from agents.root_cause_node import root_cause_node
        from agents.risk_node import risk_node
        from agents.action_node import action_node
        from agents.human_review_node import human_review_node

        graph = StateGraph(AgentState)

        graph.add_node("detect", detect_node)
        graph.add_node("root_cause", root_cause_node)
        graph.add_node("risk", risk_node)
        graph.add_node("action", action_node)
        graph.add_node("human_review", human_review_node)

        graph.set_entry_point("detect")
        graph.add_edge("detect", "root_cause")
        graph.add_edge("root_cause", "risk")
        graph.add_edge("risk", "action")
        graph.add_edge("action", "human_review")
        graph.add_edge("human_review", END)

        return graph.compile()
    except ImportError as exc:
        logger.warning("LangGraph not available (%s) — using sequential fallback pipeline", exc)
        return None


_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = _build_graph()
    return _pipeline


def run_pipeline(anomaly_event: Dict[str, Any], orbital_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the full multi-agent pipeline for an anomaly event.
    Falls back to a simple sequential call if LangGraph is unavailable.
    """
    from services.orbital_params import MISSION_OBJECTIVE

    initial_state = {
        "anomaly_event": anomaly_event,
        "orbital_params": orbital_params,
        "mission_objective": MISSION_OBJECTIVE,
        "messages": [],
    }

    pipeline = get_pipeline()
    if pipeline is not None:
        try:
            result = pipeline.invoke(initial_state)
            logger.info("LangGraph pipeline completed. Steps: %s", result.get("messages", []))
            return result
        except Exception as exc:
            logger.error("LangGraph pipeline failed: %s — falling back to sequential", exc)

    # Sequential fallback
    from agents.detect_node import detect_node
    from agents.root_cause_node import root_cause_node
    from agents.risk_node import risk_node
    from agents.action_node import action_node
    from agents.human_review_node import human_review_node

    state = initial_state
    for node_fn in [detect_node, root_cause_node, risk_node, action_node, human_review_node]:
        try:
            state = node_fn(state)
        except Exception as exc:
            logger.error("Node %s failed: %s", node_fn.__name__, exc)
            state = {**state, "error": str(exc)}

    return state
