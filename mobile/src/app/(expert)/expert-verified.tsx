import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Icon } from '@/ui/Icon';
import { ProgressRing } from '@/fx/ProgressRing';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';

// ✦ the badge spins in with a spring (ends at the mockup's rotate(-8deg))
function Badge({ children }: { children: React.ReactNode }) {
  const k = useSharedValue(0);
  useEffect(() => { k.value = withSpring(1, { damping: 9, stiffness: 110 }); }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: k.value }, { rotate: `${-8 - 180 * (1 - k.value)}deg` }] }));
  return <Animated.View style={[st, { marginTop: s(84), borderRadius: s(30), ...shadow(C.blue, 0.3, s(22), s(20)) }]}>{children}</Animated.View>;
}
export default function ExpertVerified() {
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  const [ok, setOk] = useState(!!stay);
  useEffect(() => { if (ok) return; const t = setTimeout(() => { setOk(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, 1800); return () => clearTimeout(t); }, []);
  if (!ok) return (
    <Screen bg="verified">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ProgressRing size={84} thickness={5} progress={0.3} spin colors={['#31D1FF', '#0000FE', '#7A5CFF']} />
        <T size={22} w={700} ls={-0.035} style={{ marginTop: s(26) }}>Under review</T>
        <T size={11} c={C.mute} lh={1.55} align="center" style={{ marginTop: s(8) }}>{'Project Pulse is checking your licence.\nThis usually takes 1–2 days.'}</T>
      </View>
    </Screen>
  );
  return (
    <Screen bg="verified">
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Badge>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(96), height: s(96), borderRadius: s(30), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shieldCheck" size={44} color="#fff" stroke={2.4} />
          </LinearGradient>
        </Badge>
        <View style={{ flexDirection: 'row', marginTop: s(32) }}><T size={26} w={700} ls={-0.035}>You're </T><GradientText size={26} w={700} ls={-0.035}>verified</GradientText></View>
        <T size={11} c={C.mute} lh={1.55} align="center" style={{ marginTop: s(4.5) }}>{'Project Pulse approved your profile.\nYou\'ll now get requests in\n'}<T size={11} w={700} c={C.navy}>Abu Dhabi & Dubai</T>.</T>
        <Glass r={14} style={{ marginTop: s(22), paddingVertical: s(8), paddingHorizontal: s(14) }}><T size={10} c={C.mute} align="center">Under review took <T size={10} w={700}>2 days</T> · you'll hear by email</T></Glass>
      </View>
      <Dock bg="none"><Btn title="Go to dashboard" onPress={() => { useDemo.getState().verifyExpert(); router.replace('/pro'); }} /></Dock>
    </Screen>
  );
}
