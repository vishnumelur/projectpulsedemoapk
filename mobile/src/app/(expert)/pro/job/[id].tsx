// src/app/(expert)/pro/job/[id].tsx — E7 job & deliverables
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { useDemo } from '@/store/demo';
import { Rise, IS_TEST } from '@/screens/expert/motion';
import { PHOTOS } from '@/theme/photos';
import { GRAD, EASE } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { goBack } from '@/nav/back';
import { shadow } from '@/theme/shadow';
import { C } from '@/theme/tokens';

type Ph = keyof typeof PHOTOS;
export default function Deliver() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const found = useDemo((st) => st.jobs.find((j) => j.id === id));
  const first = useDemo((st) => st.jobs[0]);
  const job = found ?? first;
  // ✦ the upload bar fills with the gradient (mockup: 2.4s cubic-bezier(.22,1,.36,1))
  const p = useSharedValue(IS_TEST ? 1 : 0);
  useEffect(() => { if (!IS_TEST) p.value = withTiming(1, { duration: 2400, easing: EASE }); }, []);
  const bar = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  const [photos, setPhotos] = useState<Ph[]>(['site1', 'site2', 'drawings']);
  const initial = useRef(photos.length);
  const addPhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos((x) => (x.includes('port1') ? x : [...x, 'port1']));
  };
  const done = useRef(false); // synchronous double-tap guard (completing releases the client's sign-off/payment flow)
  const complete = () => {
    if (done.current || job.status === 'report') return; done.current = true;
    useDemo.getState().completeJob(job.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    goBack('/pro/jobs');
  };
  return (
    <Screen bg="aurora">
      <Header right={<View style={{ paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8), backgroundColor: 'rgba(0,0,254,0.08)' }}><T size={8.5} w={700} c={C.blue}>{job.status === 'report' ? 'Delivered' : 'In progress'}</T></View>} />
      <T size={20} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(10) }}>Bid review</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`Sara · Villa, Al Reem · Due ${job.due}`}</T>
      <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(16), marginBottom: s(8) }}>DELIVERABLES</T>
      {/* ✦ the file card settles */}
      <Rise dy={14} scale={0.96}>
        <Glass r={16} style={{ padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <LinearGradient colors={['#FFFFFF', '#EEF1FB']} start={{ x: 0.33, y: 0 }} end={{ x: 0.67, y: 1 }}
            style={{ width: s(34), height: s(40), borderRadius: s(8), alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(4),
              ...shadow(C.navy, 0.1, s(5), s(3)) }}>
            <T size={7} w={800} c={C.blue}>PDF</T>
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T size={11.5} w={700}>Bid review report.pdf</T>
            <View style={{ height: s(4), borderRadius: s(4), backgroundColor: C.track, marginTop: s(6), overflow: 'hidden' }}>
              <Animated.View style={[{ height: '100%', borderRadius: s(4), overflow: 'hidden' }, bar]}>
                <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
              </Animated.View>
            </View>
          </View>
        </Glass>
      </Rise>
      <Pressable accessibilityLabel="Add file or photos" onPress={addPhoto} style={({ pressed }) => ({ marginTop: s(8), borderRadius: s(18), padding: s(16), alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed',
        borderColor: 'rgba(0,0,254,0.3)', backgroundColor: 'rgba(0,0,254,0.03)', transform: [{ scale: pressed ? 0.985 : 1 }] })}>
        <T size={11} w={700} c={C.blue}>+ Add file or photos</T><T size={9.5} c={C.mute} style={{ marginTop: 2 }}>PDF, drawings, site photos</T>
      </Pressable>
      {/* ✦ photos drop into the row */}
      <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
        {photos.map((ph, i) => (
          <Rise key={ph} dy={-22} scale={0.9} delay={i < initial.current ? 420 + 130 * i : 0} style={{ flex: 1 }}>
            <Image source={PHOTOS[ph]} contentFit="cover" style={{ width: '100%', height: s(56), borderRadius: s(12) }} />
          </Rise>
        ))}
      </View>
      <Dock><Btn title={job.status === 'report' ? 'Delivered' : 'Mark as complete'} done={job.status === 'report'} onPress={complete} /></Dock>
    </Screen>
  );
}
