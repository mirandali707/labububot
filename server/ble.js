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
 * Send message to ESP32
 * @param {string} msg - message to send to ESP32
 */
async function sendToESP32(msg) {
  if (!charTx) {
    throw new Error('Not connected. Please connect first.');
  }

  // Ensure the message is sent as an ArrayBuffer/TypedArray
  const encoder = new TextEncoder();
  const data = encoder.encode(String(msg));
  await charTx.writeValue(data);
  console.log(`Sent to ESP32: ${msg}`);
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
