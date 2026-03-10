#pragma once

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <map>

#define SDA_PIN 5
#define SCL_PIN 6

#define N_SERVOS 12

#define PWM_MIN 1600 // all the way out
#define PWM_MAX 2100 // all the way in
#define DEFAULT_SERVO_RATE 50

struct ServoPwmVals {
    uint16_t ears_out;
    uint16_t safe_out;
    uint16_t safe_in;
    uint16_t ears_in;
};

struct Step {
    unsigned long time_ms;
    int pwm;
};

struct SweepCmd{
    unsigned long cmd_start_ms = millis(); // milliseconds since boot

    static const int STEP_COUNT = 5; // CHANGE THIS IF WE ARE USING MORE STEPS!
    Step steps[STEP_COUNT];
    int next_step_index = 0;
};

extern Adafruit_PWMServoDriver pwm;
extern std::map<int, int> SERVO_ID_TO_PWM_ID;

void servo_driver_init();
void set_servo_angle(uint8_t servo_num, uint16_t angle);
void set_servo_us(uint8_t servo_num, uint16_t microseconds); // TODO later change to percent of max / min, factor in tuned servo biases
void init_sweep(int servo_id);
void update_active_sweeps();