import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, SharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { Sheet } from '@/ui/Sheet';
import { EXPERTS, DAYS, CLIENT_SLOTS, FEE, VAT_RATE, aed } from '@/data/seed';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, EASE } from '@/theme/tokens';

const SPRING = { damping: 14, stiffness: 220, mass: 0.8 };

function DayCell({ d, on, onPress }: { d: (typeof DAYS)[number]; on: boolean; onPress: () => void }) {
  const sel = useSharedValue(on ? 1 : 0);
  const pop = useSharedValue(0);
  const first = useRef(true);
  useEffect(() => {
    sel.value = withSpring(on ? 1 : 0, SPRING);
    // the selected day lifts, then settles back flush with its neighbours
    if (on && !first.current) pop.value = withSequence(withTiming(1, { duration: 130, easing: EASE }), withSpring(0, SPRING));
    first.current = false;
  }, [on, sel, pop]);
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -s(5) * pop.value }, { scale: 1 + 0.06 * pop.value }] }));
  const blue = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, sel.value)) }));
  const base = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, 1 - sel.value)) }));
  const face = (light: boolean) => (
    <>
      <T size={9} w={600} c={light ? 'rgba(255,255,255,0.8)' : C.mute} align="center">{d.d}</T>
      <T size={16} w={700} ls={-0.02} c={light ? '#fff' : C.navy} align="center" style={{ marginTop: 2 }}>{String(d.n)}</T>
    </>
  );
  return (
    <Pressable testID={`day-${d.n}`} disabled={d.off} onPress={onPress} style={{ flex: 1, opacity: d.off ? 0.35 : 1 }}>
      <Animated.View style={lift}>
        {d.off ? <View style={{ paddingVertical: s(9) }}>{face(false)}</View> : (
          <>
            <Glass r={14} style={{ paddingVertical: s(9) }}><Animated.View style={base}>{face(false)}</Animated.View></Glass>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { paddingVertical: s(9), borderRadius: s(14), backgroundColor: C.blue, ...shadow(C.blue, 0.3, s(11), s(10)) }, blue]}>{face(true)}</Animated.View>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

function Dim({ v }: { v: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ opacity: v.value }));
  if (Platform.OS !== 'ios') return null;
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}><BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} /></Animated.View>;
}

