/*
  Miranda referenced
  Rui Santos & Sara Santos - Random Nerd Tutorials
  Complete project details at https://RandomNerdTutorials.com/esp32-web-bluetooth/
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
#include <ble_setup.h>

uint32_t value = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

  bleSetup();
}

void loop() {
  if (deviceConnected) {
    sendValue(value); // send value to browser

    // blink
    digitalWrite(LED_BUILTIN, LOW);  // turn the LED on
    delay(100);                      // wait 
    digitalWrite(LED_BUILTIN, HIGH);   // turn the LED off

    value++;
    Serial.print("New value notified: ");
    Serial.println(value);

    delay(1000); // bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  }

  // ble tings
  handleDisconnect();
  handleConnect();
}
