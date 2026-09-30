import { Pressable, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sheet } from './Sheet';
import { Btn } from './Btn';
import { T } from './T';
import { Avatar } from './Avatar';
import { accountFor, PortalRole } from '@/data/accounts';
import { useDemo } from '@/store/demo';
import { resetTo } from '@/nav/back';
import { SIGN_IN } from '@/nav/next';
import { DUR, enterFade } from '@/theme/motion';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

/** Log out: signs out and starts a fresh history at Sign in. The demo data (Sara's project, Omar's quotes) stays.
 *  The portal's guard keeps the admitted portal rendered, so it never races this with a redirect of its own. */
export function logOut() {
  useDemo.getState().signOut();
  resetTo(SIGN_IN);
}

/** A thin tappable "Log out" row (glass-card rows elsewhere use the same 12px rhythm). */
export function LogoutRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(12) }}>
        <T size={12} w={600} c={C.blue}>Log out</T>
      </View>
    </Pressable>
  );
}

/** Calm confirm sheet ("Log out of Project Pulse?"). With `account`, it opens on a small account card first (engineer
 *  menu), whose Log out row turns the same sheet into the confirmation. */
export function LogoutSheet({ visible, onClose, account }: { visible: boolean; onClose: () => void; account?: PortalRole }) {
  const [step, setStep] = useState<'menu' | 'confirm'>(account ? 'menu' : 'confirm');
  const leaving = useRef(false); // sync guard: one log out per tap burst
  useEffect(() => { if (visible) { leaving.current = false; setStep(account ? 'menu' : 'confirm'); } }, [visible, account]);
  const confirm = () => {
    if (leaving.current) return; leaving.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(logOut, DUR.base); // let the sheet settle down first
  };
  const a = account ? accountFor(account) : null;
  return (
    <Sheet visible={visible} onClose={onClose}>
      {step === 'menu' && a ? (
        <Animated.View key="menu" entering={enterFade()}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
            <Avatar photo={a.photo} size={42} ring="white" />
            <View style={{ flex: 1 }}>
              <T size={14} w={700} ls={-0.02}>{a.name}</T>
              <T size={10.5} c={C.mute} style={{ marginTop: s(1) }}>{`${a.tag} · ${a.email}`}</T>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: C.line, marginTop: s(14) }} />
          <LogoutRow onPress={() => { Haptics.selectionAsync(); setStep('confirm'); }} />
        </Animated.View>
      ) : (
        <Animated.View key="confirm" entering={account ? enterFade() : undefined}>
          <T size={17} w={700} ls={-0.03}>Log out of Project Pulse?</T>
          <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Your demo data stays on this device. Sign in again any time.</T>
          <Btn title="Log out" style={{ marginTop: s(16) }} onPress={confirm} />
          <Pressable onPress={onClose} hitSlop={6} style={({ pressed }) => ({ alignSelf: 'center', paddingVertical: s(11), paddingHorizontal: s(20), marginTop: s(2), opacity: pressed ? 0.6 : 1 })}>
            <T size={12} w={600} c={C.mute}>Cancel</T>
          </Pressable>
        </Animated.View>
      )}
    </Sheet>
  );
}
