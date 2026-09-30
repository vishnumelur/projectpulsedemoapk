import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { BackButton } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Icon } from '@/ui/Icon';
import { Avatar } from '@/ui/Avatar';
import { Sheet } from '@/ui/Sheet';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { usePulseFlow } from '@/pulse/usePulseFlow';
import { SUGGESTIONS, SUGGESTION_QUERY, STAGE_EXPERTS, renderBody } from '@/pulse/match';
import { STAGES, Stage } from '@/data/types';
import { CLIENT, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

function Counter({ to, ms }: { to: number; ms: number }) {
  const [n, setN] = useState(0);
  useEffect(() => { const t0 = Date.now(); const id = setInterval(() => { const p = Math.min(1, (Date.now() - t0) / ms); setN(Math.round(to * p)); if (p === 1) clearInterval(id); }, 40); return () => clearInterval(id); }, []);
  return <T size={13} w={700} style={{ fontVariant: ['tabular-nums'] }}>{n.toLocaleString('en-US')}</T>;
}

function Streamed({ text, lead }: { text: string; lead: string }) {
  const words = text.split(' '); const [k, setK] = useState(0);
  useEffect(() => { const id = setInterval(() => setK((x) => (x >= words.length ? (clearInterval(id), x) : x + 1)), 45); return () => clearInterval(id); }, [text]);
  return <T size={12.5} lh={1.6}><T size={12.5} w={700}>{lead}</T>{' '}{words.slice(0, k).join(' ')}</T>;
}

const Head = ({ right }: { right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), paddingTop: s(8) }}>
    <BackButton flat /><T size={13} w={700} ls={-0.01}>Pulse</T><View style={{ marginLeft: 'auto' }}>{right}</View>
  </View>
);

