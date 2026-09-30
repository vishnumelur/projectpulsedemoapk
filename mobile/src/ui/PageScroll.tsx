import { forwardRef } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { s } from '@/theme/scale';
import { useTabClearance } from './TabBar';

/** A vertical page scroller for a Screen with side padding `px` (mockup px). It spans the full width and puts the margin
 *  inside its content, because an Android ScrollView clips its children to its bounds: card shadows and glows that spill
 *  into the margin were cut flat at the card's edges (a grey slab under each card). Same layout on every platform. */
/** `tabBar`: the screen sits under the floating tab bar; the content gets bottom padding to scroll fully clear of it. */
export const PageScroll = forwardRef<ScrollView, ScrollViewProps & { px?: number; tabBar?: boolean }>(function PageScroll({ px = 20, tabBar, style, contentContainerStyle, ...rest }, ref) {
  const clear = useTabClearance();
  return (
    <ScrollView ref={ref} showsVerticalScrollIndicator={false} {...rest} style={[{ marginHorizontal: -s(px) }, style]}
      contentContainerStyle={[{ paddingHorizontal: s(px) }, StyleSheet.flatten(contentContainerStyle), tabBar ? { paddingBottom: clear } : null]} />
  );
});
