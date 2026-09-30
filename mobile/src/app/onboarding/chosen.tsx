import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { ScaleIn } from '@/motion/ScaleIn';
import { SUCCESS_FROM } from '@/theme/motion';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS, BuildingType } from '@/data/types';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';
import { withPortal } from '@/nav/PortalGuard';

function Chosen() {
  const { type = 'villa', stay } = useLocalSearchParams<{ type?: BuildingType; stay?: string }>();
  const b = BUILDINGS.find((x) => x.id === type) ?? BUILDINGS[0];
  // the tick settles in (0.9 -> 1, EASE_OUT) with the success haptic; no zoom-and-bounce
  useEffect(() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, []);
  useEffect(() => { if (stay) return; const t = setTimeout(() => router.replace(`/onboarding/stage?type=${b.id}`), 1400); return () => clearTimeout(t); }, [stay]);
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <ScaleIn from={SUCCESS_FROM} style={{ marginTop: s(34), width: s(44), height: s(44), borderRadius: s(22), backgroundColor: C.blue,
          alignItems: 'center', justifyContent: 'center', ...shadow(C.blue, 0.35, s(15), s(12)) }}>
          <T size={20} c="#fff">✓</T>
        </ScaleIn>
        <View style={{ height: s(320), alignSelf: 'stretch', marginHorizontal: -s(16), marginTop: s(10) }}><ModelView model={b.id} lights={0.9} spin={0.25} radius={9.8} target={[0, 1.8, 0]} /></View>
        <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(6) }}>{b.name}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Lights on. Let's find your stage…</T>
      </View>
    </Screen>
  );
}

// Client onboarding runs only inside the client session (sealed like the (client) group).
export default withPortal('client', Chosen);
