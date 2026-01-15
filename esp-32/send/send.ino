#include <esp_now.h>
#include <WiFi.h>
#include <esp_wifi.h> // Ajouté pour le contrôle du canal

// 1. MODIFIEZ CET ID POUR CHAQUE CARTE (Plante 1, Plante 2, etc.)
#define SENSOR_ID 2 

uint8_t broadcastAddress[] = {0x80, 0xF3, 0xDA, 0x60, 0x40, 0xB8};

typedef struct struct_message {
  int id;          
  float temp;      
  int hum;      
  int moist;
  int light;   
  bool lowBattery; 
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nStatut envoi : ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Succès (ACK reçu)" : "Échec");
}

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);

  // 2. FORCE LE CANAL WI-FI (doit être le même que le récepteur, souvent canal 1)
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);
  esp_wifi_set_promiscuous(false);

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
  // 3. UTILISE L'ID UNIQUE DÉFINI EN HAUT
  myData.id = SENSOR_ID; 
  myData.temp = 24.5;
  myData.hum = analogRead(34);
  myData.moist = 24.5;
  myData.light = 24.5;
  myData.lowBattery = false;

  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
  if (result == ESP_OK) {
    Serial.print("Trame de la plante ");
    Serial.print(SENSOR_ID);
    Serial.println(" envoyée.");
  }

  // 4. DÉLAI ALÉATOIRE (Anti-collision)
  // On attend 5 secondes + un petit temps aléatoire (0 à 500ms)
  // pour éviter que deux plantes n'émettent au même millième de seconde.
  delay(5000 + random(0, 500)); 
}