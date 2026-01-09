"""Application constants."""

# Module heartbeat configuration
MODULE_HEARTBEAT_TIMEOUT_SECONDS = 120
MODULE_HEARTBEAT_CHECK_INTERVAL_SECONDS = 60

# Sensor ranges
SENSOR_THRESHOLDS = {
    "SOIL_MOIST": {"MIN": 0.0, "MAX": 100.0},
    "HUMIDITY": {"MIN": 0.0, "MAX": 100.0},
    "LIGHT": {"MIN": 0.0, "MAX": 65000.0},
    "TEMP": {"MIN": -20.0, "MAX": 50.0},
}

