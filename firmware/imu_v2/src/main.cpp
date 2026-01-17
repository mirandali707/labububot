#include <Arduino.h>
#include <lsm6dsv16x_reg.h>
#include <SPI.h>

#define SPI_MOSI 9
#define SPI_MISO 8
#define SPI_SCK 7
#define CS_PIN 44
#define SPI_CLOCK 3000000
#define SPI_READ 0x80
#define FIFO_WATERMARK 32

// https://github.com/STMicroelectronics/lsm6dsv16x-pid/tree/main?tab=readme-ov-file
stmdev_ctx_t dev_ctx; // device interface for LSM6DSV16X sensor driver

// triangulated Sparkfun library fn
// int32_t sfeLSMWrite(void* fTarget, uint8_t reg, const uint8_t *bufp, uint16_t len)
// and stm32duino
// int32_t LSM6DSV16X_io_write(void *handle, uint8_t WriteAddr, const uint8_t *pBuffer, uint16_t nBytesToWrite)
int32_t platform_write(void *handle, uint8_t reg, const uint8_t *bufp, uint16_t len){
  // ignoring handle
  // default Sparkfun SPI settings, from here:
  // https://github.com/sparkfun/SparkFun_LSM6DSV16X_Arduino_Library/blob/2989647add0287287e1bd50b0be90596fb672ff1/src/sfe_bus.cpp#L188
  SPI.beginTransaction(SPISettings(SPI_CLOCK, MSBFIRST, SPI_MODE3));
  // Signal communication start
  digitalWrite(CS_PIN, LOW);
  /* Write Reg Address */
  SPI.transfer(reg);
  /* Write the data */
  for(int i = 0; i < len; i++)
  {
    SPI.transfer(bufp[i]);
  }
  digitalWrite(CS_PIN, HIGH);
  SPI.endTransaction();
  return 0; 
}

// Sparkfun:
// int SfeSPI::readRegisterRegion(uint8_t addr, uint8_t reg, uint8_t *data, uint16_t numBytes)
// stm32duino:
// uint8_t IO_Read(uint8_t *pBuffer, uint8_t RegisterAddr, uint16_t NumByteToRead)
int32_t platform_read(void *handle, uint8_t reg, uint8_t *bufp, uint16_t len){
  // todo: add if (!spi) {ret -1} check?
  SPI.beginTransaction(SPISettings(SPI_CLOCK, MSBFIRST, SPI_MODE3));
  digitalWrite(CS_PIN, LOW);
  /* Write Reg Address */
  SPI.transfer(reg | SPI_READ);
  /* Read the data */
  for (uint16_t i = 0; i < len; i++) {
    *(bufp + i) = SPI.transfer(0x00);
  }
  digitalWrite(CS_PIN, HIGH);
  SPI.endTransaction();
  return 0;
}