export default function PulseScreen() {
  const params = useLocalSearchParams<{ state?: string; q?: string; stay?: string }>();
  const f = usePulseFlow(params);
  const [text, setText] = useState(params.state === 'ask' ? 'Do I need a soil test?' : '');
  const [stageSheet, setStageSheet] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => { if (f.state === 'flagged') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [f.state]);

  if (f.state === 'open') return (
    <Screen bg="white">
      <View style={{ alignItems: 'center', flex: 1 }}>
        <View style={{ marginTop: s(40) }}><Orb size={90} /></View>
        <View style={{ marginTop: s(34), alignItems: 'center' }}>
          <T size={15} w={600} ls={-0.02} lh={1.35} align="center">What would you like</T>
          <View style={{ flexDirection: 'row' }}><T size={15} w={600} ls={-0.02} lh={1.35}>help with, </T><GradientText shimmer size={15} w={600} ls={-0.02} lh={1.35}>{CLIENT.first}</GradientText><T size={15} w={600} lh={1.35}>?</T></View>
        </View>
        <View style={{ marginTop: s(22), gap: s(8), alignSelf: 'stretch' }}>
          {SUGGESTIONS[f.askStage].map((sug) => (
            <Pressable key={sug} onPress={() => { Haptics.selectionAsync(); setPicked(sug); setTimeout(() => f.submit(SUGGESTION_QUERY[sug] ?? sug), 260); }}>
              <Glass r={16} style={[{ paddingVertical: s(12), paddingHorizontal: s(14) }, picked === sug && { borderColor: C.blue, borderWidth: 1.5 }]}><T size={12} w={600}>{sug}</T></Glass>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => f.setState('ask')} style={{ marginTop: 'auto', marginBottom: s(22) }}><T size={9.5} c={C.mute}>or just ask. Type, or hold the mic to speak</T></Pressable>
      </View>
    </Screen>
  );

  if (f.state === 'ask') return (
    <Screen bg="white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Head right={
          <Pressable onPress={() => setStageSheet(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(5), backgroundColor: C.inputBg, paddingVertical: s(7), paddingHorizontal: s(11), borderRadius: s(16) }}>
            <T size={10.5} w={700}>{STAGES[f.askStage - 1]} stage</T><Icon name="chev" size={9} stroke={3} />
          </Pressable>} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Orb size={96} soft />
          <T size={16} w={600} ls={-0.02} lh={1.4} align="center" style={{ marginTop: s(30) }}>{'What would you\nlike to know?'}</T>
          <T size={9.5} c={C.mute} style={{ marginTop: s(8) }}>Answers from Project Pulse experts</T>
        </View>
        <View style={{ marginBottom: s(20), flexDirection: 'row', alignItems: 'center', gap: s(8), backgroundColor: C.inputBg, borderRadius: s(22), paddingVertical: s(6), paddingLeft: s(14), paddingRight: s(6) }}>
          <TextInput value={text} onChangeText={setText} onSubmitEditing={() => f.submit(text)} placeholder="Ask about your project" placeholderTextColor={C.faint2}
            allowFontScaling={false} style={{ flex: 1, fontFamily: F[400], fontSize: s(11.5), color: C.navy, paddingVertical: 0 }} />
          <Pressable onPress={() => f.submit(text)} style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center',
            shadowColor: C.blue, shadowOpacity: 0.3, shadowRadius: s(7), elevation: 4 }}><Icon name="send" size={14} color="#fff" stroke={2.4} /></Pressable>
        </View>
      </KeyboardAvoidingView>
      <Sheet visible={stageSheet} onClose={() => setStageSheet(false)}>
        <T size={15} w={700} style={{ marginBottom: s(8) }}>Asking about stage</T>
        {STAGES.map((n, i) => (
          <Pressable key={n} onPress={() => { f.setAskStage((i + 1) as Stage); setStageSheet(false); }} style={{ paddingVertical: s(10), borderBottomWidth: 1, borderBottomColor: C.line }}>
            <T size={13} w={i + 1 === f.askStage ? 700 : 500} c={i + 1 === f.askStage ? C.blue : C.navy}>{n}</T>
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );

  if (f.state === 'thinking') {
    const key = f.result?.kind === 'answer' ? f.result.entry.keyPhrase : '';
    const idx = key ? f.q.toLowerCase().indexOf(key.toLowerCase()) : -1;
    return (
      <Screen bg="white">
        <View style={{ paddingTop: s(8) }}><BackButton flat /></View>
        <View style={{ alignItems: 'center' }}>
          <View style={{ marginTop: s(62) }}><Orb size={132} soft /></View>
          <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: s(34), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {idx >= 0 ? (<>
              <T size={14} w={500} ls={-0.01} c={C.faint}>{f.q.slice(0, idx)}</T>
              <GradientText shimmer size={14} w={600} ls={-0.01}>{f.q.slice(idx, idx + key.length)}</GradientText>
              <T size={14} w={500} ls={-0.01} c={C.faint}>{f.q.slice(idx + key.length)}</T>
            </>) : <T size={14} w={500} c={C.faint} align="center">{f.q}</T>}
          </Animated.View>
          <T size={9.5} c={C.faint3} style={{ marginTop: s(6) }}>Finding your answer…</T>
          <LinearGradient colors={['#B9A8FF', 'rgba(185,168,255,0)']} style={{ width: 1, height: s(60), marginTop: s(22) }} />
          <View style={{ width: s(52), height: s(52), borderRadius: s(26), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: s(6),
            shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(10), elevation: 3 }}>
            <Counter to={1240} ms={1700} /><T size={6.5} w={700} ls={0.12} c={C.mute}>GUIDES</T>
          </View>
        </View>
      </Screen>
    );
  }

  if (f.state === 'flagged') return (
    <Screen bg="white">
      <View style={{ paddingTop: s(8) }}><BackButton flat /></View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <T size={13} c={C.faint} style={{ marginTop: s(20) }}>{`"${f.q}"`}</T>
        <View style={{ marginTop: s(30), width: s(104), height: s(104), alignItems: 'center', justifyContent: 'center' }}>
          <Orb size={104} soft calm style={{ position: 'absolute' }} />
          <Avatar photo="rashid" size={58} ring="white" />
        </View>
        <T size={21} w={700} ls={-0.035} lh={1.2} align="center" style={{ marginTop: s(24) }}>{'An engineer will\nanswer this one'}</T>
        <T size={11} c={C.mute} lh={1.55} align="center" style={{ marginTop: s(10), maxWidth: s(210) }}>
          {/wall/i.test(f.q) ? 'Wall changes affect' : f.result?.kind === 'flagged' && f.result.category === 'legal' ? 'Legal questions need' : f.result?.kind === 'flagged' && f.result.category === 'safety' ? 'Safety issues need' : 'This affects'}
          {f.result?.kind === 'flagged' && f.result.category !== 'structural' ? ' a person, so ' : " your building's structure, so "}
          <T size={11} w={700}>Rashid from Project Pulse</T> will reply to you personally.
        </T>
        <Glass r={14} style={{ marginTop: s(18), flexDirection: 'row', alignItems: 'center', gap: s(8), paddingVertical: s(9), paddingHorizontal: s(14) }}>
          <View style={{ zIndex: 1 }}><Icon name="mail" size={14} color={C.blue} stroke={2} /></View><T size={10.5} w={600}>Reply by email <T size={10.5} w={500} c={C.faint}>· within 24h</T></T>
        </Glass>
        <View style={{ alignSelf: 'stretch', marginTop: 'auto', marginBottom: s(18) }}>
          <Btn title="Got it" onPress={() => router.replace('/home')} />
          <Pressable onPress={() => router.replace('/experts')} style={{ marginTop: s(12), alignItems: 'center' }}><T size={11} w={600} c={C.blue}>Book a structural engineer instead</T></Pressable>
        </View>
      </View>
    </Screen>
  );

  // answer + fallback
  const e = f.result?.kind === 'answer' ? f.result.entry : null;
  return (
    <Screen bg="white">
      <Head />
      <View style={{ alignItems: 'flex-end', marginTop: s(14) }}>
        <View style={{ maxWidth: '78%', backgroundColor: C.navy, paddingVertical: s(10), paddingHorizontal: s(13), borderTopLeftRadius: s(18), borderTopRightRadius: s(18), borderBottomLeftRadius: s(18), borderBottomRightRadius: s(5) }}>
          <T size={11.5} c="#fff" lh={1.45}>{f.q}</T>
        </View>
      </View>
      {e ? (<>
        <View style={{ marginTop: s(14) }}><Streamed lead={e.lead} text={renderBody(e, f.projectType)} /></View>
        <Animated.View entering={FadeIn.delay(600)} style={{ flexDirection: 'row', marginTop: s(8) }}>
          <View style={{ backgroundColor: 'rgba(0,0,254,0.06)', paddingVertical: s(3.5), paddingHorizontal: s(9), borderRadius: s(10) }}><T size={9} w={700} c={C.blue}>{`◆ ${e.source}`}</T></View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(900).springify().damping(16)} style={{ marginTop: s(14) }}>
          <View style={{ borderRadius: s(22), backgroundColor: '#fff', padding: s(14), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,254,0.06)',
            shadowColor: C.blue, shadowOpacity: 0.12, shadowRadius: s(20), shadowOffset: { width: 0, height: s(18) }, elevation: 6 }}>
            <LinearGradient colors={['rgba(49,209,255,0.32)', 'rgba(185,168,255,0.32)', 'rgba(0,0,254,0.16)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, height: s(64) }} />
            <LinearGradient colors={['rgba(255,255,255,0)', '#fff']} style={{ position: 'absolute', left: 0, right: 0, top: s(24), height: s(40) }} />
            <T size={9} w={700} ls={0.13} c={C.blue}>YOU'LL NEED</T>
            <T size={15} w={700} ls={-0.02} style={{ marginTop: s(6) }}>{e.recommend.expertType}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), marginTop: s(8) }}>
              <View style={{ flexDirection: 'row' }}>{e.recommend.avatars.map((p, i) => <Avatar key={p} photo={p} size={22} ring="white" style={{ marginLeft: i ? -s(8) : 0 }} />)}</View>
              <T size={9.5} c={C.mute} style={{ flexShrink: 0 }}>{`${e.recommend.count} verified · from ${aed(e.recommend.fromPrice)}`}</T>
            </View>
            <Btn title="Request a quote" style={{ marginTop: s(12), paddingVertical: s(11) }} onPress={() => router.push(`/request?kb=${e.id}`)} />
          </View>
        </Animated.View>
      </>) : (<>
        <T size={12.5} lh={1.6} style={{ marginTop: s(14) }}>I don't have a verified answer for that yet.</T>
        <T size={11} c={C.mute} lh={1.5} style={{ marginTop: s(4) }}>{`Here's the right expert to ask for your ${STAGES[f.askStage - 1].toLowerCase()} stage:`}</T>
        <View style={{ marginTop: s(12), gap: s(8) }}>
          {STAGE_EXPERTS[f.askStage].map((x) => (
            <Pressable key={x} onPress={() => router.push('/experts')}><Glass r={16} style={{ padding: s(12), flexDirection: 'row', justifyContent: 'space-between' }}><T size={12} w={700}>{x}</T><T size={12} c={C.blue} w={700}>›</T></Glass></Pressable>
          ))}
        </View>
      </>)}
    </Screen>
  );
}
