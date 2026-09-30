import { Dimensions, PixelRatio } from 'react-native';

/** Width in CSS px of the phone screen area in the approved mockups. */
export const MOCK_W = 254;

let k = Dimensions.get('window').width / MOCK_W;

export function setScaleWidth(width: number) { k = width / MOCK_W; }
export function scaleFactor() { return k; }
/** Convert a mockup px value to device dp. */
export function s(px: number) { return px === 0 ? 0 : PixelRatio.roundToNearestPixel(px * k); }
