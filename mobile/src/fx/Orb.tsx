import { Canvas, Circle, Group, Path, RadialGradient, SweepGradient, Blur, Skia, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { View, StyleProp, ViewStyle, AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { blobPoints } from './geometry';
import { ORB } from '@/theme/tokens';
import { s } from '@/theme/scale';

function useReduceMotion() {
  const [r, setR] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setR); }, []);
  return r;
}

export function Orb({ size, soft, calm, ring, style }: { size: number; soft?: boolean; calm?: boolean; ring?: boolean; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const clock = useClock();
  const D = s(size); const pad = D * 0.45; const W = D + pad * 2; const c = W / 2; const r = D / 2;
  const speed = reduce ? 0 : calm ? 0.28 : 0.55;
  const path = useDerivedValue(() => {
    const t = (clock.value / 1000) * speed;
    const pts = blobPoints(t, r * (ring ? 0.8 : 1), c, c, 48);
    const p = Skia.Path.Make();
    const mid = (i: number) => { const a = pts[i]; const b = pts[(i + 1) % pts.length]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    const m0 = mid(pts.length - 1); p.moveTo(m0[0], m0[1]);
    for (let i = 0; i < pts.length; i++) { const m = mid(i); p.quadTo(pts[i][0], pts[i][1], m[0], m[1]); }
    p.close();
    return p;
  });
  const rot = useDerivedValue(() => [{ rotate: ((clock.value / 1000) * speed * 1.05) % (Math.PI * 2) }]);
  const blur = D * (soft ? 0.11 : 0.05);
  return (
    <View style={[{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }, style]} pointerEvents="none">
      <Canvas style={{ position: 'absolute', width: W, height: W, left: -pad, top: -pad, opacity: calm ? 0.8 : 1 }}>
        <Circle cx={c} cy={c} r={r * 1.35}>
          <RadialGradient c={vec(c, c)} r={r * 1.35} colors={['rgba(49,209,255,0.35)', 'rgba(0,0,254,0.12)', 'rgba(0,0,254,0)']} positions={[0, 0.45, 1]} />
          <Blur blur={D * 0.08} />
        </Circle>
        <Group origin={vec(c, c)} transform={rot}>
          <Path path={path} style={ring ? 'stroke' : 'fill'} strokeWidth={r * 0.55}>
            <SweepGradient c={vec(c, c)} colors={ORB} />
            <Blur blur={blur} />
          </Path>
        </Group>
        {!ring && (
          <Circle cx={c} cy={c} r={r * 0.56}>
            <RadialGradient c={vec(c, c)} r={r * 0.56} colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']} />
            <Blur blur={3} />
          </Circle>
        )}
      </Canvas>
    </View>
  );
}

/** Two expanding rings around an orb (mockup .halo): 4s loop, the second offset by 2s. */
export function Halo({ size }: { size: number }) {
  const clock = useClock();
  const D = s(size) + s(32); const c = D / 2;
  const r1 = useDerivedValue(() => { const p = ((clock.value % 4000) / 4000); return (c - 2) * (0.8 + 0.55 * p); });
  const o1 = useDerivedValue(() => 1 - ((clock.value % 4000) / 4000));
  const r2 = useDerivedValue(() => { const p = (((clock.value + 2000) % 4000) / 4000); return (c - 2) * (0.8 + 0.55 * p); });
  const o2 = useDerivedValue(() => 1 - (((clock.value + 2000) % 4000) / 4000));
  return (
    <Canvas style={{ position: 'absolute', width: D * 1.4, height: D * 1.4, left: -s(16) - D * 0.2, top: -s(16) - D * 0.2 }} pointerEvents="none">
      <Group transform={[{ translateX: D * 0.2 }, { translateY: D * 0.2 }]}>
        <Circle cx={c} cy={c} r={r1} style="stroke" strokeWidth={1} color="rgba(0,0,254,0.14)" opacity={o1} />
        <Circle cx={c} cy={c} r={r2} style="stroke" strokeWidth={1} color="rgba(0,0,254,0.14)" opacity={o2} />
      </Group>
    </Canvas>
  );
}
export default Orb;
