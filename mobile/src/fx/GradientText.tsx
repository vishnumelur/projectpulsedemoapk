import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { cancelAnimation, useSharedValue, withRepeat, withTiming, useAnimatedStyle, useReducedMotion, Easing, SharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Platform, Text, TextLayoutLine, View } from 'react-native';
import { T, TProps } from '@/ui/T';
import { GRAD } from '@/theme/tokens';

type Props = TProps & { shimmer?: boolean; base?: string; colors?: readonly string[] };
type Line = { x: number; y: number; w: number; h: number; at: number }; // at: offset of this line in the run of all lines
const SHIMMER_LOC = [0.35, 0.45, 0.52, 0.58, 0.68] as const;

/** One line's slice of the shimmer band: the band is 2.5x the total text run and sweeps across it (mockup `.shim`). */
function ShimmerSlice({ l, total, base, x }: { l: Line; total: number; base: string; x: SharedValue<number> }) {
  const band = useAnimatedStyle(() => ({ transform: [{ translateX: -l.at - total * 1.5 + x.value * total * 2.5 }] }));
  return (
    <View style={{ position: 'absolute', left: l.x, top: l.y, width: l.w, height: l.h, overflow: 'hidden', backgroundColor: base }}>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, width: total * 2.5 }, band]}>
        <LinearGradient colors={[base, '#31D1FF', '#0000FE', '#B9A8FF', base]} locations={SHIMMER_LOC} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

export function GradientText({ shimmer, base = '#16205A', colors = GRAD, children, ...t }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const x = useSharedValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!shimmer || reduce) return;
    x.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, false);
    return () => cancelAnimation(x);
  }, [shimmer, reduce]);
  if (Platform.OS === 'web') {
    // @react-native-masked-view has no web implementation: clip a CSS gradient to the glyphs instead.
    const stops = colors.map((c, i) => `${c} ${Math.round((i / Math.max(1, colors.length - 1)) * 100)}%`).join(', ');
    const web: any = shimmer
      ? { backgroundImage: `linear-gradient(90deg, ${base} 35%, #31D1FF 45%, #0000FE 52%, #B9A8FF 58%, ${base} 68%)`, backgroundSize: '250% 100%', backgroundPosition: '100% 0' }
      : { backgroundImage: `linear-gradient(90deg, ${stops})` };
    // an inline span (nested Text) so a wrapped line slices one gradient, as the mockup's inline `.grad` span does
    return <T {...t}><Text style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', ...web } as any}>{children}</Text></T>;
  }
  // Native: like the web's inline span, one gradient runs across the glyphs' own line boxes (not the container width), and a
  // wrapped text continues it on the next line. The line boxes come from onTextLayout of the invisible sizing copy.
  const onLines = (ls: TextLayoutLine[]) => {
    let at = 0;
    setLines(ls.map((l) => { const r = { x: l.x, y: l.y, w: l.width, h: l.height, at }; at += l.width; return r; }));
  };
  const total = lines.reduce((a, l) => a + l.w, 0);
  return (
    <MaskedView maskElement={<T {...t}>{children}</T>}>
      <View>
        <T {...t} style={[t.style, { opacity: 0 }]} onLayout={(e) => setOff({ x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y })}
          onTextLayout={(e) => onLines(e.nativeEvent.lines)}>{children}</T>
        {total > 0 && lines.map((l, i) => {
          const at = { ...l, x: l.x + off.x, y: l.y + off.y };
          return shimmer ? <ShimmerSlice key={i} l={at} total={total} base={base} x={x} /> : (
            <LinearGradient key={i} colors={colors as any} start={{ x: -l.at / l.w, y: 0 }} end={{ x: (total - l.at) / l.w, y: 0 }}
              style={{ position: 'absolute', left: at.x, top: at.y, width: l.w, height: l.h }} />
          );
        })}
      </View>
    </MaskedView>
  );
}
export default GradientText;
