// src/ui/LiveDot.tsx
import { View } from 'react-native';
import { useEffect } from 'react';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { T } from './T';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export function LiveDot({ label, size = 10 }: { label: string; size?: number }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false); }, []);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: 1 + p.value * 1.3 }], opacity: 0.5 * (1 - p.value) }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5) }}>
      <View style={{ width: s(7), height: s(7) }}>
        <Animated.View style={[{ position: 'absolute', width: s(7), height: s(7), borderRadius: s(4), backgroundColor: C.greenDot }, ring]} />
        <View style={{ width: s(7), height: s(7), borderRadius: s(4), backgroundColor: C.greenDot }} />
      </View>
      <T size={size} w={700} c={C.green}>{label}</T>
    </View>
  );
}
