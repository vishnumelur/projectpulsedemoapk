import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { SUCCESS_FROM, enterUp, exitFade } from '@/theme/motion';
import { ScaleIn } from '@/motion/ScaleIn';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Icon } from '@/ui/Icon';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { ProgressRing } from '@/fx/ProgressRing';
import { useDemo } from '@/store/demo';
import { EXPERTS, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { shadow } from '@/theme/shadow';
import { C, EASE } from '@/theme/tokens';

export default function Booked() {
  const { job: jobId } = useLocalSearchParams<{ job?: string }>();
  const job = useDemo((st) => st.jobs.find((j) => j.id === jobId) ?? st.jobs[0]);
  const [prog, setProg] = useState(0);
  const [tick, setTick] = useState(false);
  const [toast, setToast] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // the ring draws itself 0 -> full (EASE, 900ms), then the tick fades in and settles (0.9 -> 1, EASE_OUT) with the success haptic
    const t0 = Date.now(); let raf = 0;
    const step = () => { const k = Math.min(1, (Date.now() - t0) / 900); setProg(EASE.factory()(k)); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    const t = setTimeout(() => { setTick(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, 950);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); if (toastT.current) clearTimeout(toastT.current); };
  }, []);
  const addToCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setToast(true);
    if (toastT.current) clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(false), 2200);
  };
  if (!job) return <Screen bg="aurora3" px={16}><View /></Screen>;
  const e = EXPERTS.find((x) => x.id === job.expertId)!;
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ marginTop: s(70), width: s(92), height: s(92), alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: s(92), height: s(92), borderRadius: s(46), backgroundColor: 'rgba(0,0,254,0.16)', ...shadow(C.blue, 0.3, s(25)) }} />
          <View style={{ position: 'absolute', width: s(80), height: s(80), borderRadius: s(40), backgroundColor: 'rgba(255,255,255,0.92)' }} />
          <ProgressRing size={92} thickness={6} progress={prog} colors={['#31D1FF', '#0000FE', '#0000FE', '#31D1FF']} track="transparent">
            {tick ? <ScaleIn from={SUCCESS_FROM}><Icon name="check" color={C.blue} size={34} stroke={2.6} /></ScaleIn> : <View style={{ width: s(34), height: s(34) }} />}
          </ProgressRing>
        </View>
        <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(26) }}>You're booked</T>
        <T size={11} c={C.mute} lh={1.5} align="center" style={{ marginTop: s(6) }}>{`${e.first} will review your 3 bids and\nvisit the site on Thursday.`}</T>
        <Animated.View entering={enterUp().delay(450)} style={{ alignSelf: 'stretch', marginTop: s(20) }}>
          <Glass r={18} style={{ padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
            <Avatar photo={e.photo} size={38} />
            <View style={{ flex: 1, paddingRight: s(8) }}><T size={12} w={700}>{`${job.dayLabel} · ${job.timeLabel}`}</T><T size={9.5} c={C.mute}>{`Al Reem Island · ${aed(job.total, 2)} paid`}</T></View>
          </Glass>
        </Animated.View>
        <View style={{ alignSelf: 'stretch', marginTop: 'auto', marginBottom: s(18) }}>
          <Btn title="Track this job" onPress={() => router.replace(`/job/${job.id}`)} />
          <Pressable onPress={addToCalendar} style={{ marginTop: s(12), alignItems: 'center' }}><T size={11} w={600} c={C.blue}>Add to calendar</T></Pressable>
        </View>
      </View>
      {toast && (
        <Animated.View entering={enterUp()} exiting={exitFade} pointerEvents="none" style={{ position: 'absolute', left: s(16), right: s(16), bottom: s(92) }}>
          <Glass r={16} style={{ paddingVertical: s(10), paddingHorizontal: s(14), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(8) }}>
            <Icon name="check" color={C.blue} size={14} stroke={2.6} /><T size={11} w={600}>Added to calendar</T>
          </Glass>
        </Animated.View>
      )}
    </Screen>
  );
}
