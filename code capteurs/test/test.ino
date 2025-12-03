// Le code est exécuté une seule fois au démarrage
void setup() {
  // Initialise la communication série à 9600 bauds.
  // La vitesse (baud rate) doit correspondre au réglage du Moniteur Série.
  Serial.begin(9600);

  // Définit la broche (pin) de la LED intégrée comme une SORTIE.
  // Utilisez la broche appropriée pour votre carte ESP32-C6.
  // Souvent, la LED intégrée est sur la Broche 8 ou 13 pour l'ESP32-C6.
  // Vous pouvez aussi utiliser l'alias 'LED_BUILTIN' si défini.
  pinMode(LED_BUILTIN, OUTPUT);
}

// La fonction loop() est exécutée en continu après setup()
void loop() {
  // 1. Allume la LED et affiche un message
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED allumee");
  delay(1000); // Attend 1000 millisecondes (1 seconde)

  // 2. Éteint la LED et affiche un message
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED eteinte");
  delay(1000); // Attend 1000 millisecondes (1 seconde)
}