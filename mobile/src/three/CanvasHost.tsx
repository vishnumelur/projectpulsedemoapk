import * as THREE from 'three';
import { Canvas } from '@react-three/fiber/native';

/** expo-gl returns undefined program/shader info logs on some drivers, and three's first-use check calls .trim() on them
 *  and throws (red screen). The renderer is built here so the check is off before the first shader compiles. */
const makeRenderer = (defaults: any) => {
  const r = new THREE.WebGLRenderer({ ...defaults, antialias: true, alpha: true });
  r.debug.checkShaderErrors = false;
  return r;
};

export function CanvasHost({ children, shadows }: { children: React.ReactNode; shadows: boolean }) {
  return (
    <Canvas shadows={shadows} camera={{ fov: 22, near: 0.1, far: 400 }} gl={makeRenderer}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }} style={{ flex: 1, backgroundColor: 'transparent' }}>
      {children}
    </Canvas>
  );
}
