#include <networking_utils.h>

String format_imu_data(const int32_t accelerometer[3], const int32_t gyroscope[3], 
                       const float quaternions[4], const float gravity[3]) {
    String result = "acc/";
    result += accelerometer[0]; result += "/";
    result += accelerometer[1]; result += "/";
    result += accelerometer[2]; result += "/";
    result += "gyr/";
    result += gyroscope[0]; result += "/";
    result += gyroscope[1]; result += "/";
    result += gyroscope[2]; result += "/";
    result += "quat/";
    // quaternion is in the order x, y, z, w
    result += quaternions[0]; result += "/";
    result += quaternions[1]; result += "/";
    result += quaternions[2]; result += "/";
    result += quaternions[3]; result += "/";
    result += "grav/";
    result += gravity[0]; result += "/";
    result += gravity[1]; result += "/";
    result += gravity[2];
    return result;
}

std::vector<String> parse_cmd(const String& s) {
    // splits a /-delimited string into an array of parts
    std::vector<String> parts;
    int start = 0;
    int index;

    while ((index = s.indexOf('/', start)) != -1) {
        parts.push_back(s.substring(start, index));
        start = index + 1;
    }
    parts.push_back(s.substring(start));  // Last part

    return parts;
}

