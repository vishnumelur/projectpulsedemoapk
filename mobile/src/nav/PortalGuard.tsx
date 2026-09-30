import { Redirect } from 'expo-router';
import type { PortalRole } from '@/data/accounts';
import { useDemo } from '@/store/demo';
import { nextRoute, SIGN_IN } from './next';

/** Seals a portal: only a session of `role` gets in. No session → Sign in; the other role → its own portal root.
 *  Dev only: while the screen gallery is active (`devGallery`, set by /dev/gallery and cleared by any sign in/out), either
 *  portal opens, so the gallery and tools/fidelity/capture.mjs can load every screen by URL. */
export function PortalGuard({ role, children }: { role: PortalRole; children: React.ReactNode }) {
  const session = useDemo((st) => st.session);
  const gallery = useDemo((st) => __DEV__ && st.devGallery);
  if (session?.role === role || gallery) return <>{children}</>;
  return <Redirect href={(session ? nextRoute(useDemo.getState()) : SIGN_IN) as any} />;
}
