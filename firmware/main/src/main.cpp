#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
#include <servo.h>
#include <networking_utils.h>

// sweep state tracking
bool sweepAll = false;
int sweepStepSize = 5;
int sweepAngle = 0;
int sweepDirection = 1;  // 1 for increasing, -1 for decreasing
unsigned long lastSweepTime = 0;
const unsigned long SWEEP_INTERVAL = 50;  // milliseconds between angle updates

// handle browser commands
void handle_command(const String& received_msg){
  // received message is a /-delimited string, e.g.
  // set/0/60 means "set servo with idx 0 to angle 60 degrees"
  auto parts = parse_cmd(received_msg);
  if (parts[0] == "set") {
      int servoId = parts[1].toInt();
      int angle = parts[2].toInt();
      set_servo_angle(servoId, angle);
  }
  else if (parts[0] == "setall") {
      int angle = parts[1].toInt();
      for (int i = 0; i < N_SERVOS; i++) {
        // servo IDs are 0 indexed
        set_servo_angle(i, angle);
      }
  }
  // stop
  else if (parts[0] == "stop") {
      sweepAll = false;
      int stopAngle = 60;
      for (int i = 0; i < N_SERVOS; i++) {
        // servo IDs are 0 indexed
        set_servo_angle(i, stopAngle);
      }
  }
  else if (parts[0] == "sweepall") {
    sweepAll = true;
    if (parts.size() > 1){
      sweepStepSize = parts[1].toInt();
    }
    sweepAngle = 0;
    sweepDirection = 1;
    lastSweepTime = millis();
  }
}

void send_imu_data_to_browser(){
  send_value(format_imu_data(accelerometer, gyroscope, quaternions, gravity));
}

void setup()
{
  Serial.begin(115200);
  while (!Serial) {
    yield();
  }

  ble_init(handle_command); // initialize BLE with function to handle messages received from browser

  imu_init(); // TODO rename to imu_init

  servo_driver_init(); // initialize PCA9685 PWM servo driver
}

void loop()
{
  // ble tings
  handle_connect();
  handle_disconnect();

  update_imu_data();
  print_imu_data();
  send_imu_data_to_browser();

  // handle sweepAll
  if (sweepAll) {
    unsigned long currentTime = millis();
    if (currentTime - lastSweepTime >= SWEEP_INTERVAL) {
      lastSweepTime = currentTime;
      
      // update angle based on direction
      sweepAngle += sweepDirection * sweepStepSize;
      
      // check bounds and change direction if needed
      if (sweepAngle >= 120) {
        sweepAngle = 120;
        sweepDirection = -1;
      } else if (sweepAngle <= 0) {
        sweepAngle = 0;
        sweepDirection = 1;
      }
      
      // set all servos to current sweep angle
      for (int i = 0; i < N_SERVOS; i++) {
        set_servo_angle(i, sweepAngle);
      }
    }
  }
}