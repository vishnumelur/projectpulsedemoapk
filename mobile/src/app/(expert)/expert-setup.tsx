import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, { ZoomIn, useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Sheet } from '@/ui/Sheet';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { useDemo } from '@/store/demo';
import type { ChecklistKey } from '@/data/types';
import { GRAD, EASE } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const ITEMS: { k: ChecklistKey; t: string; done: string; hint: string; options: string[] }[] = [
  { k: 'licence', t: 'Licence', done: 'Scanned · AD-ENG-20417', hint: 'Scan with your camera', options: ['Scan licence'] },
  { k: 'experience', t: 'Experience', done: 'Cost engineer · 14 years', hint: 'Your role and years', options: ['10+ years'] },
  { k: 'services', t: 'Services & prices', done: 'Bid review · Site visit · BOQ', hint: 'What you offer', options: ['Bid review · AED 2,200', 'Site visit · AED 1,800', 'BOQ check · AED 1,500'] },
  { k: 'areas', t: 'Service areas', done: 'Abu Dhabi & Dubai', hint: 'Where you work', options: ['Abu Dhabi', 'Dubai', 'Al Ain'] },
  { k: 'portfolio', t: 'Portfolio', done: '3 photos added', hint: '3+ photos of past work', options: ['Add 3 photos'] },
];
const mixc = (a: number[], b: number[], k: number) => '#' + a.map((v, j) => Math.round(v + (b[j] - v) * k).toString(16).padStart(2, '0')).join('');
const CY = [0x31, 0xd1, 0xff], BL = [0, 0, 0xfe], PU = [0x7a, 0x5c, 0xff];
// conic-gradient(from -90deg, cyan, blue 25%, purple 40%): colour at fraction f of the full circle, measured from the arc start
const at = (f: number) => (f <= 0.25 ? mixc(CY, BL, f / 0.25) : mixc(BL, PU, Math.min(1, (f - 0.25) / 0.15)));
// Skia's SweepGradient cannot reproduce the mockup's conic-gradient(from -90deg, ...) here, so the ring is drawn from small segments
const STEP = 2;
const ACircle = Animated.createAnimatedComponent(Circle);
function GradRing({ size, thickness, progress }: { size: number; thickness: number; progress: number }) {
  const D = s(size), th = s(thickness), r = D / 2 - th / 2, c = D / 2;
  const n = Math.round((360 * progress) / STEP);
  const L = 2 * Math.PI * r * (STEP / 360) + s(0.9);
  const circ = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => { p.value = withTiming(progress, { duration: 900, easing: EASE }); }, [progress]);
  // ✦ the ring fills with the gradient: a track-coloured arc recedes to reveal the segments
  const cover = useAnimatedProps(() => ({ strokeDashoffset: -circ * p.value }));
  return (
    <View style={{ width: D, height: D }}>
      <View style={{ position: 'absolute', width: D, height: D, borderRadius: D / 2, borderWidth: th, borderColor: '#E6E9F2' }} />
      {Array.from({ length: n }, (_, i) => {
        const deg = -90 + (i + 0.5) * STEP;
        return <View key={i} style={{ position: 'absolute', left: c - L / 2, top: c - th / 2, width: L, height: th, backgroundColor: at(((i + 0.5) * STEP) / 360), transform: [{ rotate: `${deg}deg` }, { translateY: -r }] }} />;
      })}
      <Svg width={D} height={D} style={{ position: 'absolute', transform: [{ rotate: '180deg' }] }}>
        <ACircle cx={c} cy={c} r={r} stroke="#E6E9F2" strokeWidth={th} fill="none" strokeDasharray={[circ, circ]} animatedProps={cover} />
      </Svg>
    </View>
  );
}
export default function ExpertSetup() {
  const checklist = useDemo((st) => st.checklist); const n = Object.values(checklist).filter(Boolean).length;
  const [open, setOpen] = useState<ChecklistKey | null>(null); const item = ITEMS.find((i) => i.k === open);
  return (
    <Screen bg="aurora">
      <Header center={<T size={9.5} w={700} ls={0.14} c={C.mute}>2 OF 2</T>} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(14), marginTop: s(16) }}>
        <View style={{ width: s(84), height: s(84), alignItems: 'center', justifyContent: 'center' }}>
          <GradRing size={84} thickness={7} progress={n / 5} />
          <View style={{ position: 'absolute', width: s(70), height: s(70), borderRadius: s(35), backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><T size={18} w={700} ls={-0.03}>{`${n}/5`}</T><T size={8} c={C.mute}>done</T></View>
        </View>
        <View style={{ flex: 1 }}><T size={20} w={700} ls={-0.035}>Your profile</T><T size={11} c={C.mute} style={{ marginTop: s(3) }}>{n === 5 ? 'All set' : 'About 3 minutes to finish'}</T></View>
      </View>
      <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
        {ITEMS.map((it, i) => {
          const done = checklist[it.k];
          return (
            <View key={it.k} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(12), borderBottomWidth: i === 4 ? 0 : 1, borderBottomColor: C.line }}>
              {done ? <Animated.View entering={ZoomIn.springify().damping(9)}><LinearGradient colors={GRAD} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(24), height: s(24), borderRadius: s(12), alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></LinearGradient></Animated.View>
                : <View style={{ width: s(24), height: s(24), borderRadius: s(12), borderWidth: 1.5, borderColor: '#D3D8E8' }} />}
              <View style={{ flex: 1 }}><T size={12} w={700} lh={17 / 12}>{it.t}</T><T size={10} c={C.mute} lh={1.7} style={{ paddingTop: s(3) }}>{done ? it.done : it.hint}</T></View>
              {!done && <Pressable onPress={() => setOpen(it.k)}><T size={10.5} w={700} c={C.blue}>Add</T></Pressable>}
            </View>
          );
        })}
      </Glass>
      <Dock><Btn title={n === 5 ? 'Submit for review' : 'Continue'} onPress={() => (n === 5 ? router.push('/expert-verified') : setOpen(ITEMS.find((i) => !checklist[i.k])!.k))} /></Dock>
      <Sheet visible={!!open} onClose={() => setOpen(null)}>
        {item && (<>
          <T size={17} w={700} ls={-0.02}>{item.t}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(6), marginTop: s(12) }}>{item.options.map((o) => <Chip key={o} label={o} on />)}</View>
          <Btn title="Save" style={{ marginTop: s(16) }} onPress={() => { useDemo.getState().completeChecklist(item.k); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setOpen(null); }} />
        </>)}
      </Sheet>
    </Screen>
  );
}
