import { router, usePathname } from 'expo-router';

/** The tab root a screen falls back to when there is no history (deep links, screens reached by replace). */
export function parentOf(path: string): string {
  if (path.startsWith('/onboarding')) return '/onboarding/welcome';
  if (path.startsWith('/pro') || path.startsWith('/expert-')) return '/pro';
  return '/home';
}

/** router.back() when there is history, else replace with `fallback` (no unhandled GO_BACK). */
export function goBack(fallback: string) {
  // canGoBack is optional so a test's router mock without it keeps the plain back()
  if (router.canGoBack?.() === false) router.replace(fallback as any);
  else router.back();
}

/** Start a fresh history at `href`: pop every stacked screen, then replace, so back can never return (sign in, sign out). */
export function resetTo(href: string) {
  if (router.canDismiss?.()) router.dismissAll();
  router.replace(href as any);
}

/** goBack with the current route group's tab root as the fallback. */
export function useGoBack() {
  const path = usePathname?.() ?? '/';
  return () => goBack(parentOf(path));
}
