"""Utility functions."""

from datetime import datetime
from typing import TYPE_CHECKING, Literal
from sqlalchemy import select

from app.common.constants import MODULE_HB_TIMEOUT

if TYPE_CHECKING:
    from app.models.module import Module
    from app.models.plant import Plant
    from app.schemas.metrics import MetricsResponse


def is_module_online(module: Module) -> bool:
    """Check if module is online."""
    if not module.last_seen:
        return False
    last_seen = module.last_seen
    return (datetime.now() - last_seen).total_seconds() <= MODULE_HB_TIMEOUT


def are_latest_metrics_within_thresholds(session, plant: "Plant", latest_metrics: "MetricsResponse | None") -> bool:
    """Check if the latest metrics are within the plant's thresholds."""  
    if not latest_metrics:
        return False
    # Check thresholds
    if (not (plant.min_soil_moist <= latest_metrics.soilMoist <= plant.max_soil_moist) or
        not (plant.min_humidity <= latest_metrics.humidity <= plant.max_humidity) or
        not (plant.min_light <= latest_metrics.light <= plant.max_light) or
        not (plant.min_temp <= latest_metrics.temp <= plant.max_temp)):
        return False
    return True