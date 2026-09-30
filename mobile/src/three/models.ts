// @ts-nocheck — procedural port of the approved design/3d/models.js
import * as THREE from 'three';
import { Platform } from 'react-native';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { noiseTex, stripeTex, contactTex } from './textures';
import { modelBox } from './frame';

const nz = noiseTex(), nzFine = noiseTex(128, 190, 70, 10);

// expo-gl has no renderbufferStorageMultisample, which three's transmission pass needs. On native, glass and water
// use plain transparency with a matching look instead of physical transmission.
const NATIVE = Platform.OS !== 'web';
const phys = (o, nativeOpacity) => new THREE.MeshPhysicalMaterial(NATIVE
  ? { ...o, transmission: 0, thickness: 0, transparent: true, opacity: nativeOpacity, depthWrite: false }
  : o);

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
export const M = {
  concrete: std(0xf2f0eb, { roughness: 0.78, bumpMap: nz, bumpScale: 0.6 }),
  concrete2: std(0xe2e0da, { roughness: 0.9, bumpMap: nz, bumpScale: 0.6 }),
  traver: std(0xdccfb8, { roughness: 0.62, bumpMap: nzFine, bumpScale: 0.8 }),
  paving: std(0xe9e4da, { roughness: 0.92, bumpMap: nzFine, bumpScale: 0.4 }),
  asphalt: std(0x8d9097, { roughness: 0.95, bumpMap: nzFine, bumpScale: 0.6 }),
  drive: std(0x7a7d84, { roughness: 0.9, bumpMap: nzFine, bumpScale: 0.5 }),
  lawn: std(0x9fbb82, { roughness: 1, bumpMap: nzFine, bumpScale: 1 }),
  hedge: std(0x6f8f55, { roughness: 1, bumpMap: nzFine, bumpScale: 2 }),
  frame: std(0x2b303b, { roughness: 0.32, metalness: 0.75 }),
  alu: std(0xc9cdd3, { roughness: 0.35, metalness: 0.8 }),
  champ: std(0xcdb898, { roughness: 0.38, metalness: 0.7 }),
  glass: phys({ color: 0xdff4ff, roughness: 0.02, metalness: 0, transmission: 0.88, thickness: 0.25, ior: 1.5, envMapIntensity: 1.6, specularIntensity: 1 }, 0.42),
  glassDark: phys({ color: 0x7fa6c9, roughness: 0.05, metalness: 0.2, transmission: 0.35, thickness: 0.3, envMapIntensity: 1.8 }, 0.8),
  wood: std(0xa8744f, { roughness: 0.55, bumpMap: nzFine, bumpScale: 0.5 }),
  woodIn: std(0xc79a6d, { roughness: 0.6 }),
  water: phys({ color: 0x46cbea, roughness: 0.03, transmission: 0.25, thickness: 0.4, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2 }, 0.85),
  tile: std(0xbfeaf6, { roughness: 0.4 }),
  frond: new THREE.MeshStandardMaterial({ color: 0x5f8248, roughness: 0.85, side: THREE.DoubleSide }),
  trunk: std(0x8b6b4a, { roughness: 1, bumpMap: nzFine, bumpScale: 3 }),
  leaf: std(0x7f9f6c, { roughness: 0.95, flatShading: true }),
  blue: std(0x0000fe, { roughness: 0.35, metalness: 0.2 }),
  navy: std(0x16205a, { roughness: 0.55, metalness: 0.2 }),
  fabric: std(0x2a3570, { roughness: 1 }),
  white: std(0xfafafa, { roughness: 0.5 }),
  render: std(0xe8d9bd, { roughness: 0.95, bumpMap: nzFine, bumpScale: 1.2 }),
  cladding: std(0xd9dde2, { roughness: 0.42, metalness: 0.55, bumpMap: stripeTex(40, 6), bumpScale: 3 }),
  shutter: std(0x6c717a, { roughness: 0.5, metalness: 0.5, bumpMap: stripeTex(20, 1), bumpScale: 2 }),
  yellow: std(0xf2b705, { roughness: 0.45, metalness: 0.3 }),
  orange: std(0xd98a1c, { roughness: 0.5, metalness: 0.4 }),
  warm: new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffc46b, emissiveIntensity: 0.0, roughness: 1 }),
  bulb: new THREE.MeshStandardMaterial({ color: 0xfff3dd, emissive: 0xffc46b, emissiveIntensity: 1.2 }),
  ghost: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false }),
  line: new THREE.LineBasicMaterial({ color: 0x0000fe, transparent: true, opacity: 0.85 }),
  ghostLine: new THREE.LineDashedMaterial({ color: 0x0000fe, dashSize: 0.25, gapSize: 0.18 }),
};

// ---------- primitives ----------
/** RoundedBoxGeometry reports the unit BoxGeometry it starts from as its type/parameters, so its real shape is tagged
 *  here for the stage edge cache. */
/** They are also the costliest primitive to generate (a tower has 44 identical floor plates), so one instance per shape
 *  is shared by every mesh, model and remount. Disposing it on unmount only frees its GPU buffers; a later render
 *  re-uploads them. */
const RBOX = new Map<string, any>();
function rbox(w, h, d, s, r) {
  const key = `RoundedBox:${w},${h},${d},${s},${r}`;
  let g = RBOX.get(key);
  if (!g) { g = new RoundedBoxGeometry(w, h, d, s, r); g.userData.shape = key; g.computeBoundingBox(); RBOX.set(key, g); }
  return g;
}
export function part(parent, w, h, d, mat, x, y, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const r = o.round ?? 0;
  const geo = r > 0 ? rbox(w, h, d, 3, Math.min(r, w / 2.01, h / 2.01, d / 2.01)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat); m.position.y = h / 2;
  if (o.ry) g.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz;
  m.castShadow = o.cast !== false && mat !== M.glass; m.receiveShadow = true; g.add(m);
  g.userData.rise = o.rise ?? null; parent.add(g); return g;
}
function cyl(parent, r1, r2, h, mat, x, y, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, o.seg ?? 24), mat); m.position.y = h / 2; m.castShadow = true; m.receiveShadow = true; g.add(m);
  g.userData.rise = o.rise ?? null; parent.add(g); return g;
}
function bars(parent, from, to, step, fn, rise) {
  const g = new THREE.Group(); g.userData.rise = rise; parent.add(g);
  for (let v = from; v <= to + 1e-6; v += step) fn(g, v);
  return g;
}
function contact(root, w, d, op = 0.35) { // soft ambient-occlusion blob under a building
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: contactTex(op), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = -0.41; m.userData.noBounds = true; root.add(m);
}
function plot(root, w, d, mat = M.paving) {
  contact(root, w * 1.5, d * 1.6, 0.28);
  part(root, w, 0.4, d, mat, 0, -0.4, 0, { round: 0.12, cast: false });
}

