import { Stack } from 'expo-router';
import { PortalGuard } from '@/nav/PortalGuard';
// Pulse cross-fades in (the Home ask-bar blob has already glided to Pulse's hero-orb position), every other route slides.
// Sealed: only the client session gets in (see nav/PortalGuard).
export default function ClientLayout() {
  return (
    <PortalGuard role="client">
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="pulse" options={{ animation: 'fade', animationDuration: 250 }} />
      </Stack>
    </PortalGuard>
  );
}
