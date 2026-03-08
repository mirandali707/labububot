#include <servo.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x7F);

SweepCmd* servo_statuses[N_SERVOS] = {nullptr};

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

// probably deprecated; from when i was using set_servo_angle which i should not do anymore
uint16_t pulseMin = 205;  // 1000 µs
uint16_t pulseMax = 410;  // 2000 µs

uint16_t angleToPulse(uint16_t angle) {
    if (angle > 120) angle = 120;  // Clamp max angle
    return map(angle, 0, 120, pulseMin, pulseMax);
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

void set_servo_angle(uint8_t servo_num, uint16_t angle){
    pwm.setPWM(servo_num, 0, angleToPulse(angle));
}

void set_servo_us(uint8_t servo_num, uint16_t us){
    pwm.writeMicroseconds(servo_num, us);
}