// A horizontally scrolling, snapping strip of days (3 weeks back, 5 weeks forward around the demo "today").
// Used by 14a Pick a time (variant "blue") and E6 Availability (variant "gradient").
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { SharedValue, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, GRAD } from '@/theme/tokens';
import { DUR, EASE_OUT } from '@/theme/motion';

// ---- demo calendar ----
// The seed's timeline: booked & paid Mon 6 Oct 2025 (today), the visit Thu 9 Oct, due Sun 12 Oct.
const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const WD_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface StripDay {
  key: string; idx: number; n: number; m: number;
  wd: (typeof WD)[number]; wdLong: string; mon: string; first: boolean; past: boolean; today: boolean;
}
const iso = (t: Date) => t.toISOString().slice(0, 10);
const TODAY_UTC = Date.UTC(2025, 9, 6);
export const DEMO_TODAY = iso(new Date(TODAY_UTC));
/** The approved default selection: Thu 9 Oct. */
export const DEFAULT_DAY = '2025-10-09';
export const STRIP_DAYS: StripDay[] = Array.from({ length: 21 + 35 + 1 }, (_, i) => {
  const t = new Date(TODAY_UTC + (i - 21) * 86400e3); const off = i - 21;
  return { key: iso(t), idx: i, n: t.getUTCDate(), m: t.getUTCMonth(), wd: WD[t.getUTCDay()], wdLong: WD_LONG[t.getUTCDay()],
    mon: MON[t.getUTCMonth()], first: t.getUTCDate() === 1, past: off < 0, today: off === 0 };
});
const BY_KEY = new Map(STRIP_DAYS.map((d) => [d.key, d]));
export const stripDay = (key: string) => BY_KEY.get(key)!;
/** "Thu 9 Oct" */
export const dayLabel = (d: StripDay) => `${d.wd[0]}${d.wd.slice(1).toLowerCase()} ${d.n} ${d.mon}`;
/** Report due date for a visit on `d`: three days later (Thu 9 Oct → Sun 12 Oct, as seeded). */
export const dueLabel = (d: StripDay) => {
  const t = new Date(Date.parse(`${d.key}T00:00:00Z`) + 3 * 86400e3);
  const w = WD[t.getUTCDay()];
  return `${w[0]}${w.slice(1).toLowerCase()} ${t.getUTCDate()} ${MON[t.getUTCMonth()]}`;
};

// ---- look per screen (the approved 14a / E6 frames) ----
// inset: the selected (borderless) cell is a touch narrower than the bordered glass cells, as CSS flex sized them in the mockups
const LOOK = {
  blue: { inset: [0.6, 0.6], gap: 6, padV: 9, r: 14, wd: 9, wdW: 600, num: 16, numLs: -0.02, numMt: 2 },
  gradient: { inset: [1.5, 0], gap: 5, padV: 8, r: 12, wd: 8.5, wdW: 700, num: 14, numLs: 0, numMt: 1 },
} as const;
type Variant = keyof typeof LOOK;
const VISIBLE = 5;
// room for the month tag above and the selected glow below, so the list doesn't clip them
const PAD_T = 11, PAD_B = 24;

const Cell = memo(function Cell({ d, on, disabled, v, w, band, x, onPick }: { d: StripDay; on: boolean; disabled: boolean; v: Variant;
  w: number; band: number; x: SharedValue<number>; onPick: (key: string) => void }) {
  const L = LOOK[v];
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: DUR.base, easing: EASE_OUT }); }, [on, p]);
  const selSt = useAnimatedStyle(() => ({ opacity: p.value }));
  const baseSt = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  // the strip runs under the screen's side gutters: cells fade out as they slide into them, so at rest only the 5 in the band show
  const step = w + s(L.gap);
  const edge = useAnimatedStyle(() => {
    const pos = d.idx * step - x.value; const fade = w * 0.6;
    // 2px of slack for scroll rounding: a resting cell stays at exactly 1 (below 1, web drops the glass's backdrop blur)
    const o = pos < -2 ? 1 + (pos + 2) / fade : pos + w > band + 2 ? 1 - (pos + w - band - 2) / fade : 1;
    return { opacity: Math.min(1, Math.max(0, o)) };
  });
  const face = (light: boolean) => (
    <>
      <T size={L.wd} w={L.wdW} c={light ? 'rgba(255,255,255,0.8)' : C.mute} align="center">{d.wd}</T>
      <T size={L.num} w={700} ls={L.numLs || undefined} c={light ? '#fff' : C.navy} align="center" style={{ marginTop: L.numMt }}>{String(d.n)}</T>
    </>
  );
  const sel = { paddingVertical: s(L.padV), borderRadius: s(L.r), overflow: 'hidden' as const, alignItems: 'center' as const };
  return (
    <Animated.View style={[{ width: step }, edge]}>
      <Pressable testID={`day-${d.key}`} accessibilityRole="button" accessibilityLabel={`${d.wdLong} ${d.n} ${d.mon}`}
        accessibilityState={{ selected: on, disabled }} disabled={disabled} onPress={() => onPick(d.key)}
        style={[{ width: w, opacity: disabled ? 0.35 : 1 }, Platform.OS === 'web' ? ({ scrollSnapAlign: 'start' } as object) : null]}>
        {disabled ? <View style={{ paddingVertical: s(L.padV) }}>{face(false)}</View> : (
          <>
            <Animated.View style={baseSt}><Glass r={L.r} style={{ paddingVertical: s(L.padV), alignItems: 'center' }}>{face(false)}</Glass></Animated.View>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { left: s(L.inset[0]), right: s(L.inset[1]) }, selSt]}>
              {v === 'blue'
                ? <View style={[sel, { flex: 1, backgroundColor: C.blue, overflow: 'visible', ...shadow(C.blue, 0.3, s(11), s(10)) }]}>{face(true)}</View>
                : <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[sel, { flex: 1 }]}>{face(true)}</LinearGradient>}
            </Animated.View>
          </>
        )}
        {d.first && <View pointerEvents="none" style={{ position: 'absolute', top: -s(PAD_T - 1), left: 0, right: 0, alignItems: 'center' }}>
          <T size={7} w={700} ls={0.12} c={C.blue}>{d.mon.toUpperCase()}</T>
        </View>}
      </Pressable>
    </Animated.View>
  );
});

