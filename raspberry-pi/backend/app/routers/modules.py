"""Modules router."""

import os
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.module import Module
from app.models.plant import Plant
from app.models.user import User
from app.schemas.module import CoupledPlantResponse, ModuleResponse

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.get("", response_model=list[ModuleResponse])
async def get_modules(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
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
