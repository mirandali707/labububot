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

function setupCalibrationUI() {
  const statusEl  = document.getElementById('calibStatus');
  const captureEl = document.getElementById('calibCaptureBtn');
  const solveEl   = document.getElementById('calibSolveBtn');
  const resetEl   = document.getElementById('calibResetBtn');
  if (!statusEl || !captureEl) return;   // no panel on this page

  const prev = new THREE.Quaternion();
  let stillFrames = 0;
  const STILL_RAD = 0.006;   // ~0.35°/sample = "not moving"
  const STILL_NEED = 5;      // ~0.5s of stillness before capture enables
  const isStill = () => stillFrames >= STILL_NEED;

  function render() {
    const n = window.calibSampleCount || 0;
    const face = window.bottomFaceNumber;

    captureEl.textContent =
      n === 0 ? 'Capture first face' :
      n === 1 ? 'Capture second face (a different one)' :
                'Capture another face (optional)';
    captureEl.disabled = !isStill() || face == null;

    solveEl.style.display = n >= 2 ? '' : 'none';
    resetEl.style.display = n >= 1 ? '' : 'none';

    const facePart = face == null ? 'no face detected' : `face ${face} down`;
    const movePart = !isStill() ? ' — hold still…' : ' — steady, ready';
    statusEl.textContent = window.calibStatusMsg || (facePart + movePart);
  }

  captureEl.addEventListener('click', () => {
    window.calibStatusMsg = null;
    window.calibCapture();
    render();
  });
  solveEl.addEventListener('click', () => { window.calibSolve(); render(); });
  resetEl.addEventListener('click', (e) => {
    e.preventDefault(); window.calibReset(); render();
  });

  // stillness poll — reads the pre-offset quaternion the viz publishes
  setInterval(() => {
    const q = window.imuRawQuat;
    if (q) {
      stillFrames = prev.angleTo(q) < STILL_RAD ? stillFrames + 1 : 0;
      prev.copy(q);
    }
    // clear a stale "captured/solved" message once you start moving again
    if (!isStill() && window.calibStatusMsg && /captured|solved|cleared/.test(window.calibStatusMsg))
      window.calibStatusMsg = null;
    render();
  }, 100);
}


document.addEventListener("DOMContentLoaded", (event) => {
    setupCalibrationUI();

    // Bottom face display: update when threejs dispatches event
    const bottomSpan = document.getElementById('bottomFaceNumber');
    function updateBottomFace(face) {
        if (!bottomSpan) return;
        bottomSpan.textContent = (face === null || typeof face === 'undefined') ? '—' : String(face);
    }
    // Listen for event from threejs-viz
    window.addEventListener('bottomFaceChanged', (e) => {
        // IF FACE NUMBERS GET MESSED UP,
        // uncomment this and keep track of which (real) face is down. then change face_nums in threejs-viz.js with your new list
        // mapping indices (into face_nums) to real faces.
        // console.log('down geometric index:', e.detail.index,
        //             '— currently mislabeled as', e.detail.face);
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