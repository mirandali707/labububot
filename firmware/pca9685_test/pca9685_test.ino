#include "PCA9685.h"
#include <Wire.h>

ServoDriver servo;


void setup() {
    // join I2C bus (I2Cdev library doesn't do this automatically)
    Wire.begin();
    Serial.begin(9600);
    servo.init(0x7f);
    // Position "0" (1.5ms pulse) is middle, "90" (~2ms pulse) is middle, is all the way to the right, "-90" (~1ms pulse) is all the way to the left.
    // datasheet: https://www.handsontec.com/dataspecs/motor_fan/MG996R.pdf
    // params are in us
    servo.setServoPulseRange(1000,2000,120);
}

void loop() {
    // Drive 12 servos in turns
    for (int i = 0; i < 12; i++) {
        servo.setAngle(i, 0);
        delay(1000);
        servo.setAngle(i, 60); // halfway
        delay(1000);
    }
}