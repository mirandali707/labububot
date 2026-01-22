#include <parse_cmd.h>

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
