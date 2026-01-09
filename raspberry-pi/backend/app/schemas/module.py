"""Module schemas."""

from pydantic import BaseModel


# Module Responses
class ModuleResponse(BaseModel):
    """Module response schema."""

    id: str
    coupled: bool
    coupledPlantId: int | None = None
    isOnline: bool