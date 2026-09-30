import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import { enterFade, exitFade } from '@/theme/motion';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { PageDots } from '@/ui/PageDots';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS } from '@/data/types';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { withPortal } from '@/nav/PortalGuard';

function Building() {
  // First screen after Sign in: history was reset, so there is nothing to go back to (never back into the login).
  const [hasBack] = useState(() => router.canGoBack?.() ?? true);
  const { type } = useLocalSearchParams<{ type?: string }>(); // deep link / QA: open on a given building
  const [i, setI] = useState(Math.max(0, BUILDINGS.findIndex((x) => x.id === type))); const b = BUILDINGS[i];
  const go = (n: number) => { if (n !== i) { setI(n); Haptics.selectionAsync(); } };
  const step = (d: number) => go((i + d + BUILDINGS.length) % BUILDINGS.length);
  // A horizontal swipe switches building: any speed. It fires as soon as the finger has travelled far enough (no wait for
  // release), or on a quick flick at release. One step per gesture. Built once; it calls the latest step through a ref.
  const stepRef = useRef(step); stepRef.current = step;
  const fired = useRef(false);
  const swipe = useMemo(() => Gesture.Pan().runOnJS(true).activeOffsetX([-12, 12]).failOffsetY([-24, 24])
    .onBegin(() => { fired.current = false; })
    .onUpdate((e) => { if (!fired.current && Math.abs(e.translationX) > 48) { fired.current = true; stepRef.current(e.translationX < 0 ? 1 : -1); } })
    .onEnd((e) => { if (!fired.current && Math.abs(e.velocityX) > 450) { fired.current = true; stepRef.current(e.velocityX < 0 ? 1 : -1); } }), []);
  return (
    <Screen bg="aurora" px={16}>
      <Header back={hasBack} center={<Eyebrow>{`${i + 1} OF ${BUILDINGS.length}`}</Eyebrow>} />
      <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>{'What are you\nbuilding?'}</T>
      {/* a horizontal swipe switches building: the model's own drag-to-spin is off here, or its Pan would win every drag */}
      <GestureDetector gesture={swipe}>
        <View collapsable={false}>
        <View pointerEvents="none" style={{ height: s(262), marginHorizontal: -s(16), marginTop: s(6) }}><ModelView model={b.id} riseKey={b.id} lights={0.25} interactive={false} /></View>
        <View style={{ alignItems: 'center', marginTop: -s(4) }}>
          <Animated.View key={b.id} entering={enterFade(0, 220)} exiting={exitFade}><T size={26} w={700} ls={-0.035}>{b.name}</T></Animated.View>
          <T size={9.5} c={C.mute} style={{ marginTop: s(2) }}>{b.sub}</T>
        </View>
        <View style={{ marginTop: s(10), paddingBottom: s(8) }}><PageDots count={5} index={i} onPress={go} /></View>
        </View>
      </GestureDetector>
      <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title="Continue" onPress={() => router.push(`/onboarding/chosen?type=${b.id}`)} /></View>
    </Screen>
  );
}

// Client onboarding runs only inside the client session (sealed like the (client) group).
export default withPortal('client', Building);
