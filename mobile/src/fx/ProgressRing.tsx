import { Canvas, Path, Skia, SweepGradient, vec, Group, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { View } from 'react-native';
import { s } from '@/theme/scale';

export function ProgressRing({ size, thickness, progress, children, spin, colors = ['#31D1FF', '#0000FE', '#7A5CFF', '#31D1FF'], track = '#E6E9F2' }:
  { size: number; thickness: number; progress: number; children?: React.ReactNode; spin?: boolean; colors?: string[]; track?: string }) {
  const D = s(size); const t = s(thickness); const c = D / 2;
  const arc = (p: number) => { const path = Skia.Path.Make(); path.addArc({ x: t / 2, y: t / 2, width: D - t, height: D - t }, -90, 360 * p); return path; };
  const clock = useClock();
  const rot = useDerivedValue(() => (spin ? [{ rotate: ((clock.value % 3000) / 3000) * Math.PI * 2 }] : []));
  return (
    <View style={{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }}>
      <Canvas style={{ position: 'absolute', width: D, height: D }}>
        <Path path={arc(1)} style="stroke" strokeWidth={t} color={track} />
        <Group origin={vec(c, c)} transform={rot}>
          <Path path={arc(Math.max(0.001, Math.min(1, progress)))} style="stroke" strokeWidth={t} strokeCap="butt">
            {/* start at 12 o'clock by rotating a 0-360 sweep: native Skia clamps a negative start angle (seam at 3 o'clock) */}
            <SweepGradient c={vec(c, c)} colors={colors} origin={vec(c, c)} transform={[{ rotate: -Math.PI / 2 }]} />
          </Path>
        </Group>
      </Canvas>
      {children}
    </View>
  );
}
export default ProgressRing;
