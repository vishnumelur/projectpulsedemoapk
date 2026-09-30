import { Canvas, Circle, Group, RadialGradient, Blur, Skia, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { View, StyleProp, ViewStyle, AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { s } from '@/theme/scale';

function useReduceMotion() {
  const [r, setR] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setR); }, []);
  return r;
}

/** Mockup `.orb`: dark core clipped to a circle, four blurred screen-blended blobs drifting on 6/7/5/4s loops, a top-left shine,
 *  the two glow shadows, and a 4s breathe. (`ring` is kept for API compatibility and draws the same orb.) */
const ease = (t: number, T: number) => { const p = (t % T) / T; return (1 - Math.cos(p * Math.PI * 2)) / 2; }; // 0 -> 1 -> 0, like ease-in-out alternate
const BLOBS = [
  { color: '#0000FE', w: 0.8, x: -0.1, y: 0.05, dx: 0.25, dy: 0.15, sc: 1.15, T: 6, o: 1 },
  { color: '#31D1FF', w: 0.7, x: 0.45, y: -0.05, dx: -0.3, dy: 0.25, sc: 0.85, T: 7, o: 1 },
  { color: '#7A5CFF', w: 0.6, x: 0.2, y: 0.6, dx: -0.15, dy: -0.35, sc: 1.2, T: 5, o: 1 },
  { color: '#FFFFFF', w: 0.45, x: 0.3, y: 0.25, dx: 0.15, dy: -0.1, sc: 0.7, T: 4, o: 0.55 },
] as const;

function Blob({ b, clock, D, pad, speed, k }: { b: (typeof BLOBS)[number]; clock: SharedValue<number>; D: number; pad: number; speed: number; k: number }) {
  const w = b.w * D;
  const tr = useDerivedValue(() => {
    const e = ease((clock.value / 1000) * speed, b.T);
    const sc = 1 + (b.sc - 1) * e;
    return [{ translateX: pad + (b.x + b.dx * b.w * e) * D + w / 2 }, { translateY: pad + (b.y + b.dy * b.w * e) * D + w / 2 }, { scale: sc }];
  });
  return (
    <Group transform={tr} opacity={b.o}>
      <Circle cx={0} cy={0} r={w / 2} color={b.color} blendMode="screen"><Blur blur={8 * k} /></Circle>
    </Group>
  );
}

export function Orb({ size, soft, calm, style }: { size: number; soft?: boolean; calm?: boolean; ring?: boolean; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const clock = useClock();
  const D = s(size); const k = D / size; const pad = D * 0.7; const W = D + pad * 2; const c = W / 2; const r = D / 2;
  const speed = reduce ? 0 : calm ? 0.5 : 1;
  const breathe = useDerivedValue(() => [{ scale: 1 + 0.06 * ease((clock.value / 1000) * speed, 4) }]);
  const clip = Skia.RRectXY(Skia.XYWHRect(pad, pad, D, D), r, r);
  return (
    <View style={[{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }, style]} pointerEvents="none">
      <Canvas style={{ position: 'absolute', width: W, height: W, left: -pad, top: -pad, opacity: calm ? 0.85 : 1 }}>
        <Group origin={vec(c, c)} transform={breathe}>
          <Circle cx={c} cy={c + 12 * k} r={r} color="rgba(0,0,254,0.3)"><Blur blur={20 * k} /></Circle>
          <Circle cx={c} cy={c} r={r} color="rgba(49,209,255,0.45)"><Blur blur={15 * k} /></Circle>
          <Group clip={clip}>
            <Circle cx={c} cy={c} r={r} color="#0A1A8A" />
            {BLOBS.map((b, i) => <Blob key={i} b={b} clock={clock} D={D} pad={pad} speed={speed} k={soft ? k * 1.4 : k} />)}
            <Circle cx={pad + D * 0.3} cy={pad + D * 0.25} r={D * 0.36}>
              <RadialGradient c={vec(pad + D * 0.3, pad + D * 0.25)} r={D * 0.36} colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']} />
            </Circle>
          </Group>
        </Group>
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
