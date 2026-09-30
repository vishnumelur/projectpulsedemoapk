import Animated, { useSharedValue, withDelay, withTiming, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useEffect } from 'react';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

const AP = Animated.createAnimatedComponent(Path);
export function LogoMark({ size = 22, color = C.blue, animated = false }: { size?: number; color?: string; animated?: boolean }) {
  const a = useSharedValue(animated ? 0 : 1);
  const b = useSharedValue(animated ? 0 : 1);
  useEffect(() => {
    if (!animated) return;
    a.value = withTiming(1, { duration: 840, easing: EASE });
    b.value = withDelay(360, withTiming(1, { duration: 720, easing: EASE }));
  }, [animated]);
  const pa = useAnimatedProps(() => ({ opacity: a.value, transform: [{ translateX: -40 * (1 - a.value) }] } as any));
  const pb = useAnimatedProps(() => ({ opacity: b.value, transform: [{ translateY: 40 * (1 - b.value) }] } as any));
  return (
    <Svg width={s(size)} height={s(size)} viewBox="0 0 100 100">
      <AP animatedProps={pa} d="M0 100V22Q0 0 22 0H72V20L34 40V100Z" fill={color} />
      <AP animatedProps={pb} d="M50 100V50L72 39V100Z" fill={color} />
    </Svg>
  );
}
