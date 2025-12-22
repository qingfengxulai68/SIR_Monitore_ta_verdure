"""Ingestion router for sensor data from ESP32/Python scripts."""

import os
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.api_key import verify_api_key
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.values import Values
from app.schemas.values import ValuesAddRequest, ValuesResponse
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

    # Update last_seen
    module.last_seen = datetime.now(UTC)
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


    # TODO : WebSocket Notifications (will be developed later)
    # if moodule was not online before, send module status update
    # notify plant with latest values and status

    return None
