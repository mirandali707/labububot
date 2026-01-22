#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>

void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    yield();
  }

  init_imu();
}

void loop()
{
  update_imu_data();
}
