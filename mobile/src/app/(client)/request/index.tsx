import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { C, F } from '@/theme/tokens';

const WHEN = [['asap', 'ASAP'], ['2w', 'Within 2 weeks'], ['flex', 'Flexible']] as const;
export default function RequestQuote() {
  const { kb = 'soil-test' } = useLocalSearchParams<{ kb?: string }>();
  const e = KB.find((x) => x.id === kb) ?? KB[0];
  const [summary, setSummary] = useState(e.requestSummary); const [edit, setEdit] = useState(false);
  const [when, setWhen] = useState<'asap' | '2w' | 'flex'>('2w'); const [busy, setBusy] = useState(false);
  const send = () => {
    if (busy) return; setBusy(true);
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
          : <T size={11.5} lh={1.55} style={{ marginTop: s(8) }}>{summary}</T>}
        <Pressable onPress={() => setEdit(!edit)}><T size={10} w={700} c={C.blue} style={{ marginTop: s(8) }}>{edit ? 'Done' : 'Edit'}</T></Pressable>
      </LinearGradient>
      <View style={{ marginTop: s(6) }}>
        {kv('Location', <T size={11.5} w={700}>Al Reem Island</T>)}
        <View style={{ paddingTop: s(12), paddingBottom: s(6) }}><T size={11.5} c={C.mute}>When</T></View>
        <View style={{ flexDirection: 'row', backgroundColor: '#F1F3F9', borderRadius: s(12), padding: s(3) }}>
          {WHEN.map(([k, label]) => (
            <Pressable key={k} onPress={() => setWhen(k)} style={{ flex: 1, alignItems: 'center', paddingVertical: s(7), borderRadius: s(9), backgroundColor: when === k ? '#fff' : 'transparent', elevation: when === k ? 1 : 0 }}>
              <T size={9.6} w={600} ls={-0.02} numberOfLines={1} ellipsizeMode="clip" c={when === k ? C.navy : C.mute}>{label}</T>
            </Pressable>
          ))}
        </View>
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
