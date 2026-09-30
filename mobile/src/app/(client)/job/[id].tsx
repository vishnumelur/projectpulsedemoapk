import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { LiveDot } from '@/ui/LiveDot';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock, DOCK_SPACE } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { useDemo } from '@/store/demo';
import { EXPERTS } from '@/data/seed';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const STEPS = (job: { dayLabel: string; timeLabel: string; due: string; status: string }) => [
  { t: 'Booked & paid', s: 'Mon 6 Oct', st: 'dn' },
  { t: 'Site visit', s: `Today · ${job.timeLabel}, in progress`, st: job.status === 'visit' || job.status === 'booked' ? 'now' : 'dn' },
  { t: 'Report', s: `Due ${job.due}`, st: job.status === 'report' ? 'now' : job.status === 'approved' || job.status === 'reviewed' ? 'dn' : 'fut' },
  { t: 'Your sign-off', s: 'Payment released after', st: job.status === 'approved' || job.status === 'reviewed' ? 'dn' : 'fut' },
];

export default function Job() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const job = useDemo((st) => st.jobs.find((j) => j.id === id) ?? st.jobs[0]);
  const e = EXPERTS.find((x) => x.id === job.expertId)!; const steps = STEPS(job);
  const fill = steps.filter((x) => x.st === 'dn').length / 3 * 0.88;
  return (
    <Screen bg="aurora">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(job.status === 'report' ? DOCK_SPACE : 30) }}>
        <Header />
        <T size={22} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(12) }}>{job.title === 'Bid review + visit' ? 'Bid review' : job.title}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Villa · Al Reem Island</T>
        <Glass r={18} style={{ marginTop: s(14), paddingVertical: s(12), paddingHorizontal: s(14), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={e.photo} size={40} />
          <View style={{ flex: 1 }}><T size={12.5} w={700}>{e.name}</T><View style={{ marginTop: s(5) }}><LiveDot label="On site now" /></View></View>
          <Pressable onPress={() => router.push(`/chat/${e.id}`)} style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chat" size={14} color="#fff" stroke={2} />
          </Pressable>
        </Glass>
        <View style={{ marginTop: s(16), paddingLeft: s(22) }}>
          <View style={{ position: 'absolute', left: s(6), top: s(6), bottom: s(6), width: 2, borderRadius: 2, backgroundColor: '#E3E6F0' }} />
          <LinearGradient colors={[C.blue, C.cyan]} style={{ position: 'absolute', left: s(6), top: s(6), width: 2, height: `${Math.max(fill, 0.44) * 100}%`, borderRadius: 2 }} />
          {steps.map((x, i) => (
            <View key={x.t} style={{ paddingBottom: i === 3 ? 0 : s(16) }}>
              <View style={{ position: 'absolute', left: -s(21), top: s(2), width: s(12), height: s(12), borderRadius: s(6),
                backgroundColor: x.st === 'dn' ? C.blue : '#fff', borderWidth: x.st === 'now' ? 3 : 2, borderColor: x.st === 'fut' ? '#D3D8E8' : C.blue,
                ...(x.st === 'now' ? { shadowColor: C.blue, shadowOpacity: 0.12, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, boxShadow: '0 0 0 5px rgba(0,0,254,0.12)' } : null) } as any} />
              <T size={12} w={700} ls={-0.01} c={x.st === 'fut' ? C.faint2 : C.navy}>{x.t}</T>
              <T size={10} c={C.mute} style={{ marginTop: s(6) }}>{x.s}</T>
            </View>
          ))}
        </View>
        <Glass r={18} style={{ marginTop: s(16), padding: s(12) }}>
          <T size={10} c={C.mute}><T size={10} w={700}>Latest</T> · 11:40</T>
          <T size={11} lh={1.45} style={{ marginTop: s(4) }}>Foundations and site access checked. Report on Sunday.</T>
          <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
            {(['site1', 'site2'] as const).map((p) => <Image key={p} source={PHOTOS[p]} contentFit="cover" style={{ flex: 1, height: s(58), borderRadius: s(12) }} />)}
          </View>
        </Glass>
      </ScrollView>
      {job.status === 'report' && <Dock><Btn title="View report" onPress={() => router.push(`/report/${job.id}`)} /></Dock>}
    </Screen>
  );
}