// ---------- VILLA ----------
export function buildVilla() {
  const root = new THREE.Group(), solid = new THREE.Group(); root.add(solid);
  plot(root, 18, 13);
  part(root, 6.4, 0.05, 4.6, M.lawn, -5.6, 0, -3.7, { cast: false });
  part(root, 3.2, 0.03, 6.2, M.drive, -7.1, 0, 3.0, { cast: false });
  // boundary walls + hedge
  part(solid, 18, 1.0, 0.25, M.concrete2, 0, 0, -6.35, { rise: 1.05, round: 0.04 });
  part(solid, 0.25, 1.0, 12.4, M.concrete2, 8.88, 0, 0, { rise: 1.05, round: 0.04 });
  part(solid, 0.25, 1.0, 12.4, M.concrete2, -8.88, 0, 0, { rise: 1.05, round: 0.04 });
  part(solid, 7, 0.55, 0.6, M.hedge, -1.8, 0, 6.1, { rise: 1.1, round: 0.2 });
  // pool, deck, loungers, umbrella
  part(solid, 7.2, 0.1, 4.3, M.wood, 4.6, 0, 3.8, { rise: 0.9, cast: false });
  part(solid, 5.3, 0.2, 2.7, M.traver, 4.7, 0.02, 3.6, { rise: 0.92, round: 0.05, cast: false });
  part(solid, 4.7, 0.21, 2.1, M.water, 4.7, 0.03, 3.6, { rise: 0.95, cast: false });
  for (const lx of [3.2, 4.5]) { part(solid, 0.65, 0.18, 1.7, M.white, lx, 0.1, 5.35, { rise: 1.0, round: 0.06 }); part(solid, 0.65, 0.06, 0.6, M.white, lx, 0.28, 4.75, { rise: 1.0, rx: -0.6 }); }
  cyl(solid, 0.03, 0.03, 2.2, M.frame, 6.2, 0.1, 5.3, { rise: 1.0 });
  const um = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.4, 24, 1, true), M.white); um.position.set(6.2, 2.4, 5.3); um.castShadow = true; um.material.side = THREE.DoubleSide; const ug = new THREE.Group(); ug.userData.rise = 1.02; ug.add(um); solid.add(ug);
  // ground floor
  part(solid, 9.8, 0.3, 6.4, M.traver, -0.6, 0, 0, { rise: 0.0, round: 0.06 });
  const inner = new THREE.Group(); inner.userData.rise = 0.12; solid.add(inner);
  part(inner, 7.2, 0.04, 4.8, M.woodIn, 0.2, 0.3, 0.1, { cast: false });
  part(inner, 7.2, 3.0, 0.12, M.concrete, 0.2, 0.3, -2.2);
  part(inner, 2.3, 0.45, 0.95, M.fabric, 1.6, 0.34, 0.7, { round: 0.12 }); part(inner, 2.3, 0.45, 0.22, M.fabric, 1.6, 0.6, 0.28, { round: 0.08 });
  part(inner, 0.95, 0.45, 1.6, M.fabric, 0.2, 0.34, 0.45, { round: 0.12 });
  part(inner, 1.9, 0.92, 0.75, M.white, -1.6, 0.34, -0.9, { round: 0.04 });
  part(inner, 1.0, 0.04, 1.8, M.woodIn, 1.6, 0.8, 1.9, { cast: false });
  for (const bx of [-2.2, -1.6, -1.0]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), M.bulb); b.position.set(bx, 2.55, -0.9); inner.add(b); }
  const warmPanel = part(inner, 7.0, 0.04, 4.6, M.warm, 0.2, 3.2, 0.1, { cast: false });
  part(solid, 7.4, 3.0, 5.0, M.glass, 0.2, 0.3, 0.2, { rise: 0.15 });
  bars(solid, -3.5, 3.9, 1.235, (g, v) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.0, 0.08), M.frame); m.position.set(v, 1.8, 2.72); m.castShadow = true; g.add(m); }, 0.2);
  bars(solid, -2.3, 2.7, 1.25, (g, v) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.07), M.frame); m.position.set(3.92, 1.8, v); g.add(m); }, 0.2);
  part(solid, 2.4, 3.0, 6.0, M.traver, -4.3, 0.3, 0, { rise: 0.1, round: 0.05 });
  part(solid, 0.95, 2.4, 0.08, M.blue, -2.3, 0.3, 2.74, { rise: 0.3 });
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.08), M.bulb); lamp.position.set(-3.2, 2.1, 3.02); const lg = new THREE.Group(); lg.userData.rise = 0.3; lg.add(lamp); solid.add(lg);
  // terrace balustrade over ground floor front
  part(solid, 9.4, 1.0, 0.05, M.glass, -0.6, 3.3, 3.05, { rise: 0.55 });
  part(solid, 9.4, 0.05, 0.08, M.alu, -0.6, 4.3, 3.05, { rise: 0.55 });
  // upper floor
  part(solid, 10.8, 3.0, 4.9, M.concrete, 0.9, 3.3, -0.6, { rise: 0.4, round: 0.08 });
  part(solid, 8.6, 1.45, 0.1, M.glass, 1.5, 4.05, 1.87, { rise: 0.5 });
  const upIn = part(solid, 8.4, 1.45, 0.06, M.warm, 1.5, 4.05, 1.3, { rise: 0.5, cast: false });
  part(solid, 8.7, 0.07, 0.16, M.frame, 1.5, 4.0, 1.9, { rise: 0.5 }); part(solid, 8.7, 0.07, 0.16, M.frame, 1.5, 5.5, 1.9, { rise: 0.5 });
  bars(solid, -3.4, -0.4, 0.28, (g, v) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.5, 0.22), M.wood); m.position.set(v, 4.78, 2.02); m.castShadow = true; g.add(m); }, 0.55);
  part(solid, 0.1, 1.45, 3.4, M.glass, 6.32, 4.05, -0.6, { rise: 0.5 });
  part(solid, 11.3, 0.3, 5.5, M.concrete, 0.9, 6.3, -0.6, { rise: 0.6, round: 0.08 });
  part(solid, 5.4, 0.06, 4.6, M.wood, 3.6, 3.24, -0.6, { rise: 0.45, cast: false });
  // rooftop pergola
  bars(solid, -3.8, 0.2, 0.36, (g, v) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 3.8), M.wood); m.position.set(v, 7.9, -0.6); m.castShadow = true; g.add(m); }, 0.7);
  for (const [px, pz] of [[-3.8, -2.3], [-3.8, 1.1], [0.2, -2.3], [0.2, 1.1]]) cyl(solid, 0.06, 0.06, 1.3, M.frame, px, 6.6, pz, { rise: 0.68, seg: 8 });
  part(solid, 0.3, 6.9, 3.4, M.traver, -5.55, 0, -0.8, { rise: 0.25, round: 0.05 });
  // landscape
  return { root, solid, warm: M.warm, inner, upIn };
}

