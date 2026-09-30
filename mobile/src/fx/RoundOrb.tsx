import { Canvas, Circle, Group, RadialGradient, SweepGradient, Blur, Skia, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { AccessibilityInfo, StyleProp, View, ViewStyle } from 'react-native';
import { useEffect, useState } from 'react';
import { s } from '@/theme/scale';

const MIX = ['#0000FE', '#31D1FF', '#7A5CFF', '#3B5BFF', '#31D1FF', '#0000FE'];

/** 0 -> 1 -> 0 over T seconds, like an ease-in-out alternate keyframe. */
const wave = (t: number, T: number) => { 'worklet'; const p = (t % T) / T; return (1 - Math.cos(p * Math.PI * 2)) / 2; };

/**
 * Batch 5 perfectly round Pulse orb (mockup `.ro`): a Pulse Blue disc clipped to a circle, a blurred conic mix
 * (#0000FE, #31D1FF, #7A5CFF, #3b5bff) turning once every 5s inside it, a top-left shine and a soft bottom shade,
 * a 0.5px white inner rim and a blue drop shadow. `glow` adds the breathing outer glow (`.gl`, 3.2s).
 * `ob` is the conic blur in mockup px (`--ob`, default 3).
 */
export function RoundOrb({ size, glow, ob = 3, style }: { size: number; glow?: boolean; ob?: number; style?: StyleProp<ViewStyle> }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduce); }, []);
  const clock = useClock();
  const D = s(size); const k = D / size; const r = D / 2;
  const pad = D * 0.6; const W = D + pad * 2; const c = W / 2;
  const spin = useDerivedValue(() => [{ rotate: reduce ? 0 : ((clock.value / 5000) % 1) * Math.PI * 2 }]);
  const breathe = useDerivedValue(() => [{ scale: 1 + 0.06 * (reduce ? 0 : wave(clock.value / 1000, 3.2)) }]);
  const clip = Skia.RRectXY(Skia.XYWHRect(pad, pad, D, D), r, r);
  const hx = pad + D * 0.34, hy = pad + D * 0.28;
  const bx = pad + D * 0.6, by = pad + D * 1.1;
  return (
    <View style={[{ width: D, height: D }, style]} pointerEvents="none">
      <Canvas style={{ position: 'absolute', width: W, height: W, left: -pad, top: -pad }}>
        {glow && (
          <Group origin={vec(c, c)} transform={breathe}>
            <Circle cx={c} cy={c} r={D * 1.05}>
              <RadialGradient c={vec(c, c)} r={D * 1.05} colors={['rgba(49,209,255,0.5)', 'rgba(0,0,254,0.14)', 'rgba(0,0,254,0)']} positions={[0, 0.45 / 0.7, 1]} />
            </Circle>
          </Group>
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
