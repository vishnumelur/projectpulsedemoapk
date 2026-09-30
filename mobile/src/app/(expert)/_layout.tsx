import { Stack } from 'expo-router';
import { PortalGuard } from '@/nav/PortalGuard';
// Sealed: only the engineer session gets in (see nav/PortalGuard). Covers E1–E3 onboarding and /pro.
export default function ExpertLayout() {
  return (
    <PortalGuard role="expert">
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </PortalGuard>
  );
}