// ---------- TOWER ----------
export function buildTower() {
  const root = new THREE.Group(), solid = new THREE.Group(); root.add(solid);
  plot(root, 15, 15);
  part(solid, 10, 3.6, 10, M.glassDark, 0, 0, 0, { rise: 0, round: 0.2 });
  part(solid, 10.4, 0.4, 10.4, M.concrete, 0, 3.6, 0, { rise: 0.05, round: 0.1 });
  const n = 22;
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group(); g.position.y = 4 + i * 1.05; g.rotation.y = i * 0.035; g.userData.rise = 0.1 + i * 0.035; solid.add(g);
    const slab = new THREE.Mesh(rbox(6.2, 0.2, 6.2, 3, 0.09), M.white); slab.position.y = 0.1; slab.castShadow = slab.receiveShadow = true; g.add(slab);
    const gl = new THREE.Mesh(rbox(5.8, 0.85, 5.8, 3, 0.3), M.glassDark); gl.position.y = 0.625; g.add(gl);
    for (const [fx, fz] of [[2.95, 0], [-2.95, 0], [0, 2.95], [0, -2.95]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(fz ? 0.08 : 0.35, 0.85, fz ? 0.35 : 0.08), M.alu); f.position.set(fx, 0.625, fz); g.add(f); }
  }
  part(solid, 4.6, 1.6, 4.6, M.navy, 0, 4 + n * 1.05, 0, { rise: 0.9, round: 0.1, ry: n * 0.035 });
  cyl(solid, 0.05, 0.14, 4.5, M.alu, 0, 5.6 + n * 1.05, 0, { rise: 0.95, seg: 8 });
  part(solid, 5, 0.15, 2, M.water, 0, 0, 6, { rise: 0.9, cast: false });
  return { root, solid };
}

// ---------- helpers for new models ----------
const M2 = {
  solar: new THREE.MeshPhysicalMaterial({ color: 0x1b2a6b, roughness: 0.15, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.05 }),
  rubber: std(0x1d1f24, { roughness: 0.9 }),
  old: std(0xd8c39f, { roughness: 1, bumpMap: nzFine, bumpScale: 2.2 }),
  oldTrim: std(0xc7ad84, { roughness: 1, bumpMap: nzFine, bumpScale: 1.5 }),
  brick: std(0xb5654a, { roughness: 0.95, bumpMap: nzFine, bumpScale: 1.5 }),
  plank: std(0xc49a62, { roughness: 0.8 }),
  mesh: new THREE.MeshStandardMaterial({ color: 0x9aa1ab, roughness: 0.6, metalness: 0.6, transparent: true, opacity: 0.35 }),
  car1: std(0xf4f5f7, { roughness: 0.25, metalness: 0.5 }), car2: std(0x16205a, { roughness: 0.25, metalness: 0.5 }), car3: std(0xa9adb4, { roughness: 0.25, metalness: 0.7 }),
  hazard: std(0x222222, { roughness: 0.6 }),
};
function grp(parent, rise) { const g = new THREE.Group(); g.userData.rise = rise; parent.add(g); return g; }
function mesh(parent, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function archGeo(w, h, depth = 0.08) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0);
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 16 });
}
function car(parent, x, z, mat, ry = 0, rise = 1.0) {
  const g = grp(parent, rise); g.position.set(x, 0, z); g.rotation.y = ry;
  mesh(g, rbox(1.8, 0.62, 4.1, 3, 0.22), mat, 0, 0.55, 0);
  mesh(g, rbox(1.6, 0.55, 2.2, 3, 0.22), M.glassDark, 0, 1.05, -0.2);
  for (const [wx, wz] of [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]]) mesh(g, new THREE.CylinderGeometry(0.33, 0.33, 0.24, 18), M2.rubber, wx, 0.33, wz, 0, 0, Math.PI / 2);
  return g;
}
function bollard(parent, x, z, rise = 0.95) { const g = grp(parent, rise); g.position.set(x, 0, z); mesh(g, new THREE.CylinderGeometry(0.1, 0.1, 0.9, 12), M.yellow, 0, 0.45, 0); mesh(g, new THREE.CylinderGeometry(0.105, 0.105, 0.12, 12), M2.hazard, 0, 0.62, 0); return g; }

