import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { ModelView } from '@/three/ModelView';
import { useDemo } from '@/store/demo';
import { BUDGET, DECISIONS, DOCS, MILESTONES, SITE, PROJECT } from '@/data/seed';
import { STAGES, BUILDINGS } from '@/data/types';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

const LH = 1.26; // Chrome 'normal' line height of the mockup font
const L = (props: React.ComponentProps<typeof T>) => <T lh={LH} {...props} />;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Three explicit arcs (blue 0-38%, cyan 38-58%, lilac 58-68%) on the grey track, hole filled like the mockup. */
function BudgetRing({ size, thickness, children }: { size: number; thickness: number; children?: React.ReactNode }) {
  const D = s(size), t = s(thickness), c = D / 2, r = (D - t) / 2;
  const pt = (f: number) => { const a = -Math.PI / 2 + f * Math.PI * 2; return `${c + r * Math.cos(a)} ${c + r * Math.sin(a)}`; };
  const arc = (a: number, b: number) => `M ${pt(a)} A ${r} ${r} 0 ${b - a > 0.5 ? 1 : 0} 1 ${pt(b)}`;
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(1, { duration: 1200, easing: ease }); }, [v]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ rotate: `${(v.value - 1) * 90}deg` }, { scale: 0.8 + 0.2 * v.value }] }));
  return (
    <View style={{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: D, height: D }, st]}>
        <Svg width={D} height={D}>
          <Path d={arc(0, 0.9999)} stroke="#E6E9F2" strokeWidth={t} fill="none" />
          <Path d={arc(0, 0.38)} stroke="#0000FE" strokeWidth={t} fill="none" />
          <Path d={arc(0.38, 0.58)} stroke="#31D1FF" strokeWidth={t} fill="none" />
          <Path d={arc(0.58, 0.68)} stroke="#B9A8FF" strokeWidth={t} fill="none" />
        </Svg>
      </Animated.View>
      <View style={{ width: s(88), height: s(88), borderRadius: s(44), backgroundColor: '#F7F8FC', alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

function Bar({ pct, color, i }: { pct: number; color: string; i: number }) {
  const v = useSharedValue(0);
  useEffect(() => { v.value = withDelay(300 + i * 140, withTiming(pct, { duration: 900, easing: ease })); }, [v, pct, i]);
  const st = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return <View style={{ height: s(5), borderRadius: s(5), backgroundColor: '#E6E9F2', marginTop: s(6), overflow: 'hidden' }}><Animated.View style={[{ height: '100%', borderRadius: s(5), backgroundColor: color }, st]} /></View>;
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = Date.now(); const id = setInterval(() => { const f = Math.min(1, (Date.now() - t0) / 1200); setV(to * (1 - Math.pow(1 - f, 3))); if (f >= 1) clearInterval(id); }, 32);
    return () => clearInterval(id);
  }, [to]);
  return <>{`AED ${v.toFixed(2)}M `}</>;
}

const TABS = ['Milestones', 'Budget', 'Site', 'Docs', 'Decisions'] as const;
type Tab = (typeof TABS)[number];
const tag = (label: string, bg: string, fg: string) => <View style={{ paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8), backgroundColor: bg }}><L size={8.5} w={700} c={fg}>{label}</L></View>;
const k = (n: number) => `AED ${Math.round(n / 1000)}K`;

