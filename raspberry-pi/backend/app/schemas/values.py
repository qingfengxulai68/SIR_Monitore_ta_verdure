"""Value and sensor data schemas."""

import datetime
from pydantic import BaseModel, Field

from backend.app.common.constants import SENSOR_THRESHOLDS


# Values
class ValuesResponse(BaseModel):
    """Latest sensor values for a plant."""

    soilMoist: float
    humidity: float
    light: float
    temp: float
    timestamp: datetime.datetime


# Values Requests
class ValuesAddRequest(BaseModel):
    """Sensor data ingestion request schema."""

    moduleId: str = Field(..., min_length=1, max_length=50)
    soilMoist: float = Field(..., ge=SENSOR_THRESHOLDS["SOIL_MOIST"]["MIN"], le=SENSOR_THRESHOLDS["SOIL_MOIST"]["MAX"])
    humidity: float = Field(..., ge=SENSOR_THRESHOLDS["HUMIDITY"]["MIN"], le=SENSOR_THRESHOLDS["HUMIDITY"]["MAX"])
    light: float = Field(..., ge=SENSOR_THRESHOLDS["LIGHT"]["MIN"], le=SENSOR_THRESHOLDS["LIGHT"]["MAX"])
    temp: float = Field(..., ge=SENSOR_THRESHOLDS["TEMP"]["MIN"], le=SENSOR_THRESHOLDS["TEMP"]["MAX"])