// ---------- SHOP: flagship retail ----------
export function buildShop() {
  const root = new THREE.Group(), solid = new THREE.Group(); root.add(solid);
  plot(root, 18, 13);
  part(root, 18, 0.02, 3.4, M.drive, 0, 0, 4.8, { cast: false });
  for (let x = -7.5; x <= 7.5; x += 2.5) part(root, 0.08, 0.025, 2.6, M.white, x, 0, 4.8, { cast: false });
  // stepped plinth
  part(solid, 13.4, 0.25, 8.4, M.traver, 0.3, 0, -1.4, { rise: 0, round: 0.05 });
  part(solid, 4.2, 0.12, 1.2, M.traver, -1.2, 0, 3.2, { rise: 0.02, round: 0.04 });
  // interior: double height with mezzanine, lit shelving and plinths
  const inner = grp(solid, 0.1);
  part(inner, 11.6, 6.4, 0.15, M.white, 0.6, 0.25, -5.1);
  part(inner, 11.6, 0.18, 3.2, M.white, 0.6, 3.3, -3.5);
  part(inner, 11.4, 0.9, 0.05, M.glass, 0.6, 3.48, -1.9);
  for (const sx of [-3.4, -0.6, 2.2, 5.0]) { part(inner, 2.2, 2.6, 0.5, M.woodIn, sx, 0.25, -4.7, { round: 0.03 }); for (const sy of [0.9, 1.7]) part(inner, 2.1, 0.04, 0.45, M.bulb, sx, 0.25 + sy, -4.5, { cast: false }); }
  for (const [px, pz] of [[-2.2, -0.4], [0.9, 0.2], [3.8, -0.6]]) { part(inner, 1.0, 0.8, 1.0, M.white, px, 0.25, pz, { round: 0.06 }); part(inner, 0.4, 0.5, 0.4, M.blue, px, 1.05, pz, { round: 0.08 }); }
  for (const bx of [-2, 0.6, 3.2]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), M.bulb); b.position.set(bx, 5.4, -0.4); inner.add(b); }
  part(inner, 11.6, 0.04, 7.4, M.warm, 0.6, 6.6, -1.4, { cast: false });
  // double-height glazing with slim mullions
  part(solid, 11.8, 6.4, 7.6, M.glass, 0.6, 0.25, -1.4, { rise: 0.2 });
  bars(solid, -5.3, 6.5, 1.475, (g, v) => { mesh(g, new THREE.BoxGeometry(0.07, 6.4, 0.12), M.frame, v, 3.45, 2.42); }, 0.25);
  part(solid, 11.9, 0.1, 0.14, M.frame, 0.6, 3.3, 2.42, { rise: 0.25 });
  // monolithic white frame: solid left wall + deep cantilevered roof
  part(solid, 1.2, 7.2, 8.4, M.concrete, -5.9, 0.25, -1.4, { rise: 0.3, round: 0.08 });
  part(solid, 14.6, 0.9, 10.4, M.concrete, 0.9, 6.65, -0.4, { rise: 0.45, round: 0.1 });
  // champagne fin screen on the right side
  bars(solid, -4.8, 2.0, 0.34, (g, v) => { mesh(g, new THREE.BoxGeometry(0.28, 6.4, 0.07), M.champ, 7.0, 3.45, v); }, 0.5);
  // brand: blue light line on the roof edge + sign
  part(solid, 14.6, 0.12, 0.06, M.blue, 0.9, 6.75, 4.83, { rise: 0.6, cast: false });
  part(solid, 3.4, 0.5, 0.08, M.navy, -1.2, 5.5, 2.5, { rise: 0.6 });
  part(solid, 2.6, 0.16, 0.04, M.white, -1.2, 5.66, 2.56, { rise: 0.62, cast: false });
  // entrance: recessed blue portal
  part(solid, 2.4, 3.2, 0.25, M.blue, -1.2, 0.25, 2.55, { rise: 0.35 });
  part(solid, 1.9, 2.9, 0.1, M.glass, -1.2, 0.25, 2.66, { rise: 0.36 });
  // forecourt furniture
  for (const bx of [3.2, 5.6]) part(solid, 1.8, 0.45, 0.55, M.wood, bx, 0, 3.4, { rise: 0.85, round: 0.05 });
  for (const x of [-7.8, -5.8, -3.8, 1.4, 7.8]) bollard(solid, x, 3.2, 0.9);
  car(solid, -5, 4.8, M2.car2, Math.PI / 2 * 0 + 0.02, 1.0); car(solid, 5, 4.8, M2.car1, -0.03, 1.02);
  return { root, solid, warm: M.warm };
}

