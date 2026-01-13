"""Plants router."""

from typing import Annotated, Literal
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy import delete, select, func, Integer
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.common.utils import are_latest_metrics_within_thresholds, is_module_online
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.metrics import Metrics
from app.models.user import User
from app.schemas.plant import (
    LastMetricsUpdateResponse,
    ModuleInfoResponse,
    PlantCreateRequest,
    PlantResponse,
    PlantUpdateRequest,
    ThresholdRangeResponse,
    ThresholdsResponse,
)
from app.schemas.metrics import MetricsResponse, HistoryResponse, HistoryMeta, HistoryDataPoint
from app.schemas.module import ModuleConnectivity
from app.common.utils import are_latest_metrics_within_thresholds
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
        select(Metrics.plant_id, func.max(Metrics.timestamp).label("max_timestamp"))
        .group_by(Metrics.plant_id)
        .subquery()
    )

    # Get all plants with their latest metrics in a single query
    query = (
        select(Plant, Metrics, Module)
        .outerjoin(latest_timestamps_subq, Plant.id == latest_timestamps_subq.c.plant_id)
        .outerjoin(
            Metrics,
            (Metrics.plant_id == latest_timestamps_subq.c.plant_id)
            & (Metrics.timestamp == latest_timestamps_subq.c.max_timestamp),
        )
        .outerjoin(Module, Plant.module_id == Module.id)
    )
    results = session.execute(query).all()

    return [
        PlantResponse(
            id=plant.id,
            name=plant.name,
            module=ModuleInfoResponse(
                id=plant.module_id,
                connectivity=ModuleConnectivity(
                    isOnline=is_module_online(module),
                    lastSeen=module.last_seen,
                ),
            ),
            lastMetricsUpdate=(
                (lv := (
                    MetricsResponse(
                        soilMoist=val.soil_moist,
                        humidity=val.humidity,
                        light=val.light,
                        temp=val.temp,
                    )
                    if val
                    else None
                )) and (health := are_latest_metrics_within_thresholds(session, plant, lv)) is not None and LastMetricsUpdateResponse(
                    timestamp=val.timestamp,
                    metrics=lv,
                    isHealthy=health,
                ) or None
            ),
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
        for plant, val, module in results
    ]

@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> PlantResponse:
    """Get a specific plant by ID."""
    # Get plant and latest metrics
    query = (
        select(Plant, Metrics, Module)
        .outerjoin(Metrics, Metrics.plant_id == Plant.id)
        .outerjoin(Module, Plant.module_id == Module.id)
        .where(Plant.id == plant_id)
        .order_by(Metrics.timestamp.desc())
        .limit(1)
    )
    result = session.execute(query).first()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    plant, latest_val_db, module = result

    # Map to schema
    latest_metrics = None
    latest_timestamp = None
    if latest_val_db:
        latest_metrics = MetricsResponse(
            soilMoist=latest_val_db.soil_moist,
            humidity=latest_val_db.humidity,
            light=latest_val_db.light,
            temp=latest_val_db.temp,
        )
        latest_timestamp = latest_val_db.timestamp

    return PlantResponse(
        id=plant.id,
        name=plant.name,
        module=ModuleInfoResponse(
            id=plant.module_id,
            connectivity=ModuleConnectivity(
                isOnline=is_module_online(module) if module else False,
                lastSeen=module.last_seen if module else None,
            ),
        ),
        lastMetricsUpdate=(
            LastMetricsUpdateResponse(
                timestamp=latest_timestamp,
                metrics=latest_metrics,
                isHealthy=are_latest_metrics_within_thresholds(session, plant, latest_metrics),
            )
            if latest_metrics
            else None
        ),
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

    # Delete metrics
    session.execute(delete(Metrics).where(Metrics.plant_id == plant.id))
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

@router.get("/{plant_id}/history", response_model=HistoryResponse)
async def get_plant_history(
    plant_id: int,
    session: Annotated[Session, Depends(get_session)],
    range: Literal["hour", "day", "week", "month"] = Query(default="hour"),
) -> HistoryResponse:
    
    now = datetime.now(timezone.utc)
    
    config = {
        "hour":  (timedelta(hours=1),  30),      # Slots de 30s, timestamps réels
        "day":   (timedelta(days=1),   600),     # Agrégation 10 min
        "week":  (timedelta(days=7),   3600),    # Agrégation 1 heure
        "month": (timedelta(days=30),  14400),   # Agrégation 4 heures
    }
    
    time_delta, interval_seconds = config[range]
    start_time = now - time_delta

    # ===== CAS 1 : HOUR - Garde les vrais timestamps =====
    if range == "hour":
        # Récupère les données brutes avec leur bucket
        query = (
            select(
                Metrics.timestamp,
                Metrics.soil_moist,
                Metrics.temp,
                Metrics.light,
                Metrics.humidity,
                # Calcul du bucket pour grouper, mais on garde le vrai timestamp
                (
                    (func.unixepoch(Metrics.timestamp) / interval_seconds).cast(Integer) 
                    * interval_seconds
                ).label('ts_bucket'),
            )
            .where(Metrics.plant_id == plant_id)
            .where(Metrics.timestamp >= start_time)
            .order_by(Metrics.timestamp)
        )
        
        db_rows = session.execute(query).all()
        
        # Groupe par bucket mais garde le dernier timestamp réel
        bucket_map = {}
        for row in db_rows:
            bucket_key = int(row.ts_bucket)
            # Garde la mesure la plus récente du bucket (ou tu peux faire une moyenne)
            bucket_map[bucket_key] = row
        
        # Génère la grille complète
        start_ts = int(start_time.timestamp())
        aligned_start_ts = (start_ts // interval_seconds) * interval_seconds
        now_ts = int(now.timestamp())
        
        final_data = []
        current_ts = aligned_start_ts
        
        while current_ts <= now_ts:
            if current_ts in bucket_map:
                row = bucket_map[current_ts]
                # ✅ Utilise le VRAI timestamp de la mesure
                real_timestamp = row.timestamp
                if isinstance(real_timestamp, str):
                    real_timestamp = datetime.fromisoformat(
                        real_timestamp.replace(' ', 'T')
                    ).replace(tzinfo=timezone.utc)
                
                final_data.append(HistoryDataPoint(
                    time=real_timestamp,  # ✅ Timestamp exact !
                    soilMoist=round(row.soil_moist, 2) if row.soil_moist is not None else None,
                    temp=round(row.temp, 2) if row.temp is not None else None,
                    light=round(row.light, 0) if row.light is not None else None,
                    humidity=round(row.humidity, 2) if row.humidity is not None else None
                ))
            else:
                # 🔴 Pas de données dans ce slot de 30s
                slot_dt = datetime.fromtimestamp(current_ts, tz=timezone.utc)
                final_data.append(HistoryDataPoint(
                    time=slot_dt,  # Timestamp du slot attendu
                    soilMoist=None,
                    temp=None,
                    light=None,
                    humidity=None
                ))
            
            current_ts += interval_seconds
        
        return HistoryResponse(
            meta=HistoryMeta(
                range=range,
                aggregation="30s_raw",  # Indique slots de 30s avec vrais timestamps
                from_time=start_time,
                to_time=now
            ),
            data=final_data
        )
    
    # ===== CAS 2 : DAY/WEEK/MONTH - Agrégation classique =====
    query = (
        select(
            (
                (func.unixepoch(Metrics.timestamp) / interval_seconds).cast(Integer) 
                * interval_seconds
            ).label('ts_bucket'),
            func.avg(Metrics.soil_moist).label('avg_soil'),
            func.avg(Metrics.temp).label('avg_temp'),
            func.avg(Metrics.light).label('avg_light'),
            func.avg(Metrics.humidity).label('avg_humidity'),
            func.count().label('count')
        )
        .where(Metrics.plant_id == plant_id)
        .where(Metrics.timestamp >= start_time)
        .group_by('ts_bucket')
        .order_by('ts_bucket')
    )
    
    db_rows = session.execute(query).all()
    
    data_map = {}
    for row in db_rows:
        if row.ts_bucket is not None:
            bucket_key = int(row.ts_bucket)
            data_map[bucket_key] = row

    start_ts = int(start_time.timestamp())
    aligned_start_ts = (start_ts // interval_seconds) * interval_seconds
    now_ts = int(now.timestamp())
    
    final_data = []
    current_ts = aligned_start_ts
    
    while current_ts <= now_ts:
        current_dt = datetime.fromtimestamp(current_ts, tz=timezone.utc)
        
        if current_ts in data_map:
            row = data_map[current_ts]
            final_data.append(HistoryDataPoint(
                time=current_dt,
                soilMoist=round(row.avg_soil, 2) if row.avg_soil is not None else None,
                temp=round(row.avg_temp, 2) if row.avg_temp is not None else None,
                light=round(row.avg_light, 0) if row.avg_light is not None else None,
                humidity=round(row.avg_humidity, 2) if row.avg_humidity is not None else None
            ))
        else:
            final_data.append(HistoryDataPoint(
                time=current_dt,
                soilMoist=None,
                temp=None,
                light=None,
                humidity=None
            ))
        
        current_ts += interval_seconds

    return HistoryResponse(
        meta=HistoryMeta(
            range=range,
            aggregation=f"{interval_seconds}s",
            from_time=start_time,
            to_time=now
        ),
        data=final_data
    )