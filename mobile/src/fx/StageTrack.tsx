import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { T } from '@/ui/T';
import { Orb } from './Orb';
import { STAGES } from '@/data/types';

export function StageTrack({ stage }: { stage: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const pct = (stage - 1) / 5;
  return (
    <View style={{ marginTop: s(10), marginHorizontal: s(6), height: s(28) }}>
      <View style={{ position: 'absolute', left: s(4), right: s(4), top: s(10), height: s(2), borderRadius: s(2), backgroundColor: '#E1E5F0' }} />
      <View style={{ position: 'absolute', left: s(4), top: s(10), height: s(2), width: `${pct * 100}%`, borderRadius: s(2), overflow: 'hidden' }}>
        <LinearGradient colors={[C.blue, C.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {STAGES.map((name, i) => {
          const n = i + 1;
          if (n === stage) return (
            <View key={name} style={{ alignItems: 'center', marginTop: s(3) }}>
              <Orb size={14} />
              <T size={8.5} w={700} c={C.blue} style={{ marginTop: s(3) }}>{name}</T>
            </View>
          );
          return <View key={name} style={{ width: s(8), height: s(8), borderRadius: s(4), marginTop: s(6), backgroundColor: n < stage ? C.blue : '#fff',
            borderWidth: 1.5, borderColor: n < stage ? C.blue : '#CFD4E6' }} />;
        })}
      </View>
    </View>
  );
}
