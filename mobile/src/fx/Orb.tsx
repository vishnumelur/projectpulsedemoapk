import { Canvas, Circle, Group, Path, RadialGradient, SweepGradient, Blur, Skia, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
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

export type OrbProps = { size: number; soft?: boolean; calm?: boolean; ring?: boolean; style?: StyleProp<ViewStyle>; variant?: 'blob' | 'sphere' };

function OrbBlob({ size, soft, calm, ring, style }: OrbProps) {
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

/** Mockup `.orb`: dark core clipped to a circle, four blurred screen-blended blobs drifting on 6/7/5/4s loops, a top-left shine,
 *  the two glow shadows, and a 4s breathe. (`ring` is kept for API compatibility and draws the same orb.) */
const ease = (t: number, T: number) => { 'worklet'; const p = (t % T) / T; return (1 - Math.cos(p * Math.PI * 2)) / 2; }; // 0 -> 1 -> 0, like ease-in-out alternate
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

function OrbSphere({ size, soft, calm, style }: OrbProps) {
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

/** `blob` (default): the fluid iridescent morphing blob (motion.html .blob). `sphere`: the glossy sphere (common.html .orb). */
export function Orb({ variant = 'blob', ...p }: OrbProps) { return variant === 'sphere' ? <OrbSphere {...p} /> : <OrbBlob {...p} />; }

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
