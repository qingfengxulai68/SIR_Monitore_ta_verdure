# Test 

## 🛠️ Ajouter le support ESP32-C6 à l'Arduino IDE

Pour utiliser l'ESP32-C6 avec l'Arduino IDE, vous devez d'abord ajouter le package du **board manager** d'Espressif.

### 1\. Ajouter l'URL du Board Manager

1.  Ouvrez l'**Arduino IDE**.
2.  Allez dans **Fichier** (File) \> **Préférences** (Preferences).
3.  Dans la case **"Additional Boards Manager URLs"** (URL de gestionnaire de cartes supplémentaires), ajoutez l'URL suivante :
    > `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
4.  Cliquez sur **OK** pour enregistrer les préférences.

### 2\. Installer le Package ESP32

1.  Allez dans **Outils** (Tools) \> **Carte** (Board) \> **Gestionnaire de cartes...** (Boards Manager...).
2.  Dans la barre de recherche du Gestionnaire de cartes, tapez **`esp32`**.
3.  Trouvez le package **`esp32` par Espressif Systems**.
4.  Cliquez sur **Installer**. Cela téléchargera et installera tous les fichiers nécessaires pour supporter l'ESP32, y compris l'**ESP32-C6**.

### 3\. Sélectionner la Carte ESP32-C6

1.  Une fois l'installation terminée, allez dans **Outils** (Tools) \> **Carte** (Board) \> **esp32** (ou *ESP32 Arduino*).
2.  Recherchez et sélectionnez la carte **`ESP32C6 Dev Module`** .
3.  Assurez-vous également de sélectionner le **Port COM** correct sous **Outils** (Tools) \> **Port** après avoir connecté votre ESP32-C6 à votre ordinateur via USB.


## 💻 Code de Test (Blink) avec Serial Monitor

Voici un code de test simple, souvent appelé le programme "Blink" (clignotement), qui utilise également le Moniteur Série.

### 1\. Le Code

Copiez et collez ce code dans une nouvelle fenêtre de l'Arduino IDE :

```cpp
// Le code est exécuté une seule fois au démarrage
void setup() {
  // Initialise la communication série à 115200 bauds.
  // La vitesse (baud rate) doit correspondre au réglage du Moniteur Série.
  Serial.begin(115200);

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
```

### 2\. Téléversement et Moniteur Série

1.  Cliquez sur le bouton **Téléverser** (Upload - la flèche pointant vers la droite).
2.  Une fois le téléversement réussi, ouvrez le **Moniteur Série** (Outils \> Moniteur Série).

**TRÈS IMPORTANT :** Assurez-vous que le taux de bauds (baud rate) dans le coin inférieur droit du Moniteur Série est réglé sur **`115200`** pour correspondre à la ligne `Serial.begin(115200);` dans le code.

**TRÈS IMPORTANT :** Assurez-vous que le câble USB peut transférer des données, pas que de charger.

**TRÈS IMPORTANT :** Si le serial monitor ne fonctionne pas -> activation de l'USB CDC On Boot.


Vous devriez voir :

  * La LED intégrée sur votre ESP32-C6 **clignoter** (s'allumer et s'éteindre) toutes les secondes.
  * Les messages **"LED allumee"** et **"LED eteinte"** s'afficher alternativement dans le Moniteur Série.