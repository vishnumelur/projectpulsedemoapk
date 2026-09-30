// src/app/(expert)/pro/(tabs)/index.tsx — E4 expert dashboard
import { ScrollView, View } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { PageScroll } from '@/ui/PageScroll';
import { T } from '@/ui/T';
import { Avatar } from '@/ui/Avatar';
import { RequestCard } from '@/ui/RequestCard';
import { useDemo } from '@/store/demo';
import { EARNINGS, aed } from '@/data/seed';
import { Rise, useCountUp, IS_TEST } from '@/screens/expert/motion';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, EASE } from '@/theme/tokens';
import { layout } from '@/theme/motion';

const AP = Animated.createAnimatedComponent(Path);
const SPARK_LEN = 130; // polyline length in viewBox units (≈128.4), rounded up so the dash fully hides it

/** ✦ the sparkline draws itself (stroke-dashoffset LEN → 0). */
function Sparkline() {
  const p = useSharedValue(IS_TEST ? 1 : 0);
  useEffect(() => { if (!IS_TEST) p.value = withDelay(250, withTiming(1, { duration: 1300, easing: EASE })); }, []);
  const props = useAnimatedProps(() => ({ strokeDashoffset: SPARK_LEN * (1 - p.value) }));
  return (
    <Svg width={s(70)} height={s(28)} viewBox="0 0 120 40" style={{ position: 'absolute', right: s(16), bottom: s(16) }}>
      <AP animatedProps={props} d="M0 34 L20 28 L40 30 L60 18 L80 22 L100 10 L120 6" fill="none" stroke="#fff" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" opacity={0.9} strokeDasharray={[SPARK_LEN, SPARK_LEN]} />
    </Svg>
  );
}

export default function ExpertHome() {
  // raw state + useMemo (a filtering selector would return a new array every render)
  const requests = useDemo((st) => st.requests);
  const reqs = useMemo(() => requests.filter((r) => r.status === 'sent'), [requests]);
  const total = useCountUp(EARNINGS.total, 1100, 150); // ✦ the amount counts up
  // ✦ new requests slide in with a soft haptic: once as the first cards land, then for every request that arrives live
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = reqs.map((r) => r.id);
    if (!seen.current) {
      seen.current = new Set(ids);
      if (!ids.length) return;
      const t = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 380);
      return () => clearTimeout(t);
    }
    if (ids.some((id) => !seen.current!.has(id))) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    seen.current = new Set(ids);
  }, [reqs]);
  return (
    <Screen bg="aurora3">
      <PageScroll contentContainerStyle={{ paddingBottom: s(90) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
          <View><T size={9.5} c={C.mute}>Good morning</T><T size={22} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(2) }}>Omar</T></View>
          <Avatar photo="omar" size={34} ring="white" />
        </View>
        <LinearGradient colors={[C.navy, C.blue, C.cyan]} locations={[0, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ marginTop: s(14), borderRadius: s(22), padding: s(16), overflow: 'hidden',
            ...shadow(C.blue, 0.25, s(17), s(16)) }}>
          <T size={10} w={600} c="rgba(255,255,255,0.75)">This month</T>
          <T size={26} w={700} ls={-0.04} c="#fff" style={{ marginTop: s(4) }}>{aed(total)}</T>
          <T size={10} c="rgba(255,255,255,0.7)" style={{ marginTop: s(2) }}><T size={10} w={700} c="#8FF0C0">{`↑ ${EARNINGS.trend}%`}</T> vs last month</T>
          <Sparkline />
        </LinearGradient>
        <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(16), marginBottom: s(8) }}>{`NEW REQUESTS · ${reqs.length}`}</T>
        <View style={{ gap: s(8) }}>
          {reqs.map((r, i) => (
            <Animated.View key={r.id} layout={layout}>
              <Rise dx={28} dy={0} delay={180 + 70 * i}><RequestCard r={r} compact={i > 0} /></Rise>
            </Animated.View>
          ))}
        </View>
      </PageScroll>
    </Screen>
  );
}