// ---------- FACTORY: modern logistics / production facility ----------
export function buildFactory() {
  const root = new THREE.Group(), solid = new THREE.Group(); root.add(solid);
  plot(root, 24, 18, M.asphalt);
  for (let x = -10.5; x <= -3; x += 2.4) part(root, 0.08, 0.025, 4.6, M.white, x, 0, 6.2, { cast: false });
  // main hall: horizontal ribbed cladding, navy base band, clerestory glazing
  part(solid, 15, 0.25, 10, M.concrete2, 3, 0, -2.5, { rise: 0, round: 0.05 });
  part(solid, 14.6, 7.2, 9.6, M.cladding, 3, 0.25, -2.5, { rise: 0.1, round: 0.06 });
  part(solid, 14.7, 1.3, 9.7, M.navy, 3, 0.25, -2.5, { rise: 0.12 });
  part(solid, 14.7, 0.7, 9.7, M.glassDark, 3, 5.9, -2.5, { rise: 0.15 });
  part(solid, 14.9, 0.35, 9.9, M.concrete, 3, 7.45, -2.5, { rise: 0.2, round: 0.05 });
  // rooftop: solar array + HVAC
  const solar = grp(solid, 0.55);
  for (let x = -3; x <= 8; x += 1.9) for (let z = -6; z <= 0.5; z += 1.35) mesh(solar, new THREE.BoxGeometry(1.7, 0.05, 1.05), M2.solar, x, 8.15, z, -0.28, 0, 0);
  for (const hx of [8.8, 9.6]) part(solid, 0.7, 0.8, 1.6, M.alu, hx, 7.8, -5.5, { rise: 0.6, round: 0.06 });
  // loading docks with black dock shelters
  for (const dx of [2.2, 5.6, 9.0]) {
    part(solid, 3.0, 3.6, 0.3, M2.rubber, dx, 0.25, 2.45, { rise: 0.3 });
    part(solid, 2.4, 3.1, 0.12, M.shutter, dx, 0.25, 2.62, { rise: 0.32 });
    part(solid, 3.4, 0.14, 1.6, M.navy, dx, 4.0, 3.2, { rise: 0.35 });
    bollard(solid, dx - 1.7, 3.1); bollard(solid, dx + 1.7, 3.1);
  }
  // office block: two-storey glass with white frame and blue brand band
  part(solid, 6, 0.25, 7.6, M.concrete2, -7.6, 0, -1.4, { rise: 0.05, round: 0.05 });
  part(solid, 5.4, 6.2, 7, M.glass, -7.6, 0.25, -1.4, { rise: 0.2 });
  const offIn = grp(solid, 0.2);
  part(offIn, 5.2, 0.15, 6.8, M.white, -7.6, 3.2, -1.4); part(offIn, 5.2, 0.04, 6.8, M.warm, -7.6, 3.1, -1.4, { cast: false }); part(offIn, 5.2, 0.04, 6.8, M.warm, -7.6, 6.3, -1.4, { cast: false });
  for (const dx of [-9, -7.6, -6.2]) part(offIn, 1.1, 0.75, 0.6, M.woodIn, dx, 0.25, 0.4);
  bars(solid, -10.2, -5.0, 0.87, (g, v) => mesh(g, new THREE.BoxGeometry(0.08, 6.2, 0.1), M.frame, v, 3.35, 2.1), 0.25);
  part(solid, 6, 0.5, 7.6, M.concrete, -7.6, 6.45, -1.4, { rise: 0.3, round: 0.06 });
  part(solid, 6.02, 0.22, 7.62, M.blue, -7.6, 6.2, -1.4, { rise: 0.31, cast: false });
  part(solid, 3.4, 0.16, 2, M.concrete, -7.6, 3.1, 3.2, { rise: 0.35 });
  // silos + pipe rack
  for (const sz of [-6.5, -3.6]) { cyl(solid, 1.2, 1.2, 8.5, M.alu, 12.1, 0, sz, { rise: 0.45 }); const cg = grp(solid, 0.5); mesh(cg, new THREE.ConeGeometry(1.2, 0.9, 28), M.alu, 12.1, 8.95, sz); }
  const pipe = grp(solid, 0.55); mesh(pipe, new THREE.CylinderGeometry(0.16, 0.16, 3, 12), M.alu, 11.0, 6.5, -5.05, 0, 0, Math.PI / 2);
  // articulated truck backing into dock 2
  const tr = grp(solid, 0.95); tr.position.set(4.6, 0, 6.8); tr.rotation.y = Math.PI / 2;
  mesh(tr, rbox(2.3, 2.7, 7, 3, 0.08), M.white, 0, 1.9, 0);
  mesh(tr, new THREE.BoxGeometry(2.32, 0.5, 6.9), M.blue, 0, 1.1, 0);
  mesh(tr, rbox(2.3, 2.3, 2.1, 3, 0.25), M.navy, 0, 1.75, 4.7);
  mesh(tr, new THREE.BoxGeometry(2.0, 0.9, 0.05), M.glassDark, 0, 2.2, 5.76);
  for (const wz of [-2.6, -1.4, 4.8]) for (const wx of [-1.1, 1.1]) mesh(tr, new THREE.CylinderGeometry(0.5, 0.5, 0.35, 20), M2.rubber, wx, 0.5, wz, 0, 0, Math.PI / 2);
  // staff cars
  car(solid, -10.5 + 1.2, 6.2, M2.car1, 0, 1.0); car(solid, -8.1 + 1.2, 6.2, M2.car3, 0, 1.03); car(solid, -5.7 + 1.2, 6.2, M2.car2, 0, 1.06);
  // perimeter fence (back + sides)
  const fence = grp(solid, 1.05);
  for (let x = -11.8; x <= 11.8; x += 1.97) mesh(fence, new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), M.alu, x, 0.8, -8.8);
  mesh(fence, new THREE.BoxGeometry(23.6, 1.5, 0.02), M2.mesh, 0, 0.8, -8.8);
  return { root, solid, warm: M.warm };
}

// ---------- RENOVATION: half original, half renewed ----------
export function buildReno() {
  const root = new THREE.Group(), solid = new THREE.Group(); root.add(solid);
  plot(root, 18, 13);
  part(root, 3, 0.03, 5.6, M.drive, -7.2, 0, 3.4, { cast: false });
  // ORIGINAL half (left): warm sand render, arched windows, crenellated parapet
  part(solid, 7, 6.2, 7, M2.old, -3.1, 0, -1.2, { rise: 0, round: 0.03 });
  part(solid, 7.3, 0.35, 7.3, M2.oldTrim, -3.1, 3.05, -1.2, { rise: 0.08 });
  part(solid, 7.2, 0.45, 0.3, M2.oldTrim, -3.1, 6.2, 2.2, { rise: 0.12 }); part(solid, 7.2, 0.45, 0.3, M2.oldTrim, -3.1, 6.2, -4.6, { rise: 0.12 }); part(solid, 0.3, 0.45, 7.1, M2.oldTrim, -6.55, 6.2, -1.2, { rise: 0.12 });
  for (let x = -6.3; x <= 0.2; x += 0.95) { part(solid, 0.45, 0.4, 0.3, M2.oldTrim, x, 6.65, 2.2, { rise: 0.14 }); part(solid, 0.45, 0.4, 0.3, M2.oldTrim, x, 6.65, -4.6, { rise: 0.14 }); }
  const ow = grp(solid, 0.15);
  for (const wx of [-5.2, -3.1, -1.0]) for (const wy of [0.9, 3.9]) {
    const a = mesh(ow, archGeo(1.0, 1.9), M.glassDark, wx, wy, 2.3); a.castShadow = false;
    mesh(ow, new THREE.BoxGeometry(1.3, 0.12, 0.3), M2.oldTrim, wx, wy - 0.06, 2.42);
  }
  const door = mesh(ow, archGeo(1.3, 2.5, 0.1), M.wood, -3.1, 0, 2.28); door.position.x = -3.1;
  // RENEWED half (right): white concrete, floor-to-ceiling glass, timber louvres
  part(solid, 6.2, 6.2, 7, M.concrete, 4.0, 0, -1.2, { rise: 0.3, round: 0.06 });
  part(solid, 4.8, 2.4, 0.08, M.glass, 4.3, 0.5, 2.33, { rise: 0.35 });
  part(solid, 4.8, 2.2, 0.08, M.glass, 4.3, 3.5, 2.33, { rise: 0.35 });
  const rIn = grp(solid, 0.35); part(rIn, 4.6, 2.2, 0.05, M.warm, 4.3, 0.55, 2.0, { cast: false });
  bars(solid, 1.9, 6.7, 0.3, (g, v) => mesh(g, new THREE.BoxGeometry(0.08, 2.2, 0.2), M.wood, v, 4.6, 2.5), 0.45);
  part(solid, 6.6, 0.3, 7.4, M.concrete, 4.0, 6.2, -1.2, { rise: 0.4, round: 0.06 });
  // scaffold with planks over the seam + new side
  const sc = grp(solid, 0.55);
  for (let x = -0.2; x <= 7.2; x += 1.25) for (const z of [2.55, 3.55]) mesh(sc, new THREE.CylinderGeometry(0.04, 0.04, 7, 6), M.orange, x, 3.5, z);
  for (const y of [2.2, 4.4, 6.6]) {
    for (const z of [2.55, 3.55]) mesh(sc, new THREE.CylinderGeometry(0.035, 0.035, 7.4, 6), M.orange, 3.5, y, z, 0, 0, Math.PI / 2);
    mesh(sc, new THREE.BoxGeometry(7.4, 0.06, 0.95), M2.plank, 3.5, y + 0.05, 3.05);
  }
  for (let x = -0.2; x < 7; x += 2.5) mesh(sc, new THREE.CylinderGeometry(0.03, 0.03, 3.2, 6), M.orange, x + 1.25, 3.3, 3.56, 0, 0, 0.75);
  // site: skip with debris, brick pallets, cement bags, safety fence
  part(solid, 3, 1.2, 1.6, M.yellow, 5.4, 0, 5.2, { rise: 0.8, round: 0.05 });
  const deb = grp(solid, 0.82); for (let i = 0; i < 7; i++) mesh(deb, new THREE.BoxGeometry(0.4 + Math.random() * 0.4, 0.2, 0.3 + Math.random() * 0.3), i % 2 ? M2.old : M.concrete2, 4.3 + Math.random() * 2.2, 1.25, 4.8 + Math.random() * 0.8, Math.random(), Math.random(), 0);
  for (const px of [1.2, 2.5]) { part(solid, 1.1, 0.12, 1.1, M.wood, px, 0, 5.0, { rise: 0.85 }); part(solid, 1.0, 0.6, 1.0, M2.brick, px, 0.12, 5.0, { rise: 0.86 }); }
  const fence = grp(solid, 0.9);
  for (let x = -0.8; x <= 8.2; x += 1.5) { mesh(fence, new THREE.BoxGeometry(0.4, 0.15, 0.3), M.concrete2, x, 0.08, 6.1); mesh(fence, new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), M.alu, x, 0.8, 6.1); }
  mesh(fence, new THREE.BoxGeometry(9, 1.3, 0.02), M2.mesh, 3.7, 0.8, 6.1);
  car(solid, -7.2, 4.0, M2.car1, 0, 1.0);
  return { root, solid, warm: M.warm };
}


