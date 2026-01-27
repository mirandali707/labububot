// Minimal Three.js sketch: renders a single dodecahedron

(() => {
  const canvasId = 'threeCanvas';
  // Wait for DOM
  function init() {
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      // canvas.style.width = '1vw'; // i hate css. im convused. maybe a TODO for later to figure out how to actually resize the canvas...
      // canvas.style.height = '1vh';
      document.body.appendChild(canvas);
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);
    
    // Make scene globally accessible for modules
    window.scene = scene;

    // Coordinate system helper (axes)
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Add axis labels
    addAxisLabels();    

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(3, 2.5, 3);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const radius = 1.0;
    const geom = new THREE.DodecahedronGeometry(radius);
    geom.computeVertexNormals(); 
    const mat = new THREE.MeshStandardMaterial({ color: 0xfa87ce, flatShading: true });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    // Create arrow helper for gravity vector
    const gravityArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      1,
      0x0000ff
    );
    scene.add(gravityArrow);

    function onResize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    addDodecahedronFaceNormals(mesh, scene);

    // Expose function to update mesh rotation based on quaternion
    window.updateMeshRotation = function(quaternion) {
      mesh.quaternion.copy(quaternion);
    };

    // Expose function to update gravity vector
    window.updateGravityVector = function(gx, gy, gz) {
      const gravityMagnitude = Math.sqrt(gx * gx + gy * gy + gz * gz);
      const direction = new THREE.Vector3(gx, gy, gz).normalize();
      gravityArrow.setDirection(direction);
      gravityArrow.setLength(Math.min(gravityMagnitude / 100, 3)); // Scale for visualization
    };

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Function to add axis labels
function addAxisLabels() {
  const axisLength = 2;
  const labelOffset = 0.3; // Distance from axis end

  // +X axis (red)
  const plusXLabel = createTextSprite('+X', 0xff0000);
  plusXLabel.position.set(axisLength + labelOffset, 0, 0);
  scene.add(plusXLabel);

  // -X axis
  const minusXLabel = createTextSprite('-X', 0xff0000);
  minusXLabel.position.set(-axisLength - labelOffset, 0, 0);
  scene.add(minusXLabel);

  // +Y axis (green)
  const plusYLabel = createTextSprite('+Y', 0x00ff00);
  plusYLabel.position.set(0, axisLength + labelOffset, 0);
  scene.add(plusYLabel);

  // -Y axis
  const minusYLabel = createTextSprite('-Y', 0x00ff00);
  minusYLabel.position.set(0, -axisLength - labelOffset, 0);
  scene.add(minusYLabel);

  // +Z axis (blue)
  const plusZLabel = createTextSprite('+Z', 0x0000ff);
  plusZLabel.position.set(0, 0, axisLength + labelOffset);
  scene.add(plusZLabel);

  // -Z axis
  const minusZLabel = createTextSprite('-Z', 0x0000ff);
  minusZLabel.position.set(0, 0, -axisLength - labelOffset);
  scene.add(minusZLabel);
}

// Function to create a text sprite
function createTextSprite(text, color = 0x000000) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 128;

  context.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparent background
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'Bold 64px Arial';
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5, 0.5, 1);

  return sprite;
}