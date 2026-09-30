import { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Orb } from '@/fx/Orb';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';
import { Pressable } from 'react-native';

const BULLETS: [string, string][] = [['', 'Gulf Construction is lowest once MEP is added.'], ['', 'Al Noor has the strongest schedule.'], ['Recommended: ', 'Gulf, with an MEP clause.']];
export default function Report() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const sent = useRef(false); const [done, setDone] = useState(false);
  const approve = () => { if (sent.current) return; sent.current = true; setDone(true); useDemo.getState().approveJob(id); router.replace(`/review/${id}`); };
  return (
    <Screen bg="aurora">
      <Header />
      <T size={22} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(12) }}>Report ready</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Omar delivered your bid review</T>
      <Glass r={18} style={{ marginTop: s(14), padding: s(14), flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
        <View style={{ width: s(40), height: s(48), borderRadius: s(10), overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(6),
          ...shadow('#16205A', 0.1, s(6)) }}>
          <LinearGradient colors={['#FFFFFF', '#EEF1FB']} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', right: 0, top: 0, width: 0, height: 0, borderStyle: 'solid', borderTopWidth: s(10), borderLeftWidth: s(10), borderTopColor: '#D9DEF0', borderLeftColor: 'transparent' }} />
          <T size={8} w={800} c={C.blue}>PDF</T></View>
        <View style={{ flex: 1, paddingRight: s(10) }}><T size={12} w={700} lh={1.33}>Bid review report</T><T size={10} c={C.mute} style={{ marginTop: s(1) }}>14 pages · 2.4 MB</T></View>
        <T size={11} w={700} c={C.blue}>Open</T>
      </Glass>
      <View style={{ marginTop: s(12), borderRadius: s(18), padding: s(14), backgroundColor: '#fff', ...shadow(C.blue, 0.08, s(14)) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(7) }}><Orb size={14} /><T size={9} w={700} ls={0.08} c={C.blue}>PULSE SUMMARY</T></View>
        {BULLETS.map(([b, t], i) => (
          <Animated.View key={i} entering={FadeInDown.delay(150 * i)} style={{ flexDirection: 'row', marginTop: s(6), marginLeft: s(4), gap: s(6) }}>
            <View style={{ width: s(4), height: s(4), borderRadius: s(2), backgroundColor: C.navy, marginTop: s(8) }} /><T size={11} lh={1.5} style={{ flex: 1 }}>{b ? <T size={11} w={700}>{b}</T> : null}{t}</T>
          </Animated.View>
        ))}
      </View>
      <Dock>
        <Btn title="Approve & release payment" done={done} onPress={approve} />
        <Pressable style={{ marginTop: s(10), alignItems: 'center' }}><T size={11} w={600} c={C.blue}>Ask for changes</T></Pressable>
      </Dock>
    </Screen>
  );
}