export function useSimpleGlass() {
  M.glass = new THREE.MeshStandardMaterial({ color: 0xcfe9ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.45 });
  M.glassDark = new THREE.MeshStandardMaterial({ color: 0x7fa6c9, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.8 });
}

// ---------- STAGE VARIANTS (every model) ----------
// The approved villa page's stage language, derived from any model group:
//   1 Planning      survey plot: dashed footprint, timber pegs with blue flags
//   2 Design        the footprint plus a soft blueprint wireframe (edges only)
//   3 Tender        full wireframe hologram: edges and ghosted volumes (the approved villa look)
//   4 Contractor    the hologram with the foundations / plinth poured in solid
//   5 Construction  lower parts built, upper parts held, scaffold and a tower crane (the approved villa rule)
//   6 Handover      finished; the caller turns the interior lights on
const lineSoft = new THREE.LineBasicMaterial({ color: 0x0000fe, transparent: true, opacity: 0.4 });
export const BUILT = 0.4;       // rise below this is built at stage 5 (approved villa rule)
export const FOUNDATION = 0.05; // rise at or below this is poured at stage 4

type Rect = [number, number, number, number]; // x0, z0, x1, z1
export type StageParams = {
  footprint: Rect;
  scaffold: { x0: number; x1: number; step: number; zs: number[]; y0: number; h: number; ledgers: number[] };
  crane: { x: number; z: number; h: number; ry: number; reach: number; hook: number; loadY: number };
  cabin: [number, number];
  edgeAngle?: number; // EdgesGeometry threshold: 25° also outlines rounded slabs (3 × 30° segments); the villa keeps its approved 30°
};

function riseBox(solid, lo, hi) {
  const box = new THREE.Box3(), b = new THREE.Box3();
  for (const g of solid.children) { const r = g.userData.rise; if (r == null || r < lo || r >= hi) continue; b.setFromObject(g); box.union(b); }
  return box;
}
const r2 = (n) => Math.round(n * 100) / 100;

/** Stage geometry derived from the model's own bounds: the survey footprint is the part built by stage 5, the scaffold
 *  wraps the next parts to rise (front and back faces, as on the villa), the crane stands off the back corner. */
export function deriveStageParams(v, o: Partial<StageParams> = {}): StageParams {
  const core = riseBox(v.solid, -Infinity, BUILT), next = riseBox(v.solid, BUILT, 0.7);
  if (next.isEmpty()) next.copy(core);
  const fp: Rect = o.footprint ?? [r2(core.min.x), r2(core.min.z), r2(core.max.x), r2(core.max.z)];
  const sx0 = next.min.x + 0.1, sx1 = next.max.x - 0.1, n = Math.max(2, Math.round((sx1 - sx0) / 1.35)), step = (sx1 - sx0) / n;
  const y0 = Math.max(0, next.min.y), h = Math.max(3.6, next.max.y + 0.6 - y0);
  const scaffold = { x0: sx0, x1: sx1, step, zs: [r2(next.max.z + 0.2), r2(next.min.z - 0.2)], y0, h,
    ledgers: [0.3, 0.63, 0.96].map((f) => r2(y0 + f * h)), ...o.scaffold };
  const top = Math.max(core.max.y, next.max.y);
  const cx = core.max.x + 1.6, cz = core.min.z - 1.6, tx = (core.min.x + core.max.x) / 2, tz = (core.min.z + core.max.z) / 2;
  const dist = Math.hypot(tx - cx, tz - cz);
  // crane: clear of the built part, but no taller than just over the finished model, so the stage-5 props barely
  // grow the framing box (low-rise models otherwise get a crane twice their height, clipped in short headers)
  const full = riseBox(v.solid, -Infinity, Infinity);
  const ch = Math.max(Math.min(Math.max(12, top + 4), full.max.y + 0.5), core.max.y + 1);
  const crane = { x: r2(cx), z: r2(cz), h: r2(ch), ry: Math.atan2(tz - cz, -(tx - cx)), reach: r2(dist + 1.8),
    hook: r2(dist * 0.75), loadY: r2(Math.max(1, Math.min(top + 0.8, ch - 4.9))), ...o.crane };
  return { footprint: fp, scaffold, crane, cabin: o.cabin ?? [r2(core.max.x - 1.2), r2(core.max.z + 1.8)], edgeAngle: o.edgeAngle };
}

