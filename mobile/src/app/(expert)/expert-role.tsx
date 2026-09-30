import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const ROLES = [['Engineer', 'Civil · Structural · MEP'], ['Architect', 'Design & drawings'], ['Interior designer', 'Fit-out & finishes'], ['Contractor', 'Build & renovate']] as const;
export default function ExpertRole() {
  const [on, setOn] = useState<string>('Engineer');
  const [picked, setPicked] = useState(false);
  const pick = (r: string) => { setOn(r); setPicked(true); Haptics.selectionAsync(); setTimeout(() => router.push('/expert-setup'), 600); };
  return (
    <Screen bg="aurora">
      <Header center={<T size={9.5} w={700} ls={0.14} c={C.mute}>1 OF 2</T>} />
      <T size={26} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(16) }}>{'What do\nyou do?'}</T>
      <View style={{ marginTop: s(18) }}>
        {ROLES.map(([name, sub], i) => (
          <Pressable key={name} onPress={() => pick(name)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: s(13), borderBottomWidth: i === 3 ? 0 : 1, borderBottomColor: C.line }}>
            {on === name ? (picked ? <GradientText size={22} w={700} ls={-0.025}>{name}</GradientText> : <T size={22} w={700} ls={-0.025}>{name}</T>) : <T size={18} w={600} ls={-0.025}>{name}</T>}
            <T size={10} c={C.faint}>{sub}</T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
