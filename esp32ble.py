import asyncio
import csv
from datetime import datetime
from bleak import BleakClient
from gpiozero import LED
import os



SERVICE_UUID = "5660ca43-afa9-415b-a5c6-94aef5ef0a91"
CSV_FILE = "sensor_data.csv" 
esp_32 = "80:F3:DA:60:67:AE"

# SERVICE_UUID = "5660ca43-afa9-415b-a5c6-94aef5ef0a91"
CHARACTERISTIC_UUID = "1a310a1f-0b30-485a-8a13-a011fab15f36"

connected = False
# led = LED(17)


if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'Message']) 


# async def blink_task():
    # global connected
    # print("blink task started")
    # toggle = True
    # while True:
        # if toggle:
            # led.on()
        # else:
            # led.off()
        # toggle = not toggle
        # blink = 1000 if connected else 250
        # await asyncio.sleep(blink / 1000)


async def receive_task(client):
    while True:
        try:
            response = await client.read_gatt_char(CHARACTERISTIC_UUID)
            message = response.decode('utf-8')

           
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            print(f"[{current_time}] ESP32 message received: {message}")

            
            
            with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([current_time, message])

            await asyncio.sleep(1)
        except Exception as ex:
            print(f"Error: {ex}")
            break

async def connect_to_esp32(address):
    global connected
    print(f"Connecting to {address}")
    try:
        async with BleakClient(address) as client:
            connected = client.is_connected
            print(f"Connected: {connected}")
            tasks = [
                asyncio.create_task(receive_task(client)),
                # asyncio.create_task(blink_task())
            ]
            # await asyncio.gather(*tasks)
            await receive_task(client)
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        connected = False

if __name__ == "__main__":
    try:
        asyncio.run(connect_to_esp32(esp_32))
    except KeyboardInterrupt:
        print("Program stopped by user")

# # import libraries
# import asyncio
# from bleak import BleakClient
# from gpiozero import LED

# # Define variables
# connected = False  

# led = LED(17)

# # Change this to your MAC Address
# esp_32 = "80:F3:DA:60:67:AE"

# SERVICE_UUID = "5660ca43-afa9-415b-a5c6-94aef5ef0a91"
# TEMP_UUID = "1a310a1f-0b30-485a-8a13-a011fab15f36"

# # Blink LED when Pi is connected
# async def blink_task():
    # global connected
    # print("blink task started")
    # toggle = True
    # while True:
        # if toggle:
            # led.on()
        # else:
            # led.off()
        # toggle = not toggle
        # blink = 1000  if connected else 250
        # await asyncio.sleep(blink / 1000)

# # Pi receives data
# async def receive_task(client):
    # while True:
        # try:
            # response = await client.read_gatt_char(TEMP_UUID)
            # print(f"ESP 32 message received: {response.decode('utf-8')}")
            # await asyncio.sleep(1)
        # except Exception as ex:
            # print(f"Error: {ex}")
            # break
           
# # Connect to ESP32
# async def connect_to_esp32(address):
    # global connected
    # print(f"Connecting to {address}")
    # async with BleakClient(address) as client:
        # connected = client.is_connected
        # print(f"Connected: {connected}")
        # tasks = [
        # asyncio.create_task(receive_task(client)),
        # asyncio.create_task(blink_task())
        # ]
        # await asyncio.gather(*tasks)
    # connected = False

# loop = asyncio.get_event_loop()
# loop.run_until_complete(connect_to_esp32(esp_32))

