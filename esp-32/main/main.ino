// Libraries
#include <Wire.h>
#include <BH1750.h>
#include <DHT.h>

// Sensor Activation
bool lightMeterIsActivated = true;
bool soilMoistureIsActivated = true;
bool dhtIsActivated = true;
bool lmt87IsActivated = true;

// Config
const int PERIOD = 500; // in miliseconds
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
float rawValue; // Soil moisture
float hum; // air temp + humidity
double lmt87_temp; // Air temperature with lmt87

// Sensors
BH1750 lightMeter; // luminosité


DHT dht(DHT_PIN, DHTTYPE); // 


void setup() {
  Serial.begin(115200);
  delay(200);
  t0 = millis();

  

  // Soil moisture sensor
  if (soilMoistureIsActivated) {
    pinMode(SOIL_MOISTURE_PIN, INPUT);
  }

  // Luminosity
  if (lightMeterIsActivated) {
    Wire.begin(21, 22);   // SDA=21, SCL=22

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
}

void loop() {
  if (millis() - t0 >= PERIOD) {
    // Code inside is executed every period
    t0 = millis();
    // Light meter measurement
    if (lightMeterIsActivated) {
      lux = lightMeter.readLightLevel();
      Serial.print("Lux: ");
      Serial.println(lux);
    }

    // Soil moisture sensor
    if (soilMoistureIsActivated) {
      rawValue = analogRead(SOIL_MOISTURE_PIN);
      int moisturePercent = map(rawValue, 4095, 1950, 0, 100);
      moisturePercent = constrain(moisturePercent, 0, 100);
      Serial.print("Soil moisture: ");
      Serial.println(moisturePercent);
    }

    // DHT 
    if (dhtIsActivated) {
      hum = dht.readHumidity();
      Serial.println("DHT11:");
      Serial.print(hum);
      Serial.println(" %");
    }

    // LMT87 
    if (lmt87IsActivated) {
      int voltage_mV=analogReadMilliVolts(LMT87_PIN);
      lmt87_temp = (voltage_mV-2637)/(-13.6);
      Serial.println("LMT87");
      Serial.print(lmt87_temp);
      Serial.println("°C");
    }
    Serial.print
ln("###########################################################################");
  }
}