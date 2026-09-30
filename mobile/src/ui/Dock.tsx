import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';

export const DOCK_SPACE = 96; // mockup px reserved at the bottom of scrollable content
export function Dock({ children, bg = 'bg', px = 20 }: { children: React.ReactNode; bg?: 'bg' | 'white' | 'none'; px?: number }) {
  const insets = useSafeAreaInsets();
  const c = bg === 'white' ? '255,255,255' : '247,248,252';
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: s(14), paddingHorizontal: s(px), paddingBottom: s(20) + insets.bottom, zIndex: 15 }}>
      {bg !== 'none' && <LinearGradient colors={[`rgba(${c},0)`, `rgba(${c},1)`, `rgba(${c},1)`]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}
