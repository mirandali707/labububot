// DOM Elements
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM loaded");
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

    // Parse quaternion from IMU data string
    function parseQuaternion(data) {
        const quatMatch = data.match(/\/quat\/([\d.-]+)\/([\d.-]+)\/([\d.-]+)\/([\d.-]+)/);
        if (quatMatch) {
            const x = parseFloat(quatMatch[1]);
            const y = parseFloat(quatMatch[2]);
            const z = parseFloat(quatMatch[3]);
            const w = parseFloat(quatMatch[4]);
            return { x, y, z, w };
        }
        return null;
    }

    // Parse gravity vector from IMU data string
    function parseGravity(data) {
        const gravMatch = data.match(/\/grav\/([\d.-]+)\/([\d.-]+)\/([\d.-]+)/);
        if (gravMatch) {
            const x = parseFloat(gravMatch[1]);
            const y = parseFloat(gravMatch[2]);
            const z = parseFloat(gravMatch[3]);
            return { x, y, z };
        }
        return null;
    }

    // Callback for received data
    function handleDataReceived(text) {
        // console.log('Data received:', text);
        retrievedValue.innerHTML = text;
        
        // Parse and apply quaternion rotation
        const quat = parseQuaternion(text);
        if (quat && window.updateMeshRotation) {
            const quaternion = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
            window.updateMeshRotation(quaternion);
        }

        // Parse and apply gravity vector
        const grav = parseGravity(text);
        if (grav && window.updateGravityVector) {
            window.updateGravityVector(grav.x, grav.y, grav.z);
        }
    }
});
