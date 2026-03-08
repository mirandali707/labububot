#pragma once

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <map>

#define SDA_PIN 5
#define SCL_PIN 6

#define N_SERVOS 12

#define PWM_MIN 1600 // all the way out
#define PWM_MAX 2100 // all the way in
#define DEFAULT_SERVO_RATE 200

struct SweepCmd{
    bool sweep_out = true;
    int curr_pwm = PWM_MAX;
    int pwm_in_max = PWM_MAX; // TODO can put in individual tuned servo max later
    int pwm_out_max = PWM_MIN; // TODO can put in individual tuned servo min later
    int rate = DEFAULT_SERVO_RATE; // pwm microseconds to increment in each loop
};

extern Adafruit_PWMServoDriver pwm;
extern std::map<int, int> SERVO_ID_TO_PWM_ID;

void servo_driver_init();
void set_servo_angle(uint8_t servo_num, uint16_t angle);
void set_servo_us(uint8_t servo_num, uint16_t microseconds);
// TODO later change to percent of max / min, factor in tuned servo biases