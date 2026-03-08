// Minimal Three.js sketch: renders a single dodecahedron
import { FlatDodecahedronGeometry } from './FlatDodecahedronGeometry.js';

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

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(3, 2.5, 3);
    camera.lookAt(0, 0, 0);

    // OrbitControls (requires OrbitControls script included in the page)
    let controls;
    // if (THREE.OrbitControls) {
    //   controls = new THREE.OrbitControls(camera, renderer.domElement);
    //   controls.enableDamping = true;
    //   controls.dampingFactor = 0.05;
    //   controls.screenSpacePanning = false;
    //   controls.minDistance = 1;
    //   controls.maxDistance = 10;
    //   controls.target.set(0, 0, 0);
    //   controls.update();
    // }
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.target.set(0, 0, 0); // Look at origin

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const radius = 1.0;
    const geom = new FlatDodecahedronGeometry(radius);
    geom.computeVertexNormals(); 

    // Colors: default and highlight
    const defaultColor = new THREE.Color(0xfa87ce);
    const highlightColor = new THREE.Color(0x00ff00);

    // Use vertex colors so we can color faces individually
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    // Compute face centers, normals and triangle vertex indices grouped by face
    const positions = geom.attributes.position.array;
    const faceGroups = {}; // key -> { centers: [], normals: [], triangles: [] }
    if (geom.index) {
      const indices = geom.index.array;
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i], b = indices[i+1], c = indices[i+2];
        const va = new THREE.Vector3(positions[a*3], positions[a*3+1], positions[a*3+2]);
        const vb = new THREE.Vector3(positions[b*3], positions[b*3+1], positions[b*3+2]);
        const vc = new THREE.Vector3(positions[c*3], positions[c*3+1], positions[c*3+2]);
        const center = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
        const normal = new THREE.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va)).normalize();
        const key = `${Math.round(normal.x*1000)},${Math.round(normal.y*1000)},${Math.round(normal.z*1000)}`;
        if (!faceGroups[key]) faceGroups[key] = { centers: [], normals: [], triangles: [] };
        faceGroups[key].centers.push(center);
        faceGroups[key].normals.push(normal);
        faceGroups[key].triangles.push([a, b, c]);
      }
    } else {
      for (let i = 0; i < positions.length; i += 9) {
        const aIndex = (i / 3);
        const bIndex = aIndex + 1;
        const cIndex = aIndex + 2;
        const va = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
        const vb = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
        const vc = new THREE.Vector3(positions[i+6], positions[i+7], positions[i+8]);
        const center = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
        const normal = new THREE.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va)).normalize();
        const key = `${Math.round(normal.x*1000)},${Math.round(normal.y*1000)},${Math.round(normal.z*1000)}`;
        if (!faceGroups[key]) faceGroups[key] = { centers: [], normals: [], triangles: [] };
        faceGroups[key].centers.push(center);
        faceGroups[key].normals.push(normal);
        faceGroups[key].triangles.push([aIndex, bIndex, cIndex]);
      }
    }

    const faceCenters = Object.values(faceGroups).map(group => {
      const sum = group.centers.reduce((acc, c) => acc.add(c.clone()), new THREE.Vector3());
      return sum.divideScalar(group.centers.length);
    });

    // Average normals per face group
    const faceNormals = Object.values(faceGroups).map(group => {
      const sumN = group.normals.reduce((acc, n) => acc.add(n.clone()), new THREE.Vector3());
      return sumN.divideScalar(group.normals.length).normalize();
    });

    // Keep triangles per face so we can color their vertices later
    const faceTriangles = Object.values(faceGroups).map(group => group.triangles);

    // Face numbering mapping (corresponds to faceCenters order)
    const face_nums = [9, 8, 7, 11, 3, 12, 10, 4, 2, 5, 6, 1];

    // Expose bottom face number globally (initially unknown)
    window.bottomFaceNumber = null;

    // Prepare a color attribute (one color per vertex)
    const colors = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      colors[i] = defaultColor.r;
      colors[i+1] = defaultColor.g;
      colors[i+2] = defaultColor.b;
    }
    const colorAttr = new THREE.BufferAttribute(colors, 3);
    geom.setAttribute('color', colorAttr);
    let highlightedFaceIndex = -1;

    function setFaceColors(highlightIndex) {
      // reset to default
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = defaultColor.r;
        colors[i+1] = defaultColor.g;
        colors[i+2] = defaultColor.b;
      }
      if (highlightIndex >= 0) {
        const tris = faceTriangles[highlightIndex];
        for (let t = 0; t < tris.length; t++) {
          const tri = tris[t];
          for (let vi = 0; vi < 3; vi++) {
            const vIndex = tri[vi];
            colors[vIndex * 3] = highlightColor.r;
            colors[vIndex * 3 + 1] = highlightColor.g;
            colors[vIndex * 3 + 2] = highlightColor.b;
          }
        }
      }
      colorAttr.needsUpdate = true;
      highlightedFaceIndex = highlightIndex;
      // Update global bottom-face variable and notify listeners
      window.bottomFaceNumber = (highlightIndex >= 0 && typeof face_nums !== 'undefined') ? face_nums[highlightIndex] : null;
      try {
        window.dispatchEvent(new CustomEvent('bottomFaceChanged', { detail: { face: window.bottomFaceNumber } }));
      } catch (e) {
        // ignore if environment doesn't support CustomEvent
      }
    }

    // Add face labels
    faceCenters.forEach((center, index) => {
      const label = createTextSprite(face_nums[index], 0x000000);
      label.position.copy(center).multiplyScalar(1.05); // slightly outside the surface
      mesh.add(label);
    });

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
      // Rotate -90 degrees around X (swap Y/Z)
      const yzSwap = new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
      quaternion.premultiply(yzSwap);

      // Rotate +90 degrees around Y (swap X/Z)
      const xzSwap = new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      quaternion.premultiply(xzSwap);

      // Flip upside-down (180° around X)
      const flip = new THREE.Quaternion()
        .setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
      quaternion.premultiply(flip);

      mesh.quaternion.copy(quaternion);
    };

    // Expose function to update gravity vector
    window.updateGravityVector = function(gx, gy, gz) {
      const gravityMagnitude = Math.sqrt(gx * gx + gy * gy + gz * gz);
      // // World gravity direction
      // const worldDir = new THREE.Vector3(gx, gy, gz).normalize();
      // Keep previous arrow behavior (rotate gravity by mesh quaternion for visualization)
      let direction = new THREE.Vector3(gx, gy, gz).normalize();
      direction.applyQuaternion(mesh.quaternion);
      // Transform each face normal into world/global space and compare with gravity
      let bestIndex = -1;
      let bestDot = -Infinity;
      for (let i = 0; i < (faceNormals ? faceNormals.length : 0); i++) {
        const globalNormal = faceNormals[i].clone().applyQuaternion(mesh.quaternion).normalize();
        const d = globalNormal.dot(direction);
        if (d > bestDot) {
          bestDot = d;
          bestIndex = i;
        }
      }
      if (bestIndex !== highlightedFaceIndex) {
        setFaceColors(bestIndex);
      }

      gravityArrow.setDirection(direction);
      gravityArrow.setLength(Math.min(gravityMagnitude / 100, 3)); // Scale for visualization
    };

    function animate() {
      requestAnimationFrame(animate);
      // if (controls) controls.update();
      controls.update();
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