// Project Pulse motion system: calm, classic, Apple-grade. Things glide into place and stop. No bounce, no overshoot,
// no pop. Use these instead of ad-hoc springs / springify() / ZoomIn / Bounce*. (__tests__/motion.test.ts guards this.)
import { Easing, FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutUp, LinearTransition } from 'react-native-reanimated';

/** Standard curve (ease-out, like iOS). */
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
/** For things that move within the screen (in-out). */
export const EASE_IN_OUT = Easing.bezier(0.4, 0, 0.2, 1);

export const DUR = { fast: 180, base: 280, slow: 420, reveal: 600,
  /** Ambient loops (full cycle): Ken Burns push-in, a floating card, a light sweep on a button, a light sweep on a progress segment. */
  kenBurns: 14000, float: 6000, sweep: 4000, trackSweep: 2600 } as const;

/** Critically-damped springs (ζ ≥ 1): settle without overshoot. Use for press feedback, sheets, thumbs, knobs. */
export const SPRING = { damping: 30, stiffness: 260, mass: 1, overshootClamping: true } as const;
export const SPRING_SOFT = { damping: 32, stiffness: 170, mass: 1, overshootClamping: true } as const;

/** withTiming configs: `ease(DUR.slow)` for arrivals, `easeInOut(DUR.base)` for moves within the screen and departures. */
export const ease = (duration: number = DUR.slow) => ({ duration, easing: EASE_OUT });
export const easeInOut = (duration: number = DUR.base) => ({ duration, easing: EASE_IN_OUT });

/** Entrance rise: content fades in while rising at most this far (px). Chat bubbles use CHAT_RISE. */
export const RISE = 10;
export const CHAT_RISE = 6;
/** Scale-in start: calm arrivals (cards, badges) start at SCALE_FROM; success marks (ticks) at SUCCESS_FROM. Never a pop. */
export const SCALE_FROM = 0.96;
export const SUCCESS_FROM = 0.9;
/** The most a selection may grow (a review star, a chosen slot) before it settles back to 1. */
export const SELECT_PEAK = 1.08;

/** Entering presets (layout animations). `i` = stagger index (a 40–70ms step for lists), `rise` in px (≤ RISE). */
export const enterUp = (i = 0, step = 60, rise: number = RISE) =>
  FadeInDown.duration(DUR.slow).delay(i * step).easing(EASE_OUT).withInitialValues({ opacity: 0, transform: [{ translateY: rise }] });
export const enterDown = (i = 0, step = 60, rise: number = RISE) =>
  FadeInUp.duration(DUR.slow).delay(i * step).easing(EASE_OUT).withInitialValues({ opacity: 0, transform: [{ translateY: -rise }] });
export const enterFade = (delay = 0, duration: number = DUR.base) => FadeIn.duration(duration).delay(delay).easing(EASE_OUT);
export const exitFade = FadeOut.duration(DUR.fast).easing(EASE_OUT);
export const layout = LinearTransition.duration(DUR.base).easing(EASE_IN_OUT);

/** Notification banner: glides down from just above its slot while fading in; leaves upward on an in-out curve. */
export const BANNER_TRAVEL = 24;
export const bannerIn = FadeInUp.duration(DUR.slow).easing(EASE_OUT).withInitialValues({ opacity: 0, transform: [{ translateY: -BANNER_TRAVEL }] });
export const bannerOut = FadeOutUp.duration(DUR.base).easing(EASE_IN_OUT);

/** Press feedback scale for buttons/cards (with SPRING): subtle, never below 0.97. */
export const PRESS_SCALE = 0.97;
