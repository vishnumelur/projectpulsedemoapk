import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useEffect, useMemo, useRef } from 'react';
import { buildVilla, buildShop, buildTower, buildFactory, buildReno, villaStages, M } from './models';

export type ModelId = 'villa' | 'shop' | 'tower' | 'factory' | 'reno';
export type StageView = 1 | 2 | 3 | 4 | 5 | 6 | 'solid';
const BUILD = { villa: buildVilla, shop: buildShop, tower: buildTower, factory: buildFactory, reno: buildReno };
const easeOutBack = (t: number) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

export type SceneProps = { model: ModelId; stage?: StageView; lights?: number; radius: number; target: [number, number, number];
  height?: number; spin?: number; yaw0?: number; shadows?: boolean; riseKey?: string | number; yawVel: { current: number } };

export function Scene({ model, stage = 'solid', lights = 0.25, radius, target, height = 0.5, spin = 0.1, yaw0 = -0.62, shadows = true, riseKey, yawVel }: SceneProps) {
  const { gl, scene, camera, size } = useThree();
  const m = useMemo(() => { const x = BUILD[model](); return model === 'villa' ? villaStages(x) : x; }, [model]);
  const warm = useMemo(() => { const w = M.warm.clone(); m.solid.traverse((o: any) => { if (o.isMesh && o.material === M.warm) o.material = w; }); return w; }, [m]);
  const yaw = useRef(yaw0); const riseT0 = useRef<number | null>(null); const buildT0 = useRef<number | null>(null);

  useEffect(() => { // environment + lights once
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; (scene as any).environmentIntensity = 0.6;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; gl.shadowMap.enabled = shadows; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    return () => pm.dispose();
  }, [gl, scene, shadows]);
  useEffect(() => { warm.emissiveIntensity = lights; }, [lights, warm]);
  useEffect(() => { // stage variants (villa only) — same rules as the approved page
    const v: any = m; if (!v.wire) return;
    const st = stage === 'solid' ? 6 : stage;
    v.survey.visible = st === 1; v.wire.visible = st >= 2 && st <= 4; v.build.visible = st === 5; v.solid.visible = stage === 'solid' || st >= 5;
    v.solid.children.forEach((g: any) => { const r = g.userData.rise; g.userData.hold = st === 5 && stage !== 'solid' && r != null && r >= 0.4 && r < 1.0; });
    riseT0.current = performance.now(); buildT0.current = performance.now();
  }, [stage, m]);
  useEffect(() => { riseT0.current = performance.now(); }, [riseKey, m]);

  const vh = THREE.MathUtils.degToRad(22) / 2;
  useFrame(() => {
    const now = performance.now();
    if (Math.abs(yawVel.current) > 0.0001) { yaw.current += yawVel.current; yawVel.current *= 0.94; } else yaw.current += spin * 0.01;
    const aspect = size.width / Math.max(1, size.height); const hh = Math.atan(Math.tan(vh) * aspect);
    const d = Math.max(radius / Math.tan(vh), radius / Math.tan(hh));
    camera.position.set(target[0] + Math.sin(yaw.current) * d, target[1] + d * height, target[2] + Math.cos(yaw.current) * d);
    camera.lookAt(target[0], target[1], target[2]);
    const tick = (group: any, t0: number | null) => {
      if (!group?.visible || t0 == null) return; const el = (now - t0) / 1000;
      for (const o of group.children) { if (o.userData.rise == null) continue;
        const t = Math.min(1, Math.max(0, (el - o.userData.rise * 0.9) / 1.0));
        o.scale.y = Math.max(t === 0 ? 0.0001 : easeOutBack(t), 0.0001); o.visible = t > 0 && !o.userData.hold; }
    };
    tick(m.solid, riseT0.current); tick((m as any).build, buildT0.current);
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
