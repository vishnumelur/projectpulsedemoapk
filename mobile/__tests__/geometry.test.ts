import { blobRadius, blobPoints } from '@/fx/geometry';

test('blob radius stays within ±13% of the base radius at all angles and times', () => {
  for (let t = 0; t < 20; t += 0.37) for (let a = 0; a < Math.PI * 2; a += 0.1) {
    const m = blobRadius(a, t);
    expect(m).toBeGreaterThan(0.87); expect(m).toBeLessThan(1.13);
  }
});

test('blob points form a closed ring around the centre', () => {
  const pts = blobPoints(1.2, 50, 100, 100, 48);
  expect(pts).toHaveLength(48);
  for (const [x, y] of pts) { const d = Math.hypot(x - 100, y - 100); expect(d).toBeGreaterThan(43); expect(d).toBeLessThan(57); }
});
