// DOM Elements
const connectButton = document.getElementById('connectBleButton');
const disconnectButton = document.getElementById('disconnectBleButton');
const retrievedValue = document.getElementById('valueContainer');
const bleStateContainer = document.getElementById('bleState');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Connect Button
connectButton.addEventListener('click', async (event) => {
    try {
    await BLE.connect(handleDataReceived);
    console.log('Connected successfully');
    } catch (error) {
    console.error('Failed to connect:', error);
    alert('Failed to connect to BLE device: ' + error.message);
    }
});

// Disconnect Button
disconnectButton.addEventListener('click', () => {
    BLE.disconnect();
});

// Send Message Button
sendButton.addEventListener('click', async () => {
    const message = messageInput.value;
    if (message.trim()) {
    try {
        await BLE.send(message);
        messageInput.value = '';
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message: ' + error.message);
    }
    }
});

// Handle BLE connection state changes
window.addEventListener('ble-connection-changed', (event) => {
    if (event.detail.connected) {
    bleStateContainer.innerHTML = 'Connected';
    bleStateContainer.style.color = '#24af37';
    } else {
    bleStateContainer.innerHTML = 'Disconnected';
    bleStateContainer.style.color = '#d13a30';
    }
});

// Callback for received data
function handleDataReceived(text) {
    console.log('Data received:', text);
    retrievedValue.innerHTML = text;
}