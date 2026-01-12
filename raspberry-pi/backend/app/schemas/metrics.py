"""Metrics data schemas."""

import datetime
from pydantic import BaseModel, Field

from app.common.constants import SENSOR_THRESHOLDS


# Metrics Responses
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
