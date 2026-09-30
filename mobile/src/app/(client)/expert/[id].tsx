import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/ui/Header';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock, DOCK_SPACE } from '@/ui/Dock';
import { Icon } from '@/ui/Icon';
import { EXPERTS, aed } from '@/data/seed';
import { PHOTOS } from '@/theme/photos';
import { RollingText, takeTileRect } from '@/screens/experts/fx';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { DUR, SELECT_PEAK, ease, enterFade, enterUp } from '@/theme/motion';

type Svc = (typeof EXPERTS)[number]['services'][number];
const HERO_H = s(250);
const HERO_RAD = s(18);
const DOT_ON = s(5);
const ANDROID = Platform.OS === 'android'; const S4 = s(4), S10 = s(10), S14 = s(14), S24 = s(24);
/** Service card: the blue ring/border glides across on select (colour + a calm ring settle); cards glide in staggered. */
function ServiceCard({ x, on, i, onPress }: { x: Svc; on: boolean; i: number; onPress: () => void }) {
  const sel = useSharedValue(on ? 1 : 0);
  useEffect(() => { sel.value = withTiming(on ? 1 : 0, ease(DUR.base)); }, [on, sel]);
  const card = useAnimatedStyle(() => {
    const color = interpolateColor(sel.value, [0, 1], ['#16205A', C.blue]); const op = interpolate(sel.value, [0, 1], [0.05, 0.12]);
    if (ANDROID) { // boxShadow (see theme/shadow) with the mockup's .opt -> .opt.on values: 0 4px 14px navy .05 -> 0 10px 24px blue .12
      const g = Math.min(1, Math.max(0, sel.value)); const r = Math.round(22 * (1 - g)), gg = Math.round(32 * (1 - g)), b = Math.round(90 + (254 - 90) * g);
      return { boxShadow: `0px ${S4 + (S10 - S4) * g}px ${S14 + (S24 - S14) * g}px rgba(${r},${gg},${b},${0.05 + 0.07 * g})` } as any;
    }
    return { shadowColor: color, shadowOpacity: op };
  });
  const ring = useAnimatedStyle(() => ({ opacity: Math.min(1, sel.value), transform: [{ scale: interpolate(sel.value, [0, 1], [1.05, 1]) }] }));
  const dot = useAnimatedStyle(() => ({ borderWidth: interpolate(sel.value, [0, 1], [2, DOT_ON]), borderColor: interpolateColor(sel.value, [0, 1], ['#CFD4E6', C.blue]),
    transform: [{ scale: interpolate(sel.value, [0, 0.5, 1], [1, SELECT_PEAK, 1]) }] }));
  return (
    <Animated.View entering={enterUp().delay(120 + i * 60)} style={{ marginTop: s(10) }}>
      <Pressable onPress={onPress}>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(14), paddingHorizontal: s(16), borderRadius: s(18), backgroundColor: '#fff',
          shadowRadius: s(10) }, card]}>
          <Animated.View style={[{ width: s(18), height: s(18), borderRadius: s(9) }, dot]} />
          <View style={{ flex: 1 }}><T size={12.5} w={600}>{x.name}</T><T size={10} w={500} c={C.mute} style={{ marginTop: 2 }}>{x.note}</T></View>
          <T size={13} w={700}>{x.price.toLocaleString('en-US')}</T>
          {/* mockup .opt.on: box-shadow 0 0 0 1.5px blue, i.e. a 1.5px ring just OUTSIDE the card */}
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: -s(1.5), right: -s(1.5), top: -s(1.5), bottom: -s(1.5), borderRadius: s(19.5), borderWidth: s(1.5), borderColor: C.blue }, ring]} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function ExpertProfile() {
  const { id = 'omar' } = useLocalSearchParams<{ id?: string }>();
  const e = EXPERTS.find((x) => x.id === id) ?? EXPERTS[0];
  const [svc, setSvc] = useState(e.services[0].id); const price = e.services.find((x) => x.id === svc)!.price;
  const insets = useSafeAreaInsets(); const { width: W } = useWindowDimensions();
  const [from] = useState(() => takeTileRect(e.id)); const zoom = useSharedValue(from ? 0 : 1); const booked = useRef(false);
  useEffect(() => { if (from) zoom.value = withTiming(1, ease(460)); }, [from, zoom]);
  // portrait grows out of the tapped tile (uniform scale + corner radius), then sits full-bleed
  const heroStyle = useAnimatedStyle(() => {
    if (!from) return {};
    const k = from.w / W; const p = zoom.value; const H = HERO_H;
    const sc = interpolate(p, [0, 1], [k, 1]);
    return { borderRadius: ((1 - p) * HERO_RAD) / sc, transform: [
      { translateX: (1 - p) * (from.x + from.w / 2 - W / 2) }, { translateY: (1 - p) * (from.y + from.h / 2 - H / 2) }, { scale: sc }] };
  });
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: s(DOCK_SPACE) }} showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ height: s(250), overflow: 'hidden' }, heroStyle]}>
          <Image source={PHOTOS[e.photo]} contentFit="cover" contentPosition={{ top: '25%' }} style={{ flex: 1 }} />
          <LinearGradient colors={['rgba(247,248,252,0)', C.bg]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: s(110) }} />
          <View style={{ position: 'absolute', top: Math.max(insets.top, s(30)) + s(8), left: s(20), right: s(20), flexDirection: 'row', justifyContent: 'space-between' }}>
            <BackButton />
            <Pressable onPress={() => router.push(`/chat/${e.id}`)}><Glass r={16} style={{ width: s(32), height: s(32), alignItems: 'center', justifyContent: 'center' }}><View style={{ zIndex: 2 }}><Icon name="mail" size={13} stroke={2} /></View></Glass></Pressable>
          </View>
        </Animated.View>
        <Animated.View entering={enterFade(200, 360)} style={{ marginTop: -s(46), paddingHorizontal: s(20) }}>
          <T size={25} w={700} ls={-0.035} lh={1.05}>{e.name}</T>
          <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{e.role === 'Structural' ? 'Structural engineer' : e.role} · <T size={11} c={C.star}>★</T> {e.rating.toFixed(1)} · {e.jobs} jobs</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5), marginTop: s(8) }}>
            <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>
            <T size={10} w={600} c={C.blue}>Verified by Project Pulse</T>
          </View>
          <T size={9.5} w={700} ls={0.1} c={C.mute} style={{ marginTop: s(20) }}>CHOOSE A SERVICE</T>
          {e.services.slice(0, 2).map((x, i) => <ServiceCard key={x.id} x={x} i={i} on={x.id === svc} onPress={() => { if (x.id !== svc) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSvc(x.id); }} />)}
          {/* s(120): RECENT WORK sits below the fold on purpose; the approved frame shows blank space above the dock */}
          <T size={9.5} w={700} ls={0.1} c={C.mute} style={{ marginTop: s(120) }}>RECENT WORK</T>
          <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
            {(['port1', 'port2', 'port3'] as const).map((p) => <Image key={p} source={PHOTOS[p]} contentFit="cover" style={{ flex: 1, height: s(62), borderRadius: s(12) }} />)}
          </View>
          <T size={10} c={C.mute} style={{ marginTop: s(14) }}>{`Licence ${e.licence} · ${e.areas}`}</T>
        </Animated.View>
      </ScrollView>
      <Dock><Btn onPress={() => { if (booked.current) return; booked.current = true; router.push(`/book?expert=${e.id}&service=${svc}`); setTimeout(() => { booked.current = false; }, 1200); }}><RollingText text={`Book · ${aed(price)}`} size={12.5} /></Btn></Dock>
    </View>
  );
}
