"""Ingestion router for sensor data from ESP32/Python scripts."""

import os
from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.api_key import verify_api_key
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.values import Values
from app.schemas.values import ValuesAddRequest, ValuesResponse
from app.schemas.websocket import (
    PlantMetricsMessage,
    PlantMetricsPayload,
    PlantMetricsValues,
    ModuleConnectionMessage,
    ModuleConnectionPayload,
)
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


@router.post("/", status_code=204)
async def ingest_sensor_data(
    request: ValuesAddRequest,
    session: Annotated[Session, Depends(get_session)],
    _api_key: Annotated[str, Depends(verify_api_key)],
) -> None:
    """Ingest sensor data from hardware modules."""

    # Get module
    module = session.execute(select(Module).where(Module.id == request.moduleId)).scalars().first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")

    if not module.coupled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module is not coupled to any plant.")

    # Get plant
    plant = session.execute(select(Plant).where(Plant.module_id == request.moduleId)).scalars().first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found for this module.")

    # Check if module was offline before (for MODULE_CONNECTION event)
    was_offline = not module.last_seen or (
        (datetime.now(UTC) - module.last_seen.replace(tzinfo=UTC)).total_seconds()
        > int(os.environ.get("HEARTBEAT_TIMEOUT_SECONDS", "120"))
    )

    # Update last_seen
    now = datetime.now(UTC)
    module.last_seen = now
    session.add(module)

    # Save sensor data
    values = Values(
        plant_id=plant.id,
        soil_moist=request.soilMoist,
        humidity=request.humidity,
        light=request.light,
        temp=request.temp,
    )
    session.add(values)
    session.commit()

    # Calculate plant status
    def calculate_status() -> Literal["ok", "alert", "offline"]:
        """Calculate plant status based on thresholds."""
        if not (
            plant.min_soil_moist <= request.soilMoist <= plant.max_soil_moist
        ):
            return "alert"
        if not (plant.min_humidity <= request.humidity <= plant.max_humidity):
            return "alert"
        if not (plant.min_light <= request.light <= plant.max_light):
            return "alert"
        if not (plant.min_temp <= request.temp <= plant.max_temp):
            return "alert"
        return "ok"

    plant_status = calculate_status()

    # Broadcast PLANT_METRICS (always)
    plant_metrics_msg = PlantMetricsMessage(
        payload=PlantMetricsPayload(
            plantId=plant.id,
            values=PlantMetricsValues(
                soilMoist=request.soilMoist,
                humidity=request.humidity,
                light=request.light,
                temp=request.temp,
                timestamp=now,
            ),
            status=plant_status,
        )
    )
    await ws_manager.emit_plant_metrics(plant_metrics_msg)

    # Broadcast MODULE_CONNECTION (only if module was offline)
    if was_offline:
        module_connection_msg = ModuleConnectionMessage(
            payload=ModuleConnectionPayload(
                moduleId=module.id,
                isOnline=True,
                coupledPlantId=plant.id,
            )
        )
        await ws_manager.emit_module_connection(module_connection_msg)

    return None
