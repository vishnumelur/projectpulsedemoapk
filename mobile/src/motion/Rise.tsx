import { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withDelay, withTiming, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { s } from '@/theme/scale';
import { EASE } from '@/theme/tokens';

const ABlur = Animated.createAnimatedComponent(BlurView);

/** "Cards rise and de-blur in sequence": translateY s(14)->0 + opacity, with a blur veil that animates to 0. Stagger = index * 70ms. */
export function Rise({ index = 0, r = 0, spring, blur = true, style, children }: {
  index?: number; r?: number; spring?: boolean; blur?: boolean; style?: ViewStyle | ViewStyle[]; children: React.ReactNode;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(index * 70, spring ? withSpring(1, { damping: 14, stiffness: 140, mass: 0.9 }) : withTiming(1, { duration: 650, easing: EASE }));
  }, []);
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.6), transform: [{ translateY: (1 - p.value) * s(14) }] }));
  const veil = useAnimatedProps(() => ({ intensity: Math.max(0, 1 - p.value) * 40 }));
  const vs = useAnimatedStyle(() => ({ opacity: p.value >= 0.999 ? 0 : 1 }));
  return (
    <Animated.View style={[st, style as any]}>
      {children}
      {blur && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: s(r), overflow: 'hidden' }, vs]}>
          <ABlur tint="light" animatedProps={veil} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </Animated.View>
  );
}
