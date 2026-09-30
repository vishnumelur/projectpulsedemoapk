/** Morphing blob edge as a radius multiplier. The three sine waves reproduce the mockup's slow border-radius morph. */
/** `wobble` scales the edge waves: 1 = the mockup blob, a small value keeps the motion but reads as a circle. */
export function blobRadius(theta: number, t: number, wobble = 1) {
  'worklet';
  return 1 + wobble * (0.06 * Math.sin(3 * theta + t * 0.9) + 0.04 * Math.sin(5 * theta - t * 1.3) + 0.03 * Math.sin(2 * theta + t * 0.5));
}
export function blobPoints(t: number, r: number, cx: number, cy: number, n = 48, wobble = 1): [number, number][] {
  'worklet';
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r * blobRadius(a, t, wobble); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return pts;
}
