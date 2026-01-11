// ============================================================================
// Web Bluetooth API Communication Module
// Handles BLE connection to ESP32 and bidirectional communication
// ============================================================================

// Nordic UART Service UUIDs (must match ESP32)
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // notifications from ESP32 (TX)
const RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // write to ESP32 (RX)

// BLE objects
let bluetoothDevice = null;
let bleServer = null;
let charRx = null; // for receiving notifications (TX characteristic)
let charTx = null; // for sending data (RX characteristic)

// Callback for received data
let onDataReceived = null;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Connection Functions
// ============================================================================

/**
 * Connect to ESP32 via Web Bluetooth API
 * @param {Function} dataCallback - Callback function for received data
 * @returns {Promise<boolean>} - True if connected successfully
 */
async function connectESP32(dataCallback) {
  try {
    // Check if Web Bluetooth is supported
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API is not supported in this browser. Use Chrome, Edge, or Opera.');
    }

    console.log('Requesting Bluetooth device...');

    // Request device
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
      optionalServices: [SERVICE_UUID],
    });

    console.log('Connecting to GATT server...');

    // Connect to GATT server
    bleServer = await bluetoothDevice.gatt.connect();

    console.log('Getting service...');

    // Get service
    const service = await bleServer.getPrimaryService(SERVICE_UUID);

    console.log('Getting characteristics...');

    // Get TX characteristic for receiving notifications
    charRx = await service.getCharacteristic(TX_CHAR_UUID);

    // Get RX characteristic for sending data
    charTx = await service.getCharacteristic(RX_CHAR_UUID);

    // Store callback
    onDataReceived = dataCallback;

    // Start notifications
    await charRx.startNotifications();
    charRx.addEventListener('characteristicvaluechanged', handleNotification);

    console.log('BLE connected successfully!');
    window.dispatchEvent(new CustomEvent('ble-connection-changed', { detail: { connected: true } }));

    // Handle disconnection
    bluetoothDevice.addEventListener('gattserverdisconnected', handleDisconnection);

    return bluetoothDevice;
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from ESP32
 */
function disconnectESP32() {
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    console.log('Disconnecting...');
    bluetoothDevice.gatt.disconnect();
  }
}

/**
 * Check if currently connected
 * @returns {boolean}
 */
function isConnected() {
  return bluetoothDevice && bluetoothDevice.gatt.connected;
}

// ============================================================================
// Data Transfer Functions
// ============================================================================

/**
 * Encode command into 5-byte format
 * @param {string} cmd - Command name ("extend_servo", "retract_servo", or "reset")
 * @param {string} args - Command arguments (for extend_servo/retract_servo: comma-separated face IDs 1-32)
 * @returns {Uint8Array} - 5-byte encoded command
 */
function encodeCommand(cmd, args = '') {
  const bytes = new Uint8Array(5);
  let commandBits = 0;
  let dataBits = 0;

  // Encode command (4 bits)
  if (cmd === 'extend_servo') {
    commandBits = 0b0010; 
  } else if (cmd === 'retract_servo') {
    commandBits = 0b0001; 
  } else if (cmd === 'play_audio') {
      commandBits = 0b0100; 
  } else if (cmd === 'reset') {
    commandBits = 0b1000;
  } else {
    throw new Error(`Unknown command: ${cmd}`);
  }

  // Encode data (32 bits) - for extend_servo and retract_servo
  if ((cmd === 'extend_servo' || cmd === 'retract_servo') && args) {
    // Parse comma-separated face IDs (1-32) and set corresponding bits (0-31)
    const faceIds = args
      .split(',')
      .map((id) => parseInt(id.trim()))
      .filter((id) => id >= 1 && id <= 32);
    for (const faceId of faceIds) {
      const bitIndex = faceId - 1;
      if (bitIndex >= 0 && bitIndex < 32) {
        dataBits |= 1 << bitIndex;
      }
    }
  }

  // Encode string args of an integer into the lower 20 bits for play_audio
  if (cmd == "play_audio" && args && /^\d+$/.test(args)) {
    const intVal = parseInt(args, 10);
    if (intVal >= 0 && intVal <= 0xFFFFF) {
      dataBits = intVal & 0xFFFFF;
    } else {
      throw new Error("Argument out of 20-bit unsigned int range (0-1048575)");
    }
  }

  // Pack into 5 bytes:
  // Byte 0: [command 0-3][data 0-3] - 4 bits command, 4 bits data (bits 0-3)
  // Byte 1: [data 4-11] - 8 bits data (bits 4-11)
  // Byte 2: [data 12-19] - 8 bits data (bits 12-19)
  // Byte 3: [data 20-27] - 8 bits data (bits 20-27)
  // Byte 4: [data 28-31] - 4 bits data (bits 28-31), upper 4 bits unused
  bytes[0] = (commandBits & 0x0f) | ((dataBits & 0x0f) << 4);
  bytes[1] = (dataBits >> 4) & 0xff;
  bytes[2] = (dataBits >> 12) & 0xff;
  bytes[3] = (dataBits >> 20) & 0xff;
  bytes[4] = (dataBits >> 28) & 0x0f;

  return bytes;
}


/**
 * Send command to ESP32 in compressed 5-byte format
 * @param {string} cmd - Command name ("extend_servo", "retract_servo", or "reset")
 * @param {string} args - Command arguments (for extend_servo/retract_servo: comma-separated face IDs 1-32)
 */
async function sendToESP32(cmd, args = '') {
  if (!charTx) {
    throw new Error('Not connected. Please connect first.');
  }

  const encoded = encodeCommand(cmd, args);
  await charTx.writeValue(encoded);
  console.log(
    `Sent to ESP32: ${cmd}${args ? ` (${args})` : ''}`,
    Array.from(encoded)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' '),
  );
}

/**
 * Handle incoming notification from ESP32
 * @param {Event} event
 */
function handleNotification(event) {
  const value = event.target.value; // DataView
  const text = new TextDecoder().decode(value.buffer);

  // Call user callback if set
  if (onDataReceived) {
    onDataReceived(text);
  }
}

/**
 * Handle disconnection event
 */
function handleDisconnection() {
  console.log('BLE device disconnected');
  bluetoothDevice = null;
  bleServer = null;
  charRx = null;
  charTx = null;
  window.dispatchEvent(new CustomEvent('ble-connection-changed', { detail: { connected: false } }));
}

// ============================================================================
// Export functions
// ============================================================================

window.BLE = {
  connect: connectESP32,
  disconnect: disconnectESP32,
  send: sendToESP32,
  isConnected: isConnected,
  sleep: sleep,
};
