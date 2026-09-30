import { Alert, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Rise } from '@/motion/Rise';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { useDemo } from '@/store/demo';
import { CLIENT } from '@/data/seed';
import { GRAD } from '@/theme/tokens';
import { nextRoute } from '@/nav/next';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const Row = ({ label, value, last }: { label: string; value?: string; last?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(12), borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
    <T size={12} w={600}>{label}</T>
    <View style={{ marginLeft: 'auto' }}>{value ? <T size={11} c={C.mute} w={500}>{value}</T> : <T size={12} c={C.faint3}>›</T>}</View>
  </View>
);

export default function Profile() {
  // Switching cross-fades into Expert mode via the route replace; we only add the haptic.
  const toExpert = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const st = useDemo.getState(); st.setRole('expert'); router.replace(nextRoute({ ...st, role: 'expert' }) as any); };
  const reset = () => Alert.alert('Reset demo?', 'Restores the original demo data.', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive',
    onPress: () => { useDemo.getState().resetDemo(); router.replace('/'); } }]);
  return (
    <Screen bg="aurora3">
      <Animated.View style={{ flex: 1 }}>
      <Rise index={0} blur={false} style={{ alignItems: 'center', marginTop: s(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Avatar photo="sara" size={70} ring="white4" />
        <T size={20} w={700} ls={-0.035} style={{ marginTop: s(6) }}>{CLIENT.name}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(2) }}>{CLIENT.email}</T>
      </View>
      </Rise>
      <Rise index={1} r={18} style={{ marginTop: s(18) }}>
      <Glass r={18} style={{ paddingHorizontal: s(14) }}>
        <Row label="My projects" value="1" /><Row label="Payments" /><Row label="Notifications" /><Row label="Language" value="English" last />
      </Glass>
      </Rise>
      <Rise index={2} r={18} style={{ marginTop: s(14) }}>
      <Pressable onPress={toExpert}>
        <Glass r={18} style={{ padding: s(14), flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(32), height: s(32), borderRadius: s(10), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="swap" size={15} color="#fff" stroke={2.2} />
          </LinearGradient>
          <View style={{ flex: 1 }}><T size={12} w={700}>Switch to Expert app</T><T size={9.5} c={C.mute}>Demo: see the engineer side</T></View>
          <T size={14} w={700} c={C.blue}>›</T>
        </Glass>
      </Pressable>
      </Rise>
      <Pressable onLongPress={reset} style={{ marginTop: 'auto', marginBottom: s(84), alignSelf: 'center', width: s(56), height: s(20), opacity: 0 }} accessibilityLabel="Project Pulse demo v1.0 (long-press to reset)" />
      </Animated.View>
    </Screen>
  );
}
