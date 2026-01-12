#ifndef BLESETUP_H
#define BLESETUP_H

void bleSetup();
void sendValue(uint32_t value);
void handleDisconnect();
void handleConnect();

extern bool deviceConnected;

#endif
