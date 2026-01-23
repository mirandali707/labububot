#pragma once

#include <stdint.h>

// struct ImuData {
//     int32_t acc[3] = {0}; // accelerometer
//     int32_t gyr[3] = {0}; // gyroscope
//     float quat[4] = {0}; // quaternion
//     float grav[3] = {0}; // gravity
// };

// extern ImuData imu_data;

extern int32_t accelerometer[3];
extern int32_t gyroscope[3];
// sensor fusion outputs 
extern float quaternions[4];
extern float gravity[3];

void imu_init();
void update_imu_data();
void print_imu_data();