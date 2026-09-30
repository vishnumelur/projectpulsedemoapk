import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, HankenGrotesk_300Light, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold } from '@expo-google-fonts/hanken-grotesk';
import { useEffect, useState } from 'react';
import { useDemo } from '@/store/demo';
import { resumeSimulations } from '@/sim/scheduler';
import { NoticeBanner } from '@/ui/NoticeBanner';
import { LogBox } from 'react-native';

// Library deprecation / capability notices (Skia path API, expo-gl) — not app errors; keep them out of the demo UI.
LogBox.ignoreLogs(['[react-native-skia]', 'Multiple instances of Three.js', 'THREE.WebGLRenderer', 'EXGL: gl.pixelStorei']);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fonts] = useFonts({ HankenGrotesk_300Light, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold,
    // DejaVu subset for the few symbols Hanken lacks (✓ ◌ ★ ◆ ✦ ✕); used by T on native, see ui/T.tsx
    'PPSym': require('../../assets/fonts/PPSym.ttf') });
  const [hydrated, setHydrated] = useState(useDemo.persist.hasHydrated());
  // Web: CanvasKit is loaded in index.web.js before the router entry. Never require Skia's web loader here —
  // Metro resolves it on native in dev and canvaskit.js imports Node's 'fs'.
  useEffect(() => useDemo.persist.onFinishHydration(() => setHydrated(true)), []);
  useEffect(() => { if (hydrated) resumeSimulations(); }, [hydrated]);
  const ready = fonts && hydrated;
  useEffect(() => { if (ready) SplashScreen.hideAsync(); }, [ready]);
  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#F7F8FC' } }}>
          {/* the role card expands to full screen, then sign up cross-fades in over it (kept explicit for that hand-over) */}
          <Stack.Screen name="onboarding/signup" options={{ animation: 'fade' }} />
        </Stack>
        <NoticeBanner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
