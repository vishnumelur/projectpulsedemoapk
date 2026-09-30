import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { T } from '@/ui/T';
import { LogoMark } from '@/ui/LogoMark';
import { RoundOrb } from '@/fx/RoundOrb';
import { GradientText } from '@/fx/GradientText';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';
import { EASE_IN_OUT, PRESS_SCALE, enterUp } from '@/theme/motion';

// Batch 5 A2 "Cinematic photo" (design/mockups/batch5-first-impression.html, A2 · Welcome).
const ANSWER_BOLD = 'Likely yes.';
const ANSWER = `${ANSWER_BOLD} A structural check comes first. I found an engineer for you:`;
const TYPE_START = 600; // ms: the answer starts typing once the question bubble has landed
const TYPE_MS = 14; // per character (~1.1s for the answer)
const ROW_AT = TYPE_START + ANSWER.length * TYPE_MS + 100; // engineer row slides up after the answer
const android = Platform.OS === 'android';

/** Mockup `.up` / `.d1` / `.d2`: the headline, sub-line and button glide up in sequence (brand enterUp, 100ms stagger). */
function Up({ d = 0, style, children }: { d?: number; style?: any; children: React.ReactNode }) {
  return <Animated.View entering={enterUp(d, 100)} style={style}>{children}</Animated.View>;
}

/** ✦ "The photo slowly pushes in (a Ken Burns move over 14s)": mockup `.phh .im`, inset -6%, scale 1 -> 1.08 and
 *  translate(-2%, 1%), ease-in-out, alternate. Fades into the app background through the `.phh:after` gradient. */
function Hero() {
  const { width } = useWindowDimensions();
  const H = s(370);
  const kb = useSharedValue(0);
  useEffect(() => {
    kb.value = withRepeat(withTiming(1, { duration: 14000, easing: EASE_IN_OUT }), -1, true);
    return () => cancelAnimation(kb);
  }, []);
  const iw = width * 1.12, ih = H * 1.12;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -0.02 * iw * kb.value }, { translateY: 0.01 * ih * kb.value }, { scale: 1 + 0.08 * kb.value }] }));
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: H, overflow: 'hidden' }}>
      <Animated.View style={[{ position: 'absolute', left: -width * 0.06, top: -H * 0.06, width: iw, height: ih }, st]}>
        <Image source={PHOTOS.port1} contentFit="cover" contentPosition={{ left: '58%', top: '50%' }} style={{ flex: 1 }} />
      </Animated.View>
      <LinearGradient colors={['rgba(22,32,90,0.35)', 'rgba(22,32,90,0)', 'rgba(247,248,252,0)', 'rgba(247,248,252,0.85)', C.bg]}
        locations={[0, 0.26, 0.52, 0.8, 1]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

/** Mockup `.pill-g`: a frosted white pill on the photo. */
function GlassPill({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ borderRadius: s(16), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', backgroundColor: android ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.22)' }, style]}>
      {!android && <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}

/** Mockup `.fl1`: a gentle 5px float on a 6s ease-in-out loop. */
function useFloat() {
  const f = useSharedValue(0);
  useEffect(() => {
    f.value = withRepeat(withSequence(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })), -1);
    return () => cancelAnimation(f);
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -s(5) * f.value }] }));
}

/** The frosted Pulse exchange (mockup `.qa.glass.fl1`). ✦ The question bubble appears, the orb spins, the answer types in,
 *  then the engineer row slides up (brand enterUp). Everything has settled by ~2.3s. */