export default function Book() {
  const p = useLocalSearchParams<{ expert?: string; service?: string; pay?: string }>();
  const e = EXPERTS.find((x) => x.id === (p.expert ?? 'omar'))!; const sv = e.services.find((x) => x.id === (p.service ?? e.services[0].id))!;
  const [day, setDay] = useState(9); const [slot, setSlot] = useState('thu-1000');
  const [pay, setPay] = useState(!!p.pay); const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const dimV = useSharedValue(pay ? 1 : 0);
  useEffect(() => { dimV.value = withTiming(pay ? 1 : 0, { duration: 300, easing: EASE }); }, [pay, dimV]);
  const pageStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.4 * dimV.value, ...(Platform.OS === 'web' ? ({ filter: `blur(${1.5 * dimV.value}px)` } as object) : null) }));
  const paying = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  const vat = (sv.price + FEE) * VAT_RATE; const total = sv.price + FEE + vat;
  const time = CLIENT_SLOTS.find((x) => x.id === slot)!.time;
  const svName = sv.name === 'Bid review + visit' ? 'Bid review + site visit' : sv.name;
  const doPay = () => {
    if (paying.current) return; paying.current = true; setState('busy');
    timers.current.push(setTimeout(() => {
      const job = useDemo.getState().bookAndPay({ expertId: e.id, serviceId: sv.id, slotId: slot }); setState('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      timers.current.push(setTimeout(() => { setPay(false); router.replace(`/book/done?job=${job}`); }, 400));
    }, 700));
  };
  const line = (l: string, v: string) => <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: s(5) }}><T size={11} c={C.mute}>{l}</T><T size={11} w={700}>{v}</T></View>;
  return (
    <Screen bg="aurora" px={16}>
      <Animated.View style={[{ flex: 1 }, pageStyle]}>
        <Header center={<Eyebrow>BOOK</Eyebrow>} />
        <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(12) }}>{'When suits\nyou?'}</T>
        <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(12) }}>
          {DAYS.map((d) => <DayCell key={d.n} d={d} on={d.n === day} onPress={() => { setDay(d.n); Haptics.selectionAsync(); }} />)}
        </View>
        <T size={9.5} w={600} c={C.mute} style={{ marginTop: s(14) }}>{`${e.first}'s free times on Thursday`}</T>
        <Animated.View key={`slots-${day}`} entering={FadeIn.duration(260)} exiting={FadeOut.duration(120)} style={{ gap: s(6), marginTop: s(10) }}>
          {[CLIENT_SLOTS.slice(0, 3), CLIENT_SLOTS.slice(3)].map((row, ri) => <View key={ri} style={{ flexDirection: 'row', gap: s(6) }}>{row.map((x) => {
            const on = x.id === slot;
            const label = <T size={11} w={600} c={on ? '#fff' : C.navy} align="center" style={!x.free ? { textDecorationLine: 'line-through' } : undefined}>{x.time}</T>;
            return (
              <Pressable key={x.id} disabled={!x.free} onPress={() => { setSlot(x.id); Haptics.selectionAsync(); }} style={{ flex: 1, opacity: x.free ? 1 : 0.3 }}>
                {on ? <View style={{ paddingVertical: s(10), borderRadius: s(12), backgroundColor: C.navy }}>{label}</View> : <Glass r={12} style={{ paddingVertical: s(10) }}>{label}</Glass>}
              </Pressable>
            );
          })}</View>)}
        </Animated.View>
        <Glass r={18} style={{ marginTop: s(12), padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={e.photo} size={34} />
          <View style={{ flex: 1 }}><T size={11.5} w={700}>{svName}</T><T size={9.5} c={C.mute}>{`Thu ${day} Oct · ${time} · Al Reem Island`}</T></View>
        </Glass>
        <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title={`Continue · ${aed(sv.price)}`} onPress={() => setPay(true)} /></View>
      </Animated.View>
      <Dim v={dimV} />
      <Sheet visible={pay} onClose={() => state === 'idle' && setPay(false)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><T size={19} w={700} ls={-0.03}>Pay securely</T><T size={9.5} c={C.mute}>Held until job sign-off</T></View>
        <LinearGradient colors={[C.navy, C.blue, C.cyan]} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ marginTop: s(12), height: s(66), borderRadius: s(14), paddingVertical: s(10), paddingHorizontal: s(12), overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -s(20), top: -s(30), width: s(90), height: s(90), borderRadius: s(45), backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <T size={10} c="rgba(255,255,255,0.8)">Visa</T><T size={13} w={600} ls={0.12} c="#fff" style={{ marginTop: s(14) }}>•••• 4242</T>
        </LinearGradient>
        <View style={{ marginTop: s(10) }}>
          {line(svName, aed(sv.price))}{line('Service fee', aed(FEE))}{line('VAT 5%', aed(vat, 2))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E9EBF3', marginTop: s(4), paddingTop: s(7), paddingBottom: s(8) }}>
            <T size={11} w={700}>Total</T><T size={15} w={700}>{aed(total, 2)}</T>
          </View>
        </View>
        <Btn title={`Pay ${aed(total, 2)}`} busy={state === 'busy'} done={state === 'done'} onPress={doPay} style={{ marginTop: s(12) }} />
        <Btn variant="black" busy={state === 'busy'} done={state === 'done'} onPress={doPay} style={{ marginTop: s(8), borderRadius: s(14) }}>{state === 'idle' ? <T size={13} w={600} c="#fff">Pay with <T size={13} w={800} c="#fff">G</T> Pay</T> : undefined}</Btn>
      </Sheet>
    </Screen>
  );
}
