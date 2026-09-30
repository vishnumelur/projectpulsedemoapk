import { View } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
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

export default function Building() {
  // First screen after Sign in: history was reset, so there is nothing to go back to (never back into the login).
  const [hasBack] = useState(() => router.canGoBack?.() ?? true);
  const [i, setI] = useState(0); const b = BUILDINGS[i];
  const go = (n: number) => { if (n !== i) { setI(n); Haptics.selectionAsync(); } };
  const step = (d: number) => go((i + d + BUILDINGS.length) % BUILDINGS.length);
  // Fling events carry no velocity: one fling per direction (swipe left = next, right = previous). Built once, so the
  // detector isn't re-attached on every change; it calls the latest step through a ref.
  const stepRef = useRef(step); stepRef.current = step;
  const swipe = useMemo(() => Gesture.Race(Gesture.Fling().direction(Directions.LEFT).runOnJS(true).onEnd(() => stepRef.current(1)),
    Gesture.Fling().direction(Directions.RIGHT).runOnJS(true).onEnd(() => stepRef.current(-1))), []);
  return (
    <Screen bg="aurora" px={16}>
      <Header back={hasBack} center={<Eyebrow>1 OF 2</Eyebrow>} />
      <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>{'What are you\nbuilding?'}</T>
      {/* a horizontal swipe switches building: the model's own drag-to-spin is off here, or its Pan would win every drag */}
      <GestureDetector gesture={swipe}>
        <View style={{ height: s(262), marginHorizontal: -s(16), marginTop: s(6) }}><ModelView model={b.id} riseKey={b.id} lights={0.25} interactive={false} /></View>
      </GestureDetector>
      <View style={{ alignItems: 'center', marginTop: -s(4) }}>
        <Animated.View key={b.id} entering={FadeIn.duration(220)} exiting={FadeOut.duration(150)}><T size={26} w={700} ls={-0.035}>{b.name}</T></Animated.View>
        <T size={9.5} c={C.mute} style={{ marginTop: s(2) }}>{b.sub}</T>
      </View>
      <View style={{ marginTop: s(10) }}><PageDots count={5} index={i} onPress={go} /></View>
      <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title="Continue" onPress={() => router.push(`/onboarding/chosen?type=${b.id}`)} /></View>
    </Screen>
  );
}