function PulseCard() {
  const float = useFloat();
  const [n, setN] = useState(0);
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => { id = setInterval(() => setN((x) => { if (x >= ANSWER.length) { clearInterval(id); return x; } return x + 1; }), TYPE_MS); }, TYPE_START);
    return () => { clearTimeout(t); if (id) clearInterval(id); };
  }, []);
  const typed = ANSWER.slice(0, n);
  const answer = (full: boolean) => {
    const t = full ? ANSWER : typed;
    return <><T size={9.5} w={700} lh={1.4}>{t.slice(0, ANSWER_BOLD.length)}</T>{t.slice(ANSWER_BOLD.length)}</>;
  };
  return (
    <Animated.View style={[{ marginTop: s(118), borderRadius: s(18), ...shadow(C.navy, 0.07, s(12), s(6)) }, float]}>
      <View style={{ borderRadius: s(18), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)', backgroundColor: android ? 'rgba(250,251,255,0.9)' : 'rgba(255,255,255,0.72)', padding: s(10) }}>
        {!android && <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />}
        <Animated.View entering={enterUp(1, 250)} style={[{ alignSelf: 'flex-end', maxWidth: '88%', backgroundColor: C.navy, paddingVertical: s(7), paddingHorizontal: s(10),
          borderTopLeftRadius: s(13), borderTopRightRadius: s(13), borderBottomRightRadius: s(4), borderBottomLeftRadius: s(13) }]}>
          <T size={10} w={600} c="#fff">Can I add a floor to my villa?</T>
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: s(7), marginTop: s(8), alignItems: 'flex-start' }}>
          <RoundOrb size={20} glow />
          <View style={{ flex: 1 }}>
            <View>
              {/* the full answer lays out the card; the typed copy is drawn over it */}
              <T size={9.5} lh={1.4} style={{ opacity: 0 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{answer(true)}</T>
              <T size={9.5} lh={1.4} style={{ position: 'absolute', left: 0, top: 0, right: 0 }} accessibilityLabel={ANSWER}>{answer(false)}</T>
            </View>
            <Animated.View entering={enterUp(1, ROW_AT)} style={[{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(6), paddingVertical: s(5), paddingHorizontal: s(7), borderRadius: s(10), backgroundColor: '#fff' }]}>
              <Image source={PHOTOS.omar} contentFit="cover" style={{ width: s(18), height: s(18), borderRadius: s(9) }} />
              <T size={9} w={700}>Omar H.</T>
              <View style={{ width: s(11), height: s(11), borderRadius: s(5.5), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={s(7)} height={s(7)} viewBox="0 0 24 24"><Path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" /></Svg>
              </View>
              <T size={8.5} w={700} c={C.blue} style={{ marginLeft: 'auto' }}>AED 2,200</T>
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/** Mockup `.btn2`: one Pulse Blue button with a soft light sweeping across it every 4s (`shimb`). */
export function GetStarted({ onPress }: { onPress: () => void }) {
  const [w, setW] = useState(0);
  const sw = useSharedValue(0);
  useEffect(() => {
    sw.value = withDelay(800, withRepeat(withSequence(withTiming(1, { duration: 2000, easing: EASE_IN_OUT }), withTiming(1, { duration: 2000 }), withTiming(0, { duration: 0 })), -1));
    return () => cancelAnimation(sw);
  }, []);
  const ss = useAnimatedStyle(() => ({ transform: [{ translateX: w * (-0.5 + 1.8 * sw.value) }] }));
  return (
    <Pressable onPress={onPress} accessibilityRole="button" onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={({ pressed }) => [{ height: s(46), borderRadius: s(16), backgroundColor: C.blue, ...shadow(C.blue, 0.28, s(12), s(10)), transform: [{ scale: pressed ? PRESS_SCALE : 1 }] }]}>
      <View style={{ flex: 1, borderRadius: s(16), overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(8) }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, width: w * 0.4 }, ss]}>
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
        </Animated.View>
        <T size={13} w={700} ls={-0.005} c="#fff">Get started</T>
        <Svg width={s(13)} height={s(13)} viewBox="0 0 24 24"><Path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
      </View>
    </Pressable>
  );
}

const tick = { fill: 'none', stroke: C.blue, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const TICKS: [string, React.ReactNode][] = [
  ['Verified experts', <><Path {...tick} d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" /><Path {...tick} d="M8.8 12l2.2 2.2 4.2-4.4" /></>],
  ['Secure pay', <><Rect {...tick} x={5} y={10.5} width={14} height={10} rx={2.5} /><Path {...tick} d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>],
  ['Abu Dhabi', <><Path {...tick} d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><Circle {...tick} cx={12} cy={9.5} r={2.5} /></>],
];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="light" />
      <Hero />
      <View style={{ flex: 1, paddingTop: Math.max(insets.top, s(30)), paddingHorizontal: s(18) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: s(8) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(7) }}>
            <LogoMark size={18} color="#fff" />
            <T size={13.5} w={700} ls={-0.02} c="#fff">Project Pulse</T>
          </View>
          <Pressable onPress={() => router.push('/onboarding/signup?mode=signin')} hitSlop={8}>
            <GlassPill style={{ paddingVertical: s(6), paddingHorizontal: s(12) }}><T size={10.5} w={700} c="#fff">Sign in</T></GlassPill>
          </Pressable>
        </View>
        <PulseCard />
        <Up style={{ marginTop: s(22) }}>
          <T size={25} w={700} ls={-0.035} lh={1.05}>Your project,</T>
          <GradientText size={25} w={700} ls={-0.035} lh={1.05}>in expert hands.</GradientText>
        </Up>
        <Up d={1} style={{ marginTop: s(7) }}>
          <T size={11.5} c={C.mute} lh={1.45}>Answers in seconds. Verified engineers in Abu Dhabi when you need one.</T>
        </Up>
        <Up d={2} style={{ marginTop: 'auto', marginBottom: Math.max(s(16), insets.bottom) }}>
          <GetStarted onPress={() => router.push('/onboarding/role')} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: s(12), marginTop: s(12) }}>
            {TICKS.map(([label, icon]) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
                <Svg width={s(10)} height={s(10)} viewBox="0 0 24 24">{icon}</Svg>
                <T size={9} w={600} c={C.mute}>{label}</T>
              </View>
            ))}
          </View>
        </Up>
      </View>
    </View>
  );
}
