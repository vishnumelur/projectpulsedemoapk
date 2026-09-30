import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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
const LEAVE_MS = 480;

const Arrow = ({ color }: { color: string }) => (
  <Svg width={s(12)} height={s(12)} viewBox="0 0 24 24"><Path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);

function Card({ c, sel, lifted, faded, onPress }: { c: (typeof CARDS)[number]; sel: boolean; lifted: boolean; faded: boolean; onPress: () => void }) {
  const lift = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => { lift.value = withSpring(lifted ? 1 : 0, SPRING); }, [lifted]);
  useEffect(() => { fade.value = withTiming(faded ? 1 : 0, { duration: DUR.base, easing: EASE_OUT }); }, [faded]);
  const st = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * fade.value, transform: [{ translateY: -s(4) * lift.value }, { scale: 1 + 0.02 * lift.value }] }));
  return (
    <Animated.View style={[{ marginTop: s(12) }, st]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: sel }}
        style={[{ height: s(c.h), borderRadius: s(22) }, sel ? shadow(C.blue, 0.25, s(15), s(14)) : null]}>
        <View style={{ flex: 1, borderRadius: s(22), overflow: 'hidden', backgroundColor: C.navy }}>
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

export default function RoleScreen() {
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  const [sel, setSel] = useState<Role>('client');
  const [chosen, setChosen] = useState<Role | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  // ✦ the tapped card lifts (critically damped SPRING, no overshoot) with a blue ring (haptic), the other one steps back, then it moves on to sign up
  const choose = (role: Role) => {
    if (chosen) return;
    setSel(role); setChosen(role);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useDemo.getState().setRole(role);
    if (stay) return;
    t.current = setTimeout(() => router.push('/onboarding/signup'), LEAVE_MS);
  };
  return (
    <Screen bg="aurora3" px={16}>
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
          <Card c={c} sel={sel === c.role} lifted={chosen === c.role} faded={chosen != null && chosen !== c.role} onPress={() => choose(c.role)} />
        </Animated.View>
      ))}
    </Screen>
  );
}
