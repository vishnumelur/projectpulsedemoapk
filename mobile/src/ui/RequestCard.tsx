// src/ui/RequestCard.tsx — a client request as the expert sees it (E4 dashboard, Requests tab)
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from './Glass';
import { Avatar } from './Avatar';
import { T } from './T';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import type { Request } from '@/data/types';

export function RequestCard({ r, compact }: { r: Request; compact?: boolean }) {
  const photo = r.clientName === 'Sara' ? 'sara' : 'karim';
  return (
    <Pressable onPress={() => router.push(`/pro/request/${r.id}` as any)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <Glass r={18} style={{ paddingVertical: s(12), paddingHorizontal: s(14), opacity: compact ? 0.9 : 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={photo} size={34} />
          <View style={{ flex: 1 }}><T size={12.5} w={700}>{r.title}</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{r.clientName === 'Sara' ? 'Villa · Al Reem · Design stage' : r.place}</T></View>
          {compact && <T size={9.5} c={C.mute}>1h</T>}
        </View>
        {!compact && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: s(10) }}>
            <T size={9.5} c={C.mute}>{`Within 2 weeks · ${r.distance}`}</T>
            <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: s(7), paddingHorizontal: s(14), borderRadius: s(12) }}><T size={10.5} w={700} c="#fff">Quote</T></LinearGradient>
          </View>
        )}
      </Glass>
    </Pressable>
  );
}
