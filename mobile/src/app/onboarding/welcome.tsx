import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { LogoMark } from '@/ui/LogoMark';
import { Orb, Halo } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { useDemo } from '@/store/demo';

const chip = (label: string, pos: object, ver = false) => (
  <Glass r={14} style={[{ position: 'absolute', paddingVertical: s(7), paddingHorizontal: s(10), flexDirection: 'row', alignItems: 'center', gap: s(4) }, pos]}>
    {ver && <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>}
    <T size={9.5} w={600}>{label}</T>
  </Glass>
);

export default function Welcome() {
  const go = (role: 'client' | 'expert') => { useDemo.getState().setRole(role); router.push('/onboarding/signup'); };
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(6) }}>
        <LogoMark size={22} />
        <Pressable onPress={() => router.push('/onboarding/signup?mode=signin')}><T size={11} w={600} c={C.mute}>Sign in</T></Pressable>
      </View>
      <View style={{ alignItems: 'center', marginTop: s(30), height: s(118) }}>
        <View><Halo size={118} /><Orb size={118} variant="sphere" /></View>
        {chip('Villa · Design stage', { left: 0, top: s(6) })}
        {chip('Geotech Engineer', { right: -s(4), top: s(66) }, true)}
        {chip('Quote in 24h', { left: s(12), bottom: -s(24) })}
      </View>
      <View style={{ marginTop: 'auto', paddingBottom: s(20) }}>
        <T size={24} w={700} ls={-0.03} lh={1.12}>Ask. Get matched.</T>
        <GradientText size={24} w={700} ls={-0.03} lh={1.12} colors={[C.blue, C.cyan]}>Build with confidence.</GradientText>
        <T size={11} c={C.mute} lh={1.5} style={{ marginTop: s(7) }}>Verified answers and vetted experts for your construction project.</T>
        <Pressable onPress={() => go('client')} style={{ marginTop: s(16), backgroundColor: C.blue, borderRadius: s(20), paddingVertical: s(8), paddingLeft: s(18), paddingRight: s(8),
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: C.blue, shadowOpacity: 0.28, shadowRadius: s(12), shadowOffset: { width: 0, height: s(10) }, elevation: 6 }}>
          <View><T size={13} w={700} c="#fff">I need an expert</T><T size={9.5} w={500} c="rgba(255,255,255,0.75)" style={{ marginTop: 1 }}>Advice, quotes & site visits</T></View>
          <View style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}><T size={13} c="#fff">→</T></View>
        </Pressable>
        <Pressable onPress={() => go('expert')}>
          <Glass r={20} style={{ marginTop: s(8), paddingVertical: s(8), paddingLeft: s(18), paddingRight: s(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View><T size={13} w={700}>I'm an expert</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>Engineers, architects, designers</T></View>
            <View style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><T size={13} c={C.blue}>→</T></View>
          </Glass>
        </Pressable>
      </View>
    </Screen>
  );
}
