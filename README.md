# mf labubu

ancestor:
- [neilbot](https://fab.cba.mit.edu/classes/MAS.863/CBA/neilbot/index.html)
- [miranda's neilbot docs](https://fab.cba.mit.edu/classes/863.25/people/MirandaLi/pages/week11.html)

![bububot](images/bubu_cell_proto.jpg)
![bububot](images/bubu_half_proto.jpg)

threejs digital twin labububot controller
![dodecahedron](images/dodecahedron.jpeg)

BLE soon :)

# software

## server quickstart
make sure ur in `labububot/server`
### Option 1: Using npx (Node.js)
```bash
npx http-server -p 8080
```

### Option 2: Using Python
```bash
python3 -m http.server 8080
```

## what are all of these firmware subfolders?
### sparkfun_imu_test
get acc + gyr data from the LSM6DSV16X, which is connected via SPI to the ESP32. 
based on the [SPI example](https://docs.sparkfun.com/SparkFun_6DoF_LSM6DSV16X/examples/#example-3-spi) using the SparkFun library - not useful anymore as it does not support quaternion computation or gravity vector

### stm32duino_imu_test
gets acc, gyr, quat, gravity from LSM6DSV16X, which is connected via SPI to the ESP32.
uses the [stm32duino LSM6DSV16X library](https://github.com/stm32duino/LSM6DSV16X/blob/0572b20a4ad4c1bc7852e0fc6c756f538447b6ab/examples/LSM6DSV16X_Sensor_Fusion/LSM6DSV16X_Sensor_Fusion.ino)

### ble test
sends a count from the ESP32 to the browser (which should show up under Fetched Value).
if you send a message to the ESP32 (under Send Message) it will print it to the Serial monitor.
based on [this blog post](https://RandomNerdTutorials.com/esp32-web-bluetooth/)

### pca9685_test
this is exactly the `servo.h` example from [Seeed docs for this PWM driver](https://wiki.seeedstudio.com/Grove-16-Channel_PWM_Driver-PCA9685/#software)

# electronics
* battery
* ESP32S3
	* [schematic](https://files.seeedstudio.com/wiki/SeeedStudio-XIAO-ESP32S3/res/XIAO_ESP32S3_SCH_v1.2.pdf)
	* pinout
	* ![[esp32s3_pinout.jpeg]]
* [6dof IMU](https://www.sparkfun.com/sparkfun-6dof-imu-breakout-lsm6dsv16x-qwiic.html)
	* [software setup](https://docs.sparkfun.com/SparkFun_6DoF_LSM6DSV16X/software_setup_and_programming/)
	* SPI
		* [SPI with ESP32S3](https://wiki.seeedstudio.com/xiao_esp32s3_pin_multiplexing/#hardware-preparation-4)
* servos
* Grove - 16 Channel PWM Driver (PCA9685) 
	* connected via I2C
* buck converter

# hardware
* 12 labubus

# references
* [ben and dimitar's neilbot board](https://gitlab.cba.mit.edu/classes/863.25/CBA/cba-machine/-/tree/main/hardware/main)

# things we need to buy or find
* buck converters
* 2 spoots PETG
* mf glue 