import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Animated, { FadeInUp, useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle, withDelay } from 'react-native-reanimated';
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
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

function Dot({ d }: { d: number }) {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withDelay(d, withRepeat(withSequence(withTiming(-3, { duration: 360 }), withTiming(0, { duration: 360 }), withTiming(0, { duration: 480 })), -1)); }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: y.value < -1 ? 1 : 0.5 }));
  return <Animated.View style={[{ width: s(5), height: s(5), borderRadius: s(3), backgroundColor: C.faint2 }, st]} />;
}
export default function Chat() {
  const { id = 'omar' } = useLocalSearchParams<{ id?: string }>();
  const thread = useDemo((st) => st.threads.find((t) => t.id === id));
  const allMsgs = useDemo((st) => st.messages); const msgs = useMemo(() => allMsgs.filter((m) => m.threadId === id), [allMsgs, id]);
  const ex = EXPERTS.find((e) => e.id === (thread?.expertId ?? id));
  const [text, setText] = useState(''); const [typing, setTyping] = useState(!!thread?.typing);
  const scroll = useRef<ScrollView>(null);
  const send = () => {
    const t = text.trim(); if (!t) return; useDemo.getState().sendMessage(id, t); setText(''); setTyping(true);
    setTimeout(() => { useDemo.setState((st) => ({ messages: [...st.messages, { id: `r-${Date.now()}`, threadId: id, from: 'them', text: "Noted. I'll include it in the report.", at: Date.now() }] })); setTyping(false); }, 2000);
  };
  const bubble = (m: (typeof msgs)[number]) => m.photo
    ? <Image key={m.id} source={PHOTOS[m.photo]} contentFit="cover" style={{ width: s(150), height: s(96), borderRadius: s(14), marginTop: s(8) }} />
    : (
      <Animated.View key={m.id} entering={FadeInUp.springify().damping(16)} style={[{ maxWidth: '76%', paddingVertical: s(9), paddingHorizontal: s(12), borderRadius: s(16), marginTop: s(8) },
        m.from === 'me' ? { alignSelf: 'flex-end', backgroundColor: C.blue, borderBottomRightRadius: s(5) } : { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: s(5), shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(5), elevation: 1 }]}>
        <T size={11} lh={1.45} c={m.from === 'me' ? '#fff' : C.navy}>{m.text}</T>
      </Animated.View>
    );
  return (
    <Screen bg="aurora">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
    </Screen>
  );
}
