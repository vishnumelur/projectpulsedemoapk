import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { T, TProps } from '@/ui/T';
import { GRAD } from '@/theme/tokens';

type Props = TProps & { shimmer?: boolean; base?: string; colors?: readonly string[] };
export function GradientText({ shimmer, base = '#16205A', colors = GRAD, children, ...t }: Props) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  useEffect(() => { if (shimmer) x.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, false); }, [shimmer]);
  const band = useAnimatedStyle(() => ({ transform: [{ translateX: -w * 1.5 + x.value * w * 2.5 }] }));
  if (Platform.OS === 'web') {
    // @react-native-masked-view has no web implementation: clip a CSS gradient to the glyphs instead.
    const stops = colors.map((c, i) => `${c} ${Math.round((i / Math.max(1, colors.length - 1)) * 100)}%`).join(', ');
    const web: any = shimmer
      ? { backgroundImage: `linear-gradient(90deg, ${base} 35%, #31D1FF 45%, #0000FE 52%, #B9A8FF 58%, ${base} 68%)`, backgroundSize: '250% 100%', backgroundPosition: '100% 0' }
      : { backgroundImage: `linear-gradient(90deg, ${stops})` };
    // an inline span (nested Text) so a wrapped line slices one gradient, as the mockup's inline `.grad` span does
    return <T {...t}><Text style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', ...web } as any}>{children}</Text></T>;
  }
  const text = <T {...t}>{children}</T>;
  return (
    <MaskedView maskElement={text} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {shimmer ? (
        <View style={{ backgroundColor: base }}>
          <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: w * 2.5 }, band]}>
            <LinearGradient colors={[base, '#31D1FF', '#0000FE', '#B9A8FF', base]} locations={[0.35, 0.45, 0.52, 0.58, 0.68]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
          <T {...t} style={[t.style, { opacity: 0 }]}>{children}</T>
        </View>
      ) : (
        <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <T {...t} style={[t.style, { opacity: 0 }]}>{children}</T>
        </LinearGradient>
      )}
    </MaskedView>
  );
}
export default GradientText;
