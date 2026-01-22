#ifndef BLESETUP_H
#define BLESETUP_H
#include <functional>
#include <Arduino.h>

// fn to handle messages received by the ESP32
using RxHandler = std::function<void(const String&)>;
void ble_init(RxHandler);
void send_value(String value);
void handle_disconnect();
void handle_connect();

extern bool deviceConnected;

#endif
