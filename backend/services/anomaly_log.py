"""
Anomaly Log
In-memory event store (last 100 anomalies).
"""
from __future__ import annotations

from collections import deque
from typing import Deque, List, Optional

from schemas.anomaly import AnomalyEvent, AnomalyStatus


class AnomalyLog:
    """Singleton in-memory log of anomaly events."""

    _instance: Optional["AnomalyLog"] = None

    def __new__(cls) -> "AnomalyLog":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._log: Deque[AnomalyEvent] = deque(maxlen=100)
        return cls._instance

    def add(self, event: AnomalyEvent) -> None:
        self._log.appendleft(event)

    def get_active(self) -> List[AnomalyEvent]:
        return [e for e in self._log if e.status == AnomalyStatus.ACTIVE]

    def get_history(self) -> List[AnomalyEvent]:
        return list(self._log)

    def get_by_id(self, event_id: str) -> Optional[AnomalyEvent]:
        for e in self._log:
            if e.id == event_id:
                return e
        return None

    def resolve(self, event_id: str) -> bool:
        for e in self._log:
            if e.id == event_id:
                e.status = AnomalyStatus.RESOLVED
                return True
        return False

    def update_explanation(self, event_id: str, explanation: str) -> None:
        for e in self._log:
            if e.id == event_id:
                e.granite_explanation = explanation
                return

    def update_plan(self, event_id: str, plan: str) -> None:
        for e in self._log:
            if e.id == event_id:
                e.mission_plan = plan
                return


# Module-level singleton
anomaly_log = AnomalyLog()
