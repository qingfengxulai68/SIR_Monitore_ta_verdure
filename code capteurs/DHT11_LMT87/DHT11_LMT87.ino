#include <DHT.h>
#define DHT_PIN 15
#define LMT87_PIN 6
#define DHTTYPE DHT11
float temp, hum;
DHT dht(DHT_PIN, DHTTYPE);
void setup() {
  Serial.begin(9600);
  dht.begin();
  // put your setup code here, to run once:

}

void loop() {
  temp = dht.readTemperature();
  hum = dht.readHumidity();
  Serial.println("DHT11:");
  Serial.print(temp);
  Serial.println(" °C");
  Serial.print(hum);
  Serial.println(" %");
  int voltage_mV=analogReadMilliVolts(LMT87_PIN);
  //double temperatureC=(13.582-sqrt(pow(13.582,2)+4*0.00433+(2230.8-voltage_mV)))/(2*(-0.00433))+30;
  double temperatureC=(voltage_mV-2637)/(-13.6);
  Serial.print(voltage_mV);
  Serial.println("mV");
  Serial.println("LMT87");
  Serial.print(temperatureC);
  Serial.println("°C");
  // put your main code here, to run repeatedly:
  delay(500);

  // put your main code here, to run repeatedly:

}
