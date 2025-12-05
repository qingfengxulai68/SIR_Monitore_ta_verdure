#define SOIL_MOISTURE_PIN 5
int thresholdValue = 2167;
const char* MODULE_ID = "SBT4447";
void setup() {
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  Serial.begin(9600);
  // put your setup code here, to run once:

}

void loop() {
  int sensorValue = analogRead(SOIL_MOISTURE_PIN);
  Serial.print(sensorValue);
  if(sensorValue < thresholdValue){
    Serial.println(" - Doesn't need watering");
  }
  else {
    Serial.println(" - Time to water your plant");
  }
  delay(500);
  // put your main code here, to run repeatedly:

}
