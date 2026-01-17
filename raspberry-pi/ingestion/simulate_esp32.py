import json
import random
import time
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from concurrent.futures import ThreadPoolExecutor

# --- Configuration ---
API_URL = "http://localhost:8000/ingestion/"
API_KEY = "H8XIds5mGjfMaLYA-BWmKV9r5DX2aCdyu2nBVPElEkM"
MODULES = ["ESP32-001", "ESP32-003"]
INTERVAL = 5

def send_data(module_id):
    """Generates and sends data for a specific module."""
    payload = {
        "moduleId": module_id,
        "soilMoist": round(random.uniform(15, 70), 2),
        "humidity": round(random.uniform(35, 85), 2),
        "light": round(random.uniform(5000, 40000), 2),
        "temp": round(random.uniform(12, 30), 2),
    }
    
    data_bytes = json.dumps(payload).encode("utf-8")
    req = Request(API_URL, data=data_bytes, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-API-KEY", API_KEY)

    try:
        # We use a 10s timeout to not block the thread
        with urlopen(req, timeout=10) as response:
            if response.getcode() == 204:
                print(f"✓ {module_id} : Envoyé (204)")
            else:
                print(f"ok {module_id} : Code {response.getcode()}")
    except (HTTPError, URLError) as e:
        print(f"✗ {module_id} : Erreur ({e})")
    except Exception as e:
        print(f"✗ {module_id} : Erreur inattendue : {e}")

def main():
    print(f"--- ESP32 Simulator (Urllib + Threads) ---")
    print(f"Modules : {', '.join(MODULES)} | Interval : {INTERVAL}s\n")

    # We prepare the thread pool
    with ThreadPoolExecutor(max_workers=len(MODULES)) as executor:
        while True:
            start_time = time.time()
            
            # Launches sending for all modules simultaneously
            # executor.submit allows launching the function in the background
            for mod_id in MODULES:
                executor.submit(send_data, mod_id)

            # Calculation of sleep time to stay aligned on 30s
            elapsed = time.time() - start_time
            sleep_time = max(0, INTERVAL - elapsed)
            
            time.sleep(sleep_time)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopping the simulator.")