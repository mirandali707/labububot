#pragma once

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define SDA_PIN 5
#define SCL_PIN 6

#define N_SERVOS 12

extern Adafruit_PWMServoDriver pwm;

void servo_driver_init();
void set_servo_angle(uint8_t servo_num, uint16_t angle);
void set_servo_us(uint8_t servo_num, uint16_t microseconds);
// TODO later change to percent of max / min, factor in tuned servo biases