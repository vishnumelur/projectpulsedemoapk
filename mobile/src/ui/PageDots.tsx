import { Pressable, View } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
/** Pager dots. With onPress each dot is a tap target (hitSlop keeps the 5px dots easy to hit) that jumps to its page. */
export function PageDots({ count, index, activeColor = C.navy, onPress }: { count: number; index: number; activeColor?: string; onPress?: (i: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: s(5), justifyContent: 'center' }}>
      {Array.from({ length: count }, (_, i) => {
        const dot = <View style={{ width: s(i === index ? 16 : 5), height: s(5), borderRadius: s(5), backgroundColor: i === index ? activeColor : '#CFD4E6' }} />;
        return onPress
          ? <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Page ${i + 1}`} hitSlop={s(10)} onPress={() => onPress(i)}>{dot}</Pressable>
          : <View key={i}>{dot}</View>;
      })}
    </View>
  );
}
