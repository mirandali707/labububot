#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
#include <servo.h>
#include <parse_cmd.h>

// handle browser commands
void handle_command(const String& received_msg){
  // received message is a /-delimited string, e.g.
  // set/0/60 means "set servo with idx 0 to angle 60 degrees"
  auto parts = parse_cmd(received_msg);
  if (parts[0] == "set") {
      int servoId = parts[1].toInt();
      int angle = parts[2].toInt();
      set_servo_angle(servoId, angle);
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