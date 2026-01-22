#include <Arduino.h>
#include <vector>

// splits a /-delimited string into an array of parts
std::vector<String> parse_cmd(const String& s);