let pingArr = [];
// let avgPingTime = 0;
// let numPingsReceived = 0;

// DOM Elements
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM loaded");
    const connectButton = document.getElementById('connectBleButton');
    const disconnectButton = document.getElementById('disconnectBleButton');
    const bleStateContainer = document.getElementById('bleState');

    const nInput= document.getElementById('nInput');
    const sendButton = document.getElementById('sendButton');
    const pingState = document.getElementById('pingState');
    // const avgPingTime= document.getElementById('avgPingTime');
    const pingTimes = document.getElementById('pingTimes');

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

    // Send pings button
    sendButton.addEventListener('click', async () => {
        pingState.innerHTML = "pinging, please wait...";
        sendButton.disabled = true;

        const nPings = nInput.value;

        await sendOnePing(); 
        for (let i = 1; i < nPings; i++) {
            await sleep(1000); // delay for a second to give ping time to come back
            await sendOnePing();
        }

        pingState.innerHTML = "send pings! ping ping";
        sendButton.disabled = false;
    });

    async function sendOnePing() {
        // send current timestamp to the ESP32
        try {
            await BLE.send(String(Date.now() >>> 0)); // truncate Date.now() to uint_32t lol
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message: ' + error.message);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


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
        const pingReceived = Date.now() >>> 0; // truncate
        const pingSent = Number(text); // text is the result of String(Date.now()) from when ping was sent
        console.log("PIIING")
        console.log(pingReceived);
        console.log(pingSent);
        const pingDuration = pingReceived - pingSent;

        console.log('Data received:', text);
        console.log("ping duration ", pingDuration);

        pingArr.push(pingDuration);
        pingTimes.innerHTML = pingArr.toString();

        // numPingsReceived++;
        // if (numPingsReceived == 1){
        // blaaaaa maybe moving average stuff
        // }
    }
});
