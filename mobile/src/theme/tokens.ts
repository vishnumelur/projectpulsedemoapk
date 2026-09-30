import { Easing } from 'react-native-reanimated';

export const C = {
  navy: '#16205A', blue: '#0000FE', cyan: '#31D1FF', grey: '#EAEAEA', white: '#FFFFFF', bg: '#F7F8FC',
  mute: '#6B7196', faint: '#8A90B0', faint2: '#9AA0BD', faint3: '#B3B8CF', line: 'rgba(22,32,90,0.07)',
  lineSolid: '#E6E8F0', violet: '#7A5CFF', lilac: '#B9A8FF', green: '#119A55', greenDot: '#1EC26B',
  greenBg: '#E5F8EE', star: '#F5B301', tint: 'rgba(0,0,254,0.07)', inputBg: '#F4F5FA', track: '#E6E9F2',
  amber: '#D27B00',
} as const;

/** Brand gradient cyan → Pulse Blue → violet. */
export const GRAD = ['#31D1FF', '#0000FE', '#7A5CFF'] as const;
export const GRAD_LOC = [0, 0.55, 1] as const;
/** Orb conic colours (motion language v2). */
export const ORB = ['#0000FE', '#31D1FF', '#B9A8FF', '#6F7BFF', '#31D1FF', '#0000FE'];

export const F = {
  300: 'HankenGrotesk_300Light', 400: 'HankenGrotesk_400Regular', 500: 'HankenGrotesk_500Medium',
  600: 'HankenGrotesk_600SemiBold', 700: 'HankenGrotesk_700Bold', 800: 'HankenGrotesk_800ExtraBold',
} as const;

/** cubic-bezier(.22,1,.36,1) used everywhere in the mockups. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
