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
from app.tasks.module_heartbeat import module_heartbeat_checker

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
            
            # Mapping alerts to readable info
            alert_info = {
                "SOIL_MOIST": {
                    "label": "Soil Moisture",
                    "value": f"{request.soilMoist}%",
                    "range": f"{plant.min_soil_moist}% - {plant.max_soil_moist}%",
                    "icon": "🌱"
                },
                "HUMIDITY": {
                    "label": "Air Humidity",
                    "value": f"{request.humidity}%",
                    "range": f"{plant.min_humidity}% - {plant.max_humidity}%",
                    "icon": "💧"
                },
                "LIGHT": {
                    "label": "Light",
                    "value": f"{request.light} lx",
                    "range": f"{plant.min_light} - {plant.max_light} lx",
                    "icon": "☀️"
                },
                "TEMP": {
                    "label": "Temperature",
                    "value": f"{request.temp}°C",
                    "range": f"{plant.min_temp}°C - {plant.max_temp}°C",
                    "icon": "🌡️"
                }
            }
                        
            # Build grouped message for Discord
            if settings and settings.alerts_discord_enabled and settings.discord_webhook_url:
                discord_msg = f"**🔴 Alert for {plant.name}**\n"
                for alert in alerts:
                    info = alert_info[alert]
                    discord_msg += f"**{info['label']}**: {info['value']} (acceptable: {info['range']})\n"
                
                send_discord_message(settings.discord_webhook_url, discord_msg)
            
            # Build grouped message for Email
            if settings and settings.alerts_email_enabled and settings.receiver_email:
                email_body = f"Alert for {plant.name}\n"
                email_body += "Parameters out of range:\n\n"
                for alert in alerts:
                    info = alert_info[alert]
                    email_body += f"- {info['icon']} {info['label']}: {info['value']} (acceptable: {info['range']})\n"
                
                send_email(
                    sender_email=os.getenv("EMAIL"),
                    sender_password=os.getenv("EMAIL_PASSWORD"),
                    receiver_email=settings.receiver_email,
                    subject=f"🔴 Alert for {plant.name}",
                    body=email_body
                )

    session.commit()

    # Notify heartbeat checker that module is online
    module_heartbeat_checker.mark_module_online(module.id)
    
    # Broadcast MODULE_CONNECTIVITY
    await ws_manager.emit_module_connectivity(module.id, True, module.last_seen)
    
