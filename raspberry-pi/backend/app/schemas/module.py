"""Module schemas."""

from datetime import datetime
from pydantic import BaseModel, model_validator


class ModuleConnectivityResponse(BaseModel):
    """Module connectivity response schema."""

    isOnline: bool
    lastSeen: datetime | None = None

    @model_validator(mode='after')
    def check_online_requires_last_seen(self):
        if self.isOnline and self.lastSeen is None:
            raise ValueError("If module is online, lastSeen cannot be None")
        return self


# Module Responses
class ModuleResponse(BaseModel):
    """Module response schema."""

    id: str
    coupled: bool
    coupledPlantId: int | None = None
    connectivity: ModuleConnectivityResponse