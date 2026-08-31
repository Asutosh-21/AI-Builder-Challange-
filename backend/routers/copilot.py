"""
Copilot Router
RAG Incident Copilot endpoints — chat, session management.
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services import rag_copilot
from services.anomaly_log import anomaly_log

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/copilot", tags=["copilot"])


class ChatRequest(BaseModel):
    session_id: str
    message: str
    anomaly_id: Optional[str] = None


@router.post("/chat")
async def chat(body: ChatRequest):
    """
    Stream a RAG-powered Granite response.
    Injects current anomaly data as context if anomaly_id is provided.
    """
    anomaly_context: Optional[str] = None
    if body.anomaly_id:
        event = anomaly_log.get_by_id(body.anomaly_id)
        if event:
            anomaly_context = (
                f"Severity: {event.severity}, "
                f"Channels: {', '.join(event.affected_channels)}, "
                f"Values: {event.channel_values}, "
                f"Score: {event.anomaly_score}"
            )

    def _generate():
        for chunk in rag_copilot.chat(body.session_id, body.message, anomaly_context):
            # Format as SSE
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(_generate(), media_type="text/event-stream")


@router.get("/sessions")
async def list_sessions():
    """List all active copilot sessions."""
    return {"sessions": rag_copilot.get_sessions()}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Clear a copilot session's conversation history."""
    success = rag_copilot.delete_session(session_id)
    return {"status": "deleted" if success else "not_found"}
