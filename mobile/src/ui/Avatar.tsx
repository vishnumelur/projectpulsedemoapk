import { View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PHOTOS, PhotoKey } from '@/theme/photos';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { GRAD } from '@/theme/tokens';

export function Avatar({ photo, size, ring, style }: { photo: PhotoKey; size: number; ring?: 'white' | 'gradient' | 'white4'; style?: StyleProp<ViewStyle> }) {
  const img = <Image source={PHOTOS[photo]} contentFit="cover" style={{ width: s(size), height: s(size), borderRadius: s(size) / 2 }} />;
  if (ring === 'gradient')
    return (
      <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[{ padding: s(3), borderRadius: s(size), ...shadow('#0000FE', 0.2, s(14), s(12)) }, style]}>
        <View style={{ borderWidth: s(3), borderColor: '#fff', borderRadius: s(size) }}>{img}</View>
      </LinearGradient>
    );
  const bw = ring === 'white' ? 2 : ring === 'white4' ? 4 : 0;
  return (
    <View style={[{ borderRadius: s(size), borderWidth: s(bw), borderColor: '#fff', ...shadow('#16205A', ring ? 0.15 : 0, s(8), s(6)) }, style]}>{img}</View>
  );
}
