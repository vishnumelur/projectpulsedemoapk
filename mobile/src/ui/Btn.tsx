import { ActivityIndicator, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, GRAD, GRAD_LOC } from '@/theme/tokens';
import { T } from './T';
import { Icon } from './Icon';
import { PressScale } from '@/motion/PressScale';
import { ScaleIn } from '@/motion/ScaleIn';
import { SUCCESS_FROM } from '@/theme/motion';

type Props = { title?: string; onPress?: () => void; variant?: 'primary' | 'gradient' | 'black'; disabled?: boolean; busy?: boolean;
  done?: boolean; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; children?: React.ReactNode };

export function Btn({ title, onPress, variant = 'primary', disabled, busy, done, style, textStyle, children }: Props) {
  const inactive = disabled || busy || done;
  const body = children ?? (busy ? <ActivityIndicator color="#fff" /> : done ? <ScaleIn from={SUCCESS_FROM}><Icon name="check" color="#fff" size={16} stroke={2.6} /></ScaleIn>
    : <T size={12.5} w={700} c={variant === 'black' ? '#fff' : '#fff'} align="center" style={textStyle}>{title}</T>);
  const base: ViewStyle = { borderRadius: s(16), paddingVertical: s(13), alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    opacity: disabled ? 0.45 : 1 };
  const glow: ViewStyle = variant === 'black' ? {} : { ...shadow(C.blue, 0.28, s(12), s(10)) };
  return (
    <PressScale testID="btn" disabled={inactive} onPress={() => { Haptics.selectionAsync(); onPress?.(); }}
      style={[base, glow, { backgroundColor: variant === 'black' ? '#000' : C.blue }, style]}>
      {variant === 'gradient' && <LinearGradient colors={GRAD} locations={GRAD_LOC} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <View>{body}</View>
    </PressScale>
  );
}
