#include <servo.h>

ServoDriver servo;

void servo_driver_init(){
    // join I2C bus (I2Cdev library doesn't do this automatically)
    // Serial.println("DEBUG: Starting Wire.begin()");
    // Wire.begin();
    // Serial.println("DEBUG: Wire.begin() complete");
    
    // Scan for I2C devices
    Serial.println("DEBUG: Scanning I2C bus...");
    for (uint8_t addr = 0x08; addr < 0x78; addr++) {
        Wire.beginTransmission(addr);
        uint8_t error = Wire.endTransmission();
        if (error == 0) {
            Serial.print("DEBUG: Found I2C device at 0x");
            Serial.println(addr, HEX);
        }
    }
    Serial.println("DEBUG: I2C scan complete");
    
    Serial.println("DEBUG: Starting servo.init(0x7f)");
    servo.init(0x7f);
    Serial.println("DEBUG: servo.init() complete");
    // datasheet: https://www.handsontec.com/dataspecs/motor_fan/MG996R.pdf
    // params are in us
    Serial.println("DEBUG: Starting setServoPulseRange");
    servo.setServoPulseRange(1000,2000,120);
    Serial.println("DEBUG: setServoPulseRange complete");
}

void set_servo_angle(uint8_t servo_num, uint16_t angle){
    // 0 is all the way out, 120 is all the way in
    servo.setAngle(servo_num, angle); // 0 = all the way OUT
}