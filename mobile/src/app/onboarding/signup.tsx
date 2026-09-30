// Sign in (client Task 2, replaces 03 "Create your account"): the sealed demo's only door. The credentials decide the portal.
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, DemoAccount, PortalRole, accountFor } from '@/data/accounts';
import { useDemo } from '@/store/demo';
import { resetTo } from '@/nav/back';
import { nextRoute } from '@/nav/next';
import { DUR, EASE_IN_OUT, EASE_OUT, enterUp } from '@/theme/motion';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

const ERR = '#C8414B';
const FIELD = { height: s(46), borderRadius: s(14), borderWidth: 1.5, backgroundColor: '#fff', overflow: 'hidden' } as const;
const INPUT = { flex: 1, paddingHorizontal: s(14), fontFamily: F[400], fontSize: s(11.5), color: C.navy, height: '100%' } as const;

/** One input box: blue border + soft ring when focused, a calm red border on error, and a brief tint wash when a demo account fills it. */
function Field({ focused, error, fill, children }: { focused: boolean; error: boolean; fill: number; children: React.ReactNode }) {
  const wash = useSharedValue(0);
  useEffect(() => { if (fill) { wash.value = 1; wash.value = withTiming(0, { duration: DUR.reveal, easing: EASE_OUT }); } }, [fill]);
  const ws = useAnimatedStyle(() => ({ opacity: wash.value }));
  const ring = focused ? { boxShadow: `0 0 0 ${s(4)}px rgba(0,0,254,0.08)` } : null;
  return (
    <View style={[FIELD, { borderColor: error ? 'rgba(200,65,75,0.55)' : focused ? C.blue : C.lineSolid, flexDirection: 'row', alignItems: 'center' }, ring as any]}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,254,0.06)' }, ws]} />
      {children}
    </View>
  );
}

