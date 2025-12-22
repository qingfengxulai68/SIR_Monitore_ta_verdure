"""WebSocket event schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


# WebSocket Events
class LatestValuesEvent(BaseModel):
    """Latest values for WebSocket events."""

    soilMoist: float
    humidity: float
    light: float
    temp: float


class PlantUpdateEvent(BaseModel):
    """plant:update WebSocket event payload."""

    plantId: int
    name: str
    moduleId: str
    status: Literal["ok", "alert"]
    latestValues: LatestValuesEvent
    timestamp: datetime


class PlantOfflineEvent(BaseModel):
    """plant:offline WebSocket event payload."""

    plantId: int
    name: str
    moduleId: str
    status: Literal["offline"] = "offline"
    timestamp: datetime


class ModuleStatusEvent(BaseModel):
    """module:status WebSocket event payload."""

    moduleId: str
    isOnline: bool
    lastSeen: datetime
