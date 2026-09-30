import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { StageTrack } from '@/fx/StageTrack';
import { ModelView } from '@/three/ModelView';
import { Rise } from '@/motion/Rise';
import { useDemo, newQuotesFor } from '@/store/demo';
import { BUILDINGS, NEXT_STEP } from '@/data/types';
import { EXPERTS, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, EASE } from '@/theme/tokens';

export default function Home() {
  const { stage, projectType, jobs } = useDemo();
  const quotes = useDemo((st) => st.quotes);
  const fresh = useMemo(() => newQuotesFor({ quotes } as any, 'req-bid'), [quotes]);
  const from = Math.min(...fresh.map((q) => q.price));
  const job = jobs.find((j) => j.status === 'visit' || j.status === 'booked');
  const origin = useSharedValue({ dx: 0, dy: 0 });
  const leave = useSharedValue(0);
  const page = useAnimatedStyle(() => ({ opacity: 1 - leave.value }));
  const fly = useAnimatedStyle(() => {
    const o = origin.value;
    return { transform: [{ translateX: leave.value * o.dx }, { translateY: leave.value * o.dy }, { scale: 1 + leave.value * (90 / 30 - 1) }] };
  });
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const orbRef = useRef<View>(null);
  const { width: winW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [flying, setFlying] = useState<{ x: number; y: number } | null>(null);
  // Ask bar: an unclipped overlay orb (Screen root) scales 30 to 90 and glides to Pulse's hero-orb spot while the page fades
  // (EASE, 420ms) with a light haptic; then Pulse cross-fades in (see (client)/_layout.tsx). Reset when Home regains focus.
  const openPulse = () => {
    if (busy.current) return;
    busy.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    orbRef.current?.measureInWindow?.((x, y, w, h) => {
      const cx = x + w / 2, cy = y + h / 2;
      origin.value = { dx: winW / 2 - cx, dy: Math.max(insets.top, s(30)) + s(40) + s(45) - cy };
      setFlying({ x, y });
    });
    leave.value = withTiming(1, { duration: 420, easing: EASE });
    timer.current = setTimeout(() => router.push('/pulse'), 420);
  };
  useFocusEffect(useCallback(() => {
    busy.current = false; leave.value = 0; setFlying(null);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []));
  const b = BUILDINGS.find((x) => x.id === projectType)!;
  return (
    <Screen bg="aurora3" px={16} overlay={flying ? (
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: flying.x, top: flying.y, width: s(30), height: s(30) }, fly]}><Orb size={30} /></Animated.View>
    ) : undefined}>
      <Animated.View style={[{ flex: 1 }, page]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        <Rise index={0} blur={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
            <View><T size={9.5} c={C.mute}>Good evening</T><GradientText shimmer size={22} w={700} ls={-0.035} style={{ marginTop: s(-1) }}>Sara</GradientText></View>
            <Pressable onPress={() => router.push('/profile')}><Avatar photo="sara" size={34} ring="white" /></Pressable>
          </View>
        </Rise>

        <Rise index={1} r={22} style={{ marginTop: s(58.5) }}>
          <Glass r={22} style={{ paddingTop: s(58), paddingHorizontal: s(14), paddingBottom: s(12), overflow: 'visible' }}>
            <View style={{ position: 'absolute', left: '50%', marginLeft: -s(95), top: -s(78), width: s(190), height: s(140) }}>
              <ModelView model={b.id} lights={0.5} radius={9.4} target={[0, 2.2, 0]} height={0.42} spin={0.15} shadows={false} />
            </View>
            <T size={13} w={700} ls={-0.01} align="center">{b.name} · Al Reem Island</T>
            <StageTrack stage={stage} />
            <Rise index={3} spring blur={false}>
              <Pressable onPress={() => router.push('/quotes?request=req-bid')}>
                <LinearGradient colors={['rgba(0,0,254,0.06)', 'rgba(49,209,255,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }}
                  style={{ marginTop: s(12), borderRadius: s(14), paddingVertical: s(7), paddingLeft: s(7), paddingRight: s(12), flexDirection: 'row', alignItems: 'center', gap: s(9) }}>
                  <View style={{ width: s(28), height: s(28), borderRadius: s(14), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                    ...shadow(C.blue, 0.12, s(5)) }}><Icon name="arrowR" size={12} color={C.blue} stroke={2.4} /></View>
                  <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
                    <T size={8.5} w={700} ls={0.12} c={C.mute}>NEXT STEP</T>
                    {/* one line that may run under "Start", as in the mockup (web: nowrap; native text can't overflow its box, so give it room) */}
                    <GradientText shimmer size={11.5} w={700} style={{ marginTop: 1, flexShrink: 0, ...(Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : { width: s(170) }) } as any}>{NEXT_STEP[stage - 1]}</GradientText>
                  </View>
                  <T size={10} w={700} c={C.blue}>Start</T>
                </LinearGradient>
              </Pressable>
            </Rise>
          </Glass>
        </Rise>

        <Rise index={2} r={24} style={{ marginTop: s(12) }}>
          <Pressable onPress={openPulse}>
            <IridescentBorder r={24}>
              <Glass r={24} style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(6), paddingLeft: s(8), paddingRight: s(6) }}>
                <View ref={orbRef} collapsable={false} style={{ opacity: flying ? 0 : 1 }}><Orb size={30} /></View>
                <GradientText shimmer base={C.faint2} size={12} style={{ flex: 1 }}>Ask Pulse anything…</GradientText>
                <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size={13} color="#fff" stroke={2} /></View>
              </Glass>
            </IridescentBorder>
          </Pressable>
        </Rise>

        <Rise index={4} blur={false}><T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(12), marginBottom: s(8) }}>NEEDS YOU</T></Rise>
        <Rise index={5} r={20}>
          <Glass r={20} style={{ paddingHorizontal: s(14) }}>
            {fresh.length > 0 && (
              <Pressable onPress={() => router.push('/quotes?request=req-bid')} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11), borderBottomWidth: 1, borderBottomColor: C.line }}>
                <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
                  {/* mockup: box-shadow 0 0 0 4px rgba(0,0,254,.12), a ring OUTSIDE the 32px badge */}
                  <View style={{ position: 'absolute', left: -s(4), top: -s(4), right: -s(4), bottom: -s(4), borderRadius: s(20), borderWidth: s(4), borderColor: 'rgba(0,0,254,0.12)' }} />
                  <T size={12} w={700} c="#fff">{String(fresh.length)}</T></View>
                <View style={{ flex: 1 }}><T size={12} w={700} ls={-0.01}>Quotes ready</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{`Bid review · from ${aed(from)}`}</T></View>
                <T size={15} c={C.faint3}>›</T>
              </Pressable>
            )}
            {job && (
              <Pressable onPress={() => router.push(`/job/${job.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11) }}>
                <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: 'rgba(0,0,254,0.08)', alignItems: 'center', justifyContent: 'center' }}><Icon name="cal" size={15} color={C.blue} stroke={2} /></View>
                <View style={{ flex: 1 }}><T size={12} w={700} ls={-0.01}>Site visit</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{`${job.dayLabel} · ${job.timeLabel} · ${EXPERTS.find((e) => e.id === job.expertId)!.first}`}</T></View>
                <T size={15} c={C.faint3}>›</T>
              </Pressable>
            )}
          </Glass>
        </Rise>
      </ScrollView>
      </Animated.View>
    </Screen>
  );
}
