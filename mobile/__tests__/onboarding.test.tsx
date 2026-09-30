import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Welcome from '@/app/onboarding/welcome';
import Building from '@/app/onboarding/building';
import Stage from '@/app/onboarding/stage';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Welcome: the role buttons set the role and go to sign up', async () => {
  await render(<Welcome />);
  expect(screen.getByText('Ask. Get matched.')).toBeTruthy();
  await fireEvent.press(screen.getByText('I need an expert'));
  expect(useDemo.getState().role).toBe('client');
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
