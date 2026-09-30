import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';

export function Glass({ r = 18, style, children, ...rest }: ViewProps & { r?: number }) {
  // Android has no BlurView, so it gets a near-opaque frosted fill; its shadow is a boxShadow (see theme/shadow).
  const android = Platform.OS === 'android';
  return (
    <View {...rest} style={[{ borderRadius: s(r), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)',
      backgroundColor: android ? 'rgba(250,251,255,0.94)' : 'rgba(255,255,255,0.66)',
      ...shadow('#16205A', 0.07, s(12), s(6)) }, style]}>
      {Platform.OS !== 'android' && <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}
