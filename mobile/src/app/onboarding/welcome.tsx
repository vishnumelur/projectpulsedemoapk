import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SharedValue, cancelAnimation, useAnimatedStyle, useFrameCallback, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { T } from '@/ui/T';
import { LogoMark } from '@/ui/LogoMark';
import { RoundOrb } from '@/fx/RoundOrb';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';
import { DUR, EASE_IN_OUT, EASE_OUT, PRESS_SCALE, enterFade, enterUp } from '@/theme/motion';
import { useDemo } from '@/store/demo';

// Batch 5 A3 "Pulse greets you" (design/mockups/batch5-first-impression.html, A3 · Welcome (role in one tap)).
// Start flow: Splash -> this screen -> Sign up. The role is picked with one of two reply bubbles.
type Role = 'client' | 'expert';
const HELLO = "Hi, I'm Pulse.";
const ASK = 'Your construction expert for Abu Dhabi. Are you planning a project, or are you an engineer?';
const REPLIES: { role: Role; label: string; primary: boolean }[] = [
  { role: 'client', label: "I'm planning a project", primary: true },
  { role: 'expert', label: "I'm an engineer", primary: false },
];

// ✦ Entrance timeline (ms). Everything has settled by ~1.4s (captures wait 2.5s).
const CARD_AT = 250; // the Pulse message card rises in as the orb finishes blooming
const TYPE_AT = 450; // then the greeting types in
const TYPE_MS = 22; // per character
const REPLY_AT = TYPE_AT + HELLO.length * TYPE_MS + 90; // the replies follow the typed greeting, staggered
const REPLY_STEP = 90;
const TRUST_AT = REPLY_AT + 2 * REPLY_STEP + 120;
// ✦ Tap: the reply glides up into the conversation, then sign up cross-fades in (the stack's fade route).
const GLIDE_MS = DUR.slow;
const GO_AT = GLIDE_MS + 60;

/** -.02em unrounded: T's `ls` goes through s(), which snaps -0.27px / -0.3px to a whole half pixel (-0.5) and visibly
 *  tightens these short bold lines against the mockup. */
const LS = (size: number) => -0.02 * s(size);

const Arrow = () => (
  <Svg width={s(12)} height={s(12)} viewBox="0 0 24 24"><Path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>
);

/** A CSS `filter: blur(45px)` aurora blob (mockup `.aur`) as an SVG radial falloff (no Skia canvas behind the page).
 *  `stops`: [offset, strength] of a blurred disc; `drift`: the mockup's drift keyframe (px at the 50% point). */
