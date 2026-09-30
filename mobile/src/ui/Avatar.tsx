import { View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PHOTOS, PhotoKey } from '@/theme/photos';
import { s } from '@/theme/scale';
import { GRAD } from '@/theme/tokens';

export function Avatar({ photo, size, ring, style }: { photo: PhotoKey; size: number; ring?: 'white' | 'gradient' | 'white4'; style?: StyleProp<ViewStyle> }) {
  const img = <Image source={PHOTOS[photo]} contentFit="cover" style={{ width: s(size), height: s(size), borderRadius: s(size) / 2 }} />;
  if (ring === 'gradient')
    return (
      <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[{ padding: s(3), borderRadius: s(size), shadowColor: '#0000FE', shadowOpacity: 0.2, shadowRadius: s(14), shadowOffset: { width: 0, height: s(12) }, elevation: 6 }, style]}>
        <View style={{ borderWidth: s(3), borderColor: '#fff', borderRadius: s(size) }}>{img}</View>
      </LinearGradient>
    );
  const bw = ring === 'white' ? 2 : ring === 'white4' ? 4 : 0;
  return (
    <View style={[{ borderRadius: s(size), borderWidth: s(bw), borderColor: '#fff', shadowColor: '#16205A', shadowOpacity: ring ? 0.15 : 0,
      shadowRadius: s(8), shadowOffset: { width: 0, height: s(6) }, elevation: ring ? 4 : 0 }, style]}>{img}</View>
  );
}
