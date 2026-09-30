import { Children, ReactNode } from 'react';
import { Platform, Text, TextProps, TextStyle } from 'react-native';
import { C, F } from '@/theme/tokens';
import { s } from '@/theme/scale';

type W = 300 | 400 | 500 | 600 | 700 | 800;
export type TProps = TextProps & { size?: number; w?: W; c?: string; ls?: number; lh?: number; align?: TextStyle['textAlign'] };

/** Glyphs Hanken Grotesk lacks. The approved renders (Chrome) drew them with DejaVu Sans; Android's own fallback (Noto) is
 *  heavier and sized differently, so native uses the bundled DejaVu subset (assets/fonts/PPSym*.ttf) for exactly these. */
const SYM = /([✓◌★◆✦✕])/;
const HANKEN_LINE = 1.303; // (hhea ascent + descent) / unitsPerEm
function withSym(children: ReactNode): ReactNode {
  if (Platform.OS === 'web') return children;
  const family = 'PPSym'; // the approved renders show the regular-weight symbols even in bold labels
  return Children.map(children, (ch) => typeof ch !== 'string' || !SYM.test(ch) ? ch
    : ch.split(SYM).map((part, i) => (i % 2 ? <Text key={i} style={{ fontFamily: family, fontWeight: 'normal' }}>{part}</Text> : part)));
}

/** Scaled text. size/ls/lh are the mockup CSS values (ls in em, lh as a multiplier). */
export function T({ size = 12, w = 400, c = C.navy, ls = 0, lh, align, style, children, ...rest }: TProps) {
  // With a DejaVu span Android sizes the line from that font's bounds (taller rows); keep Hanken's natural 1.303em line.
  const symLine = !lh && Platform.OS !== 'web' && Children.toArray(children).some((ch) => typeof ch === 'string' && SYM.test(ch));
  const line = lh ?? (symLine ? HANKEN_LINE : 0);
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[{ fontFamily: F[w], fontSize: s(size), color: c, letterSpacing: s(size * ls), textAlign: align },
        line ? { lineHeight: s(size * line) } : null, style]}
    >{withSym(children)}</Text>
  );
}
