import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { DUR, SELECT_PEAK, ease } from '@/theme/motion';
import { ScaleIn } from '@/motion/ScaleIn';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { BackButton } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, F } from '@/theme/tokens';

const LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const TAGS = ['On time', 'Clear report', 'Professional', 'Great value'];
const glyph = (paint: string) => (
  <Svg width={s(36)} height={s(36)} viewBox="0 0 24 24">
    <Defs><SvgGrad id="sg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#31D1FF" /><Stop offset="0.55" stopColor="#0000FE" /><Stop offset="1" stopColor="#7A5CFF" /></SvgGrad></Defs>
    <Path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.5l6.3-.9z" fill={paint} />
  </Svg>
);
const GLOW = Platform.OS === 'web' ? ({ filter: 'drop-shadow(0 6px 10px rgba(0,0,254,0.28))' } as any)
  // Android: the same glyph-shaped drop shadow via RN's filter (a box shadow would draw the star's square box)
  : Platform.OS === 'android' ? ({ filter: [{ dropShadow: { offsetX: 0, offsetY: s(6), standardDeviation: s(5), color: 'rgba(0,0,254,0.28)' } }] } as any)
  : { ...shadow(C.blue, 0.28, s(5), s(6)) };
/** Stars arrive with a calm staggered scale-in. Lighting one crossfades the gradient fill in while it grows to at most
 *  SELECT_PEAK and settles back (EASE_OUT). No pop, no bounce. */
function Star({ on, i, onPress }: { on: boolean; i: number; onPress: () => void }) {
  const fill = useSharedValue(on ? 1 : 0);
  const k = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    fill.value = withTiming(on ? 1 : 0, ease(DUR.base));
    if (on && !first.current) k.value = withSequence(withTiming(SELECT_PEAK, ease(DUR.fast)), withTiming(1, ease(DUR.base)));
    first.current = false;
  }, [on]);
  useEffect(() => () => { cancelAnimation(fill); cancelAnimation(k); }, []);
  const grow = useAnimatedStyle(() => ({ transform: [{ scale: k.value }] }));
  const lit = useAnimatedStyle(() => ({ opacity: fill.value }));
  return (
    <Pressable accessibilityLabel={`${i} stars`} onPress={onPress}>
      <ScaleIn delay={60 * (i - 1)}>
        <Animated.View style={grow}>
          {glyph('#E3E6F0')}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, GLOW, lit]}>{glyph('url(#sg)')}</Animated.View>
        </Animated.View>
      </ScaleIn>
    </Pressable>
  );
}
export default function Review() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const [stars, setStars] = useState(5); const [tags, setTags] = useState(['On time', 'Clear report', 'Great value']);
  const [note, setNote] = useState<string | null>(null); const [done, setDone] = useState(false);
  const toggle = (t: string) => { Haptics.selectionAsync(); setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t])); };
  const sent = useRef(false);
  const leave = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (leave.current) clearTimeout(leave.current); }, []);
  const submit = () => {
    if (sent.current) return; sent.current = true; useDemo.getState().submitReview(id, stars, tags); setDone(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    leave.current = setTimeout(() => router.replace('/home'), 1200);
  };
  return (
    <Screen bg="review">
      <View style={{ paddingTop: s(6) }}><BackButton flat label="✕" onPress={() => router.replace('/home')} /></View>
      <View style={{ alignItems: 'center' }}>
        <Avatar photo="omar" size={70} ring="gradient" style={{ marginTop: s(18) }} />
        <T size={20} w={700} ls={-0.035} lh={1.25} align="center" style={{ marginTop: s(18) }}>{"How was Omar's\nbid review?"}</T>
        <View style={{ flexDirection: 'row', gap: s(8), marginTop: s(12) }}>
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} i={i} on={i <= stars} onPress={() => { Haptics.selectionAsync(); setStars(i); }} />)}
        </View>
        <GradientText size={14} w={800} ls={-0.01} style={{ marginTop: s(10) }}>{LABEL[stars]}</GradientText>
        <T size={9.5} w={700} ls={0.12} c={C.mute} style={{ marginTop: s(14) }}>WHAT STOOD OUT?</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(7), justifyContent: 'center', marginTop: s(10) }}>
          {TAGS.map((t) => tags.includes(t) ? (
            <Pressable key={t} onPress={() => toggle(t)}>
              <LinearGradient colors={GRAD} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: s(8), paddingHorizontal: s(12), borderRadius: s(16) }}>
                <T size={10.5} w={600} c="#fff">{`✓ ${t}`}</T>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable key={t} onPress={() => toggle(t)} style={{ paddingVertical: s(8), paddingHorizontal: s(12), borderRadius: s(16), backgroundColor: C.inputBg }}><T size={10.5} w={600} c={C.mute}>{t}</T></Pressable>
          ))}
        </View>
        {note === null ? (
          <Pressable onPress={() => setNote('')} style={{ marginTop: s(12), flexDirection: 'row', alignItems: 'center', gap: s(7), paddingVertical: s(9), paddingHorizontal: s(14), borderRadius: s(14), borderWidth: 1, borderStyle: 'dashed', borderColor: '#D9DDE9' }}>
            <Icon name="edit" size={13} color={C.mute} stroke={2} /><T size={11} w={600} c={C.mute}>Add a note <T size={11} w={500} c={C.faint3}>(optional)</T></T>
          </Pressable>
        ) : <TextInput value={note} onChangeText={setNote} autoFocus placeholder="Add a note" allowFontScaling={false}
            style={{ marginTop: s(12), alignSelf: 'stretch', borderRadius: s(14), borderWidth: 1, borderColor: '#D9DDE9', padding: s(10), fontFamily: F[400], fontSize: s(11), color: C.navy }} />}
      </View>
      <Dock bg="white">
        <Btn variant="gradient" title={done ? 'Thanks, Sara' : 'Submit review'} onPress={submit} />
      </Dock>
    </Screen>
  );
}
