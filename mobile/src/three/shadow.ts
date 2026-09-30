/** Shadow map only needs re-rendering while parts rise (max delay ~0.9*1.15 + 1.0s duration) plus margin. */
export const SHADOW_WINDOW_MS = 2500;
export function shouldUpdateShadows(now: number, t0: number | null): boolean {
  return t0 != null && now - t0 >= 0 && now - t0 < SHADOW_WINDOW_MS;
}
