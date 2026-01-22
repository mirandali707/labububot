#pragma once

// #define BUFFER_LENGTH 32
#include <Wire.h>
#include "PCA9685.h"

void servo_driver_init();
void set_servo_angle(uint8_t servo_num, uint16_t angle);
// TODO later change to percent of max / min, factor in tuned servo biases