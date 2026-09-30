import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS, BuildingType } from '@/data/types';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Chosen() {
  const { type = 'villa', stay } = useLocalSearchParams<{ type?: BuildingType; stay?: string }>();
  const b = BUILDINGS.find((x) => x.id === type) ?? BUILDINGS[0];
  useEffect(() => { if (stay) return; const t = setTimeout(() => router.replace(`/onboarding/stage?type=${b.id}`), 1400); return () => clearTimeout(t); }, [stay]);
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Animated.View entering={ZoomIn.springify().damping(9)} style={{ marginTop: s(34), width: s(44), height: s(44), borderRadius: s(22), backgroundColor: C.blue,
          alignItems: 'center', justifyContent: 'center', shadowColor: C.blue, shadowOpacity: 0.35, shadowRadius: s(15), shadowOffset: { width: 0, height: s(12) }, elevation: 8 }}>
          <T size={20} c="#fff">✓</T>
        </Animated.View>
        <View style={{ height: s(320), alignSelf: 'stretch', marginHorizontal: -s(16), marginTop: s(10) }}><ModelView model={b.id} lights={0.9} spin={0.25} radius={9.8} target={[0, 1.8, 0]} /></View>
        <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(6) }}>{b.name}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Lights on. Let's find your stage…</T>
      </View>
    </Screen>
  );
}
