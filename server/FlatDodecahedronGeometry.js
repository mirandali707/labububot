// import { PolyhedronGeometry } from 'three/src/geometries/PolyhedronGeometry.js';
import { PolyhedronGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';


/**
 * A dodecahedron geometry oriented so that one pentagonal face sits flat on
 * the XZ plane — i.e. the top and bottom faces have their normals aligned with
 * the ±Y axis.
 *
 * THREE's stock DodecahedronGeometry leaves the shape in its "natural" Platonic
 * orientation where the Y axis pierces a mid-edge.  This class applies a
 * closed-form X-axis rotation of (π − arctan(1/φ)) to the vertex positions
 * before passing them to PolyhedronGeometry, so no runtime quaternion /
 * Object3D rotation is needed.
 *
 * Usage is identical to THREE.DodecahedronGeometry:
 *
 *   const geo = new FlatDodecahedronGeometry(1);
 *   const mesh = new THREE.Mesh(geo, material);
 *   scene.add(mesh);   // bottom face is already parallel to XZ
 *
 * @augments PolyhedronGeometry
 */
class FlatDodecahedronGeometry extends PolyhedronGeometry {

  /**
   * @param {number} [radius=1] - Circumradius of the dodecahedron.
   * @param {number} [detail=0] - Subdivision level (>0 no longer a true dodecahedron).
   */
  constructor( radius = 1, detail = 0 ) {

    // ── Golden-ratio constants ───────────────────────────────────────────────
    const φ = ( 1 + Math.sqrt( 5 ) ) / 2;  // ≈ 1.6180
    const r = 1 / φ;                         // ≈ 0.6180  (1/φ)

    // ── Rotation angle ───────────────────────────────────────────────────────
    // The stock geometry's top-face normal is (0, sin θ_top, cos θ_top) where
    // θ_top = arctan(1/φ) ≈ 31.717°.  To map that normal to +Y we rotate around
    // X by −arctan(1/φ).  We want the bottom face parallel to XZ (normal = −Y),
    // so we go the other way: rotate by π − arctan(1/φ).
    const tilt  = Math.atan( r );               // arctan(1/φ) ≈ 0.5536 rad
    const angle = Math.PI - tilt;               // ≈ 2.5880 rad

    const cosA = Math.cos( angle );             //  cos(π − tilt) = −cos(tilt)
    const sinA = Math.sin( angle );             //  sin(π − tilt) =  sin(tilt)

    // ── Helper: rotate a vertex around the X axis ────────────────────────────
    const rx = ( x, y, z ) => [
      x,
      y * cosA - z * sinA,
      y * sinA + z * cosA,
    ];

    // ── Stock dodecahedron vertices (unit, unscaled) ─────────────────────────
    const raw = [
      [ -1, -1, -1 ], [ -1, -1,  1 ],
      [ -1,  1, -1 ], [ -1,  1,  1 ],
      [  1, -1, -1 ], [  1, -1,  1 ],
      [  1,  1, -1 ], [  1,  1,  1 ],

      [  0, -r, -φ ], [  0, -r,  φ ],
      [  0,  r, -φ ], [  0,  r,  φ ],

      [ -r, -φ,  0 ], [ -r,  φ,  0 ],
      [  r, -φ,  0 ], [  r,  φ,  0 ],

      [ -φ,  0, -r ], [  φ,  0, -r ],
      [ -φ,  0,  r ], [  φ,  0,  r ],
    ];

    // ── Rotate every vertex and flatten to the array PolyhedronGeometry wants ─
    const vertices = raw.flatMap( ( [ x, y, z ] ) => rx( x, y, z ) );

    // ── Face indices (unchanged from THREE.DodecahedronGeometry) ─────────────
    const indices = [
      3, 11,  7,    3,  7, 15,    3, 15, 13,
      7, 19, 17,    7, 17,  6,    7,  6, 15,
     17,  4,  8,   17,  8, 10,   17, 10,  6,
      8,  0, 16,    8, 16,  2,    8,  2, 10,
      0, 12,  1,    0,  1, 18,    0, 18, 16,
      6, 10,  2,    6,  2, 13,    6, 13, 15,
      2, 16, 18,    2, 18,  3,    2,  3, 13,
     18,  1,  9,   18,  9, 11,   18, 11,  3,
      4, 14, 12,    4, 12,  0,    4,  0,  8,
     11,  9,  5,   11,  5, 19,   11, 19,  7,
     19,  5, 14,   19, 14,  4,   19,  4, 17,
      1, 12, 14,    1, 14,  5,    1,  5,  9,
    ];

    super( vertices, indices, radius, detail );

    this.type = 'FlatDodecahedronGeometry';

    this.parameters = { radius, detail };

  }

  static fromJSON( { radius, detail } ) {

    return new FlatDodecahedronGeometry( radius, detail );

  }

}

export { FlatDodecahedronGeometry };