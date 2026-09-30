import { Canvas } from '@react-three/fiber';
export function CanvasHost({ children, shadows }: { children: React.ReactNode; shadows: boolean }) {
  return (
    <Canvas shadows={shadows} camera={{ fov: 22, near: 0.1, far: 400 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)} style={{ width: '100%', height: '100%', background: 'transparent' }}>
      {children}
    </Canvas>
  );
}
