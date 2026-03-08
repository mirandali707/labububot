#include <servo.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x7F);

SweepCmd* servo_statuses[N_SERVOS] = {nullptr}; // indexed by servo_id - 1 (since servo_id is 1-indexed)

std::map<int, int> SERVO_ID_TO_PWM_ID = {
    {1, 8},
    {2, 9},
    {3, 10},
    {4, 11},
    {5, 12},
    {6, 13},
    {7, 0},
    {8, 1},
    {9, 2},
    {10, 3},
    {11, 4},
    {12, 5}
};

// START probably deprecated; from when i was using set_servo_angle which i should not do anymore
uint16_t pulseMin = 205;  // 1000 µs
uint16_t pulseMax = 410;  // 2000 µs

uint16_t angleToPulse(uint16_t angle) {
    if (angle > 120) angle = 120;  // Clamp max angle
    return map(angle, 0, 120, pulseMin, pulseMax);
}
// END probably deprecated

void init_sweep(int servo_id){
    /***
     * servo ID is the 1-indexed face ID
     * creates a pointer to a new SweepCmd object at the (servo_id-1)th position in servo_statuses
     */
    if (servo_statuses[servo_id - 1] != nullptr) {
        // TODO handle sweep command overwrite better later
        delete servo_statuses[servo_id - 1];
    }
    servo_statuses[servo_id - 1] = new SweepCmd();
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