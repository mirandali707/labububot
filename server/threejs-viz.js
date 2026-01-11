// Minimal Three.js sketch: renders a single dodecahedron

(() => {
  const canvasId = 'threeCanvas';
  // Wait for DOM
  function init() {
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      document.body.appendChild(canvas);
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

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

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    addDodecahedronFaceNormals(mesh, scene);

    function animate() {
      requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
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