function AccountRow({ a, on, last, onPress }: { a: DemoAccount; on: boolean; last?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Use the ${a.tag.toLowerCase()} demo account`} accessibilityState={{ selected: on }}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(10), paddingHorizontal: s(12),
        backgroundColor: on ? 'rgba(0,0,254,0.045)' : pressed ? 'rgba(22,32,90,0.03)' : 'transparent', borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line })}>
      <Avatar photo={a.photo} size={32} ring="white" />
      <View style={{ flex: 1 }}>
        {/* role tag as a small eyebrow, so the full name and email always fit on a narrow phone */}
        <T size={8} w={700} ls={0.12} c={on ? C.blue : C.faint}>{a.tag.toUpperCase()}</T>
        <T size={11.5} w={600} numberOfLines={1} style={{ marginTop: s(1) }}>{a.name}</T>
        <T size={9.5} c={C.mute} numberOfLines={1} style={{ marginTop: s(1) }}>{a.email}</T>
      </View>
      {/* selected: a filled Pulse Blue check; otherwise a quiet ring */}
      <View style={{ width: s(18), height: s(18), borderRadius: s(9), alignItems: 'center', justifyContent: 'center',
        backgroundColor: on ? C.blue : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: C.faint3 }}>
        {on && <Icon name="check" size={10} color="#fff" stroke={3} />}
      </View>
    </Pressable>
  );
}

export default function SignIn() {
  // The Welcome reply sets the role (store, or ?role=): that account is pre-selected and filled in.
  const { role: qRole } = useLocalSearchParams<{ role?: string }>();
  const [initial] = useState<PortalRole | null>(() => (qRole === 'client' || qRole === 'expert' ? qRole : useDemo.getState().role));
  const [email, setEmail] = useState(initial ? accountFor(initial).email : '');
  const [pw, setPw] = useState(initial ? DEMO_PASSWORD : '');
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState<'email' | 'pw' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [fill, setFill] = useState(0);
  const busy = useRef(false); // sync guard: a double tap signs in once
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const reduce = useReducedMotion();
  // Already signed in (e.g. the browser's back button on web): Sign in is behind you, go to your portal. Checked once at
  // mount, so a sign in made here is left to its own history reset. The dev gallery may still show this screen.
  const [signedIn] = useState(() => { const st = useDemo.getState(); return !!st.session && !(__DEV__ && st.devGallery); });

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const shake = () => {
    if (reduce) return;
    const t = (to: number, d = 70) => withTiming(to, { duration: d, easing: EASE_IN_OUT });
    shakeX.value = withSequence(t(-s(7)), t(s(6)), t(-s(4)), t(s(2)), t(0, 90)); // a short decaying sway, no spring
  };

  const selected = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase())?.role ?? null;
  const use = (a: DemoAccount) => {
    if (busy.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmail(a.email); setPw(DEMO_PASSWORD); setError(null); setFill((n) => n + 1);
  };
  const edit = (set: (v: string) => void) => (v: string) => { set(v); if (error) setError(null); };

  const submit = () => {
    if (busy.current) return; busy.current = true;
    Keyboard.dismiss(); setError(null); setState('busy');
    timers.current.push(setTimeout(() => {
      const r = useDemo.getState().signIn(email, pw);
      if (!r.ok) {
        busy.current = false; setState('idle'); setError(r.error); shake();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      setState('done');
      // A fresh history: back never returns to Sign in or the start screens.
      timers.current.push(setTimeout(() => resetTo(nextRoute(useDemo.getState())), DUR.base));
    }, 650));
  };

  if (signedIn) return <Redirect href={nextRoute(useDemo.getState()) as any} />;
  return (
    <Screen bg="aurora" px={16}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
        <Header />
        <ScrollView style={{ marginHorizontal: -s(16) }} contentContainerStyle={{ paddingHorizontal: s(16), paddingBottom: s(28) }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View entering={enterUp(0)}>
            <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>Welcome back</T>
            <T size={11.5} c={C.mute} style={{ marginTop: s(6) }}>Sign in to Project Pulse</T>
          </Animated.View>

          <Animated.View entering={enterUp(1)} style={{ marginTop: s(20) }}>
            <Animated.View style={[{ gap: s(10) }, shakeStyle]}>
              <Field focused={focus === 'email'} error={!!error} fill={fill}>
                <TextInput value={email} onChangeText={edit(setEmail)} placeholder="Email" placeholderTextColor={C.faint2} autoCapitalize="none"
                  autoCorrect={false} keyboardType="email-address" textContentType="username" autoComplete="email" returnKeyType="next"
                  onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} allowFontScaling={false} accessibilityLabel="Email"
                  style={[INPUT, { outlineStyle: 'none' } as any]} />
              </Field>
              <Field focused={focus === 'pw'} error={!!error} fill={fill}>
                <TextInput value={pw} onChangeText={edit(setPw)} placeholder="Password" placeholderTextColor={C.faint2} secureTextEntry={!show}
                  autoCapitalize="none" autoCorrect={false} textContentType="password" returnKeyType="go" onSubmitEditing={submit}
                  onFocus={() => setFocus('pw')} onBlur={() => setFocus(null)} allowFontScaling={false} accessibilityLabel="Password"
                  style={[INPUT, { outlineStyle: 'none' } as any]} />
                <Pressable onPress={() => { Haptics.selectionAsync(); setShow((v) => !v); }} hitSlop={8} accessibilityRole="button"
                  accessibilityLabel={show ? 'Hide password' : 'Show password'} style={{ paddingHorizontal: s(13), height: '100%', justifyContent: 'center' }}>
                  <Icon name={show ? 'eyeOff' : 'eye'} size={16} color={C.faint} stroke={1.8} />
                </Pressable>
              </Field>
            </Animated.View>
            {error && <Animated.View entering={enterUp(0, 0)} style={{ marginTop: s(9) }}><T size={10} w={500} c={ERR} accessibilityRole="alert">{error}</T></Animated.View>}
            <Pressable hitSlop={8} accessibilityRole="link" style={{ alignSelf: 'flex-end', marginTop: s(9) }}><T size={10} w={600} c={C.mute}>Forgot password?</T></Pressable>
            <Btn title="Sign in" style={{ marginTop: s(14) }} onPress={submit} busy={state === 'busy'} done={state === 'done'} />
          </Animated.View>

          <Animated.View entering={enterUp(2)} style={{ marginTop: s(24) }}>
            <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginBottom: s(8) }}>DEMO ACCOUNTS</T>
            <Glass r={18}>
              {DEMO_ACCOUNTS.map((a, i) => <AccountRow key={a.role} a={a} on={selected === a.role} last={i === DEMO_ACCOUNTS.length - 1} onPress={() => use(a)} />)}
            </Glass>
            <T size={9.5} c={C.mute} style={{ marginTop: s(8), marginLeft: s(2) }}>Password: <T size={9.5} w={700} c={C.navy}>{DEMO_PASSWORD}</T></T>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
