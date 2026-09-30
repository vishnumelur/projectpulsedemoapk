// mobile/__tests__/job.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Job from '@/app/(client)/job/[id]';
import Report from '@/app/(client)/report/[id]';
import Review from '@/app/(client)/review/[id]';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({ id: 'job-1' }) }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test('job tracking shows the 4 approved steps and the live status', async () => {
  await render(<Job />);
  for (const t of ['Bid review', 'On site now', 'Booked & paid', 'Site visit', 'Report', 'Your sign-off', 'Foundations and site access checked. Report on Sunday.']) expect(screen.getByText(t)).toBeTruthy();
});
test('approve → review → submit returns home', async () => {
  await render(<Report />);
  await fireEvent.press(screen.getByText('Approve & release payment'));
  expect(useDemo.getState().jobs[0].status).toBe('approved');
  expect(router.replace).toHaveBeenCalledWith('/review/job-1');
  await render(<Review />);
  expect(screen.getByText('Excellent')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('3 stars'));
  expect(screen.getByText('Good')).toBeTruthy();
  await fireEvent.press(screen.getByText('Submit review'));
  await act(async () => { jest.advanceTimersByTime(1500); });
  expect(useDemo.getState().jobs[0].status).toBe('reviewed');
  expect(router.replace).toHaveBeenCalledWith('/home');
});

test('double-tapping approve only navigates once', async () => {
  await render(<Report />);
  const btn = screen.getByText('Approve & release payment');
  await fireEvent.press(btn);
  await fireEvent.press(btn);
  expect(router.replace).toHaveBeenCalledTimes(1);
});
