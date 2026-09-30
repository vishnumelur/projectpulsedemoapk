import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';
import { EASE } from '@/theme/tokens';

const ease = (t: number) => { const e: any = EASE; return (typeof e === 'function' ? e : e.factory())(t) as number; };
export const IS_TEST = typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
const hidden = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;
const srOnly = { position: 'absolute', opacity: 0 } as const;

/** Tile rect handed from the Experts grid to the profile so the portrait can zoom out of the tapped tile. */
export type Rect = { x: number; y: number; w: number; h: number; id: string; t: number };
let pending: Rect | null = null;
export const setTileRect = (r: Rect | null) => { pending = r; };
/** Accept the rect only if it belongs to this expert and is under 1s old; always consumes it. */
export const takeTileRect = (id: string) => { const r = pending; pending = null; return r && r.id === id && Date.now() - r.t < 1000 ? r : null; };

function Digit({ d, size, w, c, lh }: { d: number; size: number; w: 500 | 600 | 700; c: string; lh: number }) {
  const lineH = s(size * lh);
  const y = useSharedValue(-d * lineH);
  useEffect(() => { y.value = withTiming(-d * lineH, { duration: 520, easing: EASE }); }, [d, lineH, y]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height: lineH, overflow: 'hidden' }}>
      <Animated.View style={st}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <T key={n} size={size} w={w} c={c} lh={lh}>{String(n)}</T>)}
      </Animated.View>
    </View>
  );
}

/** Text whose digits roll vertically when they change. The full string also sits in an invisible Text (accessibility/tests). */
export function RollingText({ text, size, w = 700, c = '#fff', lh = 1.3 }: { text: string; size: number; w?: 500 | 600 | 700; c?: string; lh?: number }) {
  const chars = text.split('');
  return (
    <View>
      <View {...hidden} style={{ flexDirection: 'row', alignItems: 'center' }}>
        {chars.map((ch, i) => /\d/.test(ch)
          ? <Digit key={`d${chars.length - i}`} d={Number(ch)} size={size} w={w} c={c} lh={lh} />
          : <T key={`c${i}`} size={size} w={w} c={c} lh={lh}>{ch}</T>)}
      </View>
      <T size={size} w={w} c={c} style={srOnly}>{text}</T>
    </View>
  );
}

/** Counts a number up from 0 (EASE, ~900ms). The final text is always laid out, so nothing jumps. */
export function CountUp({ to, prefix = '', size, w = 700, ls = 0, c, duration = 900 }:
  { to: number; prefix?: string; size: number; w?: 500 | 600 | 700; ls?: number; c?: string; duration?: number }) {
  const [v, setV] = useState(IS_TEST ? to : 0);
  useEffect(() => {
    if (IS_TEST) return; // jest: show the final value (rAF state updates would escape act())
    let raf = 0; const t0 = Date.now();
    const tick = () => { const p = Math.min(1, (Date.now() - t0) / duration); setV(Math.round(to * ease(p))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  const fmt = (n: number) => `${prefix}${n.toLocaleString('en-US')}`;
  return (
    <View style={{ alignItems: 'center' }}>
      <T size={size} w={w} ls={ls} c={c} style={v === to ? undefined : { opacity: 0 }}>{fmt(to)}</T>
      {v !== to && <T size={size} w={w} ls={ls} c={c} {...hidden} style={{ position: 'absolute' }}>{fmt(v)}</T>}
    </View>
  );
}
