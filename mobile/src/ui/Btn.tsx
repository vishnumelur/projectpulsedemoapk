import { ActivityIndicator, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { s } from '@/theme/scale';
import { C, GRAD, GRAD_LOC } from '@/theme/tokens';
import { T } from './T';
import { Icon } from './Icon';

type Props = { title?: string; onPress?: () => void; variant?: 'primary' | 'gradient' | 'black'; disabled?: boolean; busy?: boolean;
  done?: boolean; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; children?: React.ReactNode };

export function Btn({ title, onPress, variant = 'primary', disabled, busy, done, style, textStyle, children }: Props) {
  const inactive = disabled || busy || done;
  const body = children ?? (busy ? <ActivityIndicator color="#fff" /> : done ? <Icon name="check" color="#fff" size={16} stroke={2.6} />
    : <T size={12.5} w={700} c={variant === 'black' ? '#fff' : '#fff'} align="center" style={textStyle}>{title}</T>);
  const base: ViewStyle = { borderRadius: s(16), paddingVertical: s(13), alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    opacity: disabled ? 0.45 : 1 };
  const glow: ViewStyle = variant === 'black' ? {} : { shadowColor: C.blue, shadowOpacity: 0.28, shadowRadius: s(12), shadowOffset: { width: 0, height: s(10) }, elevation: 6 };
  return (
    <Pressable testID="btn" disabled={inactive} onPress={() => { Haptics.selectionAsync(); onPress?.(); }}
      style={({ pressed }) => [base, glow, { backgroundColor: variant === 'black' ? '#000' : C.blue, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      {variant === 'gradient' && <LinearGradient colors={GRAD} locations={GRAD_LOC} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <View>{body}</View>
    </Pressable>
  );
}
