import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GradientText } from '@/fx/GradientText';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Orb } from '@/fx/Orb';
import { KB } from '@/pulse/kb';
import { useDemo } from '@/store/demo';
import { simulateQuotes } from '@/sim/scheduler';
import { s } from '@/theme/scale';
import { C, F, EASE } from '@/theme/tokens';

const WHEN = [['asap', 'ASAP'], ['2w', 'Within 2 weeks'], ['flex', 'Flexible']] as const;
type When = (typeof WHEN)[number][0];

/** Caption: the summary types itself in with a shimmer, then crossfades to the settled text. */
function TypedSummary({ text, instant }: { text: string; instant: boolean }) {
  const [n, setN] = useState(instant ? text.length : 0);
  const done = n >= text.length;
  const [gone, setGone] = useState(instant);
  const fade = useSharedValue(instant ? 1 : 0);
  useEffect(() => {
    if (instant || done) return;
    const id = setInterval(() => setN((v) => v + 1), 28);
    return () => clearInterval(id);
  }, [instant, done, text]);
  useEffect(() => { if (n >= text.length) setN(text.length); }, [n, text]);
  useEffect(() => { if (!done) return; fade.value = withTiming(1, { duration: 350, easing: EASE }); const id = setTimeout(() => setGone(true), 400); return () => clearTimeout(id); }, [done]);
  const settled = useAnimatedStyle(() => ({ opacity: fade.value }));
  const typing = useAnimatedStyle(() => ({ opacity: 1 - fade.value }));
  return (
    <View style={{ marginTop: s(8) }}>
      <Animated.View style={settled}><T size={11.5} lh={1.55}>{text}</T></Animated.View>
      {!gone ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0 }, typing]}>
          <GradientText shimmer base={C.navy} size={11.5} lh={1.55}>{text.slice(0, n)}</GradientText>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Caption: the segmented control slides. Local thumb that springs to the selected segment. */
function SlidingSeg({ value, onChange }: { value: When; onChange: (k: When) => void }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, WHEN.findIndex(([k]) => k === value));
  const segW = w ? (w - s(6)) / WHEN.length : 0;
  const x = useSharedValue(0);
  const placed = useRef(false);
  useEffect(() => {
    if (!segW) return;
    if (!placed.current) { placed.current = true; x.value = idx * segW; } // first measurement: snap, no spring
    else x.value = withSpring(idx * segW, { damping: 18, stiffness: 220 });
  }, [idx, segW]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View onLayout={(ev) => setW(ev.nativeEvent.layout.width)} style={{ flexDirection: 'row', backgroundColor: '#F1F3F9', borderRadius: s(12), padding: s(3) }}>
      {segW > 0 && <Animated.View style={[{ position: 'absolute', left: s(3), top: s(3), bottom: s(3), width: segW, borderRadius: s(9), backgroundColor: '#fff', elevation: 1,
        shadowColor: '#16205A', shadowOpacity: 0.08, shadowRadius: s(8), shadowOffset: { width: 0, height: s(2) } }, thumb]} />}
      {WHEN.map(([k, label]) => (
        <Pressable key={k} onPress={() => { if (k !== value) Haptics.selectionAsync(); onChange(k); }} style={{ flex: 1, alignItems: 'center', paddingVertical: s(7) }}>
          <T size={9.6} w={600} ls={-0.02} numberOfLines={1} ellipsizeMode="clip" c={value === k ? C.navy : C.mute}>{label}</T>
        </Pressable>
      ))}
    </View>
  );
}
export default function RequestQuote() {
  const { kb = 'soil-test', stay } = useLocalSearchParams<{ kb?: string; stay?: string }>();
  const e = KB.find((x) => x.id === kb) ?? KB[0];
  const [summary, setSummary] = useState(e.requestSummary); const [edit, setEdit] = useState(false); const [played, setPlayed] = useState(false);
  const [when, setWhen] = useState<When>('2w'); const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const send = () => {
    if (sending.current) return; sending.current = true; setBusy(true);
    const id = useDemo.getState().sendRequest({ kbId: e.id, title: e.requestTitle, summary, expertType: e.recommend.expertType, when });
    simulateQuotes(id); router.replace('/request/sent');
  };
  const kv = (label: string, right: React.ReactNode, last = false) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(12), borderBottomWidth: last ? 0 : 1, borderBottomColor: '#EEF0F6' }}>
      <T size={11.5} c={C.mute}>{label}</T>{right}
    </View>
  );
  return (
    <Screen bg="white">
      <Header flat />
      <T size={24} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(12) }}>Request a quote</T>
      <LinearGradient colors={['rgba(0,0,254,0.04)', 'rgba(49,209,255,0.07)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ marginTop: s(14), borderRadius: s(18), padding: s(14), borderWidth: 1, borderColor: 'rgba(0,0,254,0.08)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}><Orb size={12} /><T size={9} w={700} ls={0.08} c={C.blue}>WRITTEN BY PULSE</T></View>
        {edit ? <TextInput value={summary} onChangeText={setSummary} multiline autoFocus allowFontScaling={false}
          style={{ marginTop: s(8), fontFamily: F[400], fontSize: s(11.5), lineHeight: s(11.5 * 1.55), color: C.navy, padding: 0 }} />
          : <TypedSummary text={summary} instant={!!stay || played} />}
        <Pressable onPress={() => { setPlayed(true); setEdit(!edit); }}><T size={10} w={700} c={C.blue} style={{ marginTop: s(8) }}>{edit ? 'Done' : 'Edit'}</T></Pressable>
      </LinearGradient>
      <View style={{ marginTop: s(6) }}>
        {kv('Location', <T size={11.5} w={700}>Al Reem Island</T>)}
        <View style={{ paddingTop: s(12), paddingBottom: s(6) }}><T size={11.5} c={C.mute}>When</T></View>
        <SlidingSeg value={when} onChange={setWhen} />
        <View style={{ marginTop: s(4) }}>{kv('Sending to', (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
            <View style={{ flexDirection: 'row' }}>{e.recommend.avatars.slice(0, 3).map((p, i) => <Avatar key={p} photo={p} size={18} ring="white" style={{ marginLeft: i ? -s(8) : 0, shadowOpacity: 0, elevation: 0 }} />)}</View>
            <T size={11.5} w={700}>5 experts</T>
          </View>))}</View>
      </View>
      <Dock bg="white"><Btn title="Send request" busy={busy} onPress={send} /></Dock>
    </Screen>
  );
}
