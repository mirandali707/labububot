#include <servo.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x7F);

SweepCmd* servo_statuses[N_SERVOS] = {nullptr}; // indexed by servo_id - 1 (since servo_id is 1-indexed)

// indexed by servo_id - 1
int SERVO_ID_TO_PWM_ID[12] = { 
    /* 1  */ 13,
    /* 2  */ 14,
    /* 3  */ 99,
    /* 4  */ 99,
    /* 5  */ 12,
    /* 6  */ 11,
    /* 7  */ 99,
    /* 8  */ 15,
    /* 9  */ 10,
    /* 10 */ 99,
    /* 11 */ 99,
    /* 12 */ 99
};

const ServoPwmVals SERVO_ID_TO_PWM_VALS[12] = {
    /* 1  */ {1250, 1350, 2050, 2100},
    /* 2  */ {1400, 1500, 2150, 2200},
    /* 3  */ {1400, 1500, 2100, 2200},
    /* 4  */ {1400, 1500, 2150, 2200},
    /* 5  */ {1600, 1800, 2200, 2400},
    /* 6  */ {1400, 1500, 2100, 2200},
    /* 7  */ {1600, 1600, 2000, 2100},
    /* 8  */ {1500, 1700, 2150, 2300},
    /* 9  */ {1400, 1500, 2100, 2200},
    /* 10 */ {1600, 1600, 2150, 2150},
    /* 11 */ {1200, 1500, 2100, 2200},
    /* 12 */ {1600, 1600, 2100, 2100},
};

// START probably deprecated; from when i was using set_servo_angle which i should not do anymore
uint16_t pulseMin = 205;  // 1000 µs
uint16_t pulseMax = 410;  // 2000 µs

uint16_t angleToPulse(uint16_t angle) {
    if (angle > 120) angle = 120;  // Clamp max angle
    return map(angle, 0, 120, pulseMin, pulseMax);
}
// END probably deprecated

/**
 * creates a pointer to a new SweepCmd object at the (servo_id-1)th position in servo_statuses
 * initializes the cmd with an array of 5 (millisecond, PWM value) tuples to command a full sweep
 * @param servo_id is the 1-indexed face ID
 */
void init_sweep(int servo_id) {
    if (servo_statuses[servo_id - 1] != nullptr) {
        delete servo_statuses[servo_id - 1];
    }

    const ServoPwmVals& pwm = SERVO_ID_TO_PWM_VALS[servo_id - 1];

    SweepCmd* cmd = new SweepCmd();
    cmd->steps[0] = {0,   pwm.ears_in};
    cmd->steps[1] = {300, pwm.ears_out};
    cmd->steps[2] = {800, pwm.safe_out};
    cmd->steps[3] = {1600, pwm.ears_in};
    cmd->steps[4] = {1900, pwm.safe_in};
    // MAKE SURE TO CHANGE STEP_COUNT IN THE STRUCT DEFINITION IF YOU ARE ADDING MORE THAN 5 STEPS
    cmd->next_step_index = 0;

    servo_statuses[servo_id - 1] = cmd;
}


/**
 * checks servo_statuses for non-null SweepCmd ptrs; 
 * updates SweepCmd by going in the direction of the sweep by `rate`, and changing sweep direction / ending sweep if conditions are met
 */
void update_active_sweeps(){
    for (int i = 0; i < N_SERVOS; i++) {
        if (servo_statuses[i] != nullptr) {
            SweepCmd* cmd = servo_statuses[i];
            int servo_id = i;
            int pwm_id = SERVO_ID_TO_PWM_ID[servo_id] - 1;

            unsigned long elapsed = millis() - cmd->cmd_start_ms;
            Step& next_step = cmd->steps[cmd->next_step_index];

            if (elapsed >= next_step.time_ms) {
                set_servo_us(pwm_id, next_step.pwm);
                cmd->next_step_index++;

                if (cmd->next_step_index >= SweepCmd::STEP_COUNT) {
                    delete cmd;
                    servo_statuses[i] = nullptr;
                }
            }
        }
    }
}

void servo_driver_init(){
    // start I2C
    Wire.begin(SDA_PIN, SCL_PIN);
    Wire.setClock(100000);

    Wire.beginTransmission(0x7F);
    uint8_t err = Wire.endTransmission();
    // Serial.print("PCA9685 presence at 0x7F: ");
    // Serial.println(err == 0 ? "YES" : "NO");
    pwm.begin();
    pwm.setPWMFreq(50);
}

void set_servo_angle(uint8_t pwm_id, uint16_t angle){
    pwm.setPWM(pwm_id, 0, angleToPulse(angle));
}

void set_servo_us(uint8_t pwm_id, uint16_t us){
    pwm.writeMicroseconds(pwm_id, us);
}