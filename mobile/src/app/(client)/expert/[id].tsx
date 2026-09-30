import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/ui/Header';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock, DOCK_SPACE } from '@/ui/Dock';
import { Icon } from '@/ui/Icon';
import { EXPERTS, aed } from '@/data/seed';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function ExpertProfile() {
  const { id = 'omar' } = useLocalSearchParams<{ id?: string }>();
  const e = EXPERTS.find((x) => x.id === id) ?? EXPERTS[0];
  const [svc, setSvc] = useState(e.services[0].id); const price = e.services.find((x) => x.id === svc)!.price;
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: s(DOCK_SPACE) }} showsVerticalScrollIndicator={false}>
        <View style={{ height: s(250) }}>
          <Image source={PHOTOS[e.photo]} contentFit="cover" contentPosition={{ top: '25%' }} style={{ flex: 1 }} />
          <LinearGradient colors={['rgba(247,248,252,0)', C.bg]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: s(110) }} />
          <View style={{ position: 'absolute', top: Math.max(insets.top, s(30)) + s(8), left: s(20), right: s(20), flexDirection: 'row', justifyContent: 'space-between' }}>
            <BackButton />
            <Pressable onPress={() => router.push(`/chat/${e.id}`)}><Glass r={16} style={{ width: s(32), height: s(32), alignItems: 'center', justifyContent: 'center' }}><View style={{ zIndex: 2 }}><Icon name="mail" size={13} stroke={2} /></View></Glass></Pressable>
          </View>
        </View>
        <View style={{ marginTop: -s(46), paddingHorizontal: s(20) }}>
          <T size={25} w={700} ls={-0.035} lh={1.05}>{e.name}</T>
          <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{e.role === 'Structural' ? 'Structural engineer' : e.role} · <T size={11} c={C.star}>★</T> {e.rating.toFixed(1)} · {e.jobs} jobs</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5), marginTop: s(8) }}>
            <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>
            <T size={10} w={600} c={C.blue}>Verified by Project Pulse</T>
          </View>
          <T size={9.5} w={700} ls={0.1} c={C.mute} style={{ marginTop: s(20) }}>CHOOSE A SERVICE</T>
          {e.services.slice(0, 2).map((x) => {
            const on = x.id === svc;
            return (
              <Pressable key={x.id} onPress={() => setSvc(x.id)} style={{ marginTop: s(10), flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(14), paddingHorizontal: s(16),
                borderRadius: s(18), backgroundColor: '#fff', borderWidth: on ? 1.5 : 0, borderColor: C.blue, shadowColor: on ? C.blue : '#16205A', shadowOpacity: on ? 0.12 : 0.05, shadowRadius: s(10), elevation: 2 }}>
                <View style={{ width: s(18), height: s(18), borderRadius: s(9), borderWidth: on ? s(5) : 2, borderColor: on ? C.blue : '#CFD4E6' }} />
                <View style={{ flex: 1 }}><T size={12.5} w={600}>{x.name}</T><T size={10} w={500} c={C.mute} style={{ marginTop: 2 }}>{x.note}</T></View>
                <T size={13} w={700}>{x.price.toLocaleString('en-US')}</T>
              </Pressable>
            );
          })}
          <T size={9.5} w={700} ls={0.1} c={C.mute} style={{ marginTop: s(120) }}>RECENT WORK</T>
          <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
            {(['port1', 'port2', 'port3'] as const).map((p) => <Image key={p} source={PHOTOS[p]} contentFit="cover" style={{ flex: 1, height: s(62), borderRadius: s(12) }} />)}
          </View>
          <T size={10} c={C.mute} style={{ marginTop: s(14) }}>{`Licence ${e.licence} · ${e.areas}`}</T>
        </View>
      </ScrollView>
      <Dock><Btn title={`Book · ${aed(price)}`} onPress={() => router.push(`/book?expert=${e.id}&service=${svc}`)} /></Dock>
    </View>
  );
}
