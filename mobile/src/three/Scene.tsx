import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useEffect, useMemo, useRef } from 'react';
import { shouldUpdateShadows } from './shadow';
import { buildVilla, buildShop, buildTower, buildFactory, buildReno, stagesFor, applyStage, disposeModel, M } from './models';
import { Frame, frameFor, modelBox } from './frame';

export type ModelId = 'villa' | 'shop' | 'tower' | 'factory' | 'reno';
export type StageView = 1 | 2 | 3 | 4 | 5 | 6 | 'solid';
const BUILD = { villa: buildVilla, shop: buildShop, tower: buildTower, factory: buildFactory, reno: buildReno };
/** Each model's own camera height (tall models are seen from lower down), relative to the villa's. */
export const MODEL_HEIGHT: Record<ModelId, number> = { villa: 0.5, shop: 0.42, tower: 0.22, factory: 0.5, reno: 0.45 };
const easeOutBack = (t: number) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

/** Bounds of each finished model, measured once (a model built only to be measured is freed straight away). */
const BOX: Partial<Record<ModelId, THREE.Box3>> = {};
function boxOf(model: ModelId, built?: any): THREE.Box3 {
  if (!BOX[model]) { const m = built ?? BUILD[model](); BOX[model] = modelBox(m.root); if (!built) disposeModel(m); }
  return BOX[model]!;
}

export type SceneProps = { model: ModelId; stage?: StageView; lights?: number;
  /** the screen's framing as tuned for the villa; every model is fitted to its own bounds with the same zoom */
  frame: Frame; spin?: number; yaw0?: number; shadows?: boolean; riseKey?: string | number; yawVel: { current: number } };

export function Scene({ model, stage = 'solid', lights = 0.25, frame, spin = 0.1, yaw0 = -0.62, shadows = true, riseKey, yawVel }: SceneProps) {
  const { gl, scene, camera, size } = useThree();
  const m = useMemo(() => { const x: any = BUILD[model](); boxOf(model, x); return x; }, [model]);
  const warm = useMemo(() => { const w = M.warm.clone(); m.solid.traverse((o: any) => { if (o.isMesh && o.material === M.warm) o.material = w; }); return w; }, [m]);
  useEffect(() => () => { disposeModel(m); warm.dispose(); }, [m, warm]); // geometries (stage variants included) + per-model materials
  const yaw = useRef(yaw0); const riseT0 = useRef<number | null>(null); const buildT0 = useRef<number | null>(null);

  const aspect = Math.round((size.width / Math.max(1, size.height)) * 100) / 100;
  const [fr, fy, fz] = frame.target;
  const view = useMemo(() => frameFor(frame, boxOf('villa'), MODEL_HEIGHT.villa, boxOf(model), MODEL_HEIGHT[model], aspect, model === 'villa'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, aspect, frame.radius, frame.height, fr, fy, fz]);

  useEffect(() => { // environment + lights once
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; (scene as any).environmentIntensity = 0.6;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; gl.shadowMap.enabled = shadows; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = false; gl.shadowMap.needsUpdate = true; // model is static in world space; see useFrame
    return () => { pm.dispose(); scene.environment?.dispose(); scene.environment = null; };
  }, [gl, scene, shadows]);
  useEffect(() => { warm.emissiveIntensity = lights; }, [lights, warm]);
  useEffect(() => { // stage variants, built on first use (screens that only show the finished model never pay for them)
    if (stage !== 'solid') stagesFor(model, m);
    applyStage(m, stage);
    riseT0.current = performance.now(); buildT0.current = performance.now(); gl.shadowMap.needsUpdate = true;
  }, [stage, m, model, gl]);
  useEffect(() => { riseT0.current = performance.now(); }, [riseKey, m]);

  useFrame(() => {
    const now = performance.now();
    if (Math.abs(yawVel.current) > 0.0001) { yaw.current += yawVel.current; yawVel.current *= 0.94; } else yaw.current += spin * 0.01;
    const d = view.distance, t = view.target;
    camera.position.set(t[0] + Math.sin(yaw.current) * d, t[1] + d * view.height, t[2] + Math.cos(yaw.current) * d);
    camera.lookAt(t[0], t[1], t[2]);
    const tick = (group: any, t0: number | null) => {
      if (!group?.visible || t0 == null) return; const el = (now - t0) / 1000;
      for (const o of group.children) { if (o.userData.rise == null) continue;
        const k = Math.min(1, Math.max(0, (el - o.userData.rise * 0.9) / 1.0));
        o.scale.y = Math.max(k === 0 ? 0.0001 : easeOutBack(k), 0.0001); o.visible = k > 0 && !o.userData.hold; }
    };
    if (shouldUpdateShadows(now, riseT0.current) || shouldUpdateShadows(now, buildT0.current)) gl.shadowMap.needsUpdate = true;
    tick(m.solid, riseT0.current); tick(m.build, buildT0.current);
  });

  return (
    <>
      <directionalLight color={0xffedd6} intensity={2.6} position={[14, 22, 10]} castShadow={shadows}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={18} shadow-camera-bottom={-16} shadow-bias={-0.0003} shadow-normalBias={0.02} />
      <directionalLight color={0xcfe0ff} intensity={0.5} position={[-12, 8, -6]} />
      <hemisphereLight args={[0xe3ecff, 0xf0e8da, 0.5]} />
      <primitive object={m.root} />
    </>
  );
}
