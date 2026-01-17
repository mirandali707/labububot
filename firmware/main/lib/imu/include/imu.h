#pragma once

#include <stdint.h>

struct ImuData {
    int32_t acc[3] = {0}; // accelerometer
    int32_t gyr[3] = {0}; // gyroscope
    float quat[4] = {0}; // quaternion
    float grav[3] = {0}; // gravity
};

extern ImuData imu_data;

void init_imu();
void update_imu_data();
void print_imu_data();