"""Plant model with inline thresholds."""

from sqlalchemy import CheckConstraint, Column, Float, ForeignKey, Integer, String

from backend.app.common.constants import SENSOR_THRESHOLDS
from app.models.user import Base


class Plant(Base):
    """Plant database model with inline thresholds."""

    __tablename__ = "plants"

    __table_args__ = (
        CheckConstraint('min_soil_moist < max_soil_moist', name='check_soil_moist_range'),
        CheckConstraint('min_humidity < max_humidity', name='check_humidity_range'),
        CheckConstraint('min_light < max_light', name='check_light_range'),
        CheckConstraint('min_temp < max_temp', name='check_temp_range'),
        CheckConstraint(f'min_soil_moist >= {SENSOR_THRESHOLDS["SOIL_MOIST"]["MIN"]} AND max_soil_moist <= {SENSOR_THRESHOLDS["SOIL_MOIST"]["MAX"]}', name='check_soil_moist_bounds'),
        CheckConstraint(f'min_humidity >= {SENSOR_THRESHOLDS["HUMIDITY"]["MIN"]} AND max_humidity <= {SENSOR_THRESHOLDS["HUMIDITY"]["MAX"]}', name='check_humidity_bounds'),
        CheckConstraint(f'min_light >= {SENSOR_THRESHOLDS["LIGHT"]["MIN"]} AND max_light <= {SENSOR_THRESHOLDS["LIGHT"]["MAX"]}', name='check_light_bounds'),
        CheckConstraint(f'min_temp >= {SENSOR_THRESHOLDS["TEMP"]["MIN"]} AND max_temp <= {SENSOR_THRESHOLDS["TEMP"]["MAX"]}', name='check_temp_bounds'),
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
