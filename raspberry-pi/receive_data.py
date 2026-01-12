import serial
import time
import sys
import csv
import os

# Configuration
SERIAL_PORT = "/dev/ttyS0"
BAUD_RATE = 115200
CSV_FILE = "historique_plantes.csv"

# Création du fichier CSV avec en-tête s'il n'existe pas
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Horodatage", "Plante_ID", "Temperature", "Humidite", "Batterie"])

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    ser.flush()
    print(f"--- Enregistrement lancé dans {CSV_FILE} ---")
except Exception as e:
    print(f"Erreur : {e}")
    sys.exit()

while True:
    try:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            
            if line.startswith("DATA|"):
                parts = line.split("|")
                if len(parts) >= 5:
                    # Extraction
                    p_id = parts[1]
                    temp = parts[2]
                    hum = parts[3]
                    batt = "Faible" if parts[4] == "1" else "OK"
                    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

                    # Affichage console
                    print(f"Reçu : Plante {p_id} ({temp}°C)")

                    # Sauvegarde dans le CSV
                    with open(CSV_FILE, mode='a', newline='') as f:
                        writer = csv.writer(f)
                        writer.writerow([timestamp, p_id, temp, hum, batt])

    except KeyboardInterrupt:
        print("\nArrêt et fermeture du fichier.")
        ser.close()
        break
    except Exception as e:
        print(f"Erreur : {e}")
        time.sleep(1)