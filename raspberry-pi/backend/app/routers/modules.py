"""Modules router."""

import os
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import case, delete, func, select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.user import User
from app.models.values import Values
from app.schemas.module import CoupledPlantResponse, ModuleResponse
from app.schemas.websocket import EntityChangeMessage, EntityChangePayload
from app.websocket import ws_manager

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.get("", response_model=list[ModuleResponse])
async def get_modules(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
    coupled: Annotated[bool | None, Query()] = None,
) -> list[ModuleResponse]:
    """Get all modules with their connectivity status."""
    # Calculate isOnline in SQL using CASE and datetime functions
    now = datetime.now(UTC)
    is_online = case(
        (Module.last_seen.is_(None), False),
        (func.julianday(now) - func.julianday(Module.last_seen) <= int(os.environ.get('HEARTBEAT_TIMEOUT_SECONDS', '120')) / 86400.0, True),
        else_=False
    ).label("is_online")
    
    # Use LEFT JOIN to fetch modules and their coupled plants in a single query
    query = (
        select(Module, Plant, is_online)
        .outerjoin(Plant, Module.id == Plant.module_id)
    )
    if coupled is not None:
        query = query.where(Module.coupled == coupled)
    results = session.execute(query).all()

    # Build response from joined results
    return [
        ModuleResponse(
            id=module.id,
            coupled=module.coupled,
            coupledPlant=CoupledPlantResponse(id=plant.id, name=plant.name) if plant else None,
            isOnline=is_online_value,
        )
        for module, plant, is_online_value in results
    ]


@router.delete("/{module_id}/coupling", status_code=status.HTTP_204_NO_CONTENT)
async def uncouple_module(
    module_id: str,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Uncouple a module by removing its associated plant."""
    # Get module
    module = session.execute(select(Module).where(Module.id == module_id)).scalars().first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    # Check if module is coupled
    if not module.coupled:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Module is not coupled to any plant")

    # Get associated plant
    plant = session.execute(select(Plant).where(Plant.module_id == module_id)).scalars().first()
    plant_id = plant.id if plant else None

    # Delete plant and its values if exists
    if plant:
        session.execute(delete(Values).where(Values.plant_id == plant.id))
        session.delete(plant)

    # Uncouple module
    module.coupled = False
    session.add(module)
    session.commit()

    # Broadcast ENTITY_CHANGE for module update (now available)
    await ws_manager.emit_entity_change(
        EntityChangeMessage(
            payload=EntityChangePayload(
                entity="module",
                action="update",
                id=module_id,
            )
        )
    )

    # Broadcast ENTITY_CHANGE for plant deletion if existed
    if plant_id:
        await ws_manager.emit_entity_change(
            EntityChangeMessage(
                payload=EntityChangePayload(
                    entity="plant",
                    action="delete",
                    id=plant_id,
                )
            )
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


