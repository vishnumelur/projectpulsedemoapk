// mobile/__tests__/inbox.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import Inbox from '@/app/(client)/(tabs)/inbox';
import Chat from '@/app/(client)/chat/[id]';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => mockParams }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); });
afterEach(() => jest.useRealTimers());

test('messages and updates tabs', async () => {
  mockParams = {}; await render(<Inbox />);
  for (const t of ['Omar Haddad', 'typing…', 'Project Pulse team', 'Lina Karim']) expect(screen.getByText(t)).toBeTruthy();
  await fireEvent.press(screen.getByText('Updates · 3'));
  for (const t of ['TODAY', 'New quotes', 'Your question was answered', 'EARLIER', 'Payment held safely']) expect(screen.getByText(t)).toBeTruthy();
});
test('sending a chat message appends it and Omar replies', async () => {
  mockParams = { id: 'omar' }; await render(<Chat />);
  await fireEvent.changeText(screen.getByPlaceholderText('Message…'), 'Thanks Omar');
  await fireEvent.press(screen.getByLabelText('Send'));
  expect(screen.getByText('Thanks Omar')).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(2500); });
  expect(screen.getByText("Noted. I'll include it in the report.")).toBeTruthy();
});

test('tapping a chat photo opens the viewer and Close dismisses it', async () => {
  mockParams = { id: 'omar' }; await render(<Chat />);
  expect(screen.queryByLabelText('Close')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Open photo'));
  expect(screen.getByLabelText('Close')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Close'));
  expect(screen.queryByLabelText('Close')).toBeNull();
});
test('Updates: count stays while viewing, notices are read after leaving the tab', async () => {
  mockParams = {}; await render(<Inbox />);
  await fireEvent.press(screen.getByText('Updates · 3'));
  await act(async () => { jest.advanceTimersByTime(3000); });
  expect(screen.getByText('Updates · 3')).toBeTruthy();
  expect(useDemo.getState().notifications.filter((n) => n.forRole === 'client' && !n.read)).toHaveLength(3);
  await fireEvent.press(screen.getByText('Messages'));
  expect(useDemo.getState().notifications.filter((n) => n.forRole === 'client' && !n.read)).toHaveLength(0);
  expect(screen.getByText('Updates · 0')).toBeTruthy();
});
test('unmounting while on Updates marks notices read', async () => {
  mockParams = { tab: 'updates' }; const r = await render(<Inbox />);
  await r.unmount();
  expect(useDemo.getState().notifications.filter((n) => n.forRole === 'client' && !n.read)).toHaveLength(0);
});
