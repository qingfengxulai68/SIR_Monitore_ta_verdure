#include <esp_now.h>
#include <WiFi.h>

// La structure doit être EXACTEMENT la même que celle de l'émetteur
typedef struct struct_message {
  int id;          // ID de la plante
  float temp;      // Température
  int hum;         // Humidité
  bool lowBattery; // Alerte batterie
} struct_message;

// Créer une instance de la structure pour stocker les données reçues
struct_message incomingReadings;

// Fonction de rappel (callback) exécutée à chaque réception de données
void OnDataRecv(const esp_now_recv_info *info, const uint8_t *incomingData, int len) {
  // On copie les données dans notre structure
  memcpy(&incomingReadings, incomingData, sizeof(incomingReadings));
  
  // Pour afficher l'adresse MAC de l'émetteur si besoin
  char macStr[18];
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           info->src_addr[0], info->src_addr[1], info->src_addr[2], 
           info->src_addr[3], info->src_addr[4], info->src_addr[5]);

  Serial.println("--- NOUVELLE RECEPTION ---");
  Serial.print("De l'émetteur MAC: "); Serial.println(macStr);
  Serial.print("Plante ID: "); Serial.println(incomingReadings.id);
  Serial.print("Température: "); Serial.print(incomingReadings.temp); Serial.println(" °C");
  Serial.print("Humidité: "); Serial.println(incomingReadings.hum);
  Serial.println("--------------------------");
}

void setup() {
  // Initialise le moniteur série
  Serial.begin(115200);
  
  // Configure l'ESP32 en mode Station Wi-Fi
  WiFi.mode(WIFI_STA);

  // Initialise le protocole ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Erreur d'initialisation ESP-NOW");
    return;
  }
  
  // Enregistre la fonction de rappel pour la réception
  esp_now_register_recv_cb(OnDataRecv);
  
  Serial.println("Récepteur prêt. En attente de données...");
  Serial.print("Mon adresse MAC est : ");
  Serial.println(WiFi.macAddress());
}

void loop() {
  // Rien à faire ici, tout se passe dans la fonction OnDataRecv
}