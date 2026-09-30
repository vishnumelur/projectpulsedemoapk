import { Stack } from 'expo-router';
// Pulse cross-fades in (the Home ask-bar blob has already glided to Pulse's hero-orb position), every other route slides.
export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="pulse" options={{ animation: 'fade', animationDuration: 250 }} />
    </Stack>
  );
}
