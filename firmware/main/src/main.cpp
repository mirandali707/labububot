#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
#include <servo.h>

// when we receive a value, log to serial
void print_msg(const String& receivedMsg)
{
    Serial.print(receivedMsg);
}

void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    yield();
  }

  ble_init(print_msg); // initialize BLE with function to handle messages received from browser

  // init_imu(); // TODO rename to imu_init

  servo_driver_init(); // initialize PCA9685 PWM servo driver
}

void loop()
{
  // ble tings
  handle_connect();
  handle_disconnect();

  // update_imu_data();

  Serial.println("Move servo to 0 degrees");
  set_servo_angle(0, 0);
  delay(2000);

  Serial.println("Move servo to 60 degrees");
  set_servo_angle(0, 60);
  delay(2000);

  Serial.println("Move servo to 120 degrees");
  set_servo_angle(0, 120);
  delay(2000);

}