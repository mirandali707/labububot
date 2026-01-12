#ifndef BLESETUP_H
#define BLESETUP_H

void bleSetup();

extern BLEServer* pServer;
extern BLECharacteristic* pTxCharacteristic;
extern BLECharacteristic* pRxCharacteristic;
extern bool deviceConnected;
extern bool oldDeviceConnected;

#endif
