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
