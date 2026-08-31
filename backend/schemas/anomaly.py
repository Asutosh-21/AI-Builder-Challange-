from __future__ import annotations
from enum import Enum
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
import uuid


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"


class TriggerType(str, Enum):
    RULE = "rule"
    ML = "ml"
    COMBINED = "combined"


class AnomalyStatus(str, Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"


class AnomalyEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    severity: Severity
    affected_channels: List[str]
    channel_values: dict
    anomaly_score: float
    trigger_type: TriggerType
    status: AnomalyStatus = AnomalyStatus.ACTIVE
    granite_explanation: Optional[str] = None
    mission_plan: Optional[str] = None

    model_config = {"use_enum_values": True}
