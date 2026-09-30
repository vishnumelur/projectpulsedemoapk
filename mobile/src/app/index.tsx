import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Screen } from '@/ui/Screen';
import { LogoMark } from '@/ui/LogoMark';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';
import { useDemo } from '@/store/demo';
import { nextRoute } from '@/nav/next';

export default function Splash() {
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  useEffect(() => { if (stay) return; const t = setTimeout(() => router.replace(nextRoute(useDemo.getState()) as any), 1600); return () => clearTimeout(t); }, [stay]);
  return (
    <Screen bg="white3">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -s(30) }}>
        <LogoMark size={84} animated />
        <T size={26} w={800} ls={-0.03} lh={1} align="center" style={{ marginTop: s(18) }}>{'Project\nPulse'}</T>
      </View>
    </Screen>
  );
}
