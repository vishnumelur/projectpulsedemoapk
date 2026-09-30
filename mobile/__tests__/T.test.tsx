import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';

test('T scales size, applies weight font and ignores system font scaling', async () => {
  await render(<T size={20} w={700} ls={-0.03}>Hello</T>);
  const el = screen.getByText('Hello');
  const st = StyleSheet.flatten(el.props.style);
  expect(st.fontSize).toBe(s(20));
  expect(st.fontFamily).toBe('HankenGrotesk_700Bold');
  expect(st.letterSpacing).toBeCloseTo(s(20 * -0.03), 3);
  expect(el.props.allowFontScaling).toBe(false);
});
