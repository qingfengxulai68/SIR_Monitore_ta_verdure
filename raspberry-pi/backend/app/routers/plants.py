"""Plants router."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy import delete, select, func
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.sensor_values import SensorValues
from app.models.user import User
from app.schemas.plant import (
    PlantCreateRequest,
    PlantResponse,
    PlantUpdateRequest,
    ThresholdRangeResponse,
    ThresholdsResponse,
)
from app.schemas.sensor_values import SensorValuesResponse
from app.common.utils import calculate_plant_status
from app.websocket import ws_manager

router = APIRouter(prefix="/plants", tags=["Plants"])


@router.get("", response_model=list[PlantResponse])
async def get_plants(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> list[PlantResponse]:
    """Get all plants."""
    # Subquery to get max timestamp per plant
    latest_timestamps_subq = (
        select(SensorValues.plant_id, func.max(SensorValues.timestamp).label("max_timestamp"))
        .group_by(SensorValues.plant_id)
        .subquery()
    )

    # Get all plants with their latest values in a single query
    query = (
        select(Plant, SensorValues)
        .outerjoin(latest_timestamps_subq, Plant.id == latest_timestamps_subq.c.plant_id)
        .outerjoin(
            SensorValues,
            (SensorValues.plant_id == latest_timestamps_subq.c.plant_id)
            & (SensorValues.timestamp == latest_timestamps_subq.c.max_timestamp),
        )
    )
    results = session.execute(query).all()

    return [
        PlantResponse(
            id=plant.id,
            name=plant.name,
            moduleId=plant.module_id,
            status=calculate_plant_status(
                session,
                plant,
                lv := (
                    SensorValuesResponse(
                        soilMoist=val.soil_moist,
                        humidity=val.humidity,
                        light=val.light,
                        temp=val.temp,
                        timestamp=val.timestamp,
                    )
                    if val
                    else None
                ),
            ),
            latestValues=lv,
            thresholds=ThresholdsResponse(
                soilMoist=ThresholdRangeResponse(
                    min=plant.min_soil_moist, max=plant.max_soil_moist
                ),
                humidity=ThresholdRangeResponse(
                    min=plant.min_humidity, max=plant.max_humidity
                ),
                light=ThresholdRangeResponse(
                    min=plant.min_light, max=plant.max_light
                ),
                temp=ThresholdRangeResponse(min=plant.min_temp, max=plant.max_temp),
            ),
        )
        for plant, val in results
    ]

@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> PlantResponse:
    """Get a specific plant by ID."""
    # Get plant and latest values
    query = (
        select(Plant, SensorValues)
        .outerjoin(SensorValues, SensorValues.plant_id == Plant.id)
        .where(Plant.id == plant_id)
        .order_by(SensorValues.timestamp.desc())
        .limit(1)
    )
    result = session.execute(query).first()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    plant, latest_val_db = result

    # Map to schema
    latest_values = None
    if latest_val_db:
        latest_values = SensorValuesResponse(
            soilMoist=latest_val_db.soil_moist,
            humidity=latest_val_db.humidity,
            light=latest_val_db.light,
            temp=latest_val_db.temp,
            timestamp=latest_val_db.timestamp,
        )

    return PlantResponse(
        id=plant.id,
        name=plant.name,
        moduleId=plant.module_id,
        status=calculate_plant_status(session, plant, latest_values),
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

    # Broadcast ENTITY_CHANGE for plant creation
    await ws_manager.emit_entity_change("plant", "create", plant.id)

    # Broadcast ENTITY_CHANGE for module update (marked as coupled)
    await ws_manager.emit_entity_change("module", "update", request.moduleId)

    return Response(status_code=status.HTTP_201_CREATED, headers={"Location": f"/plants/{plant.id}"})

@router.put("/{plant_id}", status_code=204)
async def update_plant(
    plant_id: int,
    request: PlantUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Update a plant's details."""
    # Get plant
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

        # Couple new module
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
    await ws_manager.emit_entity_change("plant", "update", plant.id)

    # If module changed, broadcast ENTITY_CHANGE for both old and new modules
    if module_changed:
        # Old module (now available)
        await ws_manager.emit_entity_change("module", "update", old_module_id)
        # New module (now coupled)
        await ws_manager.emit_entity_change("module", "update", request.moduleId)

    
@router.delete("/{plant_id}", status_code=204)
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
    session.execute(delete(SensorValues).where(SensorValues.plant_id == plant.id))
    session.delete(plant)
    session.commit()

    # Uncouple module
    module = session.execute(select(Module).where(Module.id == coupled_module_id)).scalars().first()
    if module:
        module.coupled = False
        session.add(module)
        session.commit()

    # Broadcast ENTITY_CHANGE for plant deletion
    await ws_manager.emit_entity_change("plant", "delete", plant_id)

    # Broadcast ENTITY_CHANGE for module update (now available)
    await ws_manager.emit_entity_change("module", "update", coupled_module_id)