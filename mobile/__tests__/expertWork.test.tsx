// mobile/__tests__/expertWork.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Dash from '@/app/(expert)/pro/(tabs)/index';
import SendQuote from '@/app/(expert)/pro/request/[id]';
import Jobs from '@/app/(expert)/pro/(tabs)/jobs';
import Deliver from '@/app/(expert)/pro/job/[id]';
import Earnings from '@/app/(expert)/pro/(tabs)/earnings';
import Requests from '@/app/(expert)/pro/(tabs)/requests';
import ExpertInbox from '@/app/(expert)/pro/(tabs)/inbox';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => mockParams, useFocusEffect: jest.fn() }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); mockParams = {}; });

test('client request shows on the dashboard; the quote goes back to the client', async () => {
  const id = 'req-soil'; // seeded request from Sara (Task 5)
  await render(<Dash />);
  expect(screen.getByText('AED 18,400')).toBeTruthy(); expect(screen.getByText('Soil test report')).toBeTruthy();
  mockParams = { id }; await render(<SendQuote />);
  expect(screen.getByText('Typical for this job: AED 1,800–2,600')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Decrease price'));
  await fireEvent.press(screen.getByText('Send quote'));
  expect(useDemo.getState().quotes.find((q) => q.requestId === id && q.expertId === 'omar')?.price).toBe(1800);
});
test('availability toggle, deliver, earnings withdraw', async () => {
  await render(<Jobs />);
  await fireEvent.press(screen.getByText('Off · tap to open'));
  expect(useDemo.getState().slots.find((x) => x.id === 'thu-1700')?.state).toBe('open');
  mockParams = { id: 'job-1' }; await render(<Deliver />);
  await fireEvent.press(screen.getByText('Mark as complete'));
  expect(useDemo.getState().jobs[0].status).toBe('report');
  await render(<Earnings />);
  await fireEvent.press(screen.getByText('Withdraw'));
  await fireEvent.press(screen.getByText('Withdraw AED 6,200'));
  expect(useDemo.getState().withdrawable).toBe(0);
});

// ---- double-tap guards: two presses land before React re-renders; the action must run once ----
// Both presses fire inside ONE act scope (Promise.all of two fireEvent.press calls would overlap act() scopes and
// corrupt later tests), so neither sees a re-render in between — only a synchronous ref guard can stop the second.
const pressTwice = async (el: any) => {
  let n = el; while (n && !n.props.onClick) n = n.parent;
  const ev = { nativeEvent: {}, persist() {}, stopPropagation() {}, preventDefault() {} };
  await act(async () => { await Promise.all([Promise.resolve().then(() => n.props.onClick(ev)), Promise.resolve().then(() => n.props.onClick(ev))]); });
};
test('Send quote: a double tap sends one quote and navigates once', async () => {
  mockParams = { id: 'req-soil' }; await render(<SendQuote />);
  const notices = useDemo.getState().notifications.length;
  const send = screen.getByText('Send quote');
  await pressTwice(send);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === 'req-soil' && q.expertId === 'omar')).toHaveLength(1);
  expect(useDemo.getState().notifications.length - notices).toBe(2); // one client + one expert notice, sent once
  expect(router.replace).toHaveBeenCalledTimes(1);
});
test('Withdraw: a double tap on confirm pays out once', async () => {
  await render(<Earnings />);
  await fireEvent.press(screen.getByText('Withdraw'));
  const before = useDemo.getState().payouts.length;
  const confirm = screen.getByText('Withdraw AED 6,200');
  await pressTwice(confirm);
  expect(useDemo.getState().payouts.length - before).toBe(1);
  expect(useDemo.getState().payouts[0].amount).toBe(-6200);
});
test('Mark as complete: a double tap completes and notifies once', async () => {
  mockParams = { id: 'job-1' }; await render(<Deliver />);
  const notices = useDemo.getState().notifications.length;
  const done = screen.getByText('Mark as complete');
  await pressTwice(done);
  expect(useDemo.getState().notifications.length - notices).toBe(1);
  expect(router.back).toHaveBeenCalledTimes(1);
});

test('price tints amber outside the typical range; + raises the price', async () => {
  mockParams = { id: 'req-soil' }; await render(<SendQuote />);
  await fireEvent.press(screen.getByLabelText('Increase price'));
  expect(screen.getByText('2,000')).toBeTruthy();
  for (let i = 0; i < 3; i++) await fireEvent.press(screen.getByLabelText('Decrease price'));
  expect(screen.getByText('1,700')).toBeTruthy();
  expect(screen.getByTestId('range-hint').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#D27B00' })]));
});
test('requests tab lists open requests; expert inbox shows the client thread', async () => {
  await render(<Requests />);
  expect(screen.getByText('Soil test report')).toBeTruthy(); expect(screen.getByText('BOQ cost check')).toBeTruthy();
  await render(<ExpertInbox />);
  expect(screen.getByText('Sara Al Mansoori')).toBeTruthy();
});
