"""Ingestion router for sensor data from ESP32/Python scripts."""

from datetime import UTC, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.api_key import verify_api_key
from app.common.utils import calculate_plant_status, is_module_online
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.sensor_values import SensorValues
from app.schemas.sensor_values import SensorValuesAddRequest, SensorValuesResponse
from app.websocket import ws_manager

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


@router.post("/", status_code=204)
async def ingest_sensor_data(
    request: SensorValuesAddRequest,
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
    was_offline = not is_module_online(module)

    # Update last_seen
    now = datetime.now(UTC)
    module.last_seen = now
    session.add(module)

    # Save sensor data
    values = SensorValues(
        plant_id=plant.id,
        soil_moist=request.soilMoist,
        humidity=request.humidity,
        light=request.light,
        temp=request.temp,
    )
    session.add(values)
    session.commit()

    # Calculate plant status
    current_new_values = SensorValuesResponse(
        soilMoist=request.soilMoist,
        humidity=request.humidity,
        light=request.light,
        temp=request.temp,
        timestamp=now,
    )
    plant_status = calculate_plant_status(session, plant, current_new_values)

    # Broadcast PLANT_METRICS (always)
    await ws_manager.emit_plant_metrics(plant.id, current_new_values, plant_status)

    # Broadcast MODULE_CONNECTION (only if module was offline)
    if was_offline:
        await ws_manager.emit_module_connection(module.id, True, plant.id)

    
