"""Plant model with inline thresholds."""

import os

from sqlalchemy import CheckConstraint, Column, Float, ForeignKey, Integer, String

from app.models.user import Base


class Plant(Base):
    """Plant database model with inline thresholds."""

    __tablename__ = "plants"

    __table_args__ = (
        CheckConstraint('min_soil_moist < max_soil_moist', name='check_soil_moist_range'),
        CheckConstraint('min_humidity < max_humidity', name='check_humidity_range'),
        CheckConstraint('min_light < max_light', name='check_light_range'),
        CheckConstraint('min_temp < max_temp', name='check_temp_range'),
        CheckConstraint(f'min_soil_moist >= {float(os.environ.get("SOIL_MOIST_MIN", "0"))} AND max_soil_moist <= {float(os.environ.get("SOIL_MOIST_MAX", "100"))}', name='check_soil_moist_bounds'),
        CheckConstraint(f'min_humidity >= {float(os.environ.get("HUMIDITY_MIN", "0"))} AND max_humidity <= {float(os.environ.get("HUMIDITY_MAX", "100"))}', name='check_humidity_bounds'),
        CheckConstraint(f'min_light >= {float(os.environ.get("LIGHT_MIN", "0"))} AND max_light <= {float(os.environ.get("LIGHT_MAX", "50000"))}', name='check_light_bounds'),
        CheckConstraint(f'min_temp >= {float(os.environ.get("TEMP_MIN", "0"))} AND max_temp <= {float(os.environ.get("TEMP_MAX", "50"))}', name='check_temp_bounds'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    module_id = Column(String(50), ForeignKey("modules.id"), unique=True, index=True, nullable=False)

    # Soil moisture thresholds (percentage)
    min_soil_moist = Column(Float, nullable=False)
    max_soil_moist = Column(Float, nullable=False)

    # Humidity thresholds (percentage)
    min_humidity = Column(Float, nullable=False)
    max_humidity = Column(Float, nullable=False)

    # Light thresholds (lux)
    min_light = Column(Float, nullable=False)
    max_light = Column(Float, nullable=False)

    # Temperature thresholds (Celsius)
    min_temp = Column(Float, nullable=False)
    max_temp = Column(Float, nullable=False)
