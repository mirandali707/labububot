#include <Arduino.h>
#include <LSM6DSV16XSensor.h>
#include <SPI.h>
#include <imu.h>
#include <ble.h>
#include <servo.h>
#include <networking_utils.h>

// handle browser commands
void handle_command(const String& received_msg){
  // received message is a /-delimited string, e.g.
  // set/0/60 means "set servo with idx 0 to angle 60 degrees"
  auto parts = parse_cmd(received_msg);
  if (parts[0] == "set") {
      int servo_id = parts[1].toInt();
      int pwm_id = SERVO_ID_TO_PWM_ID[servo_id];
      int angle = parts[2].toInt();
      set_servo_angle(pwm_id, angle);
  }
  else if (parts[0] == "us") {
    // us/{bubu face id}/{pwm value, in us}
      int servo_id = parts[1].toInt();
      int pwm_id = SERVO_ID_TO_PWM_ID[servo_id];
      int us = parts[2].toInt();
      set_servo_us(pwm_id, us);
  }
  else if (parts[0] == "setall") {
      int angle = parts[1].toInt();
      for (int i = 0; i < N_SERVOS; i++) {
        // pwm IDs are 0 indexed
        set_servo_angle(i, angle);
      }
  }
  else if (parts[0] == "sweep") {
      int servo_id = parts[1].toInt();
      init_sweep(servo_id);
  }
  // don't do this for now -- not sure if current can take it
  // else if (parts[0] == "sweepall") {
  //     for (int servo_id = 1; servo_id <= N_SERVOS; servo_id++) {
  //       init_sweep(servo_id);
  //     }
  // }
}

void send_imu_data_to_browser(){
  send_value(format_imu_data(accelerometer, gyroscope, quaternions, gravity));
}

void setup()
{
  Serial.begin(115200);

  ble_init(handle_command); // initialize BLE with function to handle messages received from browser

  imu_init();

  servo_driver_init(); // initialize PCA9685 PWM servo driver
}

void loop()
{
  // ble tings
  handle_connect();
  handle_disconnect();

  // imu data
  update_imu_data();
  print_imu_data();
  send_imu_data_to_browser();

  // servo sweepage
  update_active_sweeps();
}