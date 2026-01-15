"""Modules router."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.common.utils import is_module_online
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.user import User
from app.models.metrics import Metrics
from app.schemas.module import ModuleConnectivityResponse, ModuleResponse
from app.websocket import ws_manager

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.get("", response_model=list[ModuleResponse])
async def get_modules(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> list[ModuleResponse]:
    """Get all modules with their connectivity status."""
    # Use LEFT JOIN to fetch modules and their coupled plants in a single query
    query = (
        select(Module, Plant)
        .outerjoin(Plant, Module.id == Plant.module_id)
    )
    results = session.execute(query).all()

    # Build response from joined results
    return [
        ModuleResponse(
            id=module.id,
            coupled=module.coupled,
            coupledPlantId=plant.id if plant else None,
            connectivity=ModuleConnectivityResponse(
                isOnline=is_module_online(module),
                lastSeen=module.last_seen,
            ),
        )
        for module, plant in results
    ]


@router.delete("/{module_id}/coupling", status_code=204)
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
    plant: Plant = session.execute(select(Plant).where(Plant.module_id == module_id)).scalars().first()

    # Delete plant and its metrics if exists
    session.execute(delete(Metrics).where(Metrics.plant_id == plant.id))
    session.delete(plant)

    # Uncouple module
    module.coupled = False
    session.add(module)
    session.commit()

    # Broadcast ENTITY_CHANGE for module update (now available)
    await ws_manager.emit_entity_change("module", "update", module_id)

    # Broadcast ENTITY_CHANGE for plant deletion if existed
    await ws_manager.emit_entity_change("plant", "delete", plant.id)

    