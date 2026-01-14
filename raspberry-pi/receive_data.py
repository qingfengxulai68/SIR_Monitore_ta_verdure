import serial
import time
import sys
import csv
import os
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Configuration Matérielle
SERIAL_PORT = "/dev/ttyS0"
BAUD_RATE = 115200
CSV_FILE = "historique_plantes.csv"

# Configuration API (Utilisez l'IP)
API_URL = "http://localhost:8000/ingestion/"
API_KEY = "H8XIds5mGjfMaLYA-BWmKV9r5DX2aCdyu2nBVPElEkM"

def send_data(data: dict) -> bool:
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
                print(f" ✓ API OK pour {data['moduleId']}")
                return True
            return False
    except Exception as e:
        print(f" ✗ API Erreur: {e}")
        return False

def main():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        ser.flush()
        print(f"--- Gateway Connectée à {API_URL} ---")
    except Exception as e:
        print(f"Erreur Port Série : {e}")
        sys.exit()

    while True:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                
                if line.startswith("DATA|"):
                    parts = line.split("|")
                    # On s'assure d'avoir assez de données dans la ligne série
                    if len(parts) >= 6:
                        # 1. Extraction (Attention : l'API veut moduleId en String)
                        p_id = f"ESP32-00{parts[1]}" 
                        val_temp = float(parts[2])
                        val_hum  = float(parts[3])
                        val_soil = float(parts[4])
                        val_light = float(parts[5])
                        
                        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

                        # # 2. Sauvegarde CSV
                        # file_exists = os.path.isfile(CSV_FILE)
                        # with open(CSV_FILE, mode='a', newline='') as f:
                        #     writer = csv.writer(f)
                        #     if not file_exists:
                        #         writer.writerow(["Horodatage", "ID", "Temp", "Hum", "Sol", "Lux"])
                        #     writer.writerow([timestamp, p_id, val_temp, val_hum, val_soil, val_light])

                        # 3. Préparation JSON (Strictement identique au simulateur)
                        data_payload = {
                            "moduleId": p_id,
                            "soilMoist": val_soil,
                            "humidity": val_hum,
                            "light": val_light,
                            "temp": val_temp
                        }
                        
                        print(f"[{timestamp}] ID: {p_id} | T: {val_temp}°C", end="")
                        send_data(data_payload)

        except KeyboardInterrupt:
            ser.close()
            break
        except Exception as e:
            print(f"Erreur boucle: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()