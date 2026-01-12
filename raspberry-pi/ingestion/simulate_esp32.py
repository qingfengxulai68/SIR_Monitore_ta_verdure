"""Simulate ESP32 sensor data for testing."""

import json
import os
import random
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Configuration
API_URL = "http://localhost:8000/ingestion/"
API_KEY = "H8XIds5mGjfMaLYA-BWmKV9r5DX2aCdyu2nBVPElEkM"
MODULE_IDS = ["ESP32-001", "ESP32-002"]  # List of modules to simulate
INTERVAL_SECONDS = 30  # Send data every 30 seconds


def generate_sensor_data(module_id: str) -> dict:
    """Generate realistic sensor data."""
    return {
        "moduleId": module_id,
        "soilMoist": round(random.uniform(15.0, 70.0), 2),  # 15-70%
        "humidity": round(random.uniform(35.0, 85.0), 2),   # 35-85%
        "light": round(random.uniform(5000.0, 40000.0), 2), # 5000-40000 lux
        "temp": round(random.uniform(12.0, 30.0), 2),       # 12-30°C
    }


def send_data(data: dict) -> bool:
    """Send sensor data to the server."""
    try:
        req = Request(
            API_URL,
            data=json.dumps(data).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "X-API-KEY": API_KEY,
            },
            method="POST",
        )

        with urlopen(req, timeout=10) as response:
            if response.getcode() == 204:
                print(f"✓ Data sent successfully for {data['moduleId']}")
                print(f"  Soil: {data['soilMoist']}%, Humidity: {data['humidity']}%, "
                      f"Light: {data['light']} lux, Temp: {data['temp']}°C")
                return True
            else:
                print(f"✗ Unexpected status code: {response.getcode()}")
                return False

    except HTTPError as e:
        print(f"✗ HTTP Error: {e.code} - {e.reason}")
        return False
    except URLError as e:
        print(f"✗ Connection Error: {e.reason}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    """Main simulation loop."""
    print(f"ESP32 Simulator Started")
    print(f"Modules: {', '.join(MODULE_IDS)}")
    print(f"API URL: {API_URL}")
    print(f"Sending data every {INTERVAL_SECONDS} seconds")
    print("-" * 60)

    try:
        while True:
            for module_id in MODULE_IDS:
                data = generate_sensor_data(module_id)
                send_data(data)
            time.sleep(INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n\nSimulation stopped by user")


if __name__ == "__main__":
    main()
