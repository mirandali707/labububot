#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define SDA_PIN 5
#define SCL_PIN 6

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x7F);

uint16_t pulseMin = 205;
uint16_t pulseMax = 410;

uint16_t angleToPulse(uint8_t angle) {
    return map(angle, 0, 120, pulseMin, pulseMax);
}

void setup() {
    Serial.begin(115200);
    delay(2000);
    Serial.println("Starting I2C...");

    Wire.begin(SDA_PIN, SCL_PIN);
    Wire.setClock(100000);

    Wire.beginTransmission(0x7F);
    uint8_t err = Wire.endTransmission();
    Serial.print("PCA9685 presence at 0x7F: ");
    Serial.println(err == 0 ? "YES" : "NO");

    Serial.println("Starting PCA9685...");
    pwm.begin();
    pwm.setPWMFreq(50);
    Serial.println("PCA9685 ready");
}

void loop() {
    Serial.println("Move servo to 0 degrees");
    pwm.setPWM(0, 0, angleToPulse(0));
    delay(2000);

    Serial.println("Move servo to 60 degrees");
    pwm.setPWM(0, 0, angleToPulse(60));
    delay(2000);

    Serial.println("Move servo to 120 degrees");
    pwm.setPWM(0, 0, angleToPulse(120));
    delay(2000);
}
