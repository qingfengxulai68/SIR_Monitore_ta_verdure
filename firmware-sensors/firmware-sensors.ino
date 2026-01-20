#include <esp_now.h>
#include <WiFi.h>
#include <BH1750.h>
#include <DHT.h>
#include <esp_wifi.h>

// Configuration
#define SENSOR_ID 1
#define SLEEP_TIME_SEC 30 

// Pins
#define SOIL_MOISTURE_PIN 35
#define LMT87_PIN 34
#define DHT_PIN 15
#define DHTTYPE DHT11

// Capteurs et variables
BH1750 lightMeter;
DHT dht(DHT_PIN, DHTTYPE);
uint8_t broadcastAddress[] = {0x80, 0xF3, 0xDA, 0x60, 0x40, 0xB8};

typedef struct struct_message {
  int id;
  int temp;
  int hum;
  int moisturePercent;
  int lux;
  bool lowBattery;
} struct_message;

struct_message myData;

// Callback envoi
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nStatut envoi : ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Succès" : "Échec");
}

void setup() {
  Serial.begin(115200);
  
  // 1. Initialisation des composants
  WiFi.mode(WIFI_STA);
  
  // Forcer le canal WiFi (doit être le même que le récepteur, ex: Canal 1)
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);
  esp_wifi_set_promiscuous(false);

  dht.begin();
  Wire.begin(21, 22);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);
  
  // Petit délai pour laisser les capteurs se stabiliser après réveil
  delay(1000); 

  // 2. Lecture des capteurs
  float lux = lightMeter.readLightLevel();
  
  int rawMoisture = analogRead(SOIL_MOISTURE_PIN);
  int moisturePercent = map(rawMoisture, 4095, 1950, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  int hum = dht.readHumidity();
  
  int voltage_mV = analogReadMilliVolts(LMT87_PIN);
  float lmt87_temp = (voltage_mV - 2637) / (-13.6);

  // 3. Préparation des données
  // a. Valeurs capteurs
  // myData.id = SENSOR_ID;
  // myData.temp = (int)lmt87_temp;
  // myData.hum = hum;
  // myData.moisturePercent = moisturePercent;
  // myData.lux = (int)lux;
  // myData.lowBattery = false;

  // b. Valeurs random pour tests sans capteurs
  myData.id = SENSOR_ID;
  myData.temp = random(15, 30);
  myData.hum = random(30, 90);
  myData.moisturePercent = random(20, 80);
  myData.lux = random(100, 1000);
  myData.lowBattery = random(0, 2) == 1;
  
  Serial.println("Données lues :");
  Serial.printf("Température: %d °C\n", myData.temp);
  Serial.printf("Humidité: %d %%\n", myData.hum);
  Serial.printf("Humidité du sol: %d %%\n", myData.moisturePercent);
  Serial.printf("Luminosité: %d lux\n", myData.lux);
  Serial.printf("Batterie faible: %s\n", myData.lowBattery ? "Oui" : "Non");

  // 4. Initialisation ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Erreur ESP-NOW");
    esp_deep_sleep_start();
  }

  esp_now_register_send_cb(OnDataSent);
  
  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 1; // Canal forcé
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) == ESP_OK) {
    esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
  }

  //Laisser un peu de temps pour que le callback d'envoi s'affiche
  delay(200);

  // 5. Mise en sommeil profond
  Serial.println("Entrée en Deep Sleep 30 sec...");
  esp_sleep_enable_timer_wakeup(SLEEP_TIME_SEC * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {
}