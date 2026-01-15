"""Ingestion router for sensor data from ESP32/Python scripts."""

from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.api_key import verify_api_key
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.metrics import Metrics
from app.schemas.metrics import MetricsAddRequest, MetricsResponse
from app.models.settings import Settings
from app.websocket import ws_manager

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


@router.post("/", status_code=204)
async def ingest_sensor_data(
    request: MetricsAddRequest,
    session: Annotated[Session, Depends(get_session)],
    _api_key: Annotated[str, Depends(verify_api_key)],
) -> None:
    """Ingest sensor data from hardware modules."""

    # Get module
    module = session.execute(select(Module).where(Module.id == request.moduleId)).scalars().first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")

    # Update last_seen
    now = datetime.now(timezone.utc)
    module.last_seen = now
    session.add(module)

    # Get plant
    plant = session.execute(select(Plant).where(Plant.module_id == request.moduleId)).scalars().first()

    if plant:
        # Save metrics data
        metric = Metrics(
            plant_id=plant.id,
            soil_moist=request.soilMoist,
            humidity=request.humidity,
            light=request.light,
            temp=request.temp,
            timestamp=now,
        )
        session.add(metric)

        # Broadcast PLANT_METRICS
        await ws_manager.emit_plant_metrics(plant.id, MetricsResponse(
            timestamp=now,
            soilMoist=request.soilMoist,
            humidity=request.humidity,
            light=request.light,
            temp=request.temp,
        ))

        # Check thresholds and broadcast alert if necessary
        alerts = []

        if request.soilMoist < plant.min_soil_moist or request.soilMoist > plant.max_soil_moist:
            alerts.append("SOIL_MOIST")
        if request.humidity < plant.min_humidity or request.humidity > plant.max_humidity:
            alerts.append("HUMIDITY")
        if request.light < plant.min_light or request.light > plant.max_light:
            alerts.append("LIGHT")
        if request.temp < plant.min_temp or request.temp > plant.max_temp:
            alerts.append("TEMP")
        
        if alerts:
            settings = session.execute(select(Settings)).scalars().first()
            if settings and settings.enable_alerts:
                discord_webhook_url = settings.discord_webhook_url
                print(f"Alert for plant {plant.id}: {alerts}. The plant is out of thresholds.")

    session.commit()

    # Broadcast MODULE_CONNECTIVITY
    await ws_manager.emit_module_connectivity(module.id, True, module.last_seen)
    
