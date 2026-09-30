import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';
import { Screen } from '@/ui/Screen';
import { PageScroll } from '@/ui/PageScroll';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Sheet } from '@/ui/Sheet';
import { ModelView } from '@/three/ModelView';
import { useDemo } from '@/store/demo';
import { BUDGET, DECISIONS, DOCS, MILESTONES, SITE, PROJECT } from '@/data/seed';
import { STAGES, BUILDINGS } from '@/data/types';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';
import { DUR, SCALE_FROM, ease } from '@/theme/motion';

const LH = 1.26; // Chrome 'normal' line height of the mockup font
const L = (props: React.ComponentProps<typeof T>) => <T lh={LH} {...props} />;

/** Three explicit arcs (blue 0-38%, cyan 38-58%, lilac 58-68%) on the grey track, hole filled like the mockup. */
function BudgetRing({ size, thickness, children }: { size: number; thickness: number; children?: React.ReactNode }) {
  const D = s(size), t = s(thickness), c = D / 2, r = (D - t) / 2;
  const pt = (f: number) => { const a = -Math.PI / 2 + f * Math.PI * 2; return `${c + r * Math.cos(a)} ${c + r * Math.sin(a)}`; };
  const arc = (a: number, b: number) => `M ${pt(a)} A ${r} ${r} 0 ${b - a > 0.5 ? 1 : 0} 1 ${pt(b)}`;
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(1, { duration: 1200, easing: EASE }); }, [v]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ rotate: `${(v.value - 1) * 20}deg` }, { scale: SCALE_FROM + (1 - SCALE_FROM) * v.value }] }));
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
  useEffect(() => { v.value = withDelay(300 + i * 140, withTiming(pct, { duration: 900, easing: EASE })); }, [v, pct, i]);
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

const PAYMENTS: Record<string, { date: string; payee: string; amount: number }[]> = {
  'Design & permits': [
    { date: '12 Mar', payee: 'Al Reem Design Studio', amount: 120_000 },
    { date: '2 Jun', payee: 'Dubai Municipality · permit fees', amount: 60_000 },
  ],
  Structure: [
    { date: '15 Jul', payee: 'Gulf Foundations', amount: 400_000 },
    { date: '9 Aug', payee: 'Emirates Steel', amount: 310_000 },
    { date: '3 Sep', payee: 'Al Noor Concrete', amount: 200_000 },
  ],
  MEP: [
    { date: '20 Aug', payee: 'CoolAir MEP', amount: 300_000 },
    { date: '14 Sep', payee: 'Volt Electrical', amount: 240_000 },
  ],
};
const aed = (n: number) => `AED ${n.toLocaleString('en-US')}`;

/** Tab row with an underline that glides to the active tab (x/width measured via onLayout). */
function TabsBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const lay = useRef<({ x: number; w: number } | undefined)[]>([]);
  const ux = useSharedValue(0); const uw = useSharedValue(0); const ready = useRef(false);
  const idx = TABS.indexOf(tab);
  const go = (i: number, animate: boolean) => {
    const l = lay.current[i]; if (!l) return;
    if (animate) { ux.value = withTiming(l.x, { duration: 420, easing: EASE }); uw.value = withTiming(l.w, { duration: 420, easing: EASE }); }
    else { ux.value = l.x; uw.value = l.w; }
  };
  // The row is wider than the screen (the mockup crops "Decisions" at the margin): it scrolls sideways, and the active tab
  // is brought fully into view, so every tab is reachable. At rest on Milestones it looks exactly like the approved row.
  const sv = useRef<ScrollView>(null); const vw = useRef(0); const sx = useRef(0);
  const reveal = (i: number, animated: boolean) => {
    const l = lay.current[i]; if (!l || !vw.current) return;
    const right = l.x + l.w + s(4); const left = Math.max(0, l.x - s(4));
    const to = right > sx.current + vw.current ? right - vw.current : left < sx.current ? left : null;
    if (to != null) sv.current?.scrollTo({ x: to, animated });
  };
  useEffect(() => { go(idx, ready.current); reveal(idx, ready.current); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const ust = useAnimatedStyle(() => ({ width: uw.value, transform: [{ translateX: ux.value }] }));
  return (
    <ScrollView ref={sv} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16} style={{ marginTop: s(14.5), marginBottom: -s(9) }}
      onLayout={(e) => { vw.current = e.nativeEvent.layout.width; reveal(idx, false); }} onScroll={(e) => { sx.current = e.nativeEvent.contentOffset.x; }}>
      {/* paddingBottom holds the underline (7px below the labels) inside the scroller, which clips */}
      <View style={{ flexDirection: 'row', gap: s(16), paddingBottom: s(9) }}>
        {TABS.map((t, i) => (
          <Pressable key={t} onPress={() => onTab(t)} onLayout={(e) => { lay.current[i] = { x: e.nativeEvent.layout.x, w: e.nativeEvent.layout.width }; if (i === idx && !ready.current) { go(i, false); reveal(i, false); ready.current = true; } }}>
            <L size={11.5} w={600} c={t === tab ? C.navy : C.faint2}>{t}</L>
          </Pressable>
        ))}
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, bottom: s(9) - s(7) - 2, height: 2, borderRadius: 2, backgroundColor: C.blue }, ust]} />
      </View>
    </ScrollView>
  );
}

