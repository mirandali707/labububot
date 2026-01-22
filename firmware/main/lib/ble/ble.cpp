
// See the following for generating UUIDs:
// https://www.uuidgenerator.net/
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ble.h>

#define SERVICE_UUID "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define TX_CHAR_UUID "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // notifications from ESP32 (TX)
#define RX_CHAR_UUID  "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // write to ESP32 (RX)

BLEServer* pServer = NULL;
BLECharacteristic* pTxCharacteristic = NULL;
BLECharacteristic* pRxCharacteristic = NULL;
bool deviceConnected = false; // this is global btw
bool oldDeviceConnected = false;

// optional fn which runs when message is received from the browser
static RxHandler rxHandler = nullptr;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

class MyRxCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    String rxValue = String(pCharacteristic->getValue().c_str());
    if (rxValue.length() > 0) {
      Serial.print("Received:");
      Serial.println(String(rxValue).c_str());
      if (rxHandler) {
        // optional fn which runs when message is received from the browser
        rxHandler(rxValue);
      }
    }
  }
};

void ble_init(
  RxHandler optionalRxHandler = nullptr
) {
  Serial.println("Setting up BLE...");
  // Create the BLE Device
  BLEDevice::init("ESP32");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);
                    
  // Create TX characteristic (for sending data to browser via notifications)
  pTxCharacteristic = pService->createCharacteristic(
      TX_CHAR_UUID,
      BLECharacteristic::PROPERTY_NOTIFY
  );
  pTxCharacteristic->addDescriptor(new BLE2902());
  
  // Create RX characteristic (for receiving commands from browser)
  if (optionalRxHandler){
    rxHandler = optionalRxHandler;
  }
  pRxCharacteristic = pService->createCharacteristic(
      RX_CHAR_UUID,
      BLECharacteristic::PROPERTY_WRITE
  );
  pRxCharacteristic->setCallbacks(new MyRxCallbacks());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);  // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

void send_value(String value){
  // send value to browser 
  pTxCharacteristic->setValue(value.c_str());
  pTxCharacteristic->notify();
}

void handle_disconnect(){
  if (!deviceConnected && oldDeviceConnected) {
    Serial.println("Device disconnected.");
    delay(500); // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("Start advertising");
    oldDeviceConnected = deviceConnected;
  }
}

void handle_connect(){
  if (deviceConnected && !oldDeviceConnected) {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
    Serial.println("Device Connected");
  }
}