function Blob({ id, cx, cy, rx, ry, color, opacity, stops, drift, t }: { id: string; cx: number; cy: number; rx: number; ry: number; color: string;
  opacity: number; stops: [number, number][]; drift: [number, number]; t: SharedValue<number> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: s(drift[0]) * t.value }, { translateY: s(drift[1]) * t.value }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: s(cx - rx), top: s(cy - ry), width: s(rx * 2), height: s(ry * 2) }, st]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${rx * 2} ${ry * 2}`}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            {stops.map(([o, a]) => <Stop key={o} offset={o} stopColor={color} stopOpacity={a * opacity} />)}
          </RadialGradient>
        </Defs>
        <Ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/** A3 backdrop: `.scr` #FBFCFF with a faint cyan blob top right (`.a-c`, opacity .25, drift2 12s) and a lilac one behind the
 *  orb (`.a-v` at top 120px, opacity .16, drift 16s). */
function Backdrop({ active }: { active: boolean }) {
  const c = useSharedValue(0);
  const v = useSharedValue(0);
  // paused (held where they are) while the screen is covered or motion is reduced; resumed from that point on focus
  useEffect(() => {
    if (!active) return;
    c.value = withRepeat(withTiming(c.value > 0.5 ? 0 : 1, { duration: DUR.auroraA, easing: EASE_IN_OUT }), -1, true);
    v.value = withRepeat(withTiming(v.value > 0.5 ? 0 : 1, { duration: DUR.auroraB, easing: EASE_IN_OUT }), -1, true);
    return () => { cancelAnimation(c); cancelAnimation(v); };
  }, [active]);
  return (
    <>
      {/* 230x200 box at right -90 / top -60, blur 45: the disc edge sits at 56% of the blurred radius */}
      <Blob id="a3c" cx={229} cy={40} rx={205} ry={190} color={C.cyan} opacity={0.25} t={c} drift={[-35, 20]}
        stops={[[0, 0.94], [0.15, 0.93], [0.34, 0.82], [0.56, 0.5], [0.78, 0.16], [1, 0]]} />
      <Blob id="a3v" cx={135} cy={205} rx={175} ry={175} color={C.lilac} opacity={0.16} t={v} drift={[35, 25]}
        stops={[[0, 0.83], [0.25, 0.74], [0.49, 0.45], [0.74, 0.15], [1, 0]]} />
    </>
  );
}

/** Mockup `.orbit`: a thin ring spinning at a constant rate (`spn`, linear), driven by the frame clock. */
function Orbit({ size, period, reverse, dashed, clock, children }: { size: number; period: number; reverse?: boolean; dashed?: boolean;
  clock: SharedValue<number>; children?: React.ReactNode }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${(reverse ? -360 : 360) * ((clock.value % period) / period)}deg` }] }));
  const D = s(size);
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: '50%', top: s((236 - size) / 2), marginLeft: -D / 2, width: D, height: D }, st]}>
      <Svg width={D} height={D} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2 - 0.5} fill="none" strokeWidth={1}
          stroke={dashed ? 'rgba(0,0,254,0.08)' : 'rgba(0,0,254,0.10)'} strokeDasharray={dashed ? '3 3' : undefined} />
      </Svg>
      {children}
    </Animated.View>
  );
}

/** Mockup `.orbit .sat`: the light point riding the ring (6px, cyan -> blue at 135deg, a cyan glow). */
function LightPoint() {
  return (
    <View style={{ position: 'absolute', top: -s(3), left: '50%', marginLeft: -s(3), width: s(6), height: s(6), borderRadius: s(3), backgroundColor: C.blue,
      ...shadow(C.cyan, 1, s(4), 0) }}>
      <LinearGradient colors={[C.cyan, C.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: s(3) }} />
    </View>
  );
}

/** ✦ The orb blooms in from the splash logo (scale .85 -> 1 with a fade, DUR.reveal, EASE_OUT), then breathes slowly while
 *  its colours rotate inside the crisp circle (RoundOrb: conic mix turning every 5s, glow breathing 3.2s, halo rings).
 *  Two orbit rings turn slowly (16s, and 26s the other way) with a light point travelling on the ring. */
function Stage({ settled, active }: { settled: boolean; active: boolean }) {
  const bloom = useSharedValue(settled ? 1 : 0);
  const breath = useSharedValue(0);
  const clock = useSharedValue(0);
  const offset = useSharedValue(0);
  const frame = useFrameCallback((f) => { clock.value = offset.value + f.timeSinceFirstFrame; }, false);
  useEffect(() => { if (!settled) bloom.value = withTiming(1, { duration: DUR.reveal, easing: EASE_OUT }); }, []);
  // the rings' clock and the breathe run only while this screen is focused (sign up on top pauses them: no UI-thread work
  // behind it); the clock resumes where it stopped, so the rings don't jump
  const first = useRef(true);
  useEffect(() => {
    if (!active) return;
    const base = clock.value;
    const delay = first.current && !settled ? DUR.reveal : 0;
    first.current = false;
    breath.value = withDelay(delay, withRepeat(withTiming(breath.value > 0.5 ? 0 : 1, { duration: DUR.float / 2, easing: EASE_IN_OUT }), -1, true));
    offset.value = base;
    frame.setActive(true);
    return () => { cancelAnimation(breath); frame.setActive(false); };
  }, [active]);
  const orb = useAnimatedStyle(() => ({ opacity: bloom.value, transform: [{ scale: (0.85 + 0.15 * bloom.value) * (1 + 0.02 * breath.value) }] }));
  const rings = useAnimatedStyle(() => ({ opacity: bloom.value }));
  return (
    <View style={{ height: s(236), alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }, rings]}>
        <Orbit size={236} period={26000} reverse dashed clock={clock} />
        <Orbit size={190} period={16000} clock={clock}><LightPoint /></Orbit>
      </Animated.View>
      <Animated.View style={orb}>
        <RoundOrb size={118} ob={10} glow halo />
      </Animated.View>
    </View>
  );
}

