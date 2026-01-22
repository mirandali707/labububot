#pragma once
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define SDA_PIN 5
#define SCL_PIN 6

extern Adafruit_PWMServoDriver pwm;

void servo_driver_init();
void set_servo_angle(uint8_t servo_num, uint16_t angle);
// TODO later change to percent of max / min, factor in tuned servo biases