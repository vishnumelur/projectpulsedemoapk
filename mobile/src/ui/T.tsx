import { Text, TextProps, TextStyle } from 'react-native';
import { C, F } from '@/theme/tokens';
import { s } from '@/theme/scale';

type W = 300 | 400 | 500 | 600 | 700 | 800;
export type TProps = TextProps & { size?: number; w?: W; c?: string; ls?: number; lh?: number; align?: TextStyle['textAlign'] };

/** Scaled text. size/ls/lh are the mockup CSS values (ls in em, lh as a multiplier). */
export function T({ size = 12, w = 400, c = C.navy, ls = 0, lh, align, style, ...rest }: TProps) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[{ fontFamily: F[w], fontSize: s(size), color: c, letterSpacing: s(size * ls), textAlign: align },
        lh ? { lineHeight: s(size * lh) } : null, style]}
    />
  );
}
