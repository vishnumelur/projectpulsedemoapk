// src/app/(expert)/pro/(tabs)/requests.tsx — expert Requests tab
import { ScrollView } from 'react-native';
import { useMemo } from 'react';
import { Screen } from '@/ui/Screen';
import { PageScroll } from '@/ui/PageScroll';
import { T } from '@/ui/T';
import { RequestCard } from '@/ui/RequestCard';
import { useDemo } from '@/store/demo';
import { Rise } from '@/screens/expert/motion';
import { s } from '@/theme/scale';

export default function Requests() {
  const requests = useDemo((st) => st.requests);
  const reqs = useMemo(() => requests.filter((r) => r.status === 'sent'), [requests]);
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(10) }}>Requests</T>
      <PageScroll tabBar contentContainerStyle={{ gap: s(8), paddingTop: s(14), paddingBottom: s(90) }}>
        {reqs.map((r, i) => <Rise key={r.id} dx={28} dy={0} delay={60 * i}><RequestCard r={r} /></Rise>)}
      </PageScroll>
    </Screen>
  );
}