/** ✦ "Hi, I'm Pulse." types in letter by letter. The full line lays out the card; the typed copy is drawn over it. */
function Greeting({ settled }: { settled: boolean }) {
  const [n, setN] = useState(settled ? HELLO.length : 0);
  useEffect(() => {
    if (settled) return;
    let id: ReturnType<typeof setInterval> | undefined;
    // letters follow the clock (not the tick count), so a busy JS thread catches up instead of dragging the greeting out
    const t0 = Date.now() + TYPE_AT;
    const tick = () => { const k = Math.min(HELLO.length, Math.max(0, Math.floor((Date.now() - t0) / TYPE_MS) + 1)); setN(k); if (k >= HELLO.length && id) clearInterval(id); };
    const t = setTimeout(() => { tick(); id = setInterval(tick, TYPE_MS); }, TYPE_AT);
    return () => { clearTimeout(t); if (id) clearInterval(id); };
  }, []);
  const title = { size: 15, w: 700 as const, lh: 1.45 };
  return (
    // `.type` is an inline-block aligned to the line bottom, so the greeting sits 1px higher than a plain line
    <View style={{ marginTop: -s(1), marginBottom: s(0.75) }}>
      <T {...title} style={{ opacity: 0, letterSpacing: LS(15) }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{HELLO}</T>
      <T {...title} style={{ position: 'absolute', left: 0, top: 0, right: 0, letterSpacing: LS(15) }} accessibilityLabel={HELLO}>{HELLO.slice(0, n)}</T>
    </View>
  );
}

/** Mockup `.reply span`: iMessage-style reply bubbles, right aligned, tail at the bottom right. */
function Reply({ r, i, settled, chosen, glide, onPress }: { r: (typeof REPLIES)[number]; i: number; settled: boolean; chosen: SharedValue<number>;
  glide: SharedValue<number>; onPress: () => void }) {
  const [y, setY] = useState(0);
  // chosen: -1 none, else the index of the tapped reply. The tapped one glides up past the top of the replies, into the
  // conversation under Pulse's message (EASE_IN_OUT); the other one fades away (EASE_OUT).
  const st = useAnimatedStyle(() => ({ opacity: chosen.value >= 0 && chosen.value !== i ? 1 - glide.value : 1,
    transform: [{ translateY: chosen.value === i ? -(y + s(6)) * glide.value : 0 }] }));
  return (
    <Animated.View entering={settled ? undefined : enterUp(1, REPLY_AT + i * REPLY_STEP)} onLayout={(e) => setY(e.nativeEvent.layout.y)}>
      <Animated.View style={st}>
        <Pressable onPress={onPress} accessibilityRole="button"
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: s(8), paddingVertical: s(11), paddingHorizontal: s(16),
            borderTopLeftRadius: s(20), borderTopRightRadius: s(20), borderBottomRightRadius: s(6), borderBottomLeftRadius: s(20),
            transform: [{ scale: pressed ? PRESS_SCALE : 1 }] },
            r.primary ? { backgroundColor: C.blue, ...shadow(C.blue, 0.26, s(11), s(10)) }
              // `.reply .s`: a light glass bubble; no backdrop blur in the mockup, and no shadow (Android-safe translucency)
              : { backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: C.lineSolid }]}>
          <T size={12} w={700} c={r.primary ? '#fff' : C.navy}>{r.label}</T>
          {r.primary && <Arrow />}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const tick = { fill: 'none', stroke: C.blue, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const TRUST: [string, React.ReactNode][] = [
  ['1,200+ verified engineers', <><Path {...tick} d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z" /><Path {...tick} d="M8.8 12l2.2 2.2 4.2-4.4" /></>],
  ['Abu Dhabi', <><Path {...tick} d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><Circle {...tick} cx={12} cy={9.5} r={2.5} /></>],
];
// `.logoW b`: linear-gradient(90deg, #31D1FF, #0000FE 60%, #7A5CFF) as evenly spaced stops
const PULSE_GRAD = ['#31D1FF', '#218BFF', '#1046FE', '#0000FE', '#3D2EFF', '#7A5CFF'] as const;

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  const reduce = useReducedMotion();
  const settled = !!stay || reduce;
  const chosen = useSharedValue(-1);
  const glide = [useSharedValue(0), useSharedValue(0)]; // one per reply (REPLIES)
  const busy = useRef(false);
  const [focused, setFocused] = useState(true);
  const active = focused && !reduce;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  // back on this screen (e.g. from sign up): the replies are in place again, ready for another tap
  useFocusEffect(useCallback(() => {
    clear(); busy.current = false; chosen.value = -1;
    glide.forEach((g) => { cancelAnimation(g); g.value = 0; });
    setFocused(true);
    return () => setFocused(false); // covered (sign up on top): pause the ambient loops
  }, []));
  const signIn = () => {
    if (busy.current) return; // shares the reply guard: a double tap, or a tap during a glide, can't push twice
    busy.current = true;
    router.push('/onboarding/signup?mode=signin');
  };
  const choose = (i: number) => {
    if (busy.current) return; // one tap only
    busy.current = true;
    const r = REPLIES[i];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useDemo.getState().setRole(r.role);
    chosen.value = i;
    glide.forEach((g, j) => { g.value = j === i ? withTiming(1, { duration: GLIDE_MS, easing: EASE_IN_OUT }) : withTiming(1, { duration: DUR.base, easing: EASE_OUT }); });
    timers.current.push(setTimeout(() => router.push('/onboarding/signup'), GO_AT));
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#FBFCFF', overflow: 'hidden' }}>
      <StatusBar style="dark" />
      <Backdrop active={active} />
      <View style={{ flex: 1, paddingTop: Math.max(insets.top, s(30)), paddingHorizontal: s(18) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: s(8) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(7) }}>
            <LogoMark size={18} />
            <View style={{ flexDirection: 'row' }}>
              <T size={13.5} w={700} style={{ letterSpacing: LS(13.5) }}>{'Project '}</T>
              <GradientText size={13.5} w={700} style={{ letterSpacing: LS(13.5) }} colors={PULSE_GRAD}>Pulse</GradientText>
            </View>
          </View>
          <Pressable onPress={signIn} hitSlop={10} accessibilityRole="button">
            <T size={11} w={700} c={C.blue}>Sign in</T>
          </Pressable>
        </View>
        <Stage settled={settled} active={active} />
        {/* `.bub`: Pulse speaks first, tail at the bottom left */}
        <Animated.View entering={settled ? undefined : enterUp(1, CARD_AT)} style={{ backgroundColor: '#fff', paddingVertical: s(11), paddingHorizontal: s(13),
          borderTopLeftRadius: s(18), borderTopRightRadius: s(18), borderBottomRightRadius: s(18), borderBottomLeftRadius: s(6), ...shadow(C.navy, 0.07, s(12), s(8)) }}>
          <Greeting settled={settled} />
          <T size={11.5} c="#4A5078" lh={1.45} style={{ marginTop: s(4) }}>{ASK}</T>
        </Animated.View>
        <View style={{ marginTop: s(12), alignItems: 'flex-end', gap: s(8) }}>
          {REPLIES.map((r, i) => <Reply key={r.role} r={r} i={i} settled={settled} chosen={chosen} glide={glide[i]} onPress={() => choose(i)} />)}
        </View>
        <Animated.View entering={settled ? undefined : enterFade(TRUST_AT)}
          style={{ marginTop: 'auto', marginBottom: Math.max(s(16), insets.bottom), flexDirection: 'row', justifyContent: 'center', gap: s(12) }}>
          {TRUST.map(([label, icon]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
              <Svg width={s(10)} height={s(10)} viewBox="0 0 24 24">{icon}</Svg>
              <T size={9} w={600} c={C.mute}>{label}</T>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
