import { useEffect } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { s } from '@/theme/scale';
import { EASE } from '@/theme/tokens';

/** "Cards rise and de-blur in sequence": translateY s(14)->0 + opacity, with a blur veil that animates to 0. Stagger = index * 70ms. */
export function Rise({ index = 0, r = 0, spring, blur = true, style, children }: {
  index?: number; r?: number; spring?: boolean; blur?: boolean; style?: ViewStyle | ViewStyle[]; children: React.ReactNode;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(index * 70, spring ? withSpring(1, { damping: 14, stiffness: 140, mass: 0.9 }) : withTiming(1, { duration: 650, easing: EASE }));
  }, [index, spring]);
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.6), transform: [{ translateY: (1 - p.value) * s(14) }] }));
  // Only the veil's opacity animates (1 to 0): fixed-intensity blur on iOS/web, a plain white wash on Android (as in Glass).
  const vs = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  return (
    <Animated.View style={[st, style as any]}>
      {children}
      {blur && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: s(r), overflow: 'hidden' }, vs]}>
          {Platform.OS === 'android' ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]} /> : <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />}
        </Animated.View>
      )}
    </Animated.View>
  );
}
