"""Plants router."""

import os
from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.values import Values
from app.models.user import User
from app.schemas.plant import (
    PlantCreateRequest,
    PlantResponse,
    PlantUpdateRequest,
    ThresholdRangeResponse,
    ThresholdsResponse,
)
from app.schemas.values import (
    ValuesResponse,
)
from app.schemas.websocket import (
    EntityChangeMessage,
    EntityChangePayload,
)
from app.websocket import ws_manager

router = APIRouter(prefix="/plants", tags=["Plants"])


def _is_module_online(module: Module | None) -> bool:
    """Check if module is online."""
    if not module or not module.last_seen:
        return False
    last_seen = module.last_seen.replace(tzinfo=UTC) if module.last_seen.tzinfo is None else module.last_seen
    return (datetime.now(UTC) - last_seen).total_seconds() <= int(os.environ.get('HEARTBEAT_TIMEOUT_SECONDS', '120'))


def _get_latest_values(session: Session, plant_id: int) -> ValuesResponse | None:
    """Get latest sensor values for a plant."""
    latest = session.execute(
        select(Values).where(Values.plant_id == plant_id).order_by(Values.timestamp.desc())  # type: ignore
    ).scalars().first()
    if not latest:
        return None
    return ValuesResponse(
        soilMoist=latest.soil_moist,
        humidity=latest.humidity,
        light=latest.light,
        temp=latest.temp,
        timestamp=latest.timestamp,
    )


def _calculate_status(session: Session, plant: Plant, latest_values: ValuesResponse | None) -> Literal["ok", "alert", "offline"]:
    """Calculate plant status."""
    module = session.execute(select(Module).where(Module.id == plant.module_id)).scalars().first()
    if not _is_module_online(module):
        return "offline"
    if not latest_values:
        return "ok"
    # Check thresholds
    if not (plant.min_soil_moist <= latest_values.soilMoist <= plant.max_soil_moist):
        return "alert"
    if not (plant.min_humidity <= latest_values.humidity <= plant.max_humidity):
        return "alert"
    if not (plant.min_light <= latest_values.light <= plant.max_light):
        return "alert"
    if not (plant.min_temp <= latest_values.temp <= plant.max_temp):
        return "alert"
    return "ok"


