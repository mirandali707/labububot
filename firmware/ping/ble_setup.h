#ifndef BLESETUP_H
#define BLESETUP_H

// optional fn to handle messages received by the ESP32
using RxHandler = std::function<void(const String&)>;
void bleSetup(RxHandler);
void sendValue(uint32_t value);
void handleDisconnect();
void handleConnect();

extern bool deviceConnected;

#endif
