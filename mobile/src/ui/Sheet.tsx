import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { DUR, ease, easeInOut } from '@/theme/motion';

/** Bottom sheet. Physical but calm: the panel glides up on EASE_OUT (DUR.slow) and stops, no overshoot; the backdrop fades.
 *  Closing reverses on the in-out curve, and the Modal unmounts only once the panel has left. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [h, setH] = useState(0);
  const p = useSharedValue(0);
  useEffect(() => {
    if (visible) { setMounted(true); p.value = withTiming(1, ease(DUR.slow)); }
    else p.value = withTiming(0, easeInOut(DUR.base), (fin) => { 'worklet'; if (fin) runOnJS(setMounted)(false); });
  }, [visible]);
  useEffect(() => () => cancelAnimation(p), []);
  // Until the panel is measured it sits off-screen (1000), so it never flashes in place before it glides.
  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - p.value) * (h || 1000) }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: p.value }));
  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(22,32,90,0.25)' }, scrim]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <View style={{ flex: 1 }} pointerEvents="box-none" />
      <Animated.View onLayout={(e) => setH(e.nativeEvent.layout.height)} style={[{ backgroundColor: '#fff', borderTopLeftRadius: s(26), borderTopRightRadius: s(26), paddingTop: s(10),
        paddingHorizontal: s(16), paddingBottom: s(18) + insets.bottom, ...shadow('#16205A', 0.18, s(20)) }, panel]}>
        <View style={{ width: s(36), height: s(4), borderRadius: s(4), backgroundColor: '#D3D7E6', alignSelf: 'center', marginBottom: s(12) }} />
        {children}
      </Animated.View>
    </Modal>
  );
}
