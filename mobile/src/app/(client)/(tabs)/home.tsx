import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { StageTrack } from '@/fx/StageTrack';
import { ModelView } from '@/three/ModelView';
import { useDemo, newQuotesFor } from '@/store/demo';
import { BUILDINGS, NEXT_STEP } from '@/data/types';
import { EXPERTS, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Home() {
  const { stage, projectType, jobs } = useDemo();
  const quotes = useDemo((st) => st.quotes);
  const fresh = useMemo(() => newQuotesFor({ quotes } as any, 'req-bid'), [quotes]);
  const from = Math.min(...fresh.map((q) => q.price));
  const job = jobs.find((j) => j.status === 'visit' || j.status === 'booked');
  const b = BUILDINGS.find((x) => x.id === projectType)!;
  return (
    <Screen bg="aurora3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(9) }}>
          <View><T size={9.5} c={C.mute}>Good evening</T><GradientText shimmer size={22} w={700} ls={-0.035} style={{ marginTop: s(-1) }}>Sara</GradientText></View>
          <Pressable onPress={() => router.push('/profile')}><Avatar photo="sara" size={34} ring="white" /></Pressable>
        </View>

        <Glass r={22} style={{ marginTop: s(54.5), paddingTop: s(54), paddingHorizontal: s(12), paddingBottom: s(10), overflow: 'visible' }}>
          <View style={{ position: 'absolute', left: '50%', marginLeft: -s(95), top: -s(74), width: s(190), height: s(140) }}>
            <ModelView model={b.id} lights={0.5} radius={9.4} target={[0, 2.2, 0]} height={0.42} spin={0.15} shadows={false} />
          </View>
          <T size={13} w={700} ls={-0.01} align="center">{b.name} · Al Reem Island</T>
          <StageTrack stage={stage} />
          <Pressable onPress={() => router.push('/quotes?request=req-bid')}>
            <LinearGradient colors={['rgba(0,0,254,0.06)', 'rgba(49,209,255,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }}
              style={{ marginTop: s(8), borderRadius: s(14), paddingVertical: s(7), paddingLeft: s(7), paddingRight: s(18), marginRight: -s(6), flexDirection: 'row', alignItems: 'center', gap: s(9) }}>
              <View style={{ width: s(28), height: s(28), borderRadius: s(14), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                shadowColor: C.blue, shadowOpacity: 0.12, shadowRadius: s(5), elevation: 2 }}><Icon name="arrowR" size={12} color={C.blue} stroke={2.4} /></View>
              <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
                <T size={8.5} w={700} ls={0.12} c={C.mute}>NEXT STEP</T>
                <GradientText shimmer size={11.5} w={700} style={{ marginTop: 1, flexShrink: 0, whiteSpace: 'nowrap' } as any}>{NEXT_STEP[stage - 1]}</GradientText>
              </View>
              <T size={10} w={700} c={C.blue}>Start</T>
            </LinearGradient>
          </Pressable>
        </Glass>

        <Pressable onPress={() => router.push('/pulse')} style={{ marginTop: s(12) }}>
          <IridescentBorder r={24}>
            <Glass r={24} style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(6), paddingLeft: s(8), paddingRight: s(6) }}>
              <Orb size={30} />
              <GradientText shimmer base={C.faint2} size={12} style={{ flex: 1 }}>Ask Pulse anything…</GradientText>
              <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size={13} color="#fff" stroke={2} /></View>
            </Glass>
          </IridescentBorder>
        </Pressable>

        <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(12), marginBottom: s(8) }}>NEEDS YOU</T>
        <Glass r={20} style={{ paddingHorizontal: s(14) }}>
          {fresh.length > 0 && (
            <Pressable onPress={() => router.push('/quotes?request=req-bid')} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11), borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', borderWidth: s(4), borderColor: 'rgba(0,0,254,0.12)' }}><T size={12} w={700} c="#fff">{String(fresh.length)}</T></View>
              <View style={{ flex: 1 }}><T size={12} w={700} ls={-0.01}>Quotes ready</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{`Bid review · from ${aed(from)}`}</T></View>
              <T size={15} c={C.faint3}>›</T>
            </Pressable>
          )}
          {job && (
            <Pressable onPress={() => router.push(`/job/${job.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11) }}>
              <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: 'rgba(0,0,254,0.08)', alignItems: 'center', justifyContent: 'center' }}><Icon name="cal" size={15} color={C.blue} stroke={2} /></View>
              <View style={{ flex: 1 }}><T size={12} w={700} ls={-0.01}>Site visit</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{`${job.dayLabel} · ${job.timeLabel} · ${EXPERTS.find((e) => e.id === job.expertId)!.first}`}</T></View>
              <T size={15} c={C.faint3}>›</T>
            </Pressable>
          )}
        </Glass>
      </ScrollView>
    </Screen>
  );
}
