#include <Arduino.h>
#include <vector>

// splits a /-delimited string into an array of parts
std::vector<String> parse_cmd(const String& s);

// formats IMU data (accelerometer, gyroscope, quaternion, gravity) as a /-separated string
// format: acc/ax/ay/az/gyr/gx/gy/gz/quat/q0/q1/q2/q3/grav/gvx/gvy/gvz
String format_imu_data(const int32_t accelerometer[3], const int32_t gyroscope[3], 
                       const float quaternions[4], const float gravity[3]);