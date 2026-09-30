import * as THREE from 'three';
import { noiseTex, stripeTex, contactTex } from '@/three/textures';
import { buildVilla, buildShop, buildTower, buildFactory, buildReno, stagesFor, applyStage, stageSignature, disposeModel, deriveStageParams, STAGE_OVERRIDES, edgeCacheSize, framingBox, M } from '@/three/models';
import { modelBox, fitBox, frameFor, radiusDistance, PAD } from '@/three/frame';
import { shouldUpdateShadows, SHADOW_WINDOW_MS } from '@/three/shadow';

const MODELS = { villa: buildVilla, shop: buildShop, tower: buildTower, factory: buildFactory, reno: buildReno } as const;

test('textures are DataTextures (no DOM canvas needed on React Native)', () => {
  for (const t of [noiseTex(), stripeTex(40, 6), contactTex(0.28)]) expect(t).toBeInstanceOf(THREE.DataTexture);
});

test('every approved model builds with rising parts and no trees', () => {
  for (const b of Object.values(MODELS)) {
    const m = b();
    expect(m.solid.children.some((c: any) => c.userData.rise != null)).toBe(true);
    let fronds = 0; m.root.traverse((o: any) => { if (o.geometry?.type === 'PlaneGeometry' && o.material?.side === THREE.DoubleSide) fronds++; });
    expect(fronds).toBe(0);
  }
});

test.each(Object.keys(MODELS))('%s has survey, wireframe and construction variants and six distinct stages', (id) => {
  const v = stagesFor(id, (MODELS as any)[id]());
  // the whole hologram is two draw calls: one merged LineSegments and one merged ghost mesh
  expect(v.wire.children.length).toBe(2);
  expect(v.wire.children[0].isLineSegments).toBe(true);
  expect(v.wire.children[0].geometry.getAttribute('position').count).toBeGreaterThan(0);
  expect(v.wire.children[1].geometry.index.count).toBeGreaterThan(0);
  expect(v.survey.children.length).toBeGreaterThan(0);
  expect(v.build.children.length).toBeGreaterThan(0);
  const sigs = [1, 2, 3, 4, 5, 6].map((s) => { applyStage(v, s); return stageSignature(v); });
  expect(new Set(sigs).size).toBe(6);
  applyStage(v, 'solid'); expect(stageSignature(v)).toBe(sigs[5]);
  applyStage(v, 1); expect(v.solid.visible).toBe(false); expect(v.survey.visible).toBe(true);
  applyStage(v, 5); expect(v.build.visible).toBe(true); expect(v.solid.children.some((g: any) => g.userData.hold)).toBe(true);
  disposeModel(v);
});

test('the villa keeps its approved hand-placed survey, scaffold and crane', () => {
  const p = deriveStageParams(buildVilla(), STAGE_OVERRIDES.villa as any);
  expect(p.footprint).toEqual([-5.5, -3.2, 4.3, 3.2]);
  expect(p.crane).toMatchObject({ x: 7.4, z: -4.9, h: 12 });
});

test('stage variants do not change a model\'s bounds', () => {
  const v = buildTower(); const before = modelBox(v.root); stagesFor('tower', v);
  expect(modelBox(v.root).equals(before)).toBe(true);
});

test('edge lists are cached by shape: a second build of the same model computes none', () => {
  const n0 = edgeCacheSize(); stagesFor('tower', buildTower()); const n = edgeCacheSize();
  expect(n - n0).toBeLessThan(30); // ~140 meshes, a handful of shapes (0 if an earlier test already built a tower)
  const v = stagesFor('tower', buildTower());
  expect(edgeCacheSize()).toBe(n);
  // baked world-space edges: the merged line spans the whole tower
  v.wire.children[0].geometry.computeBoundingBox();
  expect(v.wire.children[0].geometry.boundingBox.max.y).toBeGreaterThan(25);
});

test('disposeModel frees the model and stage geometries but never the shared palette', () => {
  const v = stagesFor('shop', buildShop());
  const shared = [M.concrete, M.glass, M.line, M.ghost, M.ghostLine, M.orange, M.yellow].map((m: any) => jest.spyOn(m, 'dispose'));
  const geos: any[] = []; v.root.traverse((o: any) => { if (o.geometry) geos.push(jest.spyOn(o.geometry, 'dispose')); });
  let contact: any; v.root.traverse((o: any) => { if (o.userData.noBounds) contact = jest.spyOn(o.material, 'dispose'); });
  disposeModel(v);
  for (const s of shared) expect(s).not.toHaveBeenCalled();
  for (const g of geos) expect(g).toHaveBeenCalled();
  expect(contact).toHaveBeenCalled(); // per-model material
  shared.forEach((s) => s.mockRestore());
});

