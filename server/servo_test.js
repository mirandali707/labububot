// import { sendToESP32 } from './ble_setup.js';

/**
 * Send set servo angle command to ESP32
 * @param {int} servoIdx - index of servo to set, 0-11 inclusive
 * @param {int} angle - desired angle of servo to set, 0-120 degrees
 */
async function sendSetServo(servoIdx, angle) {
  const message = `set/${servoIdx}/${angle}`;
  await sendToESP32(message);
}

// Attach UI event listener to call sendSetServo with input values
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('sendSetServo');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const idxEl = document.getElementById('servoIdx');
    const angleEl = document.getElementById('angle');
    const servoIdx = parseInt(idxEl?.value, 10) || 0;
    const angle = parseInt(angleEl?.value, 10) || 0;
    await sendSetServo(servoIdx, angle);
  });
});

