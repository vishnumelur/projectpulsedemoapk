import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Aurora } from '@/fx/Aurora';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export type Bg = 'aurora' | 'aurora3' | 'white' | 'white3' | 'review' | 'verified' | 'plain' | 'pulse';
export function Screen({ bg = 'aurora', px = 20, children, overlay }: { bg?: Bg; px?: number; children: React.ReactNode; overlay?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const base = bg === 'white' || bg === 'white3' || bg === 'review' ? '#FFFFFF' : bg === 'pulse' ? '#FBFCFF' : C.bg;
  return (
    <View style={{ flex: 1, backgroundColor: base }}>
      <StatusBar style="dark" />
      {bg === 'review' && <LinearGradient colors={['#E9F7FF', '#EEF0FF', '#FFFFFF']} locations={[0, 0.28, 0.55]} style={StyleSheet.absoluteFill} />}
      {bg === 'verified' && <LinearGradient colors={['#E9F7FF', '#EEF0FF', C.bg]} locations={[0, 0.3, 0.6]} style={StyleSheet.absoluteFill} />}
      {(bg === 'aurora' || bg === 'aurora3' || bg === 'white3' || bg === 'pulse') && <Aurora three={bg !== 'aurora'} />}
      <View style={{ flex: 1, paddingTop: Math.max(insets.top, s(30)), paddingHorizontal: s(px) }}>{children}</View>
      {overlay}
    </View>
  );
}
