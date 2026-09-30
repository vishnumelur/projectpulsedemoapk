import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(22,32,90,0.25)' }} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: s(26), borderTopRightRadius: s(26), paddingTop: s(10),
        paddingHorizontal: s(16), paddingBottom: s(18) + insets.bottom, ...shadow('#16205A', 0.18, s(20)) }}>
        <View style={{ width: s(36), height: s(4), borderRadius: s(4), backgroundColor: '#D3D7E6', alignSelf: 'center', marginBottom: s(12) }} />
        {children}
      </View>
    </Modal>
  );
}
