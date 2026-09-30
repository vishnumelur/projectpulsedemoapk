import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Orb } from '@/fx/Orb';
import { useDemo, bestQuote } from '@/store/demo';
import { EXPERTS, MARKET_AVG, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { CountUp } from '@/screens/experts/fx';
import { C, EASE } from '@/theme/tokens';

const hide = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;
const FACE = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backfaceVisibility: 'hidden' } as const;

export default function Quotes() {
  const { request = 'req-bid' } = useLocalSearchParams<{ request?: string }>();
  const allQuotes = useDemo((st) => st.quotes);
  const all = allQuotes.filter((q) => q.requestId === request).sort((a, b) => a.price - b.price);
  const req = useDemo((st) => st.requests.find((r) => r.id === request));
  const best = useDemo((st) => bestQuote(st, request));
  const [back, setBack] = useState(false); const flip = useSharedValue(0); const accepted = useRef(false);
  const toggle = () => { const nb = !back; setBack(nb); flip.value = withTiming(nb ? 1 : 0, { duration: 650, easing: EASE }); };
  const frontSt = useAnimatedStyle(() => ({ transform: [{ perspective: 1000 }, { rotateY: `${flip.value * 180}deg` }] }));
  const backSt = useAnimatedStyle(() => ({ transform: [{ perspective: 1000 }, { rotateY: `${180 + flip.value * 180}deg` }] }));
  if (!best) return <Screen><Header /><T size={14} style={{ marginTop: s(20) }}>Quotes are on their way.</T></Screen>;
  const ex = EXPERTS.find((e) => e.id === best.expertId)!; const others = all.filter((q) => q.id !== best.id);
  const avg = MARKET_AVG[req?.kbId ?? 'bid-review'] ?? best.price; const below = Math.round(((avg - best.price) / avg) * 100);
  const service = ex.services[0].id;
  return (
    <Screen bg="aurora">
      <Header />
      <T size={25} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>Your best match</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`From ${all.length} quotes for your ${(req?.title ?? 'bid review').toLowerCase()}`}</T>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(16)} style={{ marginTop: s(18) }}>
        <Animated.View {...(back ? hide : {})} style={[{ padding: s(18), borderRadius: s(24), backgroundColor: '#fff', alignItems: 'center', shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(10), elevation: 3, backfaceVisibility: 'hidden' }, frontSt]}>
        <Avatar photo={ex.photo} size={64} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4), marginTop: s(10) }}>
          <T size={14} w={700}>{ex.name}</T>
          <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>
        </View>
        <T size={9.5} c={C.mute} style={{ marginTop: s(2) }}><T size={9.5} c={C.star}>★</T>{` ${ex.rating.toFixed(1)} · Report in ${best.days} days`}</T>
        <View style={{ marginTop: s(12) }}><CountUp to={best.price} prefix="AED " size={30} ls={-0.04} /></View>
        {below > 0 && <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(10) }}><Orb size={14} /><T size={10} w={600} c={C.blue}>{`${below}% below average price`}</T></View>}
      </Animated.View>
        <Animated.View {...(back ? {} : hide)} style={[FACE, { borderRadius: s(24), backgroundColor: '#fff', padding: s(14), shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(10), elevation: 3 }, backSt]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <T size={13} w={700}>Side by side</T>
            <Pressable onPress={toggle} hitSlop={10} accessibilityLabel="Close comparison"><T size={13} w={600} c={C.mute}>✕</T></Pressable>
          </View>
          <Pressable onPress={toggle} style={{ flex: 1, flexDirection: 'row', gap: s(6), marginTop: s(10) }}>
            {all.map((q) => { const e = EXPERTS.find((x) => x.id === q.expertId)!; const isBest = q.id === best.id; return (
              <View key={q.id} testID="quote-col" style={{ flex: 1, alignItems: 'center', paddingVertical: s(10), paddingHorizontal: s(2), borderRadius: s(16),
                backgroundColor: isBest ? 'rgba(0,0,254,0.06)' : C.bg, borderWidth: isBest ? 1.5 : 0, borderColor: C.blue }}>
                <Avatar photo={e.photo} size={34} />
                <T size={9.5} w={700} align="center" style={{ marginTop: s(6) }} numberOfLines={2}>{e.name}</T>
                <T size={10.5} w={700} ls={-0.02} numberOfLines={1} style={{ marginTop: s(6) }}>{aed(q.price)}</T>
                <T size={9} c={C.mute} style={{ marginTop: s(2) }}>{`${q.days} days`}</T>
              </View>); })}
          </Pressable>
        </Animated.View>
      </Animated.View>
      {others.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), marginTop: s(14), paddingHorizontal: s(4) }}>
          <View style={{ flexDirection: 'row' }}>{others.slice(0, 2).map((q, i) => <Avatar key={q.id} photo={EXPERTS.find((e) => e.id === q.expertId)!.photo} size={20} ring="white" style={{ marginLeft: i ? -s(8) : 0 }} />)}</View>
          <T size={9.5} c={C.mute} style={{ flex: 1 }} numberOfLines={1}>{`${others.length} more · from ${aed(others[0].price)}`}</T>
          <Pressable onPress={toggle}><T size={11} w={700} c={C.blue}>Compare</T></Pressable>
        </View>
      )}
      <Dock><Btn title="Accept & book" onPress={() => { if (accepted.current) return; accepted.current = true; setTimeout(() => { accepted.current = false; }, 1200); useDemo.getState().acceptQuote(best.id); router.push(`/book?expert=${ex.id}&service=${service}&quote=${best.id}`); }} /></Dock>
    </Screen>
  );
}
