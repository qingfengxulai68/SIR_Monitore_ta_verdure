#include <esp_now.h>
#include <WiFi.h>
#include <esp_wifi.h>

// Configuration
#define SENSOR_ID 2
#define SLEEP_TIME_SEC 30 

// Capteurs et variables
uint8_t broadcastAddress[] = {0x80, 0xF3, 0xDA, 0x60, 0x40, 0xB8};

typedef struct struct_message {
  uint8_t id;
  int8_t temp;
  uint8_t hum; 
  uint8_t moisturePercent;
  uint lux;
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

  // 2. Lecture des capteurs
  // &
  // 3. Préparation des données
  // Valeurs random pour tests sans capteurs
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