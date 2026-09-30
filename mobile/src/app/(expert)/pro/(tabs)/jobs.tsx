// src/app/(expert)/pro/(tabs)/jobs.tsx — E6 availability & bookings
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PageScroll } from '@/ui/PageScroll';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { useDemo } from '@/store/demo';
import { DayStrip, DEFAULT_DAY, StripDay, stripDay } from '@/ui/DayStrip';
import { enterFade, exitFade } from '@/theme/motion';
import type { Slot } from '@/data/types';
import { GRAD, EASE } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';

const ROW = { flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(11), paddingHorizontal: s(12), borderRadius: s(14), marginTop: s(8) } as const;

/** ✦ Toggling a slot washes the gradient across it (left → right in, and out to the right) with a light haptic. */
function ToggleSlot({ x, onToggle }: { x: Slot; onToggle: (id: string) => void }) {
  const open = x.state === 'open';
  const [w, setW] = useState(0);
  const p = useSharedValue(open ? 1 : 0);
  const dir = useSharedValue(1); // 1: wash in from the left, -1: wash out to the right
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    dir.value = open ? 1 : -1;
    p.value = withTiming(open ? 1 : 0, { duration: 520, easing: EASE });
  }, [open]);
  const clip = useAnimatedStyle(() => {
    const left = dir.value > 0 ? 0 : (1 - p.value) * w;
    return { left, width: p.value * w };
  });
  const inner = useAnimatedStyle(() => ({ transform: [{ translateX: dir.value > 0 ? 0 : -(1 - p.value) * w }] }));
  return (
    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggle(x.id); }}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={({ pressed }) => [ROW, { backgroundColor: 'rgba(22,32,90,0.04)', overflow: 'hidden', transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, bottom: 0, overflow: 'hidden' }, clip]}>
        <Animated.View style={[{ width: w, height: '100%' }, inner]}>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </Animated.View>
      <Animated.View key={x.state} entering={first.current ? undefined : FadeIn.duration(320)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
        <T size={10} w={700} c={open ? 'rgba(255,255,255,0.75)' : C.mute} style={{ width: s(44) }}>{x.time}</T>
        <T size={11.5} w={600} c={open ? '#fff' : C.faint2}>{open ? 'Open for bookings' : 'Off · tap to open'}</T>
      </Animated.View>
    </Pressable>
  );
}

/** A day's schedule. Thursday 9 Oct is the store's seeded slots; other days are derived from the date so they stay stable. */
const VISITS = [['Khalid · Site inspection', 'Khalifa City'], ['Mariam · Structural check', 'Yas Island'], ['Fatima · Snagging walk-through', 'Saadiyat']];
function scheduleFor(d: StripDay): Slot[] {
  const n = d.n + d.m * 31; const weekend = d.wd === 'SAT' || d.wd === 'SUN';
  const times = weekend ? ['10:00', '13:00', '15:00'] : n % 2 ? ['09:00', '11:00', '14:00', '16:00'] : ['10:00', '13:00', '15:00', '17:00'];
  const booked = !weekend && n % 3 === 0 ? n % times.length : -1;
  return times.map((time, i) => {
    const id = `${d.key}-${time.replace(':', '')}`;
    if (i === booked) { const [label, sub] = VISITS[n % VISITS.length]; return { id, day: d.n, time, state: 'booked', label, sub }; }
    return { id, day: d.n, time, state: weekend || (n + i) % 3 === 0 ? 'off' : 'open' };
  });
}
const flip = (x: Slot): Slot => (x.state === 'booked' ? x : { ...x, state: x.state === 'open' ? 'off' : 'open' });

export default function Availability() {
  const seeded = useDemo((st) => st.slots); const toggleSeeded = useDemo((st) => st.toggleSlot);
  // the picked day; toggles on other days are kept per day for the session
  const [day, setDay] = useState(DEFAULT_DAY); const [edits, setEdits] = useState<Record<string, Slot[]>>({});
  const slots = day === DEFAULT_DAY ? seeded : edits[day] ?? scheduleFor(stripDay(day));
  const dayRef = useRef(day); dayRef.current = day;
  const toggle = useCallback((id: string) => {
    const k = dayRef.current; if (k === DEFAULT_DAY) { toggleSeeded(id); return; }
    setEdits((e) => ({ ...e, [k]: (e[k] ?? scheduleFor(stripDay(k))).map((x) => (x.id === id ? flip(x) : x)) }));
  }, [toggleSeeded]);
  const changed = useRef(false);
  const pick = useCallback((k: string) => { changed.current = true; setDay(k); }, []);
  const [on, setOn] = useState(true);
  // master switch: knob springs across, the gradient fades to grey, and all slots dim
  const k = useSharedValue(1);
  useEffect(() => { k.value = withSpring(on ? 1 : 0, { damping: 16, stiffness: 220 }); }, [on]);
  const knobX = s(16);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: (k.value - 1) * knobX }] }));
  const grad = useAnimatedStyle(() => ({ opacity: Math.max(0, Math.min(1, k.value)) }));
  const dim = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * Math.max(0, Math.min(1, k.value)) }));
  return (
    <Screen bg="aurora">
      <PageScroll tabBar>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
        <T size={22} w={700} ls={-0.035} lh={1.1}>Availability</T>
        <Pressable accessibilityLabel="Pause all bookings" onPress={() => { setOn(!on); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ width: s(38), height: s(22), borderRadius: s(11), backgroundColor: '#D3D8E8', overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, grad]}>
            <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', right: s(3), top: s(3), width: s(16), height: s(16), borderRadius: s(8), backgroundColor: '#fff',
            ...shadow('#000', 0.2, s(2), s(2)) }, knob]} />
        </Pressable>
      </View>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Clients can book your open slots</T>
      <DayStrip variant="gradient" px={20} mt={12} selected={day} onSelect={pick} />
      <Animated.View pointerEvents={on ? 'auto' : 'none'} style={[{ marginTop: s(12) }, dim]}>
        <Animated.View key={day} entering={changed.current ? enterFade() : undefined} exiting={exitFade}>
        {slots.map((x) => x.state === 'booked' ? (
          <Pressable key={x.id} disabled={!x.jobId} onPress={() => router.push(`/pro/job/${x.jobId}` as any)} style={[ROW, { backgroundColor: C.navy }]}>
            <T size={10} w={700} c="rgba(255,255,255,0.6)" style={{ width: s(44) }}>{x.time}</T>
            <View style={{ flex: 1 }}><T size={11.5} w={600} c="#fff">{x.label}</T><T size={9.5} w={500} c="rgba(255,255,255,0.65)">{x.sub}</T></View>
          </Pressable>
        ) : <ToggleSlot key={x.id} x={x} onToggle={toggle} />)}
        </Animated.View>
      </Animated.View>
      </PageScroll>
    </Screen>
  );
}
