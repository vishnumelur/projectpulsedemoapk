import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { Glass } from './Glass';
import { T } from './T';

export function BackButton({ onPress, flat, label = '‹' }: { onPress?: () => void; flat?: boolean; label?: string }) {
  const inner = <T size={label === '‹' ? 14 : 12} w={500} align="center">{label}</T>;
  const box = { width: s(32), height: s(32), borderRadius: s(16), alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <Pressable onPress={onPress ?? (() => router.back())} hitSlop={10}>
      {flat ? <View style={[box, { backgroundColor: C.inputBg }]}>{inner}</View> : <Glass r={16} style={box}>{inner}</Glass>}
    </Pressable>
  );
}

export function Header({ back = true, flat, onBack, center, right, style, pt = 6 }:
  { back?: boolean; flat?: boolean; onBack?: () => void; center?: React.ReactNode; right?: React.ReactNode; style?: StyleProp<ViewStyle>; pt?: number }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: s(pt) }, style]}>
      {back ? <BackButton onPress={onBack} flat={flat} /> : <View style={{ width: s(32) }} />}
      {center ?? <View />}
      {right ?? <View style={{ width: s(32) }} />}
    </View>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return <T size={9} w={700} ls={0.16} c={C.mute}>{children}</T>;
}
