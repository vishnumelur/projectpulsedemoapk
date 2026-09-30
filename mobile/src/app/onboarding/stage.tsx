import { Platform, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import Animated, { useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS, BuildingType, STAGES, STAGE_DESC, Stage as StageN } from '@/data/types';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

const SLOT = 118;
const FADE = ['transparent', '#000', '#000', 'transparent'] as const;
/** Masks the picker row with faded left/right edges (MaskedView on native, CSS mask-image on web, where MaskedView is not implemented). */
function FadeEdges({ maskElement, children }: { maskElement: React.ReactElement; children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    const m = 'linear-gradient(90deg, transparent 0%, #000 30%, #000 70%, transparent 100%)';
    return <View style={[{ flex: 1 }, { maskImage: m, WebkitMaskImage: m } as any]}>{children}</View>;
  }
  return <MaskedView style={{ flex: 1 }} maskElement={maskElement}>{children}</MaskedView>;
}
export default function StageScreen() {
  const { type = 'villa', stage } = useLocalSearchParams<{ type?: BuildingType; stage?: string }>();
  const b = BUILDINGS.find((x) => x.id === type) ?? BUILDINGS[0];
  const [st, setSt] = useState<StageN>((Number(stage) || 3) as StageN); const [w, setW] = useState(0);
  const pick = (n: number) => { const v = Math.min(6, Math.max(1, n)) as StageN; if (v !== st) { setSt(v); Haptics.selectionAsync(); } };
  const row = useAnimatedStyle(() => ({ transform: [{ translateX: withTiming(w / 2 - ((st - 1) * s(SLOT) + s(SLOT) / 2), { duration: 800, easing: EASE }) }] }));
  // Fling events carry no velocity: one fling per direction (swipe left = next stage, right = previous). Built once; it
  // reads the current stage through a ref.
  const stepRef = useRef((d: number) => pick(st + d)); stepRef.current = (d: number) => pick(st + d);
  const swipe = useMemo(() => Gesture.Race(Gesture.Fling().direction(Directions.LEFT).runOnJS(true).onEnd(() => stepRef.current(1)),
    Gesture.Fling().direction(Directions.RIGHT).runOnJS(true).onEnd(() => stepRef.current(-1))), []);
  return (
    <Screen bg="aurora" px={16}>
      <Header center={<Eyebrow>2 OF 2</Eyebrow>} />
      <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>{`Where is your\n${b.name.toLowerCase()} today?`}</T>
      <View style={{ height: s(262), marginHorizontal: -s(16), marginTop: s(6) }}>
        <ModelView model={b.id} stage={st} radius={11.2} target={[0, 3.4, 0]} spin={0.08} lights={st === 6 ? 0.9 : 0} />
      </View>
      <GestureDetector gesture={swipe}>
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: s(38), marginHorizontal: -s(16), marginTop: s(2) }}>
          <FadeEdges maskElement={<LinearGradient colors={FADE} locations={[0, 0.3, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />}>
            <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', height: s(38) }, row]}>
              {STAGES.map((name, i) => (
                <Pressable key={name} onPress={() => pick(i + 1)} style={{ width: s(SLOT), alignItems: 'center' }}>
                  {/* wider than the slot so a long name overflows both sides centred, as on web (a native Text wraps/clips at its box) */}
                  <T size={i + 1 === st ? 23 : 15} w={i + 1 === st ? 700 : 600} ls={i + 1 === st ? -0.035 : -0.02} c={i + 1 === st ? C.navy : C.faint3}
                    align="center" numberOfLines={1} style={{ width: s(SLOT + 60) }}>{name}</T>
                </Pressable>
              ))}
            </Animated.View>
          </FadeEdges>
        </View>
      </GestureDetector>
      <Animated.View key={st} entering={FadeIn.duration(250)}><T size={11} c={C.mute} align="center" style={{ marginTop: s(4) }}>{STAGE_DESC[st - 1]}</T></Animated.View>
      <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title="Continue" onPress={() => router.push(`/onboarding/creating?type=${b.id}&stage=${st}`)} /></View>
    </Screen>
  );
}
