"""Values model for storing plant measurements (time series)."""

import os
from datetime import datetime, timezone
from sqlalchemy import CheckConstraint, Column, DateTime, Float, ForeignKey, Integer

from app.models.user import Base


class Values(Base):
    """Sensor values database model (time series data)."""

    __tablename__ = "values"

    __table_args__ = (
        CheckConstraint(f'soil_moist >= {float(os.environ.get("SOIL_MOIST_MIN", "0"))} AND soil_moist <= {float(os.environ.get("SOIL_MOIST_MAX", "100"))}', name='check_soil_moist_bounds'),
        CheckConstraint(f'humidity >= {float(os.environ.get("HUMIDITY_MIN", "0"))} AND humidity <= {float(os.environ.get("HUMIDITY_MAX", "100"))}', name='check_humidity_bounds'),
        CheckConstraint(f'light >= {float(os.environ.get("LIGHT_MIN", "0"))} AND light <= {float(os.environ.get("LIGHT_MAX", "50000"))}', name='check_light_bounds'),
        CheckConstraint(f'temp >= {float(os.environ.get("TEMP_MIN", "0"))} AND temp <= {float(os.environ.get("TEMP_MAX", "50"))}', name='check_temp_bounds'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), index=True, nullable=False)

    soil_moist = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    light = Column(Float, nullable=False)
    temp = Column(Float, nullable=False)

    timestamp = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))
