// src/app/(expert)/pro/request/[id].tsx — E5 request → send a quote
import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Orb } from '@/fx/Orb';
import { useDemo } from '@/store/demo';
import { RollingPrice } from '@/screens/expert/motion';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const RANGE: Record<string, [number, number]> = { 'soil-test': [1800, 2600], boq: [1200, 1800], 'bid-review': [2000, 2800] };
export default function SendQuote() {
  const { id = 'req-soil' } = useLocalSearchParams<{ id?: string }>();
  const found = useDemo((st) => st.requests.find((x) => x.id === id));
  const first = useDemo((st) => st.requests[0]);
  const r = found ?? first;
  const [lo, hi] = RANGE[r.kbId] ?? [1500, 2500];
  const [price, setPrice] = useState(r.kbId === 'soil-test' ? 1900 : Math.round((lo + hi) / 2 / 100) * 100);
  const [days, setDays] = useState(5); const out = price < lo || price > hi;
  const input = useRef<TextInput>(null);
  const sent = useRef(false); // synchronous double-tap guard: two taps can land before a re-render
  const send = () => {
    if (sent.current) return; sent.current = true;
    useDemo.getState().sendQuote(r.id, Math.max(100, price), days); // typed prices may not have blurred through the floor yet
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/pro');
  };
  const stepBtn = (label: string, d: number, a11y: string) => (
    <Pressable accessibilityLabel={a11y} onPress={() => { setPrice((p) => Math.max(100, p + d)); Haptics.selectionAsync(); }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.92 : 1 }] })}>
      <Glass r={20} style={{ width: s(40), height: s(40), alignItems: 'center', justifyContent: 'center' }}><T size={18}>{label}</T></Glass>
    </Pressable>
  );
  const chip = { flex: 1, paddingVertical: s(9), borderRadius: s(12), alignItems: 'center', borderWidth: 1 } as const;
  return (
    <Screen bg="aurora">
      <Header />
      <T size={20} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(10) }}>{r.title}</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`From ${r.clientName} · ${r.clientName === 'Sara' ? 'Villa, Al Reem Island' : r.place}`}</T>
      <Glass r={16} style={{ marginTop: s(12), padding: s(12) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}><Orb size={12} /><T size={8.5} w={700} ls={0.08} c={C.blue}>WRITTEN BY PULSE</T></View>
        <T size={11} lh={1.5} style={{ marginTop: s(6), marginRight: s(2) }}>{r.summary}</T>
      </Glass>
      <T size={9} w={700} ls={0.14} c={C.mute} align="center" style={{ marginTop: s(16) }}>YOUR PRICE</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: s(10) }}>
        {stepBtn('−', -100, 'Decrease price')}
        {/* tap the number to type a price */}
        <Pressable accessibilityRole="button" accessibilityLabel={`Price AED ${price.toLocaleString('en-US')}, tap to type`} onPress={() => input.current?.focus()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T size={30} w={700} ls={-0.04}>AED </T>
          <RollingPrice value={price} size={30} amber={out} gradient={GRAD} />
          <TextInput ref={input} value={String(price)} keyboardType="number-pad" maxLength={5} caretHidden
            onChangeText={(t) => { const n = Number(t.replace(/\D/g, '')); if (n) setPrice(n); }}
            onBlur={() => setPrice((p) => Math.max(100, p))}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
        </Pressable>
        {stepBtn('+', 100, 'Increase price')}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(7), marginTop: s(6) }}>
        <Orb size={12} /><T testID="range-hint" size={10} w={600} c={out ? C.amber : C.blue}>{`Typical for this job: AED ${lo.toLocaleString('en-US')}–${hi.toLocaleString('en-US')}`}</T>
      </View>
      <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(16) }}>REPORT IN</T>
      <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
        {[3, 5, 7].map((d) => d === days ? (
          <LinearGradient key={d} colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[chip, { borderColor: 'transparent', shadowColor: C.blue, shadowOpacity: 0.22, shadowRadius: s(7), shadowOffset: { width: 0, height: s(6) }, elevation: 4 }]}>
            <T size={10.5} w={600} c="#fff">{`${d} days`}</T>
          </LinearGradient>
        ) : (
          <Pressable key={d} onPress={() => { setDays(d); Haptics.selectionAsync(); }} style={[chip, { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(22,32,90,0.06)' }]}>
            <T size={10.5} w={600} c={C.mute}>{`${d} days`}</T>
          </Pressable>
        ))}
      </View>
      <Dock><Btn title="Send quote" onPress={send} /></Dock>
    </Screen>
  );
}
