"""
Agent State
Shared state definition for the LangGraph multi-agent pipeline.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    # Input
    anomaly_event: Dict[str, Any]
    orbital_params: Dict[str, Any]
    mission_objective: str

    # Pipeline outputs
    detected: bool
    root_cause: Optional[str]
    risk_level: Optional[str]          # LOW / MEDIUM / HIGH / CRITICAL
    risk_score: Optional[float]        # 0.0 – 1.0
    recommended_action: Optional[str]
    mission_plan: Optional[str]

    # Human review gate
    requires_human_review: bool
    human_approved: Optional[bool]

    # Metadata
    messages: List[str]
    error: Optional[str]
