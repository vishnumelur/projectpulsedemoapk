// src/ui/InboxView.tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Animated, { FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from './Screen';
import { PageScroll } from './PageScroll';
import { T } from './T';
import { Glass } from './Glass';
import { Avatar } from './Avatar';
import { Segmented } from './Segmented';
import { Icon } from './Icon';
import { LogoMark } from './LogoMark';
import { useDemo } from '@/store/demo';
import { EXPERTS, CLIENT } from '@/data/seed';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';
import type { Notice, Thread } from '@/data/types';

const ago = (at: number, now: number) => { const m = Math.round((now - at) / 60000); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : 'Mon'; };
const D = s(34);
const disc = (bg: string, child: React.ReactNode) => <View style={{ width: D, height: D, borderRadius: D / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{child}</View>;
const BLUE_TINT = 'rgba(0,0,254,0.08)'; const GREEN_TINT = 'rgba(17,154,85,0.1)';
type IconName = React.ComponentProps<typeof Icon>['name'];
const blueIcon = (name: IconName) => disc(BLUE_TINT, <Icon name={name} size={15} color={C.blue} stroke={2} />);
const greenIcon = (name: IconName) => disc(GREEN_TINT, <Icon name={name} size={15} color={C.green} stroke={2.2} />);
/** Notice icon resolver keyed by kind (client + expert kinds). */
const NOTICE_ICON: Record<string, (n: Notice) => React.ReactNode> = {
  quotes: (n) => { const c = n.text.match(/^(\d+)/)?.[1]; return c ? disc(C.blue, <T size={12} w={700} c="#fff">{c}</T>) : blueIcon('mail'); },
  answered: () => blueIcon('shieldCheck'),
  payment: () => greenIcon('check'), report: () => greenIcon('check'), payout: () => greenIcon('check'), booked: () => greenIcon('cal'),
  request: () => blueIcon('req'), quoteSent: () => blueIcon('send'), message: () => blueIcon('chat'),
};
const noticeIcon = (n: Notice) => (NOTICE_ICON[n.kind] ?? (() => blueIcon('inbox')))(n);
function threadAvatar(t: Thread) {
  if (t.kind === 'team') return <View style={{ width: s(42), height: s(42), borderRadius: s(21), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><LogoMark size={18} color="#fff" /></View>;
  const ex = t.expertId ? EXPERTS.find((e) => e.id === t.expertId) : undefined;
  const photo = ex?.photo ?? (t.title === CLIENT.name ? CLIENT.photo : undefined);
  if (photo) return <Avatar photo={photo} size={42} />;
  return disc(BLUE_TINT, <T size={13} w={700} c={C.blue}>{t.title.charAt(0)}</T>);
}
function TypingText({ children }: { children: string }) {
  const o = useSharedValue(1);
  useEffect(() => { o.value = withRepeat(withSequence(withTiming(0.45, { duration: 900, easing: EASE }), withTiming(1, { duration: 900, easing: EASE })), -1); }, []);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ marginTop: 2 }, st]}><T size={10.5} w={600} c={C.blue} numberOfLines={1}>{children}</T></Animated.View>;
}
function UnreadDot({ on }: { on: boolean }) {
  const o = useSharedValue(on ? 1 : 0);
  useEffect(() => { o.value = withTiming(on ? 1 : 0, { duration: 400 }); }, [on]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', right: 0, top: s(13), width: s(7), height: s(7), borderRadius: s(4), backgroundColor: C.blue }, st]} />;
}
export function InboxView({ role, initialTab = 0, chatBase }: { role: 'client' | 'expert'; initialTab?: number; chatBase: string }) {
  const [tab, setTab] = useState(initialTab);
  const allThreads = useDemo((st) => st.threads); const allNotes = useDemo((st) => st.notifications);
  const threads = useMemo(() => allThreads.filter((t) => t.forRole === role), [allThreads, role]);
  const notes = useMemo(() => allNotes.filter((n) => n.forRole === role), [allNotes, role]);
  const unread = notes.filter((n) => !n.read).length;
  const initialIds = useRef(new Set(threads.map((t) => t.id)));
  const topId = useRef(threads[0]?.id);
  useEffect(() => {
    if (threads[0]?.id !== topId.current) { topId.current = threads[0]?.id; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
  }, [threads]);
  const [faded, setFaded] = useState(false);
  useEffect(() => {
    if (tab !== 1) return;
    setFaded(false);
    const h = setTimeout(() => setFaded(true), 1200); // dots fade out locally while viewing
    return () => { clearTimeout(h); useDemo.getState().markNoticesRead(role); }; // read on leaving the tab / unmount
  }, [tab, role]);
  const now = notes.length ? Math.max(...notes.map((n) => n.at)) + 10 * 60e3 : Date.now();
  const today = notes.filter((n) => now - n.at < 20 * 3600e3); const earlier = notes.filter((n) => now - n.at >= 20 * 3600e3);
  const group = (label: string, list: typeof notes) => list.length ? (<>
    <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(11.5), marginBottom: s(8) }}>{label}</T>
    <Glass r={18} style={{ paddingHorizontal: s(14) }}>
      {list.map((n, i) => (
        <Pressable key={n.id} onPress={() => router.push(n.href as any)} style={{ flexDirection: 'row', gap: s(11), paddingVertical: s(9.5), borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
          {noticeIcon(n)}
          <View style={{ flex: 1, marginRight: -s(6) }}><T size={12} w={700} lh={1.75}>{n.title}</T><T size={10.5} c={C.mute} lh={1.93}>{n.text}</T><T size={9} c={C.faint2} style={{ marginTop: s(3) }}>{ago(n.at, now)}</T></View>
          <UnreadDot on={!n.read && !faded} />
        </Pressable>
      ))}
    </Glass>
  </>) : null;
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} style={{ marginTop: s(7) }}>Inbox</T>
      <Segmented options={['Messages', `Updates · ${unread}`]} value={tab} onChange={setTab} style={{ marginTop: s(12) }} />
      <PageScroll contentContainerStyle={{ paddingBottom: s(90) }}>
        {tab === 0 ? (
          <Glass r={18} style={{ marginTop: s(14), paddingHorizontal: s(14) }}>
            {threads.map((t, i) => (
              <Animated.View key={t.id} layout={LinearTransition.springify().damping(18)} entering={initialIds.current.has(t.id) ? undefined : FadeInDown.springify().damping(16)}
                style={{ borderBottomWidth: i === threads.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
                <Pressable onPress={() => router.push(`${chatBase}/${t.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11) }}>
                  {threadAvatar(t)}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ width: s(112) }}><T size={12.5} w={700} numberOfLines={1}>{t.title}</T></View>
                    {t.typing ? <TypingText>{t.preview}</TypingText> : <T size={10.5} c={C.mute} numberOfLines={1} style={{ marginTop: 2 }}>{t.preview}</T>}
                  </View>
                  <View style={{ alignItems: 'flex-end', marginLeft: 0 }}>
                    <T size={9} c={C.faint}>{t.timeLabel}</T>
                    {t.unread > 0 && <View style={{ marginTop: s(4), minWidth: s(16), height: s(16), borderRadius: s(8), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(4) }}><T size={9} w={700} c="#fff">{String(t.unread)}</T></View>}
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </Glass>
        ) : (<>{group('TODAY', today)}{group('EARLIER', earlier)}</>)}
      </PageScroll>
    </Screen>
  );
}
