"""Metrics model for storing plant measurements (time series)."""

from sqlalchemy import CheckConstraint, Column, DateTime, Float, ForeignKey, Index, Integer

from app.common.constants import SENSOR_THRESHOLDS
from app.models.user import Base


class Metrics(Base):
    """Metrics database model (time series data)."""

    __tablename__ = "metrics"

    __table_args__ = (
        CheckConstraint(f'soil_moist >= {SENSOR_THRESHOLDS["SOIL_MOIST"]["MIN"]} AND soil_moist <= {SENSOR_THRESHOLDS["SOIL_MOIST"]["MAX"]}', name='check_soil_moist_bounds'),
        CheckConstraint(f'humidity >= {SENSOR_THRESHOLDS["HUMIDITY"]["MIN"]} AND humidity <= {SENSOR_THRESHOLDS["HUMIDITY"]["MAX"]}', name='check_humidity_bounds'),
        CheckConstraint(f'light >= {SENSOR_THRESHOLDS["LIGHT"]["MIN"]} AND light <= {SENSOR_THRESHOLDS["LIGHT"]["MAX"]}', name='check_light_bounds'),
        CheckConstraint(f'temp >= {SENSOR_THRESHOLDS["TEMP"]["MIN"]} AND temp <= {SENSOR_THRESHOLDS["TEMP"]["MAX"]}', name='check_temp_bounds'),
        Index('ix_metrics_plant_timestamp', 'plant_id', 'timestamp')
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), index=True, nullable=False)

    soil_moist = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    light = Column(Float, nullable=False)
    temp = Column(Float, nullable=False)

    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
    )