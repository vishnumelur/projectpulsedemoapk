import * as THREE from 'three';

function tex(data: Uint8Array<ArrayBuffer>, w: number, h: number, rx = 1, ry = 1) {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t;
}
export function noiseTex(size = 128, base = 200, amp = 40, rep = 4) {
  const d = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) { const v = Math.max(0, Math.min(255, base + (Math.random() - 0.5) * amp)); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  return tex(d, size, size, rep, rep);
}
/** Ribbed cladding bump: n bright/dark stripes across 256px. */
export function stripeTex(n = 24, rep = 1) {
  const w = 256, h = 8, d = new Uint8Array(w * h * 4);
  for (let x = 0; x < w; x++) { const f = ((x * n) / w) % 1; const v = Math.round(68 + 187 * (1 - Math.abs(2 * f - 1)));
    for (let y = 0; y < h; y++) { const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } }
  return tex(d, w, h, rep, 1);
}
/** Soft navy contact shadow (radial alpha). */
export function contactTex(op = 0.35, size = 64) {
  const d = new Uint8Array(size * size * 4); const c = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const r = Math.hypot(x - c, y - c) / c; const a = Math.max(0, 1 - Math.max(0, r - 0.15) / 0.85) * op;
    const i = (y * size + x) * 4; d[i] = 22; d[i + 1] = 32; d[i + 2] = 90; d[i + 3] = Math.round(a * 255);
  }
  const t = new THREE.DataTexture(d, size, size, THREE.RGBAFormat); t.needsUpdate = true; return t;
}
