import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '@/ui/Screen';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { PHOTOS, PhotoKey } from '@/theme/photos';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';
import { DUR, EASE_OUT, SPRING, enterUp } from '@/theme/motion';
import { useDemo } from '@/store/demo';

// Batch 5 A2 · after Get started (role): two large photo cards (mockup `.pcard`).
type Role = 'client' | 'expert';
const CARDS: { role: Role; tag: string; title: string; sub: string; photo: PhotoKey; h: number }[] = [
  { role: 'client', tag: 'Client', title: "I'm building", sub: 'Villa, shop, tower or renovation', photo: 'port2', h: 166 },
  { role: 'expert', tag: 'Expert', title: "I'm an engineer", sub: 'Consultants, architects, designers', photo: 'drawings', h: 150 },
];
const android = Platform.OS === 'android';
const LIFT_MS = DUR.base; // the card lifts, then expands to full screen over DUR.slow and hands over to sign up
const LIFT = { y: 4, scale: 1.02 }; // mockup px / factor

const Arrow = ({ color }: { color: string }) => (
  <Svg width={s(12)} height={s(12)} viewBox="0 0 24 24"><Path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);

function Card({ c, sel, lifted, faded, hidden, onPress, boxRef }: { c: (typeof CARDS)[number]; sel: boolean; lifted: boolean; faded: boolean; hidden: boolean;
  onPress: () => void; boxRef: (v: View | null) => void }) {
  const lift = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => { lift.value = withSpring(lifted ? 1 : 0, SPRING); }, [lifted]);
  useEffect(() => { fade.value = withTiming(faded ? 1 : 0, { duration: DUR.base, easing: EASE_OUT }); }, [faded]);
  const st = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * fade.value, transform: [{ translateY: -s(LIFT.y) * lift.value }, { scale: 1 + (LIFT.scale - 1) * lift.value }] }));
  return (
    <Animated.View style={[{ marginTop: s(12), opacity: hidden ? 0 : 1 }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: sel }}
        style={[{ height: s(c.h), borderRadius: s(22) }, sel ? shadow(C.blue, 0.25, s(15), s(14)) : null]}>
        <View ref={boxRef} collapsable={false} style={{ flex: 1, borderRadius: s(22), overflow: 'hidden', backgroundColor: C.navy }}>
          <Image source={PHOTOS[c.photo]} contentFit="cover" style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(22,32,90,0)', 'rgba(22,32,90,0)', 'rgba(22,32,90,0.82)']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />
          {/* .tg.pill-g */}
          <View style={{ position: 'absolute', left: s(12), top: s(12), borderRadius: s(16), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)',
            backgroundColor: android ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.22)', paddingVertical: s(4), paddingHorizontal: s(9) }}>
            {!android && <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />}
            <T size={9} w={700} c="#fff">{c.tag}</T>
          </View>
          <View style={{ position: 'absolute', left: s(14), right: s(14), bottom: s(12), flexDirection: 'row', alignItems: 'flex-end', gap: s(10) }}>
            <View style={{ flex: 1 }}>
              <T size={15} w={700} ls={-0.02} c="#fff">{c.title}</T>
              {/* mockup: the sub-line is an inline span in a 16px line box, so it sits lower under the title */}
              <T size={9.5} c="#fff" style={{ opacity: 0.85, marginTop: s(6.5), marginBottom: s(2) }}>{c.sub}</T>
            </View>
            {/* the round arrow is a span in the mockup, so it takes `.ct span { opacity:.85 }` too */}
            <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: sel ? C.blue : '#fff', opacity: 0.85, alignItems: 'center', justifyContent: 'center' }}>
              <Arrow color={sel ? '#fff' : C.navy} />
            </View>
          </View>
        </View>
        {/* .pcard.sel: box-shadow 0 0 0 2px Pulse Blue, a ring outside the card */}
        {sel && <View pointerEvents="none" style={{ position: 'absolute', left: -2, top: -2, right: -2, bottom: -2, borderRadius: s(22) + 2, borderWidth: 2, borderColor: C.blue }} />}
      </Pressable>
    </Animated.View>
  );
}

type Rect = { x: number; y: number; w: number; h: number };

/** ✦ Shared-element hand-over: a copy of the tapped card, placed on its (lifted) rect, grows to fill the screen
 *  (EASE_OUT, DUR.slow) while its corners go square and its text fades, so the photo becomes the next screen's backdrop. */
