import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router, Redirect, useFocusEffect } from 'expo-router';
import Welcome from '@/app/onboarding/welcome';
import Role from '@/app/onboarding/role';
import Building from '@/app/onboarding/building';
import Stage from '@/app/onboarding/stage';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}), // runs like a mount-time focus; its cleanup runs on unmount (blur)
  useFocusEffect: jest.fn((cb: () => void | (() => void)) => require('react').useEffect(cb, [cb])),
  Redirect: jest.fn(() => null) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Welcome (A3): Pulse greets you, with the lockup, the two replies and the trust line', async () => {
  await render(<Welcome />);
  for (const t of ['Project ', 'Pulse', 'Sign in', 'Your construction expert for Abu Dhabi. Are you planning a project, or are you an engineer?',
    "I'm planning a project", "I'm an engineer", '1,200+ verified engineers', 'Abu Dhabi']) expect(screen.getByText(t)).toBeTruthy();
  expect(screen.getByLabelText("Hi, I'm Pulse.")).toBeTruthy();
  expect(screen.getByTestId('RoundOrb')).toBeTruthy();
});

test('Welcome (A3): Sign in goes to sign in', async () => {
  await render(<Welcome />);
  await fireEvent.press(screen.getByText('Sign in'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup?mode=signin');
});

test('Welcome (A3): Sign in shares the tap guard: a double tap pushes once and a reply after it is ignored', async () => {
  jest.useFakeTimers();
  await render(<Welcome />);
  await fireEvent.press(screen.getByText('Sign in'));
  await fireEvent.press(screen.getByText('Sign in'));
  await fireEvent.press(screen.getByText("I'm an engineer"));
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup?mode=signin');
  expect(useDemo.getState().role).toBeNull();
  jest.useRealTimers();
});

test('Welcome (A3): Sign in is ignored while a reply glides', async () => {
  jest.useFakeTimers();
  await render(<Welcome />);
  await fireEvent.press(screen.getByText("I'm planning a project"));
  await fireEvent.press(screen.getByText('Sign in'));
  await act(async () => { jest.advanceTimersByTime(1000); });
  jest.useRealTimers();
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup');
});

test('Welcome (A3): focus is tracked, and losing it (unmount/blur) runs the pause cleanup cleanly', async () => {
  const r = await render(<Welcome />);
  expect(useFocusEffect).toHaveBeenCalled();
  await r.unmount();
});

test.each([["I'm planning a project", 'client'], ["I'm an engineer", 'expert']] as const)('Welcome (A3): the reply "%s" sets the %s role, glides up, then goes to sign up', async (reply, role) => {
  jest.useFakeTimers();
  await render(<Welcome />);
  await fireEvent.press(screen.getByText(reply));
  expect(useDemo.getState().role).toBe(role);
  expect(router.push).not.toHaveBeenCalled(); // the reply glides up into the conversation first
  await act(async () => { jest.advanceTimersByTime(1000); });
  jest.useRealTimers();
  expect(router.push).toHaveBeenCalledTimes(1);
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup');
});

test('Welcome (A3): a double tap on the replies navigates once', async () => {
  jest.useFakeTimers();
  await render(<Welcome />);
  await fireEvent.press(screen.getByText("I'm planning a project"));
  await fireEvent.press(screen.getByText("I'm planning a project"));
  await fireEvent.press(screen.getByText("I'm an engineer"));
  await act(async () => { jest.advanceTimersByTime(2000); });
  jest.useRealTimers();
  expect(useDemo.getState().role).toBe('client');
  expect(router.push).toHaveBeenCalledTimes(1);
});

test('Role: the old role screen redirects to the A3 welcome', async () => {
  await render(<Role />);
  expect((Redirect as unknown as jest.Mock).mock.calls[0][0]).toMatchObject({ href: '/onboarding/welcome' });
});

test('Building: shows Villa first with its subtitle; Continue goes to chosen', async () => {
  await render(<Building />);
  expect(screen.getByText('Villa')).toBeTruthy(); expect(screen.getByText('Private residence')).toBeTruthy();
  await fireEvent.press(screen.getByText('Continue'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/chosen?type=villa');
});

test('Stage: defaults to Tender with its description; Continue goes to creating', async () => {
  await render(<Stage />);
  expect(screen.getByText('Collecting contractor bids')).toBeTruthy();
  await fireEvent.press(screen.getByText('Continue'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/creating?type=villa&stage=3');
});
