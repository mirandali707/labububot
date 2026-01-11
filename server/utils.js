function addDodecahedronFaceNormals(mesh, scene, options = {}) {
  const {
    normalLength = 0.4,
    color = 0xff0000,
    epsilon = 1e-4
  } = options;

  const geom = mesh.geometry.clone();
  geom.computeVertexNormals();

  const pos = geom.attributes.position.array;
  const triangles = [];

  // 1. Compute triangle normals + centroids
  for (let i = 0; i < pos.length; i += 9) {
    const a = new THREE.Vector3(pos[i],     pos[i+1], pos[i+2]);
    const b = new THREE.Vector3(pos[i + 3], pos[i+4], pos[i+5]);
    const c = new THREE.Vector3(pos[i + 6], pos[i+7], pos[i+8]);

    const centroid = new THREE.Vector3()
      .add(a).add(b).add(c)
      .multiplyScalar(1 / 3);

    const normal = new THREE.Vector3()
      .subVectors(b, a)
      .cross(new THREE.Vector3().subVectors(c, a))
      .normalize();

    triangles.push({ normal, centroid });
  }

  // 2. Cluster triangles by normal direction (3 triangles per face)
  const faces = [];

  triangles.forEach(tri => {
    let found = false;

    for (const face of faces) {
      if (tri.normal.dot(face.normal) > 1 - epsilon) {
        face.triangles.push(tri);
        found = true;
        break;
      }
    }

    if (!found) {
      faces.push({
        normal: tri.normal.clone(),
        triangles: [tri]
      });
    }
  });

  // Sanity check
  if (faces.length !== 12) {
    console.warn(`Expected 12 faces, found ${faces.length}`);
  }

  // 3. Compute face centers and render normals
  faces.forEach(face => {
    const center = new THREE.Vector3();
    face.triangles.forEach(t => center.add(t.centroid));
    center.multiplyScalar(1 / face.triangles.length);

    const arrow = new THREE.ArrowHelper(
      face.normal,
      center,
      normalLength,
      color
    );

    mesh.add(arrow); // attach to mesh so it rotates with IMU
  });
}

window.addDodecahedronFaceNormals = addDodecahedronFaceNormals;