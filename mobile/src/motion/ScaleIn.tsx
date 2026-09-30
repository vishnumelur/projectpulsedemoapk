import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { DUR, SCALE_FROM, ease } from '@/theme/motion';

/** Calm scale-in (the motion system's `enterScale`): fades in while scaling from `from` to 1 on EASE_OUT. Never overshoots.
 *  Success ticks use `from={SUCCESS_FROM}`. Driven by shared values so it behaves the same on iOS, Android and web. */
export function ScaleIn({ delay = 0, from = SCALE_FROM, duration = DUR.slow, style, children }: {
  delay?: number; from?: number; duration?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, ease(duration)));
    return () => cancelAnimation(p);
  }, []);
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: from + (1 - from) * p.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}
