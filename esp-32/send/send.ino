#include <esp_now.h>
#include <WiFi.h>
<<<<<<< Updated upstream
#include <esp_wifi.h> // Ajouté pour le contrôle du canal

// 1. MODIFIEZ CET ID POUR CHAQUE CARTE (Plante 1, Plante 2, etc.)
#define SENSOR_ID 2 
=======
#include <BH1750.h>
#include <DHT.h>
// Sensor Activation
bool lightMeterIsActivated = true;
bool soilMoistureIsActivated = true;
bool dhtIsActivated = true;
bool lmt87IsActivated = true;
////soil moisture_sensor
#define SOIL_MOISTURE_PIN 35
// Air temperature
#define LMT87_PIN 34
// Air temperature + humidity
#define DHT_PIN 15
#define DHTTYPE DHT11 
// Variables
int t0 = 0;
float lux; // Luminosity
float rawValue;
int hum; // air temp + humidity
double lmt87_temp; // Air temperature with lmt87
int moisturePercent;
// Sensors
BH1750 lightMeter; // luminosité


DHT dht(DHT_PIN, DHTTYPE); // 
>>>>>>> Stashed changes

uint8_t broadcastAddress[] = {0x80, 0xF3, 0xDA, 0x60, 0x40, 0xB8};

typedef struct struct_message {
<<<<<<< Updated upstream
  int id;          
  float temp;      
  int hum;      
  int moist;
  int light;   
  bool lowBattery; 
=======
  int id;          // ID de la plante
  int temp;      // Température
  int hum;         // Humidité
  int moisturePercent;//Pourcentage d'humidité
  int lux;        // Luminosité
  bool lowBattery; // Alerte batterie
>>>>>>> Stashed changes
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

<<<<<<< Updated upstream
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nStatut envoi : ");
=======
// Fonction de rappel (callback) appelée lors de l'envoi
void OnDataSent(const wifi_tx_info_t *info, esp_now_send_status_t status) {
  Serial.print("\r\nStatut du dernier paquet : ");
>>>>>>> Stashed changes
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Succès (ACK reçu)" : "Échec");
}

void setup() {
  Serial.begin(115200);
<<<<<<< Updated upstream

=======
  delay(200);
  t0 = millis();
  // Mettre le Wi-Fi en mode Station
>>>>>>> Stashed changes
  WiFi.mode(WIFI_STA);
  // Soil moisture sensor
  // Soil moisture sensor
  if (soilMoistureIsActivated) {
    pinMode(SOIL_MOISTURE_PIN, INPUT);
  }
  // Luminosity
  if (lightMeterIsActivated) {
    Wire.begin(21, 22);   // SDA=21, SCL=22

<<<<<<< Updated upstream
  // 2. FORCE LE CANAL WI-FI (doit être le même que le récepteur, souvent canal 1)
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);
  esp_wifi_set_promiscuous(false);

=======
    if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
      Serial.println("BH1750 init OK");
    } else {
      Serial.println("BH1750 init FAILED");
      lightMeterIsActivated = false;
    }
  }

  // Temperature + Humidity
  if (dhtIsActivated) {
    dht.begin();
  }
  // Initialiser ESP-NOW
>>>>>>> Stashed changes
  if (esp_now_init() != ESP_OK) {
    Serial.println("Erreur d'initialisation ESP-NOW");
    return;
  }

  esp_now_register_send_cb(OnDataSent);
  
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Échec de l'ajout du pair");
    return;
  }
}

void loop() {
<<<<<<< Updated upstream
  // 3. UTILISE L'ID UNIQUE DÉFINI EN HAUT
  myData.id = SENSOR_ID; 
  myData.temp = 24.5;
  myData.hum = analogRead(34);
  myData.moist = 24.5;
  myData.light = 24.5;
=======
  if (millis() - t0 >= 5000) {
    // Code inside is executed every period
    t0 = millis();
    // Light meter measurement
    if (lightMeterIsActivated) {
      lux = lightMeter.readLightLevel();
    }
    // Soil moisture sensor
    if (soilMoistureIsActivated) {
      rawValue = analogRead(SOIL_MOISTURE_PIN);
      moisturePercent = map(rawValue, 4095, 1950, 0, 100);
      moisturePercent = constrain(moisturePercent, 0, 100);
    }

    // DHT 
    if (dhtIsActivated) {
      hum = dht.readHumidity();
    }

    // LMT87 
    if (lmt87IsActivated) {
      int voltage_mV=analogReadMilliVolts(LMT87_PIN);
      lmt87_temp = (voltage_mV-2637)/(-13.6);
    }
  // Lecture de capteurs
  myData.id = 1;
  myData.temp = (int)lmt87_temp;
  myData.hum = hum;
  myData.moisturePercent=moisturePercent;
  myData.lux= (int)lux;
>>>>>>> Stashed changes
  myData.lowBattery = false;

  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
  if (result == ESP_OK) {
<<<<<<< Updated upstream
    Serial.print("Trame de la plante ");
    Serial.print(SENSOR_ID);
    Serial.println(" envoyée.");
=======
    Serial.println("Trame envoyée avec succès");
    Serial.print("ID: "); 
    Serial.println(myData.id);
    Serial.print("Temp: "); 
    Serial.println(myData.temp);
    Serial.print("Hum: "); 
    Serial.println(myData.hum);
    Serial.print("Soil: "); 
    Serial.println(myData.moisturePercent);
    Serial.print("Lux: "); 
    Serial.println(myData.lux);
  } else {
    Serial.println("Erreur d'envoi");
>>>>>>> Stashed changes
  }
  }

  // 4. DÉLAI ALÉATOIRE (Anti-collision)
  // On attend 5 secondes + un petit temps aléatoire (0 à 500ms)
  // pour éviter que deux plantes n'émettent au même millième de seconde.
  delay(5000 + random(0, 500)); 
}