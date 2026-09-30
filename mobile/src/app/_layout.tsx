import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, HankenGrotesk_300Light, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold } from '@expo-google-fonts/hanken-grotesk';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useDemo } from '@/store/demo';
import { resumeSimulations } from '@/sim/scheduler';
import { NoticeBanner } from '@/ui/NoticeBanner';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fonts] = useFonts({ HankenGrotesk_300Light, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold });
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== 'web');
  const [hydrated, setHydrated] = useState(useDemo.persist.hasHydrated());
  useEffect(() => { if (Platform.OS === 'web') require('@shopify/react-native-skia/lib/module/web').LoadSkiaWeb({ locateFile: () => '/canvaskit.wasm' }).then(() => setSkiaReady(true)); }, []);
  useEffect(() => useDemo.persist.onFinishHydration(() => setHydrated(true)), []);
  useEffect(() => { if (hydrated) resumeSimulations(); }, [hydrated]);
  const ready = fonts && skiaReady && hydrated;
  useEffect(() => { if (ready) SplashScreen.hideAsync(); }, [ready]);
  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#F7F8FC' } }} />
        <NoticeBanner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
