#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
#include <servo.h>

// handle browser commands
void handle_command(const String& received_msg){
  if (received_msg == "move"){
    set_servo_angle(0, 0);
    delay(1000);
    set_servo_angle(0, 120);
    delay(1000);
    set_servo_angle(0, 0);
  }
}

void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    yield();
  }

  ble_init(handle_command); // initialize BLE with function to handle messages received from browser

  // init_imu(); // TODO rename to imu_init

  servo_driver_init(); // initialize PCA9685 PWM servo driver
}

void loop()
{
  // ble tings
  handle_connect();
  handle_disconnect();

  // update_imu_data();
}