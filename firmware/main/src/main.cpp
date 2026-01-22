#include <Arduino.h>
#include <Wire.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
// #include <servo.h>

// when we receive a value, log to serial
void printMsg(const String& receivedMsg)
{
    Serial.print(receivedMsg);
}

void setup()
{
  delay(1000);  // Give USB time to enumerate
  Serial.begin(115200);
  Wire.begin();
  while (!Serial) {
    yield();
  }

  // bleSetup(printMsg);

  init_imu();
  // Serial.println("hello world");
  // Serial.println("before servo_driver_init");
  // servo_driver_init();
  // Serial.println("after servo_driver_init");
}

int SERVO_NUM = 1;

void loop()
{
  // // ble tings
  // handleDisconnect();
  // handleConnect();

  update_imu_data();
  // Serial.println("setting to 60");
  // // servo.setAngle(SERVO_NUM, 60);
  // set_servo_angle(SERVO_NUM, 60);
  // delay(2000);
  // Serial.println("setting to 0");
  // // servo.setAngle(SERVO_NUM, 0);
  // set_servo_angle(SERVO_NUM, 0);
  // delay(2000);
  // Serial.println("setting to 120");
  // // servo.setAngle(SERVO_NUM, 120);
  // set_servo_angle(SERVO_NUM, 120);
  // delay(2000);
}