// EdgesGeometry is the expensive part of a stage build (a tower has ~140 meshes but only a handful of distinct shapes).
// Edge lists are cached by shape (geometry type + parameters, or uuid when it has none) and threshold, and shared
// across meshes, models and remounts. They are plain arrays, never uploaded, so nothing here needs disposing.
const EDGE_CACHE = new Map<string, Float32Array>();
export const edgeCacheSize = () => EDGE_CACHE.size;
function edgesOf(geo, angle): Float32Array {
  const shape = geo.userData.shape ?? (geo.parameters && !(geo instanceof RoundedBoxGeometry) ? `${geo.type}:${JSON.stringify(geo.parameters)}` : geo.uuid);
  const key = `${angle}|${shape}`;
  let e = EDGE_CACHE.get(key);
  if (!e) { const eg = new THREE.EdgesGeometry(geo, angle); e = eg.getAttribute('position').array as Float32Array; eg.dispose(); EDGE_CACHE.set(key, e); }
  return e;
}
const _v = new THREE.Vector3();
function mergeEdges(meshes, angle) {
  const parts = meshes.map((m) => edgesOf(m.geometry, angle));
  const out = new Float32Array(parts.reduce((n, a) => n + a.length, 0)); let k = 0;
  meshes.forEach((m, i) => { const a = parts[i]; for (let j = 0; j < a.length; j += 3) { _v.set(a[j], a[j + 1], a[j + 2]).applyMatrix4(m.matrixWorld); out[k++] = _v.x; out[k++] = _v.y; out[k++] = _v.z; } });
  return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(out, 3));
}
/** Every ghost volume in one indexed, position-only geometry (the ghost material is unlit). */
function mergeGhost(meshes) {
  let nv = 0, ni = 0;
  for (const m of meshes) { const g = m.geometry, c = g.getAttribute('position').count; nv += c; ni += g.index ? g.index.count : c; }
  const pos = new Float32Array(nv * 3), idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni); let pv = 0, pi = 0;
  for (const m of meshes) {
    const g = m.geometry, pa = g.getAttribute('position'), base = pv;
    for (let j = 0; j < pa.count; j++) { _v.fromBufferAttribute(pa, j).applyMatrix4(m.matrixWorld); pos[pv * 3] = _v.x; pos[pv * 3 + 1] = _v.y; pos[pv * 3 + 2] = _v.z; pv++; }
    if (g.index) for (let j = 0; j < g.index.count; j++) idx[pi++] = base + g.index.getX(j); else for (let j = 0; j < pa.count; j++) idx[pi++] = base + j;
  }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setIndex(new THREE.BufferAttribute(idx, 1));
}

export function makeStages(v, p: StageParams) {
  if (v.wire) return v;
  const geos = [];
  const G = (g) => { geos.push(g); return g; };
  // wireframe hologram of the building: edges (same material as the villa) + ghosted volumes, each baked into ONE
  // world-space geometry (two draw calls however many parts the model has)
  const meshes = [];
  v.solid.traverse((o) => { if (o.isMesh && o.geometry.type !== 'SphereGeometry' && o.geometry.type !== 'PlaneGeometry') meshes.push(o); });
  const lines = new THREE.LineSegments(G(mergeEdges(meshes, p.edgeAngle ?? 25)), M.line);
  const ghost = new THREE.Mesh(G(mergeGhost(meshes)), M.ghost);
  const wire = new THREE.Group(); wire.add(lines, ghost); v.root.add(wire);
  // survey: dashed footprint + corner pegs with blue flags
  const survey = new THREE.Group(), pegs = new THREE.Group(); v.root.add(survey);
  const [x0, z0, x1, z1] = p.footprint;
  const fp = [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]].map(([x, z]) => new THREE.Vector3(x, 0.03, z));
  const dl = new THREE.Line(G(new THREE.BufferGeometry().setFromPoints(fp)), M.ghostLine); dl.computeLineDistances(); survey.add(dl, pegs);
  const stake = G(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8)), flag = G(new THREE.SphereGeometry(0.14, 16, 16));
  for (const [x, , z] of fp.slice(0, 4).map((q) => q.toArray())) {
    const s = new THREE.Mesh(stake, M.wood); s.position.set(x, 0.6, z); s.castShadow = true; pegs.add(s);
    const f = new THREE.Mesh(flag, M.blue); f.position.set(x, 1.25, z); pegs.add(f);
  }
  // construction: scaffold round the next level, tower crane, site cabin
  const build = new THREE.Group(); v.root.add(build);
  const sc = p.scaffold, L = sc.x1 - sc.x0 + 0.1, xc = (sc.x0 + sc.x1) / 2;
  const post = G(new THREE.CylinderGeometry(0.04, 0.04, sc.h, 6)), ledger = G(new THREE.CylinderGeometry(0.035, 0.035, L, 6));
  for (let x = sc.x0; x <= sc.x1 + 1e-6; x += sc.step) for (const z of sc.zs) { const m = new THREE.Mesh(post, M.orange); m.position.set(x, sc.y0 + sc.h / 2, z); m.castShadow = m.receiveShadow = true; build.add(m); }
  for (const y of sc.ledgers) for (const z of sc.zs) { const r = new THREE.Mesh(ledger, M.orange); r.rotation.z = Math.PI / 2; r.position.set(xc, y, z); build.add(r); }
  const c = p.crane, crane = new THREE.Group(); crane.position.set(c.x, 0, c.z); crane.rotation.y = c.ry; build.add(crane);
  const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(G(new THREE.BoxGeometry(w, h, d)), mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; crane.add(m); return m; };
  box(0.5, c.h, 0.5, M.yellow, 0, 0, 0); // mast
  box(c.reach + 1.65, 0.4, 0.4, M.yellow, (1.65 - c.reach) / 2, c.h, 0); // jib + counter-jib
  box(1, 1, 1, M.navy, 1.2, c.h - 0.4, 0); // counterweight
  const cable = new THREE.Mesh(G(new THREE.CylinderGeometry(0.015, 0.015, c.h - c.loadY - 0.4, 4)), M.frame); cable.position.set(-c.hook, (c.h + c.loadY + 0.5) / 2, 0); crane.add(cable);
  box(1.2, 0.5, 0.8, M.concrete2, -c.hook, c.loadY, 0); // load on the hook
  const cabin = new THREE.Group(); cabin.position.set(p.cabin[0], 0, p.cabin[1]); build.add(cabin);
  const cm = new THREE.Mesh(G(rbox(2.4, 1.1, 1.3, 3, 0.05)), M.yellow); cm.position.y = 0.55; cm.castShadow = cm.receiveShadow = true; cabin.add(cm);
  for (const g of [wire, survey, build]) { g.userData.stageVariant = true; g.visible = false; }
  Object.assign(v, { wire, survey, build, stageGeos: geos });
  return v;
}