function Expand({ c, from, grow }: { c: (typeof CARDS)[number]; from: Rect; grow: SharedValue<number> }) {
  const { width, height } = useWindowDimensions();
  const box = useAnimatedStyle(() => {
    const g = grow.value;
    return { left: from.x * (1 - g), top: from.y * (1 - g), width: from.w + (width - from.w) * g, height: from.h + (height - from.h) * g, borderRadius: s(22) * (1 - g) };
  });
  const text = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - grow.value * 2.5) }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', overflow: 'hidden', backgroundColor: C.navy }, box]}>
      <Image source={PHOTOS[c.photo]} contentFit="cover" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(22,32,90,0)', 'rgba(22,32,90,0)', 'rgba(22,32,90,0.82)']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[{ position: 'absolute', left: s(14), bottom: s(12) }, text]}>
        <T size={15} w={700} ls={-0.02} c="#fff">{c.title}</T>
        <T size={9.5} c="#fff" style={{ opacity: 0.85, marginTop: s(6.5), marginBottom: s(2) }}>{c.sub}</T>
      </Animated.View>
    </Animated.View>
  );
}

export default function RoleScreen() {
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  const [sel, setSel] = useState<Role>('client');
  const [chosen, setChosen] = useState<Role | null>(null);
  const [from, setFrom] = useState<Rect | null>(null);
  const grow = useSharedValue(0);
  const leave = useSharedValue(0);
  const boxes = useRef<Record<Role, View | null>>({ client: null, expert: null });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  // back on this screen (e.g. from sign up): cards in place again, ready for another tap
  useFocusEffect(useCallback(() => { clear(); setChosen(null); setFrom(null); grow.value = 0; leave.value = 0; }, []));
  const page = useAnimatedStyle(() => ({ opacity: 1 - leave.value }));
  // ✦ the tapped card lifts (critically damped SPRING, no overshoot) with a blue ring (haptic), the other one steps back,
  // then it expands to full screen and hands over to sign up (a fade route). Guarded against double taps.
  const choose = (role: Role) => {
    if (chosen) return;
    setSel(role); setChosen(role);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useDemo.getState().setRole(role);
    if (stay) return;
    boxes.current[role]?.measureInWindow?.((x, y, w, h) => {
      // start from the lifted rect (scaled about its centre, then raised)
      const dw = w * (LIFT.scale - 1), dh = h * (LIFT.scale - 1);
      setFrom({ x: x - dw / 2, y: y - dh / 2 - s(LIFT.y), w: w + dw, h: h + dh });
    });
    timers.current.push(setTimeout(() => {
      grow.value = withTiming(1, { duration: DUR.slow, easing: EASE_OUT });
      leave.value = withTiming(1, { duration: DUR.base, easing: EASE_OUT });
    }, LIFT_MS));
    timers.current.push(setTimeout(() => router.push('/onboarding/signup'), LIFT_MS + DUR.slow));
  };
  const card = CARDS.find((c) => c.role === chosen);
  return (
    <Screen bg="aurora3" px={16} overlay={card && from ? <Expand c={card} from={from} grow={grow} /> : undefined}>
      <Animated.View style={[{ flex: 1 }, page]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: s(8) }}>
          <Pressable onPress={() => (router.canGoBack?.() ? router.back() : router.replace('/onboarding/welcome'))} hitSlop={10} accessibilityLabel="Back">
            <Glass r={16} style={{ width: s(32), height: s(32), alignItems: 'center', justifyContent: 'center' }}>
              {/* wrapped in a View: on web a bare <svg> paints under the positioned BlurView */}
              <View><Svg width={s(13)} height={s(13)} viewBox="0 0 24 24"><Path d="M15 5l-7 7 7 7" fill="none" stroke={C.navy} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg></View>
            </Glass>
          </Pressable>
          <Pressable onPress={() => router.push('/onboarding/signup?mode=signin')} hitSlop={8}><T size={11} w={600} c={C.mute}>Sign in</T></Pressable>
        </View>
        <Animated.View entering={enterUp(0)}><T size={24} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(12) }}>{'What brings you\nto Pulse?'}</T></Animated.View>
        {/* ✦ the cards rise in turn */}
        {CARDS.map((c, i) => (
          <Animated.View key={c.role} entering={enterUp(i + 1, 90)}>
            <Card c={c} sel={sel === c.role} lifted={chosen === c.role} faded={chosen != null && chosen !== c.role} hidden={chosen === c.role && from != null}
              boxRef={(v) => { boxes.current[c.role] = v; }} onPress={() => choose(c.role)} />
          </Animated.View>
        ))}
      </Animated.View>
    </Screen>
  );
}
