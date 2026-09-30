import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, SharedValue, withTiming } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { Sheet } from '@/ui/Sheet';
import { DayStrip, DEFAULT_DAY, StripDay, dayLabel, stripDay } from '@/ui/DayStrip';
import { enterFade, exitFade } from '@/theme/motion';
import { EXPERTS, CLIENT_SLOTS, FEE, VAT_RATE, aed } from '@/data/seed';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

/** Omar's free times per day: Thursday 9 Oct is the approved seed; other days are derived from the date so they stay stable. */
const TIMES = ['08:00', '09:00', '10:00', '11:30', '13:00', '14:00', '15:00', '16:30', '18:00'];
function slotsFor(d: StripDay): { id: string; time: string; free: boolean }[] {
  if (d.key === DEFAULT_DAY) return CLIENT_SLOTS;
  const n = d.n + d.m * 31; const from = n % 4; const weekend = d.wd === 'SAT' || d.wd === 'SUN';
  return TIMES.slice(from, from + 6).map((time, i) => ({ id: `${d.key}-${time.replace(':', '')}`, time,
    free: i !== (n * 5) % 6 && !(weekend && i === (n * 5 + 3) % 6) }));
}
// booking opens tomorrow: today and earlier are dimmed and can't be picked
const notBookable = (d: StripDay) => d.past || d.today;
// this week reads as the weekday ("on Thursday"); further out adds the date ("on Thursday 16 Oct")
const heading = (d: StripDay) => (!d.past && d.idx - stripDay(DEFAULT_DAY).idx <= 3 ? d.wdLong : `${d.wdLong} ${d.n} ${d.mon}`);

const BLUR = s(1.5);
function Dim({ v }: { v: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ opacity: v.value }));
  if (Platform.OS !== 'ios') return null;
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}><BlurView intensity={10} tint="light" style={StyleSheet.absoluteFill} /></Animated.View>;
}

export default function Book() {
  const p = useLocalSearchParams<{ expert?: string; service?: string; pay?: string }>();
  const e = EXPERTS.find((x) => x.id === (p.expert ?? 'omar'))!; const sv = e.services.find((x) => x.id === (p.service ?? e.services[0].id))!;
  const [day, setDay] = useState(DEFAULT_DAY); const [slot, setSlot] = useState('thu-1000');
  const d = stripDay(day); const slots = slotsFor(d);
  const [pay, setPay] = useState(!!p.pay); const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  // a new day keeps the picked time when it's free there, else takes that day's first free time
  const shown = useRef(slots);
  const pickDay = useCallback((key: string) => {
    const next = slotsFor(stripDay(key)); const prev = shown.current; shown.current = next; setDay(key);
    setSlot((cur) => { const t0 = prev.find((x) => x.id === cur)?.time;
      return (next.find((x) => x.free && x.time === t0) ?? next.find((x) => x.free)!).id; });
  }, []);
  const dimV = useSharedValue(pay ? 1 : 0);
  useEffect(() => { dimV.value = withTiming(pay ? 1 : 0, { duration: 300, easing: EASE }); }, [pay, dimV]);
  // page behind the pay sheet: dims and blurs (web: CSS filter; Android 12+: RN's native filter blur; iOS: the Dim BlurView)
  const pageStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.4 * dimV.value, ...(Platform.OS === 'web' ? ({ filter: `blur(${1.5 * dimV.value}px)` } as object)
    : Platform.OS === 'android' ? ({ filter: [{ blur: BLUR * dimV.value }] } as object) : null) }));
  const paying = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  const vat = (sv.price + FEE) * VAT_RATE; const total = sv.price + FEE + vat;
  const time = slots.find((x) => x.id === slot)!.time;
  const svName = sv.name === 'Bid review + visit' ? 'Bid review + site visit' : sv.name;
  const doPay = () => {
    if (paying.current) return; paying.current = true; setState('busy');
    timers.current.push(setTimeout(() => {
      const job = useDemo.getState().bookAndPay({ expertId: e.id, serviceId: sv.id, slotId: slot }); setState('done');
      // the store stamps Thursday's labels; carry the picked day and time onto the job
      useDemo.setState((st) => ({ jobs: st.jobs.map((j) => (j.id === job ? { ...j, dayLabel: dayLabel(d), timeLabel: time } : j)) }));
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
        <DayStrip variant="blue" px={16} mt={12} selected={day} isDisabled={notBookable} onSelect={pickDay} />
        <Animated.View key={`slots-${day}`} entering={enterFade()} exiting={exitFade}>
          <T size={9.5} w={600} c={C.mute} style={{ marginTop: s(14) }}>{`${e.first}'s free times on ${heading(d)}`}</T>
          <View style={{ gap: s(6), marginTop: s(10) }}>
            {[slots.slice(0, 3), slots.slice(3)].map((row, ri) => <View key={ri} style={{ flexDirection: 'row', gap: s(6) }}>{row.map((x) => {
              const on = x.id === slot;
              const label = <T size={11} w={600} c={on ? '#fff' : C.navy} align="center" style={!x.free ? { textDecorationLine: 'line-through' } : undefined}>{x.time}</T>;
              return (
                <Pressable key={x.id} disabled={!x.free} onPress={() => { setSlot(x.id); Haptics.selectionAsync(); }} style={{ flex: 1, opacity: x.free ? 1 : 0.3 }}>
                  {on ? <View style={{ paddingVertical: s(10), borderRadius: s(12), backgroundColor: C.navy }}>{label}</View> : <Glass r={12} style={{ paddingVertical: s(10) }}>{label}</Glass>}
                </Pressable>
              );
            })}</View>)}
          </View>
        </Animated.View>
        <Glass r={18} style={{ marginTop: s(12), padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={e.photo} size={34} />
          <View style={{ flex: 1 }}><T size={11.5} w={700}>{svName}</T><T size={9.5} c={C.mute}>{`${dayLabel(d)} · ${time} · Al Reem Island`}</T></View>
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
