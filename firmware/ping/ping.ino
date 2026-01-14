/*
  this demo works with ping.html and ping.js --
  browser will send pings (timestamps) to the ESP32,
  this program, on the ESP32, just sends the timestamp back immediately
  on the browser side, we will calculate the round trip duration
*/
#include <Arduino.h>
#include <ble_setup.h>

void setup() {
  Serial.begin(115200);
  // setup BLE with message handler, which will run when the ESP32 receives a message from the browser
  bleSetup(pingMsg);
}

void loop() {
  // ble tings
  handleDisconnect();
  handleConnect();
}

// when we receive a value, send it immediately back
void pingMsg(const String& receivedMsg)
{
    sendValue(receivedMsg);
}