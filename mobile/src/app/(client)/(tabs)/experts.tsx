import { Pressable, ScrollView, View } from 'react-native';
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { EXPERTS, aed } from '@/data/seed';
import { STAGES } from '@/data/types';
import { PHOTOS } from '@/theme/photos';
import { useDemo } from '@/store/demo';
import { IS_TEST, setTileRect } from '@/screens/experts/fx';
import { s } from '@/theme/scale';
import { useTabClearance } from '@/ui/TabBar';
import { C } from '@/theme/tokens';

const PAR = s(5); // parallax travel; the photo scales up only while scrolled (scale 1, translate 0 at rest = approved crop)
const BOX = s(124);
type E = (typeof EXPERTS)[number];
function Tile({ e, i, top, scrollY }: { e: E; i: number; top: boolean; scrollY: SharedValue<number> }) {
  const ref = useRef<View>(null); const lift = useSharedValue(0);
  const wrap = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.03 * lift.value }], zIndex: lift.value > 0.01 ? 5 : 0,
    shadowColor: '#16205A', shadowOpacity: 0.2 * lift.value, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } }));
  const par = useAnimatedStyle(() => { const ty = Math.max(-PAR, Math.min(PAR, -scrollY.value * 0.06)); return { transform: [{ translateY: ty }, { scale: 1 + (2 * Math.abs(ty)) / BOX }] }; });
  const open = () => {
    lift.value = withSequence(withSpring(1, { damping: 14, stiffness: 220 }), withDelay(600, withTiming(0, { duration: 300 })));
    let pushed = false; const go = () => { if (pushed) return; pushed = true; router.push(`/expert/${e.id}`); };
    const node = ref.current as any;
    if (IS_TEST || !node?.measureInWindow) return go();
    node.measureInWindow((x: number, y: number, w: number, h: number) => { setTileRect({ x, y, w, h, id: e.id, t: Date.now() }); go(); });
    setTimeout(go, 60); // fallback if the measure callback never fires
  };
  const photo = (
    <View style={{ height: BOX, borderRadius: s(18), overflow: 'hidden' }}>
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: BOX }, par]}>
        <Image source={PHOTOS[e.photo]} contentFit="cover" contentPosition={{ top: '20%' }} style={{ flex: 1 }} />
      </Animated.View>
      <View style={{ position: 'absolute', left: s(8), top: s(8), backgroundColor: '#fff', paddingVertical: s(3), paddingHorizontal: s(8), borderRadius: s(10) }}>
        {top ? <GradientText shimmer size={9} w={700}>{`${e.match}% match`}</GradientText> : <T size={9} w={700}>{`${e.match}% match`}</T>}
      </View>
    </View>
  );
  return (
    <Animated.View style={[{ width: '48%' }, wrap]}>
      <Pressable ref={ref} onPress={open}>
        {top ? <IridescentBorder r={18}>{photo}</IridescentBorder> : photo}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(3), marginTop: s(7) }}>
          <T size={12} w={700} ls={-0.01} numberOfLines={1}>{e.name}</T>
          {i < 2 && <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>}
        </View>
        <T size={9.5} c={C.mute} numberOfLines={1}>{`${e.role} · ★ ${e.rating.toFixed(1)}`}</T>
        <T size={11} w={700} style={{ marginTop: s(3) }}>{aed(e.services[0].price)}</T>
      </Pressable>
    </Animated.View>
  );
}

const FILTERS = ['For you', 'Engineers', 'Architects', 'Interiors'] as const;
export default function Experts() {
  const stage = useDemo((st) => st.stage); const [f, setF] = useState<(typeof FILTERS)[number]>('For you');
  // drop any stale tile rect whenever this tab regains focus (guarded: the jest router mock has no useFocusEffect)
  if (typeof useFocusEffect === 'function') useFocusEffect(useCallback(() => { setTileRect(null); }, []));
  const clear = useTabClearance();
  const scrollY = useSharedValue(0); const onScroll = useAnimatedScrollHandler((ev) => { scrollY.value = ev.contentOffset.y; });
  const list = [...EXPERTS].filter((e) => f === 'For you' || e.category === f).sort((a, b) => b.match - a.match);
  return (
    <Screen bg="aurora">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
        <T size={24} w={700} ls={-0.035}>Experts</T>
        <Glass r={17} style={{ width: s(34), height: s(34), alignItems: 'center', justifyContent: 'center' }}><View style={{ zIndex: 2 }}><Icon name="search" size={14} stroke={2.2} /></View></Glass>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(6) }}>
        <Orb size={14} /><GradientText shimmer base={C.faint2} size={9.5}>{`Matched by Pulse to your ${STAGES[stage - 1]} stage`}</GradientText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: s(12), flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ gap: s(6) }}>
        {/* mockup .fchips: only the selected chip is filled; the others are bare labels */}
        {FILTERS.map((x) => <Chip key={x} label={x} on={x === f} onPress={() => setF(x)} style={x === f ? undefined : { backgroundColor: 'transparent', borderColor: 'transparent' }} />)}
      </ScrollView>
      {/* full-width scroller, margin inside: an Android ScrollView clips its children, which cut the top match's glow */}
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} style={{ marginHorizontal: -s(20) }}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(12), marginTop: s(12), paddingBottom: Math.max(s(110), clear + s(20)), paddingHorizontal: s(20) }}>
        {list.map((e, i) => <Tile key={e.id} e={e} i={i} top={i === 0 && f === 'For you'} scrollY={scrollY} />)}
      </Animated.ScrollView>
      <LinearGradient pointerEvents="none" colors={['rgba(247,248,252,0)', 'rgba(247,248,252,1)', 'rgba(247,248,252,1)']} locations={[0, 0.55, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: s(96) }} />
    </Screen>
  );
}
