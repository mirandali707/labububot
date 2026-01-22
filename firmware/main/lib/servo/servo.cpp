#include <servo.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x7F);

uint16_t pulseMin = 205;
uint16_t pulseMax = 410;

uint16_t angleToPulse(uint8_t angle) {
    return map(angle, 0, 120, pulseMin, pulseMax);
}

void servo_driver_init(){
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

void set_servo_angle(uint8_t servo_num, uint16_t angle){
    pwm.setPWM(servo_num, 0, angleToPulse(angle));
}