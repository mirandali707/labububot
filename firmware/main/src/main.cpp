#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
#include <servo.h>

// when we receive a value, log to serial
void printMsg(const String& receivedMsg)
{
    Serial.print(receivedMsg);
}

void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    yield();
  }

  // bleSetup(printMsg);

  // init_imu();

  servo_driver_init();
}

void loop()
{
  // // ble tings
  // handleDisconnect();
  // handleConnect();

  Serial.println("Move servo to 0 degrees");
  set_servo_angle(0, 0);
  delay(2000);

  Serial.println("Move servo to 60 degrees");
  set_servo_angle(0, 60);
  delay(2000);

  Serial.println("Move servo to 120 degrees");
  set_servo_angle(0, 120);
  delay(2000);
  // update_imu_data();
}