"""Value and sensor data schemas."""

import datetime
import os
from pydantic import BaseModel, Field


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
    soilMoist: float = Field(..., ge=float(os.environ.get('SOIL_MOIST_MIN')), le=float(os.environ.get('SOIL_MOIST_MAX')))
    humidity: float = Field(..., ge=float(os.environ.get('HUMIDITY_MIN')), le=float(os.environ.get('HUMIDITY_MAX')))
    light: float = Field(..., ge=float(os.environ.get('LIGHT_MIN')), le=float(os.environ.get('LIGHT_MAX')))
    temp: float = Field(..., ge=float(os.environ.get('TEMP_MIN')), le=float(os.environ.get('TEMP_MAX')))
