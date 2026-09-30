import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Role from '@/app/(expert)/expert-role';
import Setup from '@/app/(expert)/expert-setup';
import Verified from '@/app/(expert)/expert-verified';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => mockParams }));
beforeEach(() => { jest.useFakeTimers({ advanceTimers: true }); useDemo.getState().resetDemo(); jest.clearAllMocks(); mockParams = {}; });
afterEach(() => jest.useRealTimers());

test('E1 one tap auto-advances', async () => {
  await render(<Role />); await fireEvent.press(screen.getByText('Architect'));
  await act(async () => { jest.advanceTimersByTime(700); });
  expect(router.push).toHaveBeenCalledWith('/expert-setup');
});
test('E2 checklist: 2/5 done; completing items enables Submit for review', async () => {
  await render(<Setup />);
  expect(screen.getByText('2/5')).toBeTruthy();
  for (let i = 0; i < 3; i++) { await fireEvent.press(screen.getAllByText('Add')[0]); await fireEvent.press(screen.getByText('Save')); }
  expect(screen.getByText('5/5')).toBeTruthy();
  await fireEvent.press(screen.getByText('Submit for review'));
  expect(router.push).toHaveBeenCalledWith('/expert-verified');
});
test('E3 review → verified → dashboard', async () => {
  await render(<Verified />);
  expect(screen.getByText('Under review')).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(1900); });
  await fireEvent.press(screen.getByText('Go to dashboard'));
  expect(useDemo.getState().expertVerified).toBe(true);
  expect(router.replace).toHaveBeenCalledWith('/pro');
});
