import type { DemoState } from '@/store/demo';

export const SIGN_IN = '/onboarding/signup';

/** Where the app belongs for this state: the signed-in portal's root (first time: its onboarding), else the start screen. */
export function nextRoute(s: Pick<DemoState, 'session' | 'clientOnboarded' | 'expertVerified'>) {
  if (s.session?.role === 'client') return s.clientOnboarded ? '/home' : '/onboarding/building';
  if (s.session?.role === 'expert') return s.expertVerified ? '/pro' : '/expert-role';
  return '/onboarding/welcome';
}