export function DayStrip({ selected, onSelect, variant, px, firstVisible = DEMO_TODAY, isDisabled, mt = 0 }: {
  selected: string; onSelect: (key: string) => void; variant: Variant;
  /** the screen's horizontal padding (mockup px): the strip runs to the screen edges and snaps its cells to this inset */
  px: number;
  /** the day shown in the first of the 5 visible cells on open */
  firstVisible?: string;
  isDisabled?: (d: StripDay) => boolean;
  /** top margin (mockup px) as the approved frame has it */
  mt?: number;
}) {
  const L = LOOK[variant];
  const [W, setW] = useState(() => Dimensions.get('window').width - 2 * s(px)); // measured on layout
  const cellW = (W - (VISIBLE - 1) * s(L.gap)) / VISIBLE; const step = cellW + s(L.gap);
  const ref = useAnimatedRef<Animated.FlatList<StripDay>>();
  const first = stripDay(firstVisible).idx;
  const x = useSharedValue(first * step); // the scroll offset, on the UI thread
  // web scrolls in whole px: nudge the content so the opening offset lands on one and the cells sit on the approved pixels
  const nudge = Math.ceil(first * step) - first * step;
  const onScroll = useAnimatedScrollHandler((e) => { x.value = e.contentOffset.x; });
  const props = useRef({ onSelect, step, cellW, W }); props.current = { onSelect, step, cellW, W };
  const onPick = useCallback((key: string) => {
    const { onSelect: sel, step: st, cellW: cw, W: w } = props.current;
    Haptics.selectionAsync(); sel(key);
    const at = stripDay(key).idx * st - x.value; // the cell's left edge within the visible band
    const to = at < -1 ? stripDay(key).idx * st : at + cw > w + 1 ? (stripDay(key).idx - VISIBLE + 1) * st : null;
    if (to != null) (ref.current as any)?.scrollToOffset({ offset: Math.max(0, to), animated: true });
  }, [x, ref]);
  const renderItem = useCallback(({ item }: { item: StripDay }) => (
    <Cell d={item} on={item.key === selected} disabled={!!isDisabled?.(item)} v={variant} w={cellW} band={W} x={x} onPick={onPick} />
  ), [selected, isDisabled, variant, cellW, W, x, onPick]);
  const getItemLayout = useCallback((_: unknown, i: number) => ({ length: step, offset: step * i, index: i }), [step]);
  const onLayout = (e: LayoutChangeEvent) => { const w = e.nativeEvent.layout.width - 2 * s(px); if (Math.abs(w - W) > 0.5) setW(w); };
  return (
    <Animated.FlatList
      ref={ref} data={STRIP_DAYS} keyExtractor={keyOf} renderItem={renderItem} getItemLayout={getItemLayout} extraData={renderItem}
      horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={step} snapToAlignment="start"
      disableIntervalMomentum={false} initialScrollIndex={first} initialNumToRender={12} maxToRenderPerBatch={8} windowSize={5}
      removeClippedSubviews={Platform.OS === 'android'} onScroll={onScroll} scrollEventThrottle={16} onLayout={onLayout}
      style={[{ flexGrow: 0, marginHorizontal: -s(px), marginTop: s(mt) - s(PAD_T), marginBottom: -s(PAD_B) },
        Platform.OS === 'web' ? ({ scrollSnapType: 'x mandatory', scrollPaddingLeft: s(px) } as object) : null]}
      contentContainerStyle={{ paddingLeft: s(px) + nudge, paddingRight: s(px) - s(L.gap), paddingTop: s(PAD_T), paddingBottom: s(PAD_B) }}
    />
  );
}
const keyOf = (d: StripDay) => d.key;
