import serial
import time
import sys

try:
    port = serial.Serial("/dev/ttyACM0", baudrate=115200, timeout=1)
except:
    print("Erreur : Port introuvable essayer /dev/ttyUSB0")
    sys.exit()

while True:
    try:
        if port.in_waiting > 0:
            # Lire une ligne et la décoder
            line = port.readline().decode('utf-8').strip()
            
            # Si la ligne contient nos données
            if line.startswith("DATA|"):
                # Découper la ligne
                elements = line.split("|")
                # elements[0] est "DATA", on prend la suite :
                p_id = elements[1]
                temp = elements[2]
                hum  = elements[3]
                
                print(f"Plante {p_id} : {temp}°C, Humidité {hum}%")   

        time.sleep(0.1)

    except KeyboardInterrupt:
        print("\nArrêt par l'utilisateur")
        port.close()
        sys.exit()
        
    except Exception as e:
        print(f"Erreur de lecture: {e}")

    port.close()