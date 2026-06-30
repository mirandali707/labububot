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

// Send a sweep command using the currently-detected top face
async function sendGopherCommand() {
    const face = window.topFaceNumber;
    if (face === null || typeof face === 'undefined') {
        alert('No top face detected yet.');
        return;
    }
    const message = `sweep/${face}`;
    try {
        await BLE.send(message);
    } catch (error) {
        console.error('Failed to send gopher message:', error);
        alert('Failed to send gopher message: ' + error.message);
    }
}

function toggleContinuousRoll() {
    const continuousRollOn = window.continuousRollOn || false;
    // flip tha switch
    window.continuousRollOn = !continuousRollOn;
    console.log("continuous roll mode toggled to", window.continuousRollOn);

    const modeSpan = document.getElementById('currentMode');
    if (!modeSpan) return;
    if (window.continuousRollOn){
        window.gopherModeOn = false; // modes are mutually exclusive
        modeSpan.textContent = "roll";
        sendRollCommand();
    } else {
        modeSpan.textContent = "none";
    }
}

function toggleGopherMode() {
    const gopherModeOn = window.gopherModeOn || false;
    // flip tha switch
    window.gopherModeOn = !gopherModeOn;
    console.log("gopher mode toggled to", window.gopherModeOn);

    const modeSpan = document.getElementById('currentMode');
    if (!modeSpan) return;
    if (window.gopherModeOn){
        window.continuousRollOn = false; // modes are mutually exclusive
        modeSpan.textContent = "gopher";
        sendGopherCommand();
    } else {
        modeSpan.textContent = "none";
    }
}

document.addEventListener("DOMContentLoaded", (event) => {
    // Bottom face display: update when threejs dispatches event
    const bottomSpan = document.getElementById('bottomFaceNumber');
    function updateBottomFace(face) {
        if (!bottomSpan) return;
        bottomSpan.textContent = (face === null || typeof face === 'undefined') ? '—' : String(face);
    }
    // Top face display: update when threejs dispatches event
    const topSpan = document.getElementById('topFaceNumber');
    function updateTopFace(face) {
        if (!topSpan) return;
        topSpan.textContent = (face === null || typeof face === 'undefined') ? '—' : String(face);
    }
    // In continuous roll mode, skip a sweep if one is still in flight so we
    // always act on the current bottom face rather than queuing stale ones.
    let sweepBusy = false;
    // Listen for event from threejs-viz
    window.addEventListener('bottomFaceChanged', (e) => {
        // IF FACE NUMBERS GET MESSED UP,
        // uncomment this and keep track of which (real) face is down. then change face_nums in threejs-viz.js with your new list
        // mapping indices (into face_nums) to real faces.
        // console.log('down geometric index:', e.detail.index,
        //             '— currently mislabeled as', e.detail.face);
        updateBottomFace(e.detail.face);
        if (window.continuousRollOn){
            // continuous roll is on, sweep new bottom face
            const face = e.detail.face;
            if (face !== null && typeof face !== 'undefined' && !sweepBusy) {
                sweepBusy = true;
                sendSweepCommand(face).finally(() => { sweepBusy = false; });
            }
        }
    });
    // Listen for top face event from threejs-viz
    window.addEventListener('topFaceChanged', (e) => {
        updateTopFace(e.detail.face);
        if (window.gopherModeOn){
            // gopher mode is on, sweep new top face
            const face = e.detail.face;
            if (face !== null && typeof face !== 'undefined' && !sweepBusy) {
                sweepBusy = true;
                sendSweepCommand(face).finally(() => { sweepBusy = false; });
            }
        }
    });
    // If value already present on window, initialize display
    if (typeof window.bottomFaceNumber !== 'undefined') updateBottomFace(window.bottomFaceNumber);
    if (typeof window.topFaceNumber !== 'undefined') updateTopFace(window.topFaceNumber);

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