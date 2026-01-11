import serial
import time
import sys

try:
    port = serial.Serial("/dev/ttyACM0", baudrate=115200, timeout=1)
except:
    print("Erreur: Impossible d'ouvrir /dev/ttyACM0 Essaie /dev/ttyUSB0")
    sys.exit()

print("Appuyez sur Ctrl+C pour arrêter")
print("*"*40)
print("")

while True:
    try:
        if port.in_waiting > 0:
            # Lire une ligne complète venant de l'ESP32
            line = port.readline().decode('utf-8', errors='ignore').strip()
            
            # On ne traite que les lignes qui commencent par RAW_DATA
            if line.startswith("RAW_DATA:"):
                # On enlève le préfixe et on sépare par les virgules
                data_string = line.replace("RAW_DATA:", "")
                values = data_string.split(",")
                
                if len(values) == 3:
                    plante_id = values[0]
                    temp = values[1]
                    hum = values[2]
                    
                    # Horodatage réel du Raspberry Pi
                    timestamp = time.strftime("%H:%M:%S")
                    
                    print(f"[{timestamp}] PLANTE {plante_id} -> Temp: {temp}°C | Hum: {hum}")
        
        time.sleep(0.01) # Petite pause pour laisser respirer le processeur
        
    except KeyboardInterrupt:
        print("\nArrêt par l'utilisateur")
        port.close()
        sys.exit()
    except Exception as e:
        print(f"Erreur de lecture: {e}")