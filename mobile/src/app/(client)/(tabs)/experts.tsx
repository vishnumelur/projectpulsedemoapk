import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { EXPERTS, aed } from '@/data/seed';
import { STAGES } from '@/data/types';
import { PHOTOS } from '@/theme/photos';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const FILTERS = ['For you', 'Engineers', 'Architects', 'Interiors'] as const;
export default function Experts() {
  const stage = useDemo((st) => st.stage); const [f, setF] = useState<(typeof FILTERS)[number]>('For you');
  const list = [...EXPERTS].filter((e) => f === 'For you' || e.category === f).sort((a, b) => b.match - a.match);
  return (
    <Screen bg="aurora">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
        <T size={24} w={700} ls={-0.035}>Experts</T>
        <Glass r={17} style={{ width: s(34), height: s(34), alignItems: 'center', justifyContent: 'center' }}><View style={{ zIndex: 2 }}><Icon name="search" size={14} stroke={2.2} /></View></Glass>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(6) }}>
        <Orb size={14} /><GradientText shimmer base={C.faint2} size={9.5}>{`Matched by Pulse to your ${STAGES[stage - 1]} stage`}</GradientText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: s(12), flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ gap: s(6) }}>
        {FILTERS.map((x) => <Chip key={x} label={x} on={x === f} onPress={() => setF(x)} />)}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(12), marginTop: s(12), paddingBottom: s(110) }}>
        {list.map((e, i) => {
          const top = i === 0 && f === 'For you';
          const photo = (
            <View style={{ height: s(124), borderRadius: s(18), overflow: 'hidden' }}>
              <Image source={PHOTOS[e.photo]} contentFit="cover" contentPosition={{ top: '20%' }} style={{ flex: 1 }} />
              <View style={{ position: 'absolute', left: s(8), top: s(8), backgroundColor: '#fff', paddingVertical: s(3), paddingHorizontal: s(8), borderRadius: s(10) }}>
                {top ? <GradientText shimmer size={9} w={700}>{`${e.match}% match`}</GradientText> : <T size={9} w={700}>{`${e.match}% match`}</T>}
              </View>
            </View>
          );
          return (
            <Pressable key={e.id} onPress={() => router.push(`/expert/${e.id}`)} style={{ width: '48%' }}>
              {top ? <IridescentBorder r={18}>{photo}</IridescentBorder> : photo}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(3), marginTop: s(7) }}>
                <T size={12} w={700} ls={-0.01} numberOfLines={1}>{e.name}</T>
                {i < 2 && <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>}
              </View>
              <T size={9.5} c={C.mute} numberOfLines={1}>{`${e.role} · ★ ${e.rating.toFixed(1)}`}</T>
              <T size={11} w={700} style={{ marginTop: s(3) }}>{aed(e.services[0].price)}</T>
            </Pressable>
          );
        })}
      </ScrollView>
      <LinearGradient pointerEvents="none" colors={['rgba(247,248,252,0)', 'rgba(247,248,252,1)', 'rgba(247,248,252,1)']} locations={[0, 0.55, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: s(96) }} />
    </Screen>
  );
}
