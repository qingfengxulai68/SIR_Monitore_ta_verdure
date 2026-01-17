"""Ingestion router for sensor data from ESP32/Python scripts."""

from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

load_dotenv()


from app.common.discord_utils import send_discord_message
from app.common.email_utils import send_email
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
        
        if len(alerts) > 0:
            settings = session.execute(select(Settings)).scalars().first()
            for alert in alerts:
                if settings and settings.alerts_discord_enabled and settings.discord_webhook_url:
                    if alert == "SOIL_MOIST":
                        message = f"⚠️ Alert: Soil Moisture out of thresholds for plant {plant.id}. Current: {request.soilMoist}%, Min: {plant.min_soil_moist}%, Max: {plant.max_soil_moist}%."
                    elif alert == "HUMIDITY":
                        message = f"⚠️ Alert: Humidity out of thresholds for plant {plant.id}. Current: {request.humidity}%, Min: {plant.min_humidity}%, Max: {plant.max_humidity}%."
                    elif alert == "LIGHT":
                        message = f"⚠️ Alert: Light out of thresholds for plant {plant.id}. Current: {request.light} lx, Min: {plant.min_light} lx, Max: {plant.max_light} lx."
                    elif alert == "TEMP":
                        message = f"⚠️ Alert: Temperature out of thresholds for plant {plant.id}. Current: {request.temp} °C, Min: {plant.min_temp} °C, Max: {plant.max_temp} °C."
                    send_discord_message(settings.discord_webhook_url, message)
                if settings and settings.alerts_email_enabled and settings.receiver_email:
                    if alert == "SOIL_MOIST":
                        message = f"Alert: Soil Moisture out of thresholds for plant {plant.id}. Current: {request.soilMoist}%, Min: {plant.min_soil_moist}%, Max: {plant.max_soil_moist}%."
                    elif alert == "HUMIDITY":
                        message = f"Alert: Humidity out of thresholds for plant {plant.id}. Current: {request.humidity}%, Min: {plant.min_humidity}%, Max: {plant.max_humidity}%."
                    elif alert == "LIGHT":  
                        message = f"Alert: Light out of thresholds for plant {plant.id}. Current: {request.light} lx, Min: {plant.min_light} lx, Max: {plant.max_light} lx."
                    elif alert == "TEMP":
                        message = f"Alert: Temperature out of thresholds for plant {plant.id}. Current: {request.temp} °C, Min: {plant.min_temp} °C, Max: {plant.max_temp} °C."
                    send_email(
                        sender_email=os.getenv("EMAIL"),
                        sender_password=os.getenv("EMAIL_PASSWORD"),
                        receiver_email=settings.receiver_email,
                        subject=f"Plant {plant.id} Alert: {alert} out of thresholds",
                        body=message
                    )       
                    # Here you would normally send the alert to the Discord webhook.
                    # For this example, we'll just print it.
            print(f"Alert for plant {plant.id}: {alerts}. The plant is out of thresholds.")

    session.commit()

    # Broadcast MODULE_CONNECTIVITY
    await ws_manager.emit_module_connectivity(module.id, True, module.last_seen)
    
