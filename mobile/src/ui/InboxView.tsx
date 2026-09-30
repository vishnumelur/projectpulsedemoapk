// src/ui/InboxView.tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Screen } from './Screen';
import { T } from './T';
import { Glass } from './Glass';
import { Avatar } from './Avatar';
import { Segmented } from './Segmented';
import { Icon } from './Icon';
import { LogoMark } from './LogoMark';
import { useDemo } from '@/store/demo';
import { EXPERTS, CLIENT } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const ago = (at: number, now: number) => { const m = Math.round((now - at) / 60000); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : 'Mon'; };
export function InboxView({ role, initialTab = 0, chatBase }: { role: 'client' | 'expert'; initialTab?: number; chatBase: string }) {
  const [tab, setTab] = useState(initialTab);
  const allThreads = useDemo((st) => st.threads); const allNotes = useDemo((st) => st.notifications);
  const threads = useMemo(() => allThreads.filter((t) => t.forRole === role), [allThreads, role]);
  const notes = useMemo(() => allNotes.filter((n) => n.forRole === role), [allNotes, role]);
  const unread = notes.filter((n) => !n.read).length;
  const now = notes.length ? Math.max(...notes.map((n) => n.at)) + 10 * 60e3 : Date.now();
  const today = notes.filter((n) => now - n.at < 20 * 3600e3); const earlier = notes.filter((n) => now - n.at >= 20 * 3600e3);
  const icon = (k: string) => k === 'quotes' ? <View style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={12} w={700} c="#fff">2</T></View>
    : k === 'answered' ? <View style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: 'rgba(0,0,254,0.08)', alignItems: 'center', justifyContent: 'center' }}><Icon name="shieldCheck" size={15} color={C.blue} stroke={2} /></View>
    : <View style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: 'rgba(17,154,85,0.1)', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} color={C.green} stroke={2.2} /></View>;
  const group = (label: string, list: typeof notes) => list.length ? (<>
    <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(11.5), marginBottom: s(8) }}>{label}</T>
    <Glass r={18} style={{ paddingHorizontal: s(14) }}>
      {list.map((n, i) => (
        <Pressable key={n.id} onPress={() => router.push(n.href as any)} style={{ flexDirection: 'row', gap: s(11), paddingVertical: s(9.5), borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
          {icon(n.kind)}
          <View style={{ flex: 1, marginRight: -s(6) }}><T size={12} w={700} lh={1.75}>{n.title}</T><T size={10.5} c={C.mute} lh={1.93}>{n.text}</T><T size={9} c={C.faint2} style={{ marginTop: s(3) }}>{ago(n.at, now)}</T></View>
        </Pressable>
      ))}
    </Glass>
  </>) : null;
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} style={{ marginTop: s(7) }}>Inbox</T>
      <Segmented options={['Messages', `Updates · ${unread}`]} value={tab} onChange={setTab} style={{ marginTop: s(12) }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        {tab === 0 ? (
          <Glass r={18} style={{ marginTop: s(14), paddingHorizontal: s(14) }}>
            {threads.map((t, i) => (
              <Pressable key={t.id} onPress={() => router.push(`${chatBase}/${t.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11), borderBottomWidth: i === threads.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
                {t.kind === 'team' ? <View style={{ width: s(42), height: s(42), borderRadius: s(21), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><LogoMark size={18} color="#fff" /></View>
                  : <Avatar photo={t.expertId ? EXPERTS.find((e) => e.id === t.expertId)!.photo : CLIENT.photo} size={42} />}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T size={12.5} w={700} numberOfLines={1}>{t.title}</T>
                  <T size={10.5} w={t.typing ? 600 : 400} c={t.typing ? C.blue : C.mute} numberOfLines={1} style={{ marginTop: 2 }}>{t.preview}</T>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: -s(8) }}>
                  <T size={9} c={C.faint}>{t.timeLabel}</T>
                  {t.unread > 0 && <View style={{ marginTop: s(4), minWidth: s(16), height: s(16), borderRadius: s(8), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(4) }}><T size={9} w={700} c="#fff">{String(t.unread)}</T></View>}
                </View>
              </Pressable>
            ))}
          </Glass>
        ) : (<>{group('TODAY', today)}{group('EARLIER', earlier)}</>)}
      </ScrollView>
    </Screen>
  );
}
