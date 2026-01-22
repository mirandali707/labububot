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

int SERVO_NUM = 11;

void loop() {
    for (int i = 1; i < 13; i++) {
        if (i == SERVO_NUM){
            servo.setAngle(i, 0); // 0 = all the way OUT
        }
        else {
            servo.setAngle(i, 80);
        }
    }
    delay(4000);
    // Drive 12 servos in turns
    // for (int i = 1; i < 13; i++) {
    //     servo.setAngle(i, 60);
    // }
    // delay(4000);
    // for (int i = 1; i < 13; i++) {
    //     servo.setAngle(i, 0);
    // }
    // delay(2000);
    // for (int i = 1; i < 13; i++) {
    //     servo.setAngle(i, 120);
    // }
    // delay(2000);
}