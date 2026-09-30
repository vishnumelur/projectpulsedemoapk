import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Book from '@/app/(client)/book/index';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({ expert: 'omar', service: 'bid-visit' }) }));
beforeEach(() => { jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] }); useDemo.getState().resetDemo(); useDemo.setState({ jobs: [] }); jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test('pick a time, pay once (double tap safe), land on booked', async () => {
  await render(<Book />);
  expect(screen.getByText("Omar's free times on Thursday")).toBeTruthy();
  await fireEvent.press(screen.getByText('Continue · AED 2,200'));
  expect(screen.getByText('AED 2,425.50')).toBeTruthy();
  // two taps land before React re-renders (Pay twice, then Pay + Google Pay): only one job may be created
  const pay = screen.getByText('Pay AED 2,425.50');
  const g = screen.getByText('G');
  await Promise.all([fireEvent.press(pay), fireEvent.press(pay), fireEvent.press(g)]);
  await act(async () => { jest.advanceTimersByTime(1200); });
  expect(useDemo.getState().jobs).toHaveLength(1);
  expect(router.replace).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith(expect.stringMatching(/^\/book\/done\?job=/));
});
