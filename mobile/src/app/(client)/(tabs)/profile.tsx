import { Alert, Pressable, View } from 'react-native';
import { useState } from 'react';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Rise } from '@/motion/Rise';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { LogoutRow, LogoutSheet } from '@/ui/LogoutSheet';
import { useDemo } from '@/store/demo';
import { CLIENT } from '@/data/seed';
import { resetTo } from '@/nav/back';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const Row = ({ label, value, last }: { label: string; value?: string; last?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(12), borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
    <T size={12} w={600}>{label}</T>
    <View style={{ marginLeft: 'auto' }}>{value ? <T size={11} c={C.mute} w={500}>{value}</T> : <T size={12} c={C.faint3}>›</T>}</View>
  </View>
);

export default function Profile() {
  // The client app is sealed: no path to the engineer portal. Log out (confirm sheet) returns to Sign in.
  const [out, setOut] = useState(false);
  const reset = () => Alert.alert('Reset demo?', 'Restores the original demo data.', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive',
    onPress: () => { useDemo.getState().resetDemo(); resetTo('/'); } }]);
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
      <Glass r={18} style={{ paddingHorizontal: s(14) }}><LogoutRow onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOut(true); }} /></Glass>
      </Rise>
      <Pressable onLongPress={reset} style={{ marginTop: 'auto', marginBottom: s(84), alignSelf: 'center', width: s(56), height: s(20), opacity: 0 }} accessibilityLabel="Project Pulse demo v1.0 (long-press to reset)" />
      </Animated.View>
      <LogoutSheet visible={out} onClose={() => setOut(false)} />
    </Screen>
  );
}
