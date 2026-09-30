import { Platform, ViewStyle } from 'react-native';

/** Converts '#RRGGBB' (or 'rgb(a)(...)') plus an opacity to an rgba() string. */
export function rgba(color: string, opacity: number) {
  if (color.startsWith('#')) {
    const h = color.length === 4 ? color.slice(1).split('').map((c) => c + c).join('') : color.slice(1, 7);
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${opacity})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim());
  return `rgba(${r},${g},${b},${+a * opacity})`;
}

/** The mockups' CSS drop shadow (`0 y blur color`), with blur/y already in dp (pass s(...) values).
 *  iOS/web: the RN shadow props (react-native-web emits exactly this box-shadow).
 *  Android: `boxShadow`. `elevation` can't take a colour, offset or blur, and on a translucent fill it paints through the
 *  surface (grey cards, white boxes behind text); boxShadow is clipped outside the border box and matches CSS. */
export function shadow(color: string, opacity: number, blur: number, y?: number): ViewStyle {
  if (Platform.OS === 'android') return { boxShadow: `0px ${y ?? 0}px ${blur}px ${rgba(color, opacity)}` } as ViewStyle;
  return { shadowColor: color, shadowOpacity: opacity, shadowRadius: blur, ...(y != null ? { shadowOffset: { width: 0, height: y } } : null) };
}
