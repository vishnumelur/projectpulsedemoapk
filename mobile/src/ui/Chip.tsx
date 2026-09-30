import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { T } from './T';

export function Chip({ label, on, onPress, style }: { label: string; on?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={[{ paddingVertical: s(7), paddingHorizontal: s(12), borderRadius: s(16), borderWidth: 1,
      borderColor: on ? C.navy : 'rgba(22,32,90,0.06)', backgroundColor: on ? C.navy : 'rgba(255,255,255,0.7)' }, style]}>
      <T size={10.5} w={600} c={on ? '#fff' : C.navy} numberOfLines={1}>{label}</T>
    </Pressable>
  );
}
