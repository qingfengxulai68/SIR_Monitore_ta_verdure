// Libraries
#include <Wire.h>
#include <BH1750.h>

// Sensors
BH1750 lightMeter; // luminosité

// Sensor Activation
bool lightMeterIsActivated = true;

// Config
int PERIOD = 500; // in miliseconds

// Variables
int t0 = 0;


void setup() {
  Serial.begin(115200);
  delay(200);
  t0 = millis();

  if (lightMeterIsActivated) {
    Wire.begin(21, 22);   // SDA=21, SCL=22

    if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
      Serial.println("BH1750 init OK");
    } else {
      Serial.println("BH1750 init FAILED");
      lightMeterIsActivated = false;
    }
  }

}

void loop() {
  if (millis() - t0 >= PERIOD) {
    // Code inside is executed every period
    t0 = millis();
    // Light meter measurement
    if (lightMeterIsActivated) {
      float lux = lightMeter.readLightLevel();
      Serial.print("Lux: ");
      Serial.println(lux);
    }
  }

  // Code bellow is executed every time the arduino loops


}