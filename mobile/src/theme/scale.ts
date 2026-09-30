import { Dimensions, PixelRatio } from 'react-native';

/** Width in CSS px of the phone screen area in the approved mockups. */
export const MOCK_W = 254;

let k = Dimensions.get('window').width / MOCK_W;
const R = PixelRatio.get();

export function setScaleWidth(width: number) { k = width / MOCK_W; }
export function scaleFactor() { return k; }
/** Convert a mockup px value to device dp. */
// A worklet so animated styles / derived values may call it on the UI thread (k and R are captured).
export function s(px: number) { 'worklet'; return px === 0 ? 0 : Math.round(px * k * R) / R; }
