import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';
import { useDemo } from '@/store/demo';

export default function SignUp() {
  const role = useDemo((st) => st.role) ?? 'client';
  const acct = role === 'expert' ? { name: 'Omar Haddad', email: 'omar.haddad@mail.ae', initial: 'O' } : { name: 'Sara Al Mansoori', email: 'sara@almansoori.ae', initial: 'S' };
  const [email, setEmail] = useState(acct.email); const [pw, setPw] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const input = { fontFamily: F[400], fontSize: s(11.5), color: C.navy, padding: s(14), borderRadius: s(14), borderWidth: 1.5, backgroundColor: '#fff' } as const;
  const submit = () => { setState('busy'); setTimeout(() => setState('done'), 600); setTimeout(() => router.push(role === 'expert' ? '/expert-role' : '/onboarding/building'), 900); };
  return (
    <Screen bg="aurora" px={16}>
      <Header />
      <T size={22} w={700} ls={-0.03} lh={1.12} style={{ marginTop: s(18) }}>{'Create your\naccount'}</T>
      <T size={11} c={C.mute} style={{ marginTop: s(6) }}>Takes 10 seconds.</T>
      <View style={{ marginTop: s(20), gap: s(10) }}>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" allowFontScaling={false}
          style={[input, { borderColor: C.blue, boxShadow: '0 0 0 4px rgba(0,0,254,0.08)' } as any]} />
        <Pressable onPress={() => { setEmail(acct.email); setPw('••••••••'); }}>
          <Glass r={14} style={{ marginTop: -s(4), paddingVertical: s(9), paddingHorizontal: s(12), flexDirection: 'row', alignItems: 'center', gap: s(9) }}>
            <View style={{ width: s(24), height: s(24), borderRadius: s(12), backgroundColor: '#AEBCFF', alignItems: 'center', justifyContent: 'center' }}><T size={10} w={700} c="#fff">{acct.initial}</T></View>
            <View style={{ flex: 1 }}><T size={11} w={600}>{acct.name}</T><T size={9.5} c={C.mute}>{acct.email}</T></View>
            <T size={9.5} w={700} c={C.blue}>Use</T>
          </Glass>
        </Pressable>
        <View style={[input, { borderColor: C.lineSolid, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 0, paddingRight: s(14) }]}>
          <TextInput value={pw} onChangeText={setPw} placeholder="Password" placeholderTextColor="#9AA0BD" secureTextEntry allowFontScaling={false}
            style={{ flex: 1, padding: s(14), fontFamily: F[400], fontSize: s(11.5), color: C.navy }} />
          <T size={11} c="#9AA0BD">◌</T>
        </View>
      </View>
      <View style={{ marginTop: 'auto', marginBottom: s(10) }}><Btn title="Create account" onPress={submit} busy={state === 'busy'} done={state === 'done'} /></View>
      <T size={9.5} c={C.mute} align="center" style={{ marginBottom: s(20) }}>Already a member? <T size={9.5} w={700} c={C.blue}>Sign in</T></T>
    </Screen>
  );
}
