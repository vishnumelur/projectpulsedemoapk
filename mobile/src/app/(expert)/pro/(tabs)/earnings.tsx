// src/app/(expert)/pro/(tabs)/earnings.tsx — E8 earnings
import { Pressable, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Sheet } from '@/ui/Sheet';
import { Segmented } from '@/ui/Segmented';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { EARNINGS, aed } from '@/data/seed';
import { useCountUp, IS_TEST } from '@/screens/expert/motion';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

const CHART_H = 110;
/** ✦ the bars grow in sequence (mockup: 1s cubic-bezier(.22,1,.36,1), staggered). Height is h × chart, capped by the column like the CSS flex shrink. */
function Bar({ h, i, last }: { h: number; i: number; last: boolean }) {
  const g = useSharedValue(IS_TEST ? 1 : 0);
  useEffect(() => { if (!IS_TEST) g.value = withDelay(120 * i, withTiming(1, { duration: 1000, easing: EASE })); }, []);
  const full = s(CHART_H * h);
  const st = useAnimatedStyle(() => ({ height: full * g.value }));
  return (
    <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
      <Animated.View style={[{ width: '100%', maxHeight: '100%', borderTopLeftRadius: s(8), borderTopRightRadius: s(8), borderBottomLeftRadius: s(4), borderBottomRightRadius: s(4),
        overflow: 'hidden', backgroundColor: last ? undefined : 'rgba(22,32,90,0.08)' }, st]}>
        {last && <LinearGradient colors={GRAD} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} />}
      </Animated.View>
    </View>
  );
}

export default function Earnings() {
  const [seg, setSeg] = useState(1); const [sheet, setSheet] = useState(false);
  const withdrawable = useDemo((st) => st.withdrawable); const payouts = useDemo((st) => st.payouts);
  const total = useCountUp(EARNINGS.total, 1100, 100); // ✦ the total counts up
  const paying = useRef(false); // synchronous double-tap guard for the payout
  const confirm = () => {
    if (paying.current) return; paying.current = true;
    useDemo.getState().withdraw();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSheet(false);
  };
  const openSheet = () => { paying.current = false; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSheet(true); };
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(10) }}>Earnings</T>
      <Segmented options={['Week', 'Month', 'Year']} value={seg} onChange={setSeg} style={{ marginTop: s(12) }} />
      <View style={{ alignItems: 'center', marginTop: s(14) }}>
        <T size={9.5} c={C.mute}>{EARNINGS.month}</T>
        <View style={{ flexDirection: 'row', marginTop: s(2) }}><T size={28} w={700} ls={-0.04}>AED </T><GradientText size={28} w={700} ls={-0.04}>{total.toLocaleString('en-US')}</GradientText></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: s(8), height: s(CHART_H), marginTop: s(16), paddingHorizontal: s(4) }}>
        {EARNINGS.weeks.map((h, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: s(5), height: '100%', justifyContent: 'flex-end' }}>
            <Bar h={h} i={i} last={i === EARNINGS.weeks.length - 1} />
            <T size={8} w={700} c={C.faint}>{`W${i + 1}`}</T>
          </View>
        ))}
      </View>
      <Glass r={16} style={{ marginTop: s(14), paddingVertical: s(12), paddingHorizontal: s(14), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View><T size={9.5} c={C.mute}>Ready to withdraw</T><T size={15} w={700} ls={-0.02}>{aed(withdrawable)}</T></View>
        <Pressable disabled={!withdrawable} onPress={openSheet} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: s(9), paddingHorizontal: s(14), borderRadius: s(12), opacity: withdrawable ? 1 : 0.4 }}><T size={10.5} w={700} c="#fff">Withdraw</T></LinearGradient>
        </Pressable>
      </Glass>
      <Glass r={16} style={{ marginTop: s(10), paddingHorizontal: s(14) }}>
        {payouts.map((p, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(10), borderBottomWidth: i === payouts.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
            <View><T size={11.5}>{p.title}</T><T size={9.5} c={C.faint} style={{ marginTop: 1 }}>{p.when}</T></View>
            <T size={11.5} w={700}>{`${p.amount > 0 ? '+' : '−'}${Math.abs(p.amount).toLocaleString('en-US')}`}</T>
          </View>
        ))}
      </Glass>
      {/* ✦ Withdraw opens a short confirmation sheet */}
      <Sheet visible={sheet} onClose={() => setSheet(false)}>
        <T size={17} w={700}>Withdraw to bank</T><T size={11} c={C.mute} style={{ marginTop: s(4) }}>Emirates NBD •••• 2210 · arrives in 1–2 working days</T>
        <Btn title={`Withdraw ${aed(withdrawable)}`} style={{ marginTop: s(14) }} onPress={confirm} />
      </Sheet>
    </Screen>
  );
}
