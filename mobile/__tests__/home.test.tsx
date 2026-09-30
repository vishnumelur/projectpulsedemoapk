import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import Home from '@/app/(client)/(tabs)/home';
import Profile from '@/app/(client)/(tabs)/profile';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Home shows the approved content and wires the actions', async () => {
  await render(<Home />);
  for (const t of ['Good evening', 'Sara', 'Villa · Al Reem Island', 'NEXT STEP', 'Choose a contractor', 'Start', 'Ask Pulse anything…',
    'NEEDS YOU', 'Quotes ready', 'Bid review · from AED 2,200', 'Site visit', 'Thu 9 Oct · 10:00 · Omar']) expect(screen.getByText(t)).toBeTruthy();
  expect(screen.getByText('2')).toBeTruthy();
  await fireEvent.press(screen.getByText('Ask Pulse anything…'));
  expect(router.push).toHaveBeenCalledWith('/pulse');
  await fireEvent.press(screen.getByText('Quotes ready'));
  expect(router.push).toHaveBeenCalledWith('/quotes?request=req-bid');
});

test('Profile switch goes to the expert side', async () => {
  await render(<Profile />);
  await fireEvent.press(screen.getByText('Switch to Expert app'));
  expect(useDemo.getState().role).toBe('expert');
  expect(router.replace).toHaveBeenCalledWith('/expert-role');
});
