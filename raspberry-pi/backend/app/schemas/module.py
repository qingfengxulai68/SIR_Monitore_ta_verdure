"""Module schemas."""

from datetime import datetime
from pydantic import BaseModel


# Module Info
class CoupledPlantResponse(BaseModel):
    """Coupled plant info for module response."""

    id: int
    name: str


# Module Responses
class ModuleResponse(BaseModel):
    """Module response schema."""

    id: str
    coupled: bool
    coupledPlant: CoupledPlantResponse | None = None
    isOnline: bool