import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Orb, Halo } from '@/fx/Orb';
import { BUILDINGS, BuildingType, STAGES, Stage } from '@/data/types';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Creating() {
  const p = useLocalSearchParams<{ type?: BuildingType; stage?: string; stay?: string }>();
  const type = (p.type ?? 'villa') as BuildingType; const stage = Number(p.stage ?? 3) as Stage;
  const name = BUILDINGS.find((b) => b.id === type)!.name;
  useEffect(() => {
    if (p.stay) return;
    const t = setTimeout(() => { useDemo.getState().completeClientOnboarding(type, stage); router.replace('/home'); }, 2600);
    return () => clearTimeout(t);
  }, [p.stay]);
  const lines = [`✓ ${name} · ${STAGES[stage - 1]} stage`, '✓ 6 milestones created', '✓ Pulse tuned to your stage', '◌ Matching experts near Al Reem…'];
  return (
    <Screen bg="pulse" px={16}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View><Halo size={110} /><Orb size={110} /></View>
        <T size={17} w={700} ls={-0.02} style={{ marginTop: s(34) }}>Building your project…</T>
        <View style={{ marginTop: s(16), gap: s(8), alignItems: 'flex-start' }}>
          {lines.map((l, i) => (
            <Animated.View key={l} entering={FadeInDown.delay(100 * (i + 1)).duration(1000)}>
              <T size={11} c={i === 3 ? C.mute : C.navy}>{l}</T>
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
