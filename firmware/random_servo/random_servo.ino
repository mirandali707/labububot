#include "PCA9685.h"
#include <Wire.h>

#define NUM_SERVOS 12

#define SERVO_MIN 20 // all the way out
#define SERVO_MAX 100 // all the way in

#define SERVO_STEP 2          // degrees per update
#define SERVO_UPDATE_MS 20    // speed of sweep
#define ACTIVATE_INTERVAL 1000 // 1 second

ServoDriver servo;

/* Servo state machine */
enum ServoState {
  IDLE,
  SWEEP_UP,
  SWEEP_DOWN
};

ServoState servoState[NUM_SERVOS];
int servoAngle[NUM_SERVOS];
unsigned long lastServoUpdate[NUM_SERVOS];

unsigned long lastActivation = 0;

void setup() {
  Wire.begin();
  Serial.begin(9600);

  servo.init(0x7f);
  servo.setServoPulseRange(1000, 2000, 120);

  randomSeed(analogRead(A0));

  for (int i = 0; i < NUM_SERVOS; i++) {
    servoState[i] = IDLE;
    servoAngle[i] = SERVO_MAX;
    servo.setAngle(i + 1, SERVO_MAX);
    lastServoUpdate[i] = 0;
  }
}

void loop() {
  unsigned long now = millis();

  /* Activate a random idle servo every second */
  if (now - lastActivation >= ACTIVATE_INTERVAL) {
    lastActivation = now;
    activateRandomServo();
  }

  /* Update all active servos */
  for (int i = 0; i < NUM_SERVOS; i++) {
    updateServo(i, now);
  }
}

/* Pick a random servo that is IDLE */
void activateRandomServo() {
  int idleList[NUM_SERVOS];
  int idleCount = 0;

  for (int i = 0; i < NUM_SERVOS; i++) {
    if (servoState[i] == IDLE) {
      idleList[idleCount++] = i;
    }
  }

  if (idleCount == 0) return; // all busy

  int index = idleList[random(idleCount)];
  servoState[index] = SWEEP_DOWN; // down from SERVO_MAX to SERVO_MIN moves the servo out

  Serial.print("Activating servo ");
  Serial.println(index + 1);
}

/* Handle sweep motion */
void updateServo(int i, unsigned long now) {
  if (servoState[i] == IDLE) return;

  if (now - lastServoUpdate[i] < SERVO_UPDATE_MS) return;
  lastServoUpdate[i] = now;

  if (servoState[i] == SWEEP_DOWN) {
    // first sweep down, from SERVO_
    servoAngle[i] += SERVO_STEP;
    if (servoAngle[i] >= SERVO_MAX) {
      servoAngle[i] = SERVO_MAX;
      servoState[i] = SWEEP_UP;
    }
  }
  else if (servoState[i] == SWEEP_UP) {
    servoAngle[i] -= SERVO_STEP;
    if (servoAngle[i] <= SERVO_MIN) {
      servoAngle[i] = SERVO_MIN;
      servoState[i] = IDLE;
    }
  }

  servo.setAngle(i + 1, servoAngle[i]);
}
