import { Canvas, Circle, Group, RadialGradient, SweepGradient, Blur, Skia, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue, useReducedMotion } from 'react-native-reanimated';
import { StyleProp, View, ViewStyle } from 'react-native';
import { s } from '@/theme/scale';

const MIX = ['#0000FE', '#31D1FF', '#7A5CFF', '#3B5BFF', '#31D1FF', '#0000FE'];

/** 0 -> 1 -> 0 over T seconds, like an ease-in-out alternate keyframe. */
const wave = (t: number, T: number) => { 'worklet'; const p = (t % T) / T; return (1 - Math.cos(p * Math.PI * 2)) / 2; };

/**
 * Batch 5 perfectly round Pulse orb (mockup `.ro`): a Pulse Blue disc clipped to a circle, a blurred conic mix
 * (#0000FE, #31D1FF, #7A5CFF, #3b5bff) turning inside it (once every `period` s, mockup 5s), a top-left shine and a
 * soft bottom shade, a 0.5px white inner rim and a blue drop shadow.
 * - `glow`: the breathing outer glow (`.gl`, 3.2s); a number 0..1 scales its strength.
 * - `halo`: the two expanding rings (`.hl`, 2.4s, the second offset 1.2s).
 * - `ob`: the conic blur in mockup px (`--ob`; 2 at 12-16px, 3 at 18-20px, 10 at 118px).
 * Reduced motion: the mix, glow and rings hold still.
 */
export function RoundOrb({ size, glow, halo, ob = 3, period = 5, opacity = 1, style }: {
  size: number; glow?: boolean | number; halo?: boolean; ob?: number; period?: number; opacity?: number; style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReducedMotion();
  const clock = useClock();
  const D = s(size); const k = D / size; const r = D / 2;
  const pad = D * 0.6 + 6 * k; const W = D + pad * 2; const c = W / 2;
  const g = glow === true ? 1 : glow || 0;
  const spin = useDerivedValue(() => [{ rotate: reduce ? 0 : ((clock.value / (period * 1000)) % 1) * Math.PI * 2 }]);
  const breathe = useDerivedValue(() => [{ scale: 1 + 0.06 * (reduce ? 0 : wave(clock.value / 1000, 3.2)) }]);
  const hr = r + 4 * k;
  const ring = (off: number) => { 'worklet'; const p = reduce ? 0.4 : (((clock.value + off) % 2400) / 2400); return p; };
  const r1 = useDerivedValue(() => hr * (0.8 + 0.55 * ring(0)));
  const o1 = useDerivedValue(() => 1 - ring(0));
  const r2 = useDerivedValue(() => hr * (0.8 + 0.55 * ring(1200)));
  const o2 = useDerivedValue(() => 1 - ring(1200));
  const clip = Skia.RRectXY(Skia.XYWHRect(pad, pad, D, D), r, r);
  const hx = pad + D * 0.34, hy = pad + D * 0.28;
  const bx = pad + D * 0.6, by = pad + D * 1.1;
  return (
    <View style={[{ width: D, height: D }, style]} pointerEvents="none">
      <Canvas style={{ position: 'absolute', width: W, height: W, left: -pad, top: -pad, opacity }}>
        {g > 0 && (
          <Group origin={vec(c, c)} transform={breathe} opacity={g}>
            <Circle cx={c} cy={c} r={D * 1.05}>
              <RadialGradient c={vec(c, c)} r={D * 1.05} colors={['rgba(49,209,255,0.5)', 'rgba(0,0,254,0.14)', 'rgba(0,0,254,0)']} positions={[0, 0.45 / 0.7, 1]} />
            </Circle>
          </Group>
        )}
        {halo && (
          <>
            <Circle cx={c} cy={c} r={r1} style="stroke" strokeWidth={k} color="rgba(0,0,254,0.35)" opacity={o1} />
            <Circle cx={c} cy={c} r={r2} style="stroke" strokeWidth={k} color="rgba(0,0,254,0.35)" opacity={o2} />
          </>
        )}
        {/* box-shadow 0 3px 10px rgba(0,0,254,.35) */}
        <Circle cx={c} cy={c + 3 * k} r={r} color="rgba(0,0,254,0.35)"><Blur blur={5 * k} /></Circle>
        <Group clip={clip}>
          <Circle cx={c} cy={c} r={r} color="#0000FE" />
          <Group origin={vec(c, c)} transform={spin}>
            <Circle cx={c} cy={c} r={D * 0.75}>
              <SweepGradient c={vec(c, c)} colors={MIX} />
              <Blur blur={ob * k * 0.5} />
            </Circle>
          </Group>
          {/* CSS radial stops are % of the distance to the farthest corner: 42% of 0.98D, 60% of 1.25D */}
          <Circle cx={hx} cy={hy} r={D * 0.41}>
            <RadialGradient c={vec(hx, hy)} r={D * 0.41} colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']} />
          </Circle>
          <Circle cx={bx} cy={by} r={D * 0.75}>
            <RadialGradient c={vec(bx, by)} r={D * 0.75} colors={['rgba(22,32,90,0.35)', 'rgba(22,32,90,0)']} />
          </Circle>
          <Circle cx={c} cy={c} r={r - 0.25 * k} style="stroke" strokeWidth={0.5 * k} color="rgba(255,255,255,0.55)" />
        </Group>
      </Canvas>
    </View>
  );
}
export default RoundOrb;
