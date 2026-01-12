"""Application constants."""

# Module heartbeat configuration
MODULE_HB_INTERVAL = 30
MODULE_HB_TIMEOUT = 3 * MODULE_HB_INTERVAL
MODULE_HB_CHECK_INTERVAL = MODULE_HB_INTERVAL

# Sensor ranges
SENSOR_THRESHOLDS = {
    "SOIL_MOIST": {"MIN": 0.0, "MAX": 100.0},
    "HUMIDITY": {"MIN": 0.0, "MAX": 100.0},
    "LIGHT": {"MIN": 0.0, "MAX": 65000.0},
    "TEMP": {"MIN": -20.0, "MAX": 50.0},
}

