import { fireEvent, render, screen } from '@testing-library/react-native';
import { Btn } from '@/ui/Btn';
import { Segmented } from '@/ui/Segmented';
import { Chip } from '@/ui/Chip';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

test('Btn fires once and ignores taps while busy', async () => {
  const onPress = jest.fn();
  const { rerender } = await render(<Btn title="Pay" onPress={onPress} />);
  await fireEvent.press(screen.getByText('Pay'));
  expect(onPress).toHaveBeenCalledTimes(1);
  await rerender(<Btn title="Pay" onPress={onPress} busy />);
  await fireEvent.press(screen.getByTestId('btn'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('Segmented reports the tapped index', async () => {
  const onChange = jest.fn();
  await render(<Segmented options={['Messages', 'Updates · 3']} value={0} onChange={onChange} />);
  await fireEvent.press(screen.getByText('Updates · 3'));
  expect(onChange).toHaveBeenCalledWith(1);
});

test('Chip toggles via onPress', async () => {
  const onPress = jest.fn();
  await render(<Chip label="On time" onPress={onPress} />);
  await fireEvent.press(screen.getByText('On time'));
  expect(onPress).toHaveBeenCalled();
});
