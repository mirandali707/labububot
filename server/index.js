async function sendSweepCommand(faceId) {
    const message = `sweep/${faceId}`;
    try {
        await BLE.send(message);
        messageInput.value = '';
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message: ' + error.message);
    }
}

// Send a roll command using the currently-detected bottom face
async function sendRollCommand() {
    const face = window.bottomFaceNumber;
    if (face === null || typeof face === 'undefined') {
        alert('No bottom face detected yet.');
        return;
    }
    const message = `sweep/${face}`;
    try {
        await BLE.send(message);
    } catch (error) {
        console.error('Failed to send roll message:', error);
        alert('Failed to send roll message: ' + error.message);
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    // Bottom face display: update when threejs dispatches event
    const bottomSpan = document.getElementById('bottomFaceNumber');
    function updateBottomFace(face) {
        if (!bottomSpan) return;
        bottomSpan.textContent = (face === null || typeof face === 'undefined') ? '—' : String(face);
    }
    // Listen for event from threejs-viz
    window.addEventListener('bottomFaceChanged', (e) => {
        updateBottomFace(e.detail.face);
    });
    // If value already present on window, initialize display
    if (typeof window.bottomFaceNumber !== 'undefined') updateBottomFace(window.bottomFaceNumber);

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
});