export default function Project() {
  const p = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(p.tab === 'budget' ? 'Budget' : p.tab === 'site' ? 'Site' : 'Milestones');
  const { stage, projectType } = useDemo(); const name = BUILDINGS.find((b) => b.id === projectType)!.name;
  const tabs = (
    <View style={{ flexDirection: 'row', gap: s(16), marginTop: s(14.5), overflow: 'hidden' }}>
      {TABS.map((t) => (
        <Pressable key={t} onPress={() => setTab(t)}>
          <L size={11.5} w={600} c={t === tab ? C.navy : C.faint2}>{t}</L>
          {t === tab && <View style={{ position: 'absolute', left: 0, right: 0, bottom: -s(7), height: 2, borderRadius: 2, backgroundColor: C.blue }} />}
        </Pressable>
      ))}
    </View>
  );
  const compactHeader = (title: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(11) }}>
      <T size={20} w={700} ls={-0.035} lh={1.1}>{title}</T><L size={9.5} c={C.mute}>{`${name} · Al Reem`}</L>
    </View>
  );
  const dateRow = (key: string, day: string, month: string, title: string, sub: string, right: React.ReactNode, last: boolean) => (
    <View key={key} style={{ flexDirection: 'row', gap: s(12), alignItems: 'center', paddingVertical: s(11), borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
      <View style={{ width: s(30), alignItems: 'center' }}><T size={14} w={700} ls={-0.02} style={{ lineHeight: s(22) }}>{day}</T><T size={8.5} w={700} ls={0.06} c={C.mute} style={{ lineHeight: s(17) }}>{month}</T></View>
      <View style={{ flex: 1, minWidth: 0, marginRight: -s(8) }}><T size={11.5} w={700} ellipsizeMode="clip" numberOfLines={1} style={{ lineHeight: s(19.5) }}>{title}</T><T size={10} c={C.mute} style={{ lineHeight: s(19.5) }}>{sub}</T></View>
      {right}
    </View>
  );
  return (
    <Screen bg="aurora">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        {tab === 'Milestones' ? (<>
          <View style={{ height: s(118), marginHorizontal: -s(20) }}><ModelView model={projectType} stage={projectType === 'villa' ? stage : 'solid'} radius={8.5} target={[0, 2.8, 0]} spin={0.12} shadows={false} /></View>
          <T size={20} w={700} ls={-0.035} lh={1.1}>{`${name} · Al Reem`}</T>
          <L size={11} c={C.mute} style={{ marginTop: s(4.5) }}>{`${STAGES[stage - 1]} · step ${stage} of 6`}</L>
          {tabs}
          <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
            {MILESTONES.map((m, i) => dateRow(m.title, m.day, m.month, m.title, m.stage,
              m.status === 'done' ? tag('Done', C.greenBg, C.green) : m.status === 'next' ? tag('Next', 'rgba(0,0,254,0.08)', C.blue) : <L size={9.5} c={C.mute}>Planned</L>, i === MILESTONES.length - 1))}
          </Glass>
        </>) : tab === 'Budget' ? (<>
          {compactHeader('Budget')}{tabs}
          <View style={{ alignItems: 'center', marginTop: s(16.5) }}>
            <BudgetRing size={118} thickness={15}>
              <T size={20} w={700} ls={-0.03} lh={LH}>{`${Math.round((PROJECT.committed / PROJECT.budget) * 100)}%`}</T><L size={8.5} c={C.mute}>committed</L>
            </BudgetRing>
            <T size={15} w={700} ls={-0.02} lh={LH} style={{ marginTop: s(11) }}><CountUp to={PROJECT.committed / 1_000_000} /><T size={15} w={500} c={C.faint2}>of 2.4M</T></T>
          </View>
          <Glass r={18} style={{ marginTop: s(12.5), paddingVertical: s(2), paddingHorizontal: s(14) }}>
            {BUDGET.map((b, i) => (
              <View key={b.name} style={{ paddingVertical: s(9) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><L size={11} w={700}>{b.name}</L><L size={11} c={C.mute}>{k(b.amount)}</L></View>
                <Bar pct={b.pct} color={b.color} i={i} />
              </View>
            ))}
          </Glass>
        </>) : tab === 'Site' ? (<>
          {compactHeader('Site')}{tabs}
          <View style={{ gap: s(8), marginTop: s(14) }}>
            {[[SITE[0]], SITE.slice(1)].map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: s(8) }}>
                {row.map((x) => (
                  <View key={x.label} style={{ flex: 1, height: s('big' in x && x.big ? 122 : 104), borderRadius: s(16), overflow: 'hidden' }}>
                    <Image source={PHOTOS[x.photo]} contentFit="cover" style={{ flex: 1 }} />
                    <View style={{ position: 'absolute', left: s(8), bottom: s(8), backgroundColor: 'rgba(10,16,50,0.45)', paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8) }}><L size={9} w={700} c="#fff">{x.label}</L></View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>) : tab === 'Docs' ? (<>
          {compactHeader('Docs')}{tabs}
          <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
            {DOCS.map((d, i) => (
              <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(11), borderBottomWidth: i === DOCS.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
                <View style={{ width: s(30), height: s(36), borderRadius: s(8), backgroundColor: '#F4F6FD', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(4) }}><T size={7} w={800} c={C.blue}>PDF</T></View>
                <View style={{ flex: 1 }}><L size={11.5} w={700}>{d.name}</L><L size={10} c={C.mute}>{`${d.date} · ${d.size}`}</L></View>
              </View>
            ))}
          </Glass>
        </>) : (<>
          {compactHeader('Decisions')}{tabs}
          <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
            {DECISIONS.map((d, i) => dateRow(d.title, d.day, d.month, d.title, `Decided by ${d.by}`, tag('Approved', C.greenBg, C.green), i === DECISIONS.length - 1))}
          </Glass>
        </>)}
      </ScrollView>
    </Screen>
  );
}
