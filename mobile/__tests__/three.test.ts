import * as THREE from 'three';
import { noiseTex, stripeTex, contactTex } from '@/three/textures';
import { buildVilla, buildShop, buildTower, buildFactory, buildReno, villaStages } from '@/three/models';

test('textures are DataTextures (no DOM canvas needed on React Native)', () => {
  for (const t of [noiseTex(), stripeTex(40, 6), contactTex(0.28)]) expect(t).toBeInstanceOf(THREE.DataTexture);
});

test('every approved model builds with rising parts and no trees', () => {
  for (const b of [buildVilla, buildShop, buildTower, buildFactory, buildReno]) {
    const m = b();
    expect(m.solid.children.some((c: any) => c.userData.rise != null)).toBe(true);
    let fronds = 0; m.root.traverse((o: any) => { if (o.geometry?.type === 'PlaneGeometry' && o.material?.side === THREE.DoubleSide) fronds++; });
    expect(fronds).toBe(0);
  }
});

test('villa stage variants exist (survey, wireframe, construction)', () => {
  const v = villaStages(buildVilla());
  expect(v.wire.children.length).toBeGreaterThan(0);
  expect(v.survey.children.length).toBeGreaterThan(0);
  expect(v.build.children.length).toBeGreaterThan(0);
});

import { shouldUpdateShadows, SHADOW_WINDOW_MS } from '@/three/shadow';
test('shadow map updates only inside the rise window', () => {
  expect(shouldUpdateShadows(1000, null)).toBe(false);
  expect(shouldUpdateShadows(1000, 1000)).toBe(true);
  expect(shouldUpdateShadows(1000 + SHADOW_WINDOW_MS - 1, 1000)).toBe(true);
  expect(shouldUpdateShadows(1000 + SHADOW_WINDOW_MS, 1000)).toBe(false);
});
