"""Utility functions."""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Literal
from sqlalchemy import select

from app.common.constants import MODULE_HEARTBEAT_TIMEOUT_SECONDS

if TYPE_CHECKING:
    from app.models.module import Module
    from app.models.plant import Plant
    from app.schemas.sensor_values import SensorValuesResponse


def is_module_online(module: Module) -> bool:
    """Check if module is online."""
    if not module.last_seen:
        return False
    last_seen = module.last_seen.replace(tzinfo=UTC) if module.last_seen.tzinfo is None else module.last_seen
    return (datetime.now(UTC) - last_seen).total_seconds() <= MODULE_HEARTBEAT_TIMEOUT_SECONDS


def calculate_plant_status(session, plant: "Plant", latest_values: "SensorValuesResponse | None") -> Literal["ok", "alert", "offline"]:
    """Calculate plant status."""  
    from app.models.module import Module

    module = session.execute(select(Module).where(Module.id == plant.module_id)).scalars().first()
    if not is_module_online(module):
        return "offline"
    if not latest_values:
        return "ok"
    # Check thresholds
    if (not (plant.min_soil_moist <= latest_values.soilMoist <= plant.max_soil_moist) or
        not (plant.min_humidity <= latest_values.humidity <= plant.max_humidity) or
        not (plant.min_light <= latest_values.light <= plant.max_light) or
        not (plant.min_temp <= latest_values.temp <= plant.max_temp)):
        return "alert"
    return "ok"