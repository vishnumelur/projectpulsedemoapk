import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Animated, { cancelAnimation, useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle, useReducedMotion, withDelay } from 'react-native-reanimated';
import { CHAT_RISE, DUR, SCALE_FROM, ease, easeInOut, enterUp } from '@/theme/motion';
import { Image } from 'expo-image';
import { Screen } from '@/ui/Screen';
import { BackButton } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { LogoMark } from '@/ui/LogoMark';
import { LiveDot } from '@/ui/LiveDot';
import { useDemo } from '@/store/demo';
import { EXPERTS } from '@/data/seed';
import { PHOTOS, PhotoKey } from '@/theme/photos';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, F } from '@/theme/tokens';

function PhotoViewer({ photo, onClose }: { photo: PhotoKey | null; onClose: () => void }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = photo ? withTiming(1, ease(DUR.slow)) : 0; return () => cancelAnimation(p); }, [photo]);
  // the scrim fades; only the photo settles from SCALE_FROM to 1
  const st = useAnimatedStyle(() => ({ opacity: p.value }));
  const img = useAnimatedStyle(() => ({ transform: [{ scale: SCALE_FROM + (1 - SCALE_FROM) * p.value }] }));
  if (!photo) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(8,12,40,0.92)', alignItems: 'center', justifyContent: 'center' }, st]}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ position: 'absolute', top: s(50), right: s(20), width: s(34), height: s(34), borderRadius: s(17), backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <T size={16} w={600} c="#fff">✕</T>
        </Pressable>
        <Animated.View style={[{ width: '94%', aspectRatio: 1.5 }, img]}><Image source={PHOTOS[photo]} contentFit="contain" style={{ flex: 1 }} /></Animated.View>
      </Animated.View>
    </Modal>
  );
}
/** Typing dot: a soft wave, each dot brightens and drifts up 2px on an in-out curve, then rests. No hop. */
function Dot({ d }: { d: number }) {
  const w = useSharedValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    w.value = withDelay(d, withRepeat(withSequence(withTiming(1, easeInOut(450)), withTiming(0, easeInOut(450)), withTiming(0, { duration: 300 })), -1));
    return () => cancelAnimation(w);
  }, [reduce]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: -2 * w.value }], opacity: 0.4 + 0.6 * w.value }));
  return <Animated.View style={[{ width: s(5), height: s(5), borderRadius: s(3), backgroundColor: C.faint2 }, st]} />;
}
export default function Chat() {
  const { id = 'omar' } = useLocalSearchParams<{ id?: string }>();
  const thread = useDemo((st) => st.threads.find((t) => t.id === id));
  const allMsgs = useDemo((st) => st.messages); const msgs = useMemo(() => allMsgs.filter((m) => m.threadId === id), [allMsgs, id]);
  const ex = EXPERTS.find((e) => e.id === (thread?.expertId ?? id));
  const [text, setText] = useState(''); const [typing, setTyping] = useState(!!thread?.typing);
  const [viewer, setViewer] = useState<PhotoKey | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const scroll = useRef<ScrollView>(null);
  const send = () => {
    const t = text.trim(); if (!t) return; useDemo.getState().sendMessage(id, t); setText(''); setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { useDemo.setState((st) => ({ messages: [...st.messages, { id: `r-${Date.now()}`, threadId: id, from: 'them', text: "Noted. I'll include it in the report.", at: Date.now() }] })); setTyping(false); }, 2000);
  };
  const bubble = (m: (typeof msgs)[number]) => m.photo
    ? <Pressable key={m.id} accessibilityLabel="Open photo" onPress={() => setViewer(m.photo!)} style={{ alignSelf: 'flex-start', marginTop: s(8) }}><Image source={PHOTOS[m.photo]} contentFit="cover" style={{ width: s(150), height: s(96), borderRadius: s(14) }} /></Pressable>
    : (
      <Animated.View key={m.id} entering={enterUp(0, 0, CHAT_RISE)} style={[{ maxWidth: '76%', paddingVertical: s(9), paddingHorizontal: s(12), borderRadius: s(16), marginTop: s(8) },
        m.from === 'me' ? { alignSelf: 'flex-end', backgroundColor: C.blue, borderBottomRightRadius: s(5) } : { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: s(5), ...shadow('#16205A', 0.06, s(5)) }]}>
        <T size={11} lh={1.45} c={m.from === 'me' ? '#fff' : C.navy}>{m.text}</T>
      </Animated.View>
    );
  return (
    <Screen bg="aurora">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: s(9) }}>
          <BackButton />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), marginLeft: s(10) }}>
            {thread?.kind === 'team' ? <View style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><LogoMark size={14} color="#fff" /></View>
              : <Avatar photo={ex?.photo ?? 'sara'} size={30} />}
            <View style={{ height: s(30), justifyContent: 'space-between', marginTop: -s(2) }}><T size={12} w={700}>{thread?.title ?? ex?.name}</T>{thread?.kind !== 'team' && <LiveDot label="On site" size={9} />}</View>
          </View>
        </View>
        <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ paddingTop: s(10), paddingBottom: s(20) }}>
          <T size={9.5} c={C.mute} align="center" style={{ marginTop: s(6), marginBottom: s(2) }}>Today</T>
          {msgs.map(bubble)}
          {typing && (
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: s(3), paddingVertical: s(10), paddingHorizontal: s(12), backgroundColor: '#fff', borderRadius: s(16), borderBottomLeftRadius: s(5), marginTop: s(8) }}>
              <Dot d={0} /><Dot d={150} /><Dot d={300} />
            </View>
          )}
        </ScrollView>
        <Glass r={22} style={{ marginBottom: s(20), flexDirection: 'row', alignItems: 'center', gap: s(8), paddingVertical: s(6), paddingLeft: s(14), paddingRight: s(6) }}>
          <TextInput value={text} onChangeText={setText} placeholder="Message…" placeholderTextColor={C.faint2} onSubmitEditing={send} allowFontScaling={false}
            style={{ flex: 1, position: 'relative', fontFamily: F[400], fontSize: s(11.5), color: C.navy, paddingVertical: 0 }} />
          <Pressable accessibilityLabel="Send" onPress={send} style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={13} color="#fff" stroke={2.4} />
          </Pressable>
        </Glass>
      </KeyboardAvoidingView>
      <PhotoViewer photo={viewer} onClose={() => setViewer(null)} />
    </Screen>
  );
}