@router.get("", response_model=list[PlantResponse])
async def get_plants(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> list[PlantResponse]:
    """Get all plants."""
    plants = session.execute(select(Plant)).scalars().all()
    return [
        PlantResponse(
            id=p.id,
            name=p.name,
            moduleId=p.module_id,
            status=_calculate_status(session, p, lv := _get_latest_values(session, p.id)),
            latestValues=lv,
            thresholds=ThresholdsResponse(
                soilMoist=ThresholdRangeResponse(min=p.min_soil_moist, max=p.max_soil_moist),
                humidity=ThresholdRangeResponse(min=p.min_humidity, max=p.max_humidity),
                light=ThresholdRangeResponse(min=p.min_light, max=p.max_light),
                temp=ThresholdRangeResponse(min=p.min_temp, max=p.max_temp),
            ),
        )
        for p in plants
    ]

@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> PlantResponse:
    """Get a specific plant by ID."""
    # Get plant
    plant = session.execute(select(Plant).where(Plant.id == plant_id)).scalars().first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    # Get current values
    latest_values = _get_latest_values(session, plant.id)
    return PlantResponse(
        id=plant.id,
        name=plant.name,
        moduleId=plant.module_id,
        status=_calculate_status(session, plant, latest_values),
        latestValues=latest_values,
        thresholds=ThresholdsResponse(
            soilMoist=ThresholdRangeResponse(min=plant.min_soil_moist, max=plant.max_soil_moist),
            humidity=ThresholdRangeResponse(min=plant.min_humidity, max=plant.max_humidity),
            light=ThresholdRangeResponse(min=plant.min_light, max=plant.max_light),
            temp=ThresholdRangeResponse(min=plant.min_temp, max=plant.max_temp),
        ),
    )

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_plant(
    request: PlantCreateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> Response:
    """Create a new plant with module coupling."""
    # Get module
    module = session.execute(select(Module).where(Module.id == request.moduleId)).scalars().first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    # Check if module is already coupled
    if module.coupled:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Module is already coupled to another plant")

    # Create plant
    plant = Plant(
        name=request.name,
        module_id=request.moduleId,
        min_soil_moist=request.thresholds.soilMoist.min,
        max_soil_moist=request.thresholds.soilMoist.max,
        min_humidity=request.thresholds.humidity.min,
        max_humidity=request.thresholds.humidity.max,
        min_light=request.thresholds.light.min,
        max_light=request.thresholds.light.max,
        min_temp=request.thresholds.temp.min,
        max_temp=request.thresholds.temp.max,
    )
    session.add(plant)
    module.coupled = True
    session.add(module)
    session.commit()
    session.refresh(plant)

    # Get current values
    latest_values = _get_latest_values(session, plant.id)

    # Broadcast ENTITY_CHANGE for plant creation
    await ws_manager.emit_entity_change(
        EntityChangeMessage(
            payload=EntityChangePayload(
                entity="plant",
                action="create",
                id=plant.id,
            )
        )
    )

    # Broadcast ENTITY_CHANGE for module update (marked as coupled)
    await ws_manager.emit_entity_change(
        EntityChangeMessage(
            payload=EntityChangePayload(
                entity="module",
                action="update",
                id=request.moduleId,
            )
        )
    )

    return Response(status_code=status.HTTP_201_CREATED, headers={"Location": f"/plants/{plant.id}"})

@router.put("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_plant(
    plant_id: int,
    request: PlantUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Update a plant's details."""
    plant = session.execute(select(Plant).where(Plant.id == plant_id)).scalars().first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    # Track old module ID and handle module change
    old_module_id = plant.module_id
    module_changed = request.moduleId and request.moduleId != plant.module_id
    
    if module_changed:
        new_module = session.execute(select(Module).where(Module.id == request.moduleId)).scalars().first()
        if not new_module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
        elif new_module.coupled:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="New module is already coupled to another plant")

        # Uncouple old module
        old_module = session.execute(select(Module).where(Module.id == plant.module_id)).scalars().first()
        if old_module:
            old_module.coupled = False
            session.add(old_module)

        new_module.coupled = True
        session.add(new_module)
        plant.module_id = request.moduleId

    if request.name:
        plant.name = request.name

    if request.thresholds:
        plant.min_soil_moist = request.thresholds.soilMoist.min
        plant.max_soil_moist = request.thresholds.soilMoist.max
        plant.min_humidity = request.thresholds.humidity.min
        plant.max_humidity = request.thresholds.humidity.max
        plant.min_light = request.thresholds.light.min
        plant.max_light = request.thresholds.light.max
        plant.min_temp = request.thresholds.temp.min
        plant.max_temp = request.thresholds.temp.max

    session.add(plant)
    session.commit()
    session.refresh(plant)

    # Broadcast ENTITY_CHANGE for plant update
    await ws_manager.emit_entity_change(
        EntityChangeMessage(
            payload=EntityChangePayload(
                entity="plant",
                action="update",
                id=plant.id,
            )
        )
    )

    # If module changed, broadcast ENTITY_CHANGE for both old and new modules
    if module_changed:
        # Old module (now available)
        await ws_manager.emit_entity_change(
            EntityChangeMessage(
                payload=EntityChangePayload(
                    entity="module",
                    action="update",
                    id=old_module_id,
                )
            )
        )
        # New module (now coupled)
        await ws_manager.emit_entity_change(
            EntityChangeMessage(
                payload=EntityChangePayload(
                    entity="module",
                    action="update",
                    id=request.moduleId,
                )
            )
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(
    plant_id: int,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Delete a plant."""
    # Get plant
    plant = session.execute(select(Plant).where(Plant.id == plant_id)).scalars().first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    # Save module ID before deletion
    coupled_module_id = plant.module_id

    # Delete sensor values
    session.execute(delete(Values).where(Values.plant_id == plant.id))
    session.delete(plant)
    session.commit()

    # Uncouple module
    module = session.execute(select(Module).where(Module.id == coupled_module_id)).scalars().first()
    if module:
        module.coupled = False
        session.add(module)
        session.commit()

    # Broadcast ENTITY_CHANGE for plant deletion
    await ws_manager.emit_entity_change(
        EntityChangeMessage(
            payload=EntityChangePayload(
                entity="plant",
                action="delete",
                id=plant_id,
            )
        )
    )

    # Broadcast ENTITY_CHANGE for module update (now available)
    await ws_manager.emit_entity_change(
        EntityChangeMessage(
            payload=EntityChangePayload(
                entity="module",
                action="update",
                id=coupled_module_id,
            )
        )
    )