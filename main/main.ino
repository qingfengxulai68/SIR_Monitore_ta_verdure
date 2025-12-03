// Libraries
#include <Wire.h>
#include <BH1750.h>

// Sensors
BH1750 lightMeter; // luminosité

// Sensor Activation
bool lightMeterIsActivated = true;

// Config
int PERIOD = 1000; // in miliseconds


void setup() {
  Serial.begin(115200);
  delay(200);

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
  if (lightMeterIsActivated) {
    float lux = lightMeter.readLightLevel();
    Serial.print("Lux: ");
    Serial.println(lux);
  }

  delay(PERIOD);
}