import { View, Platform } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Animated, { type SharedValue, useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle, ZoomIn, withSpring, withDelay } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import type { PhotoKey } from '@/theme/photos';

const PEOPLE: PhotoKey[] = ['karim', 'lina', 'rashid', 'maya', 'omar'];
/** Caption: avatars glide out from the orb onto the orbit (staggered 180ms), tick one by one with a light haptic, then drift around it. */
function Orbiter({ i, spin }: { i: number; spin: SharedValue<number> }) {
  const R = s(86);
  const out = useSharedValue(0);
  useEffect(() => {
    out.value = withDelay(180 * i, withSpring(1, { damping: 26, stiffness: 170 }));
    const t = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 180 * i + 600);
    return () => clearTimeout(t);
  }, []);
  const st = useAnimatedStyle(() => {
    const a = ((i * 72 - 90) * Math.PI) / 180 + spin.value;
    // translate only (never rotate), so the avatar stays upright while it orbits
    return { opacity: Math.min(1, out.value * 2), transform: [{ translateX: Math.cos(a) * R * out.value }, { translateY: Math.sin(a) * R * out.value }, { scale: 0.4 + 0.6 * out.value }] };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: s(100) - s(19), top: s(100) - s(19) }, st]}>
      <Avatar photo={PEOPLE[i]} size={34} ring="white" />
      <Animated.View entering={ZoomIn.delay(180 * i + 600).springify()} style={{ position: 'absolute', right: -s(4), bottom: -s(3), width: s(15), height: s(15), borderRadius: s(8),
        backgroundColor: C.blue, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" color="#fff" size={8} stroke={3} /></Animated.View>
    </Animated.View>
  );
}
export default function Sent() {
  const spin = useSharedValue(0);
  useEffect(() => { spin.value = withRepeat(withTiming(Math.PI * 2, { duration: 30000, easing: Easing.linear }), -1, false); }, []);
  const step = (label: string, when: string, on = false) => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ width: s(12), height: s(12), borderRadius: s(6), backgroundColor: on ? C.blue : '#fff', borderWidth: 2, borderColor: on ? C.blue : '#D3D8E8',
        // Android can't draw a zIndex:-1 child behind its parent: the same halo as a boxShadow ring there
        ...(on && Platform.OS === 'android' ? { boxShadow: `0px 0px 0px ${s(4)}px rgba(0,0,254,0.12)` } : null) }}>
        {on && Platform.OS !== 'android' && <View style={{ position: 'absolute', left: -s(6), top: -s(6), width: s(20), height: s(20), borderRadius: s(10), backgroundColor: 'rgba(0,0,254,0.12)', zIndex: -1 }} />}
      </View>
      <T size={11} w={700} style={{ marginTop: s(7) }}>{label}</T><T size={9} c={C.faint} style={{ marginTop: 1 }}>{when}</T>
    </View>
  );
  return (
    <Screen bg="white">
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ marginTop: s(40), width: s(200), height: s(200) }}>
          <Svg width={s(200)} height={s(200)} style={{ position: 'absolute' }}><Circle cx={s(100)} cy={s(100)} r={s(86)} stroke="rgba(0,0,254,0.18)" strokeDasharray="4 4" fill="none" /></Svg>
          <View style={{ position: 'absolute', left: s(100) - s(39), top: s(100) - s(39) }}><Orb size={78} soft /></View>
          {PEOPLE.map((_, i) => <Orbiter key={i} i={i} spin={spin} />)}
        </View>
        <T size={23} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(22) }}>Sent to 5 experts</T>
        <View style={{ flexDirection: 'row', marginTop: s(6) }}><T size={11} c={C.mute}>Quotes usually arrive </T><GradientText shimmer base={C.navy} size={11} w={600}>within 24 hours</GradientText></View>
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: s(22) }}>
          <View style={{ position: 'absolute', left: '16%', right: '16%', top: s(5), height: 2, backgroundColor: '#E6E9F2' }} />
          {step('Sent', 'Now', true)}{step('Quotes', '~24h')}{step('You choose', 'Then')}
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 'auto', marginBottom: s(20) }}><Btn title="Done" onPress={() => router.replace('/home')} /></View>
      </View>
    </Screen>
  );
}
