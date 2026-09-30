import type { DemoState } from '@/store/demo';
export function nextRoute(s: Pick<DemoState, 'role' | 'clientOnboarded' | 'expertVerified'>) {
  if (s.role === 'client') return s.clientOnboarded ? '/home' : '/onboarding/building';
  if (s.role === 'expert') return s.expertVerified ? '/pro' : '/expert-role';
  return '/onboarding/welcome';
}
