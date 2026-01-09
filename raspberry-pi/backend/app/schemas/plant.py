"""Plant schemas."""

from typing import Literal
from pydantic import BaseModel, Field, field_validator, model_validator

from app.common.constants import SENSOR_THRESHOLDS
from app.schemas.sensor_values import SensorValuesResponse


# Thresholds Ranges
class ThresholdRangeRequest(BaseModel):
    """Threshold range for a sensor."""

    min: float
    max: float

    @model_validator(mode="after")
    def validate_range(self) -> "ThresholdRangeRequest":
        """Validate that min is less than max."""
        if self.min >= self.max:
            raise ValueError("min must be less than max")
        return self


class ThresholdRangeResponse(BaseModel):
    """Threshold range for a sensor."""

    min: float
    max: float


# Thresholds
class ThresholdsRequest(BaseModel):
    """Thresholds for plant creation/update."""

    soilMoist: ThresholdRangeRequest
    humidity: ThresholdRangeRequest
    light: ThresholdRangeRequest
    temp: ThresholdRangeRequest

    @field_validator("soilMoist")
    @classmethod
    def validate_soil_moist(cls, v):
        min_val = SENSOR_THRESHOLDS["SOIL_MOIST"]["MIN"]
        max_val = SENSOR_THRESHOLDS["SOIL_MOIST"]["MAX"]
        if not (min_val <= v.min <= max_val and min_val <= v.max <= max_val):
            raise ValueError(f"Soil moisture thresholds must be between {min_val} and {max_val}")
        return v

    @field_validator("humidity")
    @classmethod
    def validate_humidity(cls, v):
        min_val = SENSOR_THRESHOLDS["HUMIDITY"]["MIN"]
        max_val = SENSOR_THRESHOLDS["HUMIDITY"]["MAX"]
        if not (min_val <= v.min <= max_val and min_val <= v.max <= max_val):
            raise ValueError(f"Humidity thresholds must be between {min_val} and {max_val}")
        return v

    @field_validator("light")
    @classmethod
    def validate_light(cls, v):
        min_val = SENSOR_THRESHOLDS["LIGHT"]["MIN"]
        max_val = SENSOR_THRESHOLDS["LIGHT"]["MAX"]
        if not (min_val <= v.min <= max_val and min_val <= v.max <= max_val):
            raise ValueError(f"Light thresholds must be between {min_val} and {max_val}")
        return v

    @field_validator("temp")
    @classmethod
    def validate_temp(cls, v):
        min_val = SENSOR_THRESHOLDS["TEMP"]["MIN"]
        max_val = SENSOR_THRESHOLDS["TEMP"]["MAX"]
        if not (min_val <= v.min <= max_val and min_val <= v.max <= max_val):
            raise ValueError(f"Temperature thresholds must be between {min_val} and {max_val}")
        return v


class ThresholdsResponse(BaseModel):
    """Thresholds response."""

    soilMoist: ThresholdRangeResponse
    humidity: ThresholdRangeResponse
    light: ThresholdRangeResponse
    temp: ThresholdRangeResponse


# Plant Requests
class PlantCreateRequest(BaseModel):
    """Plant creation request schema."""

    name: str = Field(..., min_length=1, max_length=100)
    moduleId: str = Field(..., min_length=1, max_length=50)
    thresholds: ThresholdsRequest


class PlantUpdateRequest(BaseModel):
    """Plant update request schema."""

    name: str | None = Field(None, min_length=1, max_length=100)
    moduleId: str | None = Field(None, min_length=1, max_length=50)
    thresholds: ThresholdsRequest | None = None


# Plant Responses
class PlantResponse(BaseModel):
    """Plant response schema."""

    id: int
    name: str
    moduleId: str
    status: Literal["ok", "alert", "offline"]
    latestValues: SensorValuesResponse | None = None
    thresholds: ThresholdsResponse