/** Full-screen photo viewer: zooms in from the tapped photo, swipe between dates, close with the cross. */
function PhotoViewer({ index, onIndex, onClose }: { index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const v = useSharedValue(0); const open = index !== null;
  useEffect(() => { v.value = 0; if (open) v.value = withTiming(1, ease(DUR.slow)); }, [open, index, v]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.55 + 0.45 * v.value }] }));
  const pan = Gesture.Pan().activeOffsetX([-16, 16]).failOffsetY([-24, 24]).onEnd((e) => {
    'worklet';
    if (index === null) return;
    if (e.translationX < -50 && index < SITE.length - 1) runOnJS(onIndex)(index + 1);
    else if (e.translationX > 50 && index > 0) runOnJS(onIndex)(index - 1);
  });
  const x = index === null ? undefined : SITE[index];
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'rgba(8,12,40,0.94)', justifyContent: 'center' }}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ marginHorizontal: s(14), height: s(380), borderRadius: s(18), overflow: 'hidden' }, st]}>
            {x && <Image source={PHOTOS[x.photo]} contentFit="cover" style={{ flex: 1 }} />}
            {x && <View style={{ position: 'absolute', left: s(12), bottom: s(12), backgroundColor: 'rgba(10,16,50,0.55)', paddingVertical: s(4), paddingHorizontal: s(9), borderRadius: s(10) }}><L size={11} w={700} c="#fff">{x.label}</L></View>}
          </Animated.View>
        </GestureDetector>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: s(6), marginTop: s(14) }}>
          {SITE.map((_, i) => <View key={i} style={{ width: s(6), height: s(6), borderRadius: s(3), backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.35)' }} />)}
        </View>
        <Pressable accessibilityLabel="Close" onPress={onClose} hitSlop={12} style={{ position: 'absolute', top: s(54), right: s(20), width: s(32), height: s(32), borderRadius: s(16), backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <T size={14} w={700} c="#fff">✕</T>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default function Project() {
  const p = useLocalSearchParams<{ tab?: string }>();
  const fromParam = (v?: string): Tab => (v === 'budget' ? 'Budget' : v === 'site' ? 'Site' : 'Milestones');
  const [tab, setTab] = useState<Tab>(fromParam(p.tab));
  const [photo, setPhoto] = useState<number | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const { stage, projectType } = useDemo(); const name = BUILDINGS.find((b) => b.id === projectType)!.name;
  useEffect(() => { if (p.tab) setTab(fromParam(p.tab)); }, [p.tab]);

  // slide the body in from the side of the new tab
  const prev = useRef<Tab>(tab);
  const bx = useSharedValue(0); const bo = useSharedValue(1);
  useEffect(() => {
    if (prev.current === tab) return;
    const d = TABS.indexOf(tab) > TABS.indexOf(prev.current) ? 1 : -1; prev.current = tab;
    bx.value = d * s(46); bo.value = 0;
    bx.value = withTiming(0, { duration: 460, easing: EASE }); bo.value = withTiming(1, { duration: 360, easing: EASE });
  }, [tab, bx, bo]);
  const bst = useAnimatedStyle(() => ({ opacity: bo.value, transform: [{ translateX: bx.value }] }));
  const step = (d: number) => { const i = TABS.indexOf(tab) + d; if (i >= 0 && i < TABS.length) setTab(TABS[i]); };
  // Horizontal swipe on the content switches tab. It runs simultaneously with the page ScrollView's own native gesture
  // (on iOS the UIScrollView recogniser otherwise swallowed it); vertical drags fail it (failOffsetY) and just scroll.
  const stepRef = useRef(step); stepRef.current = step;
  const swipe = useMemo(() => {
    const go = (d: number) => stepRef.current(d);
    return Gesture.Simultaneous(Gesture.Pan().activeOffsetX([-20, 20]).failOffsetY([-14, 14]).onEnd((e) => {
      'worklet';
      if (e.translationX < -50) runOnJS(go)(1); else if (e.translationX > 50) runOnJS(go)(-1);
    }), Gesture.Native());
  }, []);

  const compactHeader = (title: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(11) }}>
      <T size={20} w={700} ls={-0.035} lh={1.1}>{title}</T><L size={9.5} c={C.mute}>{`${name} · Al Reem`}</L>
    </View>
  );
  // Titles wrap to a second line when long (client request; "Upgrade to solar-ready roof"), with the pill kept top-right.
  const dateRow = (key: string, day: string, month: string, title: string, sub: string, right: React.ReactNode, last: boolean, pillTop = false) => (
    <View key={key} style={{ flexDirection: 'row', gap: s(12), alignItems: 'center', paddingVertical: s(11), borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
      <View style={{ width: s(30), alignItems: 'center' }}><T size={14} w={700} ls={-0.02} style={{ lineHeight: s(22) }}>{day}</T><T size={8.5} w={700} ls={0.06} c={C.mute} style={{ lineHeight: s(17) }}>{month}</T></View>
      <View style={{ flex: 1, minWidth: 0, marginRight: pillTop ? 0 : -s(8) }}>
        <T size={11.5} w={700} numberOfLines={pillTop ? 3 : 2} style={{ lineHeight: s(pillTop ? 15 : 19.5), marginBottom: pillTop ? s(3) : 0 }}>{title}</T><T size={10} c={C.mute} style={{ lineHeight: s(pillTop ? 15 : 19.5) }}>{sub}</T></View>
      {pillTop ? <View style={{ alignSelf: 'flex-start' }}>{right}</View> : right}
    </View>
  );
  const head = tab === 'Milestones' ? (<>
    <View style={{ height: s(118), marginHorizontal: -s(20) }}><ModelView model={projectType} stage={projectType === 'villa' ? stage : 'solid'} radius={8.5} target={[0, 2.8, 0]} spin={0.12} shadows={false} /></View>
    <T size={20} w={700} ls={-0.035} lh={1.1}>{`${name} · Al Reem`}</T>
    <L size={11} c={C.mute} style={{ marginTop: s(4.5) }}>{`${STAGES[stage - 1]} · step ${stage} of 6`}</L>
  </>) : compactHeader(tab);
  const body = tab === 'Milestones' ? (
    <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
      {MILESTONES.map((m, i) => dateRow(m.title, m.day, m.month, m.title, m.stage,
        m.status === 'done' ? tag('Done', C.greenBg, C.green) : m.status === 'next' ? tag('Next', 'rgba(0,0,254,0.08)', C.blue) : <L size={9.5} c={C.mute}>Planned</L>, i === MILESTONES.length - 1))}
    </Glass>
  ) : tab === 'Budget' ? (<>
    <View style={{ alignItems: 'center', marginTop: s(16.5) }}>
      <BudgetRing size={118} thickness={15}>
        <T size={20} w={700} ls={-0.03} lh={LH}>{`${Math.round((PROJECT.committed / PROJECT.budget) * 100)}%`}</T><L size={8.5} c={C.mute}>committed</L>
      </BudgetRing>
      <T size={15} w={700} ls={-0.02} lh={LH} style={{ marginTop: s(11) }}><CountUp to={PROJECT.committed / 1_000_000} /><T size={15} w={500} c={C.faint2}>of 2.4M</T></T>
    </View>
    <Glass r={18} style={{ marginTop: s(12.5), paddingVertical: s(2), paddingHorizontal: s(14) }}>
      {BUDGET.map((b, i) => (
        <Pressable key={b.name} onPress={() => setCat(b.name)} style={{ paddingVertical: s(9) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><L size={11} w={700}>{b.name}</L><L size={11} c={C.mute}>{k(b.amount)}</L></View>
          <Bar pct={b.pct} color={b.color} i={i} />
        </Pressable>
      ))}
    </Glass>
  </>) : tab === 'Site' ? (
    <View style={{ gap: s(8), marginTop: s(14) }}>
      {[[0], [1, 2]].map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: s(8) }}>
          {row.map((si) => { const x = SITE[si]; return (
            <Pressable key={x.label} onPress={() => setPhoto(si)} style={{ flex: 1, height: s('big' in x && x.big ? 122 : 104), borderRadius: s(16), overflow: 'hidden' }}>
              <Image source={PHOTOS[x.photo]} contentFit="cover" style={{ flex: 1 }} />
              <View style={{ position: 'absolute', left: s(8), bottom: s(8), backgroundColor: 'rgba(10,16,50,0.45)', paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8) }}><L size={9} w={700} c="#fff">{x.label}</L></View>
            </Pressable>
          ); })}
        </View>
      ))}
    </View>
  ) : tab === 'Docs' ? (
    <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
      {DOCS.map((d, i) => (
        <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(11), borderBottomWidth: i === DOCS.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
          <View style={{ width: s(30), height: s(36), borderRadius: s(8), backgroundColor: '#F4F6FD', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(4) }}><T size={7} w={800} c={C.blue}>PDF</T></View>
          <View style={{ flex: 1 }}><L size={11.5} w={700}>{d.name}</L><L size={10} c={C.mute}>{`${d.date} · ${d.size}`}</L></View>
        </View>
      ))}
    </Glass>
  ) : (
    <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
      {DECISIONS.map((d, i) => dateRow(d.title, d.day, d.month, d.title, `Decided by ${d.by}`, tag('Approved', C.greenBg, C.green), i === DECISIONS.length - 1, true))}
    </Glass>
  );
  const pay = cat ? PAYMENTS[cat] : [];
  return (
    <Screen bg="aurora">
      <GestureDetector gesture={swipe}>
        <PageScroll tabBar contentContainerStyle={{ paddingBottom: s(90) }}>
          <View>{head}</View>
          <TabsBar tab={tab} onTab={setTab} />
          <Animated.View style={bst}>{body}</Animated.View>
        </PageScroll>
      </GestureDetector>
      <PhotoViewer index={photo} onIndex={setPhoto} onClose={() => setPhoto(null)} />
      <Sheet visible={cat !== null} onClose={() => setCat(null)}>
        <T size={15} w={700} ls={-0.02}>{`${cat ?? ''} · payments`}</T>
        {pay.map((x, i) => (
          <View key={x.payee} style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(11), borderBottomWidth: i === pay.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
            <T size={10} w={700} c={C.mute} style={{ width: s(40) }}>{x.date}</T>
            <T size={11.5} w={600} style={{ flex: 1 }}>{x.payee}</T>
            <T size={11.5} w={700}>{aed(x.amount)}</T>
          </View>
        ))}
        <Pressable onPress={() => setCat(null)} style={{ alignSelf: 'center', marginTop: s(8), padding: s(8) }}><T size={11} w={700} c={C.blue}>Done</T></Pressable>
      </Sheet>
    </Screen>
  );
}
