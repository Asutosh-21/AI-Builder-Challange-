"""
Human Review Node
Final gate: marks the pipeline output as requiring human approval before execution.
All propulsion and mode-change commands require human sign-off.
"""
from __future__ import annotations

import logging
from agents.state import AgentState

logger = logging.getLogger(__name__)


def human_review_node(state: AgentState) -> AgentState:
    """
    Gate node — does not execute commands autonomously.
    Sets human_approved=False and appends a mandatory review notice.
    """
    messages = state.get("messages", [])
    messages.append(
        "[HUMAN_REVIEW] HUMAN APPROVAL REQUIRED - All recommended actions pended "
        "for flight operations team review. No autonomous command execution."
    )

    return {
        **state,
        "human_approved": False,
        "messages": messages,
    }
