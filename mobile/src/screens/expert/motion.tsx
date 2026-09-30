// Motion helpers for the expert work screens (E4–E8). Every effect settles on the approved static frame.
import { useEffect, useRef, useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { DUR, RISE, SUCCESS_FROM, ease } from '@/theme/motion';
import { GradientText } from '@/fx/GradientText';
import { IS_TEST } from '@/screens/experts/fx';
import { s } from '@/theme/scale';
import { EASE } from '@/theme/tokens';

export { IS_TEST };
const easeFn = (t: number) => { const e: any = EASE; return (typeof e === 'function' ? e : e.factory())(t) as number; };
const hidden = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

/** ✦ "counts up": 0 → `to` with EASE after `delay` ms. Jest shows the final value at once. */
export function useCountUp(to: number, duration = 1100, delay = 0) {
  const [v, setV] = useState(IS_TEST ? to : 0);
  useEffect(() => {
    if (IS_TEST) { setV(to); return; }
    let raf = 0; const t0 = Date.now() + delay;
    const tick = () => { const p = Math.max(0, Math.min(1, (Date.now() - t0) / duration)); setV(Math.round(to * easeFn(p))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, delay]);
  return v;
}

/** Entrance: rises (or drops, dy < 0; slides with dx) into place on EASE_OUT and fades in; rests at translate 0 / opacity 1.
 *  Calm by construction: travel is capped at RISE px and the start scale at SUCCESS_FROM, so nothing flies or pops. */
export function Rise({ delay = 0, dy = 14, dx = 0, scale = 1, style, children }: { delay?: number; dy?: number; dx?: number; scale?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const k = useSharedValue(IS_TEST ? 1 : 0);
  useEffect(() => { if (!IS_TEST) k.value = withDelay(delay, withTiming(1, ease(DUR.reveal))); return () => cancelAnimation(k); }, []);
  // plain helpers stay outside the worklet (Android: no sync remote calls)
  const cap = (v: number) => Math.sign(v) * Math.min(Math.abs(s(v)), RISE);
  const d = cap(dy); const e = cap(dx); const sc = Math.max(scale, SUCCESS_FROM);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.value * 1.6),
    transform: [{ translateX: e * (1 - k.value) }, { translateY: d * (1 - k.value) }, { scale: sc + (1 - sc) * k.value }],
  }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

// ---- rolling price (E5 ✦ "the price rolls like an odometer, and it tints amber outside the typical range") ----
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** Colour of a multi-stop, evenly spaced gradient at fraction f (matches GradientText's stop layout). */
function colorAt(colors: readonly string[], f: number) {
  const n = colors.length - 1; const x = Math.max(0, Math.min(1, f)) * n; const i = Math.min(n - 1, Math.floor(x)); const t = x - i;
  const a = hex(colors[i]); const b = hex(colors[i + 1]);
  return `#${a.map((c, j) => Math.round(c + (b[j] - c) * t).toString(16).padStart(2, '0')).join('')}`;
}

function RollChar({ from, to, dir, h, size, colors }: { from: string; to: string; dir: 1 | -1; h: number; size: number; colors: readonly string[] }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withTiming(1, ease(DUR.slow)); return () => cancelAnimation(p); }, []);
  const inSt = useAnimatedStyle(() => ({ transform: [{ translateY: dir * h * (1 - p.value) }] }));
  const outSt = useAnimatedStyle(() => ({ transform: [{ translateY: -dir * h * p.value }], opacity: 1 - p.value * 0.6 }));
  const g = (ch: string) => <GradientText size={size} w={700} ls={-0.04} colors={colors}>{ch}</GradientText>;
  return (
    <View style={{ height: h, overflow: 'hidden' }}>
      <Animated.View style={inSt}>{g(to || ' ')}</Animated.View>
      {!!from && <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, outSt]}>{g(from)}</Animated.View>}
    </View>
  );
}

export const AMBER_GRAD = ['#F2A73B', '#D27B00', '#C2551A'] as const;
export function RollingPrice({ value, size, amber, gradient }: { value: number; size: number; amber: boolean; gradient: readonly string[] }) {
  const text = value.toLocaleString('en-US');
  const prev = useRef({ text, value });
  const [roll, setRoll] = useState<{ from: string; to: string; dir: 1 | -1; key: number } | null>(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (prev.current.text === text) return;
    const from = prev.current; prev.current = { text, value };
    if (IS_TEST || !h) return;
    setRoll({ from: from.text, to: text, dir: value > from.value ? 1 : -1, key: Date.now() });
    const t = setTimeout(() => setRoll(null), 460);
    return () => clearTimeout(t);
  }, [text]);
  const tint = useSharedValue(amber ? 1 : 0);
  useEffect(() => { tint.value = withTiming(amber ? 1 : 0, ease(320)); }, [amber]);
  const gSt = useAnimatedStyle(() => ({ opacity: 1 - tint.value }));
  const aSt = useAnimatedStyle(() => ({ opacity: tint.value }));
  const colors = amber ? AMBER_GRAD : gradient;
  if (roll) {
    const n = Math.max(roll.from.length, roll.to.length);
    const a = roll.from.padStart(n, '\0').split(''); const b = roll.to.padStart(n, '\0').split('');
    return (
      <View style={{ flexDirection: 'row', height: h }}>
        {b.map((ch, i) => {
          const f0 = i / n; const f1 = (i + 1) / n; const cc = [colorAt(colors, f0), colorAt(colors, f1)];
          const to = ch === '\0' ? '' : ch; const from = a[i] === '\0' ? '' : a[i];
          if (from === to) return <GradientText key={`${roll.key}-${i}`} size={size} w={700} ls={-0.04} colors={cc}>{to}</GradientText>;
          if (!to) return null; // a digit that disappears (e.g. 1,000 → 900) simply rolls out of the row
          return <RollChar key={`${roll.key}-${i}`} from={from} to={to} dir={roll.dir} h={h} size={size} colors={cc} />;
        })}
      </View>
    );
  }
  return (
    <View onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      <Animated.View style={gSt} {...(amber ? hidden : {})}><GradientText size={size} w={700} ls={-0.04} colors={gradient}>{text}</GradientText></Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, right: 0 }, aSt]} {...(amber ? {} : hidden)} pointerEvents="none">
        <GradientText size={size} w={700} ls={-0.04} colors={AMBER_GRAD}>{text}</GradientText>
      </Animated.View>
    </View>
  );
}
