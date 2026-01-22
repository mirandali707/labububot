#ifndef BLESETUP_H
#define BLESETUP_H
#include <functional>
#include <Arduino.h>

// fn to handle messages received by the ESP32
using RxHandler = std::function<void(const String&)>;
void bleSetup(RxHandler);
void sendValue(String value);
void handleDisconnect();
void handleConnect();

extern bool deviceConnected;

#endif
