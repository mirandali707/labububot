#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>

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

  bleSetup(printMsg);

  // init_imu();
}

void loop()
{
  // ble tings
  handleDisconnect();
  handleConnect();

  // update_imu_data();
}
