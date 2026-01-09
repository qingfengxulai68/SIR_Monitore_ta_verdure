#include <esp_now.h>
#include <WiFi.h>

// ADRESSE MAC DU RÉCEPTEUR (À remplacer par l'adresse de votre Pi ou 2ème ESP32)
uint8_t broadcastAddress[] = {0x80, 0xF3, 0xDA, 0x60, 0x40, 0xB8};

// Structure des données à envoyer (doit être identique côté récepteur)
typedef struct struct_message {
  int id;          // ID de la plante
  float temp;      // Température
  int hum;         // Humidité
  bool lowBattery; // Alerte batterie
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

// Fonction de rappel (callback) appelée lors de l'envoi
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nStatut du dernier paquet : ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Succès (ACK reçu)" : "Échec");
}

void setup() {
  Serial.begin(115200);

  // Mettre le Wi-Fi en mode Station
  WiFi.mode(WIFI_STA);

  // Initialiser ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Erreur d'initialisation ESP-NOW");
    return;
  }

  // Enregistrer le callback d'envoi
  esp_now_register_send_cb(OnDataSent);
  
  // Enregistrer le pair (peer)
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Échec de l'ajout du pair");
    return;
  }
}

void loop() {
  // Simulation de lecture de capteurs
  myData.id = 1;
  myData.temp = 24.5;
  myData.hum = analogRead(34); // Exemple sur GPIO 34
  myData.lowBattery = false;

  // Envoi du message
  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
  if (result == ESP_OK) {
    Serial.println("Trame envoyée avec succès");
  } else {
    Serial.println("Erreur d'envoi");
  }

  delay(5000); // Attendre 5 secondes
}