import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import RequestQuote from '@/app/(client)/request/index';
import { useDemo } from '@/store/demo';
import * as sim from '@/sim/scheduler';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({ kb: 'soil-test' }) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Pulse-written summary, one tap to send, double tap sends once', async () => {
  const before = useDemo.getState().requests.filter((r) => r.kbId === 'soil-test').length; // seed already has req-soil
  const spy = jest.spyOn(sim, 'simulateQuotes').mockImplementation(() => {});
  await render(<RequestQuote />);
  expect(screen.getByText('Soil investigation and geotechnical report for a 5-bedroom villa on Al Reem Island, needed before structural design.')).toBeTruthy();
  expect(screen.getByText('Within 2 weeks')).toBeTruthy();
  await fireEvent.press(screen.getByText('Send request'));
  await fireEvent.press(screen.getByTestId('btn'));
  expect(useDemo.getState().requests.filter((r) => r.kbId === 'soil-test')).toHaveLength(before + 1);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith('/request/sent');
});

test('two presses fired concurrently before re-render run the send once', async () => {
  const spy = jest.spyOn(sim, 'simulateQuotes').mockImplementation(() => {});
  await render(<RequestQuote />);
  const btn = screen.getByTestId('btn');
  // both presses are dispatched before React can re-render (and disable) the button
  await act(async () => { void fireEvent.press(btn); void fireEvent.press(btn); });
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledTimes(1);
});
