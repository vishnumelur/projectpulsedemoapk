import { useEffect } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { PRESS_SCALE, SPRING } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A Pressable that gives the house press feedback: it eases down to PRESS_SCALE on a critically-damped SPRING while held and
 *  settles back to 1 on release. Never below 0.97, never overshoots. */
export function PressScale({ style, onPressIn, onPressOut, scaleTo = PRESS_SCALE, ...rest }: Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>; scaleTo?: number;
}) {
  const k = useSharedValue(1);
  useEffect(() => () => cancelAnimation(k), []);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: k.value }] }));
  return (
    <AnimatedPressable {...rest}
      onPressIn={(e) => { k.value = withSpring(scaleTo, SPRING); onPressIn?.(e); }}
      onPressOut={(e) => { k.value = withSpring(1, SPRING); onPressOut?.(e); }}
      style={[style, st]} />
  );
}
