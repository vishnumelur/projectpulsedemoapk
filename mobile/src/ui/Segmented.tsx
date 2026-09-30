import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { T } from './T';

export function Segmented({ options, value, onChange, style, track = 'rgba(22,32,90,0.05)' }:
  { options: string[]; value: number; onChange: (i: number) => void; style?: StyleProp<ViewStyle>; track?: string }) {
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: track, borderRadius: s(12), padding: s(3) }, style]}>
      {options.map((o, i) => (
        <Pressable key={o} onPress={() => onChange(i)} style={{ flex: 1, alignItems: 'center', paddingVertical: s(7), borderRadius: s(9),
          backgroundColor: i === value ? '#fff' : 'transparent', shadowColor: '#16205A', shadowOpacity: i === value ? 0.08 : 0, shadowRadius: s(4), elevation: i === value ? 1 : 0 }}>
          <T size={10.5} w={600} c={i === value ? C.navy : C.mute}>{o}</T>
        </Pressable>
      ))}
    </View>
  );
}