void init_ctx(){
  dev_ctx.write_reg = platform_write;
  dev_ctx.read_reg = platform_read;
  // dev_ctx.mdelay = platform_delay; // skip for now
}

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    yield();
  }
  pinMode(LED_BUILTIN, OUTPUT);

  SPI.begin();
  init_ctx();

  /* Restore default configuration - power-on reset */
  lsm6dsv16x_sw_por(&dev_ctx);

  /* Enable Block Data Update */
  // don't read data until MSB (most significant bits) and LSB (least significant bits) registers have been updated
  // prevents incoherent values, since acc + gyr data are 16 bits and each register only holds 8
  // total_value = (MSB << 8) | LSB;
  lsm6dsv16x_block_data_update_set(&dev_ctx, PROPERTY_ENABLE);
  
 /* Set full scale */
  lsm6dsv16x_xl_full_scale_set(&dev_ctx, LSM6DSV16X_2g);
  lsm6dsv16x_gy_full_scale_set(&dev_ctx, LSM6DSV16X_2000dps);

  /*
   * Set FIFO watermark (number of unread sensor data TAG + 6 bytes
   * stored in FIFO) to FIFO_WATERMARK samples
   */
  lsm6dsv16x_fifo_watermark_set(&dev_ctx, FIFO_WATERMARK);
  /* Set FIFO batch XL/Gyro ODR to 12.5Hz */
  lsm6dsv16x_fifo_xl_batch_set(&dev_ctx, LSM6DSV16X_XL_BATCHED_AT_60Hz);
  lsm6dsv16x_fifo_gy_batch_set(&dev_ctx, LSM6DSV16X_GY_BATCHED_AT_15Hz);

  /* Set FIFO mode to Stream mode (aka Continuous Mode) */
  lsm6dsv16x_fifo_mode_set(&dev_ctx, LSM6DSV16X_STREAM_MODE);

  /* Set Output Data Rate */
  lsm6dsv16x_xl_data_rate_set(&dev_ctx, LSM6DSV16X_ODR_AT_60Hz);
  lsm6dsv16x_gy_data_rate_set(&dev_ctx, LSM6DSV16X_ODR_AT_15Hz);
  lsm6dsv16x_fifo_timestamp_batch_set(&dev_ctx, LSM6DSV16X_TMSTMP_DEC_8);
  lsm6dsv16x_timestamp_set(&dev_ctx, PROPERTY_ENABLE);
}


lsm6dsv16x_fifo_status_t fifo_status;
static int16_t *datax;
static int16_t *datay;
static int16_t *dataz;
static int32_t *ts; // timestamp
uint32_t wdLastTick = 0;
uint32_t wdInterval = 50;

void loop() {
  uint16_t num = 0;

  /* Read watermark flag */
  lsm6dsv16x_fifo_status_get(&dev_ctx, &fifo_status);

  // if (fifo_status.fifo_th == 1) {
  if (fifo_status.fifo_level > 0) {
    num = fifo_status.fifo_level;
    // Serial.print("-- FIFO num ");
    // Serial.println(num);

    while (num--) {
      lsm6dsv16x_fifo_out_raw_t f_data;
      float_t ts_usec;

      /* Read FIFO sensor value */
      lsm6dsv16x_fifo_out_raw_get(&dev_ctx, &f_data);
      datax = (int16_t *)&f_data.data[0];
      datay = (int16_t *)&f_data.data[2];
      dataz = (int16_t *)&f_data.data[4];
      ts = (int32_t *)&f_data.data[0];

      // Serial.println(f_data.tag);
      switch (f_data.tag) {
      // case LSM6DSV16X_FIFO_EMPTY:
      //   Serial.println("FIFO empty");
      //   break;
      case LSM6DSV16X_XL_NC_TAG:
        Serial.print("ACC [mg]:\t");
        Serial.print(lsm6dsv16x_from_fs2_to_mg(*datax), 2);
        Serial.print('\t');
        Serial.print(lsm6dsv16x_from_fs2_to_mg(*datay), 2);
        Serial.print('\t');
        Serial.println(lsm6dsv16x_from_fs2_to_mg(*dataz), 2);
        break;
      case LSM6DSV16X_GY_NC_TAG:
        Serial.print("GYR [mdps]:\t");
        Serial.print(lsm6dsv16x_from_fs2000_to_mdps(*datax), 2);
        Serial.print('\t');
        Serial.print(lsm6dsv16x_from_fs2000_to_mdps(*datay), 2);
        Serial.print('\t');
        Serial.println(lsm6dsv16x_from_fs2000_to_mdps(*dataz), 2);
        break;
      case LSM6DSV16X_TIMESTAMP_TAG:
        ts_usec = lsm6dsv16x_from_lsb_to_nsec(*ts) / 1000.0f;
        Serial.print("TIMESTAMP ");
        Serial.print(ts_usec, 1);
        Serial.print(" [us] (lsb: ");
        Serial.print(*ts);
        Serial.println(')');
        break;
      default:
        break;
      }
    }
    // Serial.println("------");
    // Serial.println();

    // blinky blinky
    if (millis() > wdLastTick + wdInterval){
      wdLastTick = millis();
      digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
    }
  }
}