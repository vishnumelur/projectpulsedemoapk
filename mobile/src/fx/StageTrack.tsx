import { useEffect } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withRepeat, withSequence, withTiming, cancelAnimation, useReducedMotion } from 'react-native-reanimated';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { DUR, EASE_IN_OUT, EASE_OUT } from '@/theme/motion';
import { T } from '@/ui/T';
import { RoundOrb } from './RoundOrb';
import { STAGES } from '@/data/types';

type Stage = 1 | 2 | 3 | 4 | 5 | 6;
const GREY = '#E3E6F0';
const STAGGER = 90; // ms between segments filling left to right
const NOW_FILL = 0.55; // mockup: the current segment's fill eases to 55%

/** The labels under the bar: first stage · "Next: <stage after the current one>" · last stage. */
export function stageLabels(stage: Stage) {
  return { first: STAGES[0], next: stage < STAGES.length ? (STAGES as readonly string[])[stage] : null, last: STAGES[STAGES.length - 1] };
}

/** A done segment: its Pulse Blue fill glides from 0 to full width (✦ "segments fill left to right"; brand EASE_OUT, no overshoot).
 *  The last done segment runs into cyan (mockup `.dn:nth-child(3)`), so blue flows into the current segment. */
function Done({ i, last }: { i: number; last: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(i * STAGGER, withTiming(1, { duration: DUR.reveal, easing: EASE_OUT })); }, []);
  const st = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={seg}>
      <Animated.View style={[{ height: '100%', borderRadius: s(6), overflow: 'hidden' }, st]}>
        <LinearGradient colors={last ? ['#1F2CFF', '#31A8FF'] : [C.blue, '#2A3BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

/** The current segment: grey track, a cyan fill that eases to ~half after the done segments have filled,
 *  and a soft white light that sweeps along it every 2.6s (✦). */
function Now({ i }: { i: number }) {
  const fill = useSharedValue(0);
  const sweep = useSharedValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    fill.value = withDelay(i * STAGGER + 150, withTiming(NOW_FILL, { duration: 1400, easing: EASE_OUT }));
    // mockup @keyframes sweep 2.6s ease-in-out: left -40% -> 60% over the first 70%, then rests off the fill
    if (reduce) return;
    sweep.value = withDelay(1200, withRepeat(withSequence(withTiming(1, { duration: DUR.trackSweep * 0.7, easing: EASE_IN_OUT }), withTiming(1, { duration: DUR.trackSweep * 0.3 }), withTiming(0, { duration: 0 })), -1));
    return () => { cancelAnimation(sweep); };
  }, [reduce]);
  const fs = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const ss = useAnimatedStyle(() => ({ left: `${-40 + sweep.value * 100}%` }));
  return (
    <View style={seg}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: s(6), overflow: 'hidden' }, fs]}>
        <LinearGradient colors={['#31A8FF', C.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: '40%' }, ss]}>
        <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

const seg = { flex: 1, height: s(6), borderRadius: s(6), backgroundColor: GREY, overflow: 'hidden' } as const;

/** Batch 5 B1 "Segmented bar + stage pill": the stage pill with a small round orb and "Stage N of 6" opposite,
 *  six even segments (done = Pulse Blue, current = part-filled cyan with a light sweep, future = grey) and
 *  the first · Next: · last labels. Driven by the project's stage. */
export function StageTrack({ stage }: { stage: Stage }) {
  const { first, next, last } = stageLabels(stage);
  return (
    <View style={{ marginTop: s(14) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), paddingVertical: s(4), paddingLeft: s(5), paddingRight: s(10), borderRadius: s(14), backgroundColor: 'rgba(0,0,254,0.07)' }}>
          <RoundOrb size={12} ob={2} />
          <T size={10.5} w={700} ls={-0.005} c={C.blue}>{STAGES[stage - 1]}</T>
        </View>
        <T size={9.5} w={600} c={C.mute}>Stage <T size={9.5} w={700} c={C.navy}>{String(stage)}</T> of {STAGES.length}</T>
      </View>
      <View style={{ flexDirection: 'row', gap: s(4), marginTop: s(10) }}>
        {STAGES.map((name, i) => i + 1 < stage ? <Done key={name} i={i} last={i + 2 === stage} /> : i + 1 === stage ? <Now key={name} i={i} /> : <View key={name} style={seg} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: s(6) }}>
        <T size={8.5} w={600} c={C.faint2}>{first}</T>
        {next ? <T size={8.5} w={600} c={C.faint2}>Next: <T size={8.5} w={700} c={C.navy}>{next}</T></T> : <T size={8.5} w={700} c={C.navy}>Final stage</T>}
        <T size={8.5} w={600} c={C.faint2}>{last}</T>
      </View>
    </View>
  );
}
