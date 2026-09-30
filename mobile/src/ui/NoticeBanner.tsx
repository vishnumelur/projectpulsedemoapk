import Animated from 'react-native-reanimated';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemo } from '@/store/demo';
import { Glass } from './Glass';
import { T } from './T';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { bannerIn, bannerOut } from '@/theme/motion';

export function NoticeBanner() {
  const banner = useDemo((st) => st.banner); const dismiss = useDemo((st) => st.dismissBanner);
  const insets = useSafeAreaInsets();
  useEffect(() => { if (!banner) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); const t = setTimeout(dismiss, 3500); return () => clearTimeout(t); }, [banner?.id]);
  if (!banner) return null;
  return (
    <Animated.View key={banner.id} entering={bannerIn} exiting={bannerOut} style={{ position: 'absolute', top: insets.top + s(6), left: s(12), right: s(12), zIndex: 100 }}>
      <Pressable onPress={() => { dismiss(); router.push(banner.href as any); }}>
        <Glass r={18} style={{ padding: s(12), flexDirection: 'row', gap: s(10), alignItems: 'center' }}>
          <View style={{ width: s(8), height: s(8), borderRadius: s(4), backgroundColor: C.blue }} />
          <View style={{ flex: 1 }}><T size={12} w={700}>{banner.title}</T><T size={10.5} c={C.mute}>{banner.text}</T></View>
        </Glass>
      </Pressable>
    </Animated.View>
  );
}