/** Visibility and hold flags for a stage. Pure (no GL): Scene applies it, the unit test checks each stage differs. */
export function applyStage(v, stage) {
  const st = stage === 'solid' ? 6 : stage;
  const on = !!v.wire;
  if (on) {
    v.survey.visible = st <= 2; v.survey.children[1].visible = st === 1;
    v.wire.visible = st >= 2 && st <= 4; v.wire.children[1].visible = st >= 3;
    v.wire.children[0].material = st === 2 ? lineSoft : M.line;
    v.build.visible = st === 5;
  }
  v.solid.visible = !on || st >= 4;
  for (const g of v.solid.children) {
    const r = g.userData.rise;
    g.userData.hold = !on ? false : st === 4 ? (r == null || r > FOUNDATION) : st === 5 ? (r != null && r >= BUILT && r < 1.0) : false;
    if (r == null) g.visible = !g.userData.hold;
  }
  return st;
}

/** A stage signature (what is on screen), for tests and debugging. */
export function stageSignature(v) {
  const held = v.solid.children.filter((g) => g.userData.hold).length;
  return JSON.stringify({ survey: v.survey?.visible, pegs: v.survey?.children[1].visible, wire: v.wire?.visible, ghost: v.wire?.children[1].visible,
    soft: v.wire?.children[0].material === lineSoft, solid: v.solid.visible, held, build: v.build?.visible });
}

const SHARED = new Set<any>();
/** Frees what a model owns: its geometries (stage variants included) and its per-model materials and textures. The
 *  shared material palette (M, M2, the stage line materials) stays. */
export function disposeModel(v) {
  if (!SHARED.size) for (const m of [...Object.values(M), ...Object.values(M2), lineSoft]) SHARED.add(m);
  const geos = new Set(v.stageGeos ?? []);
  v.root.traverse((o) => {
    if (o.geometry) geos.add(o.geometry);
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of mats) if (!SHARED.has(m) && !Object.values(M).includes(m)) { m.map?.dispose(); m.dispose(); }
  });
  geos.forEach((g) => g.dispose());
}

// Per-model stage geometry. The villa keeps its approved hand-placed survey, scaffold and crane exactly; the others
// are derived from their bounds, with small placements so nothing clashes with the model's own site furniture.
export const STAGE_OVERRIDES = {
  villa: { footprint: [-5.5, -3.2, 4.3, 3.2], scaffold: { x0: -4.4, x1: 6.4, step: 1.35, zs: [2.05, -3.2], y0: 3.3, h: 3.6, ledgers: [4.3, 5.5, 6.7] },
    crane: { x: 7.4, z: -4.9, h: 12, ry: 0, reach: 7.85, hook: 6.0, loadY: 7.1 }, cabin: [7.0, 4.8], edgeAngle: 30 },
  shop: {}, tower: { edgeAngle: 10 }, factory: {}, reno: {}, // tower: its rounded floor plates' facets are shallower than 25°
};
/** Everything the stage props can occupy (survey pegs, scaffold, crane with its jib, cabin), from the parameters alone,
 *  so a screen can frame them without building them. */
export function stageExtent(p: StageParams): THREE.Box3 {
  const b = new THREE.Box3(), P = (x, y, z) => b.expandByPoint(_v.set(x, y, z));
  const [x0, z0, x1, z1] = p.footprint; for (const x of [x0, x1]) for (const z of [z0, z1]) { P(x, 0, z); P(x, 1.4, z); }
  const s = p.scaffold; for (const x of [s.x0, s.x1]) for (const z of s.zs) { P(x, s.y0, z); P(x, s.y0 + s.h, z); }
  const c = p.crane, Y = new THREE.Vector3(0, 1, 0);
  for (const [lx, ly, lz] of [[0, 0, 0.25], [0, 0, -0.25], [-c.reach, c.h + 0.4, 0.2], [-c.reach, c.h + 0.4, -0.2], [1.7, c.h + 0.6, 0.5], [1.7, c.h + 0.6, -0.5]]) {
    const q = new THREE.Vector3(lx, ly, lz).applyAxisAngle(Y, c.ry); P(c.x + q.x, q.y, c.z + q.z);
  }
  for (const dx of [-1.2, 1.2]) for (const dz of [-0.65, 0.65]) { P(p.cabin[0] + dx, 0, p.cabin[1] + dz); P(p.cabin[0] + dx, 1.1, p.cabin[1] + dz); }
  return b;
}

/** The box a screen frames: the finished model and plot, plus (for the derived models) every stage prop, so the camera
 *  is the same at every stage and nothing is clipped at any of them. The villa keeps its approved framing box. */
export function framingBox(model, v): THREE.Box3 {
  const sy = v.solid.children.map((c) => c.scale.y); v.solid.children.forEach((c) => { c.scale.y = 1; });
  v.root.updateMatrixWorld(true);
  const box = modelBox(v.root);
  if (model !== 'villa') box.union(stageExtent(deriveStageParams(v, STAGE_OVERRIDES[model] ?? {})));
  v.solid.children.forEach((c, i) => { c.scale.y = sy[i]; }); v.root.updateMatrixWorld(true);
  return box;
}

/** Adds the stage variants to a built model (once). Measured at full height: the rise animation may already have
 *  squashed parts by the time a screen first asks for a stage. */
export function stagesFor(model, v) {
  if (v.wire) return v;
  const sy = v.solid.children.map((c) => c.scale.y); v.solid.children.forEach((c) => { c.scale.y = 1; });
  v.root.updateMatrixWorld(true);
  makeStages(v, deriveStageParams(v, STAGE_OVERRIDES[model] ?? {}));
  v.solid.children.forEach((c, i) => { c.scale.y = sy[i]; });
  v.root.updateMatrixWorld(true);
  return v;
}
