"""Metrics data schemas."""

import datetime
from typing import Literal
from pydantic import BaseModel, Field

from app.common.constants import SENSOR_THRESHOLDS


# Metrics Response
class MetricsResponse(BaseModel):
    """Latest metrics for a plant."""

    soilMoist: float
    humidity: float
    light: float
    temp: float


# Metrics Requests
class MetricsAddRequest(BaseModel):
    """Metrics ingestion request schema."""

    moduleId: str = Field(..., min_length=1, max_length=50)
    soilMoist: float = Field(..., ge=SENSOR_THRESHOLDS["SOIL_MOIST"]["MIN"], le=SENSOR_THRESHOLDS["SOIL_MOIST"]["MAX"])
    humidity: float = Field(..., ge=SENSOR_THRESHOLDS["HUMIDITY"]["MIN"], le=SENSOR_THRESHOLDS["HUMIDITY"]["MAX"])
    light: float = Field(..., ge=SENSOR_THRESHOLDS["LIGHT"]["MIN"], le=SENSOR_THRESHOLDS["LIGHT"]["MAX"])
    temp: float = Field(..., ge=SENSOR_THRESHOLDS["TEMP"]["MIN"], le=SENSOR_THRESHOLDS["TEMP"]["MAX"])

# History Response
class HistoryDataPoint(BaseModel):
    """Single data point in history."""

    time: datetime.datetime
    soilMoist: float | None = None
    temp: float | None = None
    light: float | None = None
    humidity: float | None = None


class HistoryMeta(BaseModel):
    """Metadata about the history query."""

    range: Literal["hour", "day", "week", "month"]
    aggregation: str  # e.g., "raw", "10m", "1h", "4h"
    from_time: datetime.datetime = Field(alias="from")
    to_time: datetime.datetime = Field(alias="to")

    class Config:
        populate_by_name = True


class HistoryResponse(BaseModel):
    """Historical data response."""

    meta: HistoryMeta
    data: list[HistoryDataPoint]
