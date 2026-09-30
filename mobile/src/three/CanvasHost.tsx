import { Canvas } from '@react-three/fiber/native';
export function CanvasHost({ children, shadows }: { children: React.ReactNode; shadows: boolean }) {
  return (
    <Canvas shadows={shadows} camera={{ fov: 22, near: 0.1, far: 400 }} gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }} style={{ flex: 1, backgroundColor: 'transparent' }}>
      {children}
    </Canvas>
  );
}
