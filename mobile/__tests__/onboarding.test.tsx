import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Welcome from '@/app/onboarding/welcome';
import Role from '@/app/onboarding/role';
import Building from '@/app/onboarding/building';
import Stage from '@/app/onboarding/stage';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}), useFocusEffect: jest.fn() }));
// building/stage are sealed to the client session (Task 2)
beforeEach(() => { useDemo.getState().resetDemo(); useDemo.setState({ session: { role: 'client', email: 'sara@projectpulse.ae' } }); jest.clearAllMocks(); });

test('Welcome (A2): Get started goes to the role screen; Sign in goes to sign in', async () => {
  await render(<Welcome />);
  for (const t of ['Project Pulse', 'Can I add a floor to my villa?', 'Omar H.', 'AED 2,200', 'Your project,', 'in expert hands.',
    'Answers in seconds. Verified engineers in Abu Dhabi when you need one.', 'Verified experts', 'Secure pay', 'Abu Dhabi']) expect(screen.getByText(t)).toBeTruthy();
  await fireEvent.press(screen.getByText('Get started'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/role');
  await fireEvent.press(screen.getByText('Sign in'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup?mode=signin');
});

test.each([["I'm building", 'client'], ["I'm an engineer", 'expert']] as const)('Role: tapping "%s" sets the %s role and moves on to sign up', async (card, role) => {
  jest.useFakeTimers();
  await render(<Role />);
  expect(screen.getByText('What brings you\nto Pulse?')).toBeTruthy();
  await fireEvent.press(screen.getByText(card));
  expect(useDemo.getState().role).toBe(role);
  expect(router.push).not.toHaveBeenCalled(); // the card lifts, then expands to full screen
  await act(async () => { jest.advanceTimersByTime(500); });
  expect(router.push).not.toHaveBeenCalled();
  await act(async () => { jest.advanceTimersByTime(400); });
  jest.useRealTimers();
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup');
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
