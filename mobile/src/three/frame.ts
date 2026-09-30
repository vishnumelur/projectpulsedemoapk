import * as THREE from 'three';

/** Camera framing derived from a model's bounding box, so every model sits fully inside the view.
 *
 *  Screens describe their framing the way it was tuned (and approved) for the villa: a radius, a target and a camera
 *  height. `frameFor` maps that onto any model: it fits each box into the view over a full turn of the turntable, and
 *  scales the villa's approved framing by the ratio of the two fits. The villa therefore keeps its exact look, and every
 *  other model gets the same visual size and centring relative to its own bounds. */

export type Frame = { radius: number; target: [number, number, number]; height: number };
export type Fit = { d: number; center: THREE.Vector3 };

/** Bounds of a finished model: the solid building plus its plot, without the soft contact-shadow plane (flagged
 *  `noBounds`), which is far wider than anything visible. Measured at build time, before any rise animation. */
export function modelBox(root: THREE.Object3D): THREE.Box3 {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3(), b = new THREE.Box3();
  root.traverse((o: any) => {
    if (!o.isMesh || o.userData.noBounds) return;
    let p = o.parent; while (p) { if (p.userData.stageVariant) return; p = p.parent; }
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); box.union(b);
  });
  return box;
}

const YAWS = 24;
/** The smallest camera distance (for the turntable used in Scene: camera at target + (sin yaw·d, height·d, cos yaw·d))
 *  at which all eight corners of `box` stay inside the frustum, for every yaw. Closed form per corner and axis:
 *  |offset along the screen axis| <= tan(half fov) · depth, with depth = d + (corner · view direction). */
export function fitBox(box: THREE.Box3, height: number, aspect: number, fovDeg = 22, at?: THREE.Vector3): Fit {
  const center = at ?? box.getCenter(new THREE.Vector3());
  const tv = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2), th = tv * aspect;
  const corners: THREE.Vector3[] = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z])
    corners.push(new THREE.Vector3(x, y, z).sub(center));
  const f = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  let d = 0;
  for (let k = 0; k < YAWS; k++) {
    const yaw = (k / YAWS) * Math.PI * 2;
    f.set(-Math.sin(yaw), -height, -Math.cos(yaw)).normalize(); // camera -> target
    right.crossVectors(f, Y).normalize(); up.crossVectors(right, f).normalize();
    for (const c of corners) {
      const along = c.dot(f);
      d = Math.max(d, Math.abs(c.dot(up)) / tv - along, Math.abs(c.dot(right)) / th - along);
    }
  }
  // Scene places the camera at distance d·sqrt(1 + height²) from the target (d is the horizontal distance).
  return { d: d / Math.sqrt(1 + height * height), center };
}

/** The horizontal camera distance Scene uses for a framing radius (unchanged from the approved turntable). */
export function radiusDistance(radius: number, aspect: number, fovDeg = 22): number {
  if (!(aspect > 0) || !Number.isFinite(aspect)) aspect = 1;
  const vh = THREE.MathUtils.degToRad(fovDeg) / 2, hh = Math.atan(Math.tan(vh) * aspect);
  return Math.max(radius / Math.tan(vh), radius / Math.tan(hh));
}

/** Breathing room kept round every model other than the approved villa: its whole box (plot included) stays inside
 *  this fraction of the view at every turntable angle. */
export const PAD = 1.1;

/** Maps a screen's villa framing `ref` onto a model: the same zoom relative to the fitted distance, the same target
 *  offset from the box centre (in units of the fit), and the model's own camera height relative to the villa's.
 *  The villa itself gets exactly `ref` (approved). Any other model is never closer than a padded fit around the
 *  actual target, so nothing (top, base or sides) is ever cut, however tall or wide it is. */
export function frameFor(ref: Frame, refBox: THREE.Box3, refHeight: number, box: THREE.Box3, height: number, aspect: number, isRef = false) {
  if (!(aspect > 0) || !Number.isFinite(aspect)) aspect = 1; // unlaid-out canvas: 0, NaN or Infinity
  if (isRef) return { distance: radiusDistance(ref.radius, aspect), target: ref.target, height: ref.height };
  const h = ref.height * (height / refHeight);
  const a = fitBox(refBox, ref.height, aspect), b = fitBox(box, h, aspect);
  const zoom = radiusDistance(ref.radius, aspect) / a.d, s = b.d / a.d;
  const t = new THREE.Vector3(...ref.target).sub(a.center).multiplyScalar(s).add(b.center);
  const safe = fitBox(box, h, aspect, 22, t).d * PAD;
  return { distance: Math.max(zoom * b.d, safe), target: [t.x, t.y, t.z] as [number, number, number], height: h };
}