test('framing guards an unlaid-out canvas (aspect 0 / NaN / Infinity)', () => {
  const villa = modelBox(buildVilla().root), box = framingBox('tower', buildTower());
  const ref = { radius: 9.2, target: [0, 1.8, 0] as [number, number, number], height: 0.5 };
  for (const a of [0, NaN, Infinity]) {
    const f = frameFor(ref, villa, 0.5, box, 0.22, a);
    expect(Number.isFinite(f.distance) && f.distance > 0).toBe(true);
    expect(f).toEqual(frameFor(ref, villa, 0.5, box, 0.22, 1));
  }
});

test('stage-5 props (scaffold, crane, cabin) lie inside each derived model\'s framing box', () => {
  for (const id of ['shop', 'tower', 'factory', 'reno']) {
    const v = (MODELS as any)[id](); const box = framingBox(id, v).expandByScalar(0.05); stagesFor(id, v);
    for (const g of [v.build, v.survey]) { g.visible = true; expect(box.containsBox(new THREE.Box3().setFromObject(g))).toBe(true); }
  }
});

test('never cropped: every framing-box corner projects inside the view through a real camera, at many yaws', () => {
  const villa = modelBox(buildVilla().root);
  const screens = [[9.2, 1.8, 0.5, 1.45], [9.8, 1.8, 0.5, 1.19], [11.2, 3.4, 0.5, 1.45], [9.4, 2.2, 0.42, 1.36], [8.5, 2.8, 0.5, 3.6]];
  const cam = new THREE.PerspectiveCamera(22, 1, 0.1, 400), p = new THREE.Vector3();
  for (const [r, y, hh, aspect] of screens) for (const [id, h] of [['tower', 0.22], ['factory', 0.5], ['shop', 0.42], ['reno', 0.45]] as const) {
    const box = framingBox(id, (MODELS as any)[id]());
    const f = frameFor({ radius: r, target: [0, y, 0], height: hh }, villa, 0.5, box, h, aspect);
    cam.aspect = aspect; cam.updateProjectionMatrix();
    for (let k = 0; k < 37; k++) { // 10° steps, off the 15° grid the fit samples
      const yaw = 0.13 + k * (Math.PI / 18), t = f.target;
      cam.position.set(t[0] + Math.sin(yaw) * f.distance, t[1] + f.distance * f.height, t[2] + Math.cos(yaw) * f.distance);
      cam.lookAt(t[0], t[1], t[2]); cam.updateMatrixWorld();
      for (const cx of [box.min.x, box.max.x]) for (const cy of [box.min.y, box.max.y]) for (const cz of [box.min.z, box.max.z]) {
        p.set(cx, cy, cz).project(cam);
        expect(Math.max(Math.abs(p.x), Math.abs(p.y))).toBeLessThanOrEqual(1 / PAD + 0.02);
      }
    }
  }
});

test('framing: the villa keeps its approved camera; every other model is whole, with padding, on every screen', () => {
  const villa = modelBox(buildVilla().root);
  const screens = [ // [radius, target y, height, aspect]: building, chosen, stage, home, project
    [9.2, 1.8, 0.5, 1.45], [9.8, 1.8, 0.5, 1.19], [11.2, 3.4, 0.5, 1.45], [9.4, 2.2, 0.42, 1.36], [8.5, 2.8, 0.5, 3.6]];
  for (const [r, y, hh, aspect] of screens) {
    const ref = { radius: r, target: [0, y, 0] as [number, number, number], height: hh };
    const same = frameFor(ref, villa, 0.5, villa, 0.5, aspect, true);
    expect(same.distance).toBeCloseTo(radiusDistance(r, aspect), 6);
    expect(same.target[1]).toBeCloseTo(y, 6);
    const zoom = radiusDistance(r, aspect) / fitBox(villa, hh, aspect).d;
    for (const [id, h] of [['tower', 0.22], ['factory', 0.5], ['shop', 0.42], ['reno', 0.45]] as const) {
      const box = modelBox((MODELS as any)[id]().root);
      const f = frameFor(ref, villa, 0.5, box, h, aspect);
      const t = new THREE.Vector3(...f.target);
      expect(f.distance).toBeGreaterThanOrEqual(fitBox(box, f.height, aspect, 22, t).d * PAD - 1e-9); // never cropped
      expect(f.distance).toBeGreaterThanOrEqual(zoom * fitBox(box, f.height, aspect).d - 1e-9); // never bigger than the villa
      expect(f.height).toBeCloseTo(h * (hh / 0.5), 6);
    }
  }
});

test('shadow map updates only inside the rise window', () => {
  expect(shouldUpdateShadows(1000, null)).toBe(false);
  expect(shouldUpdateShadows(1000, 1000)).toBe(true);
  expect(shouldUpdateShadows(1000 + SHADOW_WINDOW_MS - 1, 1000)).toBe(true);
  expect(shouldUpdateShadows(1000 + SHADOW_WINDOW_MS, 1000)).toBe(false);
});
