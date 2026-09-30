import { View } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
export function PageDots({ count, index, activeColor = C.navy }: { count: number; index: number; activeColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: s(5), justifyContent: 'center' }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: s(i === index ? 16 : 5), height: s(5), borderRadius: s(5), backgroundColor: i === index ? activeColor : '#CFD4E6' }} />
      ))}
    </View>
  );
}
