import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { s } from '@/theme/scale';

export function Glass({ r = 18, style, children, ...rest }: ViewProps & { r?: number }) {
  return (
    <View {...rest} style={[{ borderRadius: s(r), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)',
      backgroundColor: 'rgba(255,255,255,0.66)', shadowColor: '#16205A', shadowOpacity: 0.07, shadowRadius: s(12),
      shadowOffset: { width: 0, height: s(6) }, elevation: 2 }, style]}>
      {Platform.OS !== 'android' && <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}
