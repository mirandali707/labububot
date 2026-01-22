#include <Arduino.h>
#include <SPI.h>
#include <LSM6DSV16XSensor.h>
#include <imu.h>

// Global variable definitions
int32_t accelerometer[3];
int32_t gyroscope[3];
float quaternions[4] = {0};
float gravity[3] = {0};

#define ALGO_FREQ 24U /* Algorithm frequency 120Hz */
#define ALGO_PERIOD  (1000U / ALGO_FREQ) /* Algorithm period [ms] */
unsigned long startTime, elapsedTime;

#define SPI_MOSI 9
#define SPI_MISO 8
#define SPI_SCK 7
#define CS_PIN 44

LSM6DSV16XSensor AccGyr(&SPI, CS_PIN, 500000);

uint8_t status = 0;
uint32_t k = 0;

// ImuData imu_data;
uint8_t tag = 0;

void init_imu(){
  SPI.begin();

  // Initialize LSM6DSV16X.
  AccGyr.begin();
  status |= AccGyr.Device_Reset();

  status |= AccGyr.Enable_X();
  status |= AccGyr.Enable_G();

  // Enable Sensor Fusion
  status |= AccGyr.Set_X_FS(4);
  status |= AccGyr.Set_G_FS(500);
  status |= AccGyr.Set_X_ODR(60.0f);
  status |= AccGyr.Set_G_ODR(60.0f);

  // Configure FIFO BDR for acc and gyro
  status |= AccGyr.FIFO_Set_X_BDR(60.0f);
  status |= AccGyr.FIFO_Set_G_BDR(60.0f);

  status |= AccGyr.Set_SFLP_ODR(60.0f);
  status |= AccGyr.Enable_Rotation_Vector();
  status |= AccGyr.Enable_Gravity_Vector();
  status |= AccGyr.FIFO_Set_Mode(LSM6DSV16X_STREAM_MODE);

  if (status != LSM6DSV16X_OK) {
    Serial.println("LSM6DSV16X Sensor failed to init/configure");
    while (1);
  }
  Serial.println("LSM6DSV16X SFLP Demo");
}

void update_imu_data(){
  uint16_t fifo_samples;
  // Get start time of loop cycle
  startTime = millis();

  // Check the number of samples inside FIFO
  if (AccGyr.FIFO_Get_Num_Samples(&fifo_samples) != LSM6DSV16X_OK) {
    Serial.println("LSM6DSV16X Sensor failed to get number of samples inside FIFO");
    while (1);
  }

  // Read the FIFO if there is one stored sample
  if (fifo_samples > 0) {
    for (int i = 0; i < fifo_samples; i++) {
      AccGyr.FIFO_Get_Tag(&tag);
      // Serial.println(tag);
      if (tag == 0x2) {
        // Print accel data
        AccGyr.FIFO_Get_X_Axes(accelerometer); // FIFO_Get_X_Axes?
        // AccGyr.Get_X_AxesRaw(accelerometer); // FIFO_Get_X_Axes?

        Serial.print("Accelerometer: ");
        Serial.print("X: ");
        Serial.print(accelerometer[0], 4);
        Serial.print(" ");
        Serial.print("Y: ");
        Serial.print(accelerometer[1], 4);
        Serial.print(" ");
        Serial.print("Z: ");
        Serial.print(accelerometer[2], 4);
        Serial.println(" ");
      }
      else if (tag == 0x1) {
        // Print gyr data
        AccGyr.FIFO_Get_G_Axes(gyroscope);
        // AccGyr.Get_G_AxesRaw(gyroscope);
        Serial.print("Gyroscope: ");
        Serial.print("X: ");
        Serial.print(gyroscope[0], 4);
        Serial.print(" ");
        Serial.print("Y: ");
        Serial.print(gyroscope[1], 4);
        Serial.print(" ");
        Serial.print("Z: ");
        Serial.print(gyroscope[2], 4);
        Serial.println(" ");
      }
      else if (tag == 0x17){
        // Print gravity vector
        Serial.print("Gravity Vector: ");
        AccGyr.FIFO_Get_Gravity_Vector(&gravity[0]);
        Serial.print(gravity[0], 4);
        Serial.print(", ");
        Serial.print(gravity[1], 4);
        Serial.print(", ");
        Serial.println(gravity[2], 4);
      }
      else if (tag == 0x13){
        // Print Quaternion data
        AccGyr.FIFO_Get_Rotation_Vector(&quaternions[0]);

        Serial.print("Quaternion: ");
        Serial.print(quaternions[3], 4);
        Serial.print(", ");
        Serial.print(quaternions[0], 4);
        Serial.print(", ");
        Serial.print(quaternions[1], 4);
        Serial.print(", ");
        Serial.println(quaternions[2], 4);
      }

      // Compute the elapsed time within loop cycle and wait
      elapsedTime = millis() - startTime;

      if ((long)(ALGO_PERIOD - elapsedTime) > 0) {
        delay(ALGO_PERIOD - elapsedTime);
      }
    }
  }
}

// void print_imu_data(){
//   Serial.println("acc: ");
//   Serial.println(imu_data.acc[0], 4);
//   Serial.println(imu_data.acc[1], 4);
//   Serial.println(imu_data.acc[2], 4);
//   Serial.println();

//   Serial.println("gyr: ");
//   Serial.println(imu_data.gyr[0], 4);
//   Serial.println(imu_data.gyr[1], 4);
//   Serial.println(imu_data.gyr[2], 4);
//   Serial.println();

//   // Print Quaternion data
//   Serial.println("quat: ");
//   Serial.println(imu_data.quat[0], 4);
//   Serial.println(imu_data.quat[1], 4);
//   Serial.println(imu_data.quat[2], 4);
//   Serial.println(imu_data.quat[3], 4);
//   Serial.println();

//   // Print gravity vector
//   Serial.println("grav: ");
//   Serial.println(imu_data.grav[0], 4);
//   Serial.println(imu_data.grav[1], 4);
//   Serial.println(imu_data.grav[2], 4);
//   Serial.println();
// }