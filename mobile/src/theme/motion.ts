// Project Pulse motion system: calm, classic, Apple-grade. Things glide into place and stop. No bounce, no overshoot,
// no pop. Use these instead of ad-hoc springs / springify() / ZoomIn / Bounce*.
import { Easing, FadeIn, FadeInDown, FadeInUp, FadeOut, LinearTransition } from 'react-native-reanimated';

/** Standard curve (ease-out, like iOS). */
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
/** For things that move within the screen (in-out). */
export const EASE_IN_OUT = Easing.bezier(0.4, 0, 0.2, 1);

export const DUR = { fast: 180, base: 280, slow: 420, reveal: 600 } as const;

/** Critically-damped springs (ζ ≥ 1): settle without overshoot. Use for press feedback, sheets, thumbs, knobs. */
export const SPRING = { damping: 30, stiffness: 260, mass: 1, overshootClamping: true } as const;
export const SPRING_SOFT = { damping: 32, stiffness: 170, mass: 1, overshootClamping: true } as const;

/** Entering presets (layout animations). `i` = stagger index. */
export const enterUp = (i = 0, step = 60) => FadeInDown.duration(DUR.slow).delay(i * step).easing(EASE_OUT);
export const enterDown = (i = 0, step = 60) => FadeInUp.duration(DUR.slow).delay(i * step).easing(EASE_OUT);
export const enterFade = (delay = 0) => FadeIn.duration(DUR.base).delay(delay).easing(EASE_OUT);
export const exitFade = FadeOut.duration(DUR.fast).easing(EASE_OUT);
export const layout = LinearTransition.duration(DUR.base).easing(EASE_IN_OUT);

/** Press feedback scale for buttons/cards (with SPRING): subtle, never below 0.97. */
export const PRESS_SCALE = 0.97;
