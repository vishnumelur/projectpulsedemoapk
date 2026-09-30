import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import Experts from '@/app/(client)/(tabs)/experts';
import ExpertProfile from '@/app/(client)/expert/[id]';
import Quotes from '@/app/(client)/quotes';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => mockParams }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Experts grid is sorted by Pulse match with the approved badges', async () => {
  mockParams = {}; await render(<Experts />);
  expect(screen.getByText('96% match')).toBeTruthy(); expect(screen.getByText('Matched by Pulse to your Tender stage')).toBeTruthy();
  await fireEvent.press(screen.getByText('Omar Haddad'));
  expect(router.push).toHaveBeenCalledWith('/expert/omar');
});
test('Profile: choosing the second service updates the Book button', async () => {
  mockParams = { id: 'omar' }; await render(<ExpertProfile />);
  expect(screen.getByText('Book · AED 2,200')).toBeTruthy();
  await fireEvent.press(screen.getByText('Site visit only'));
  await fireEvent.press(screen.getByText('Book · AED 1,800'));
  expect(router.push).toHaveBeenCalledWith('/book?expert=omar&service=visit');
});
test('Quotes: best match is Omar at 12% below average; Accept goes to booking', async () => {
  mockParams = { request: 'req-bid' }; await render(<Quotes />);
  expect(screen.getByText('AED 2,200')).toBeTruthy(); expect(screen.getByText('12% below average price')).toBeTruthy();
  expect(screen.getByText('2 more · from AED 2,450')).toBeTruthy();
  await fireEvent.press(screen.getByText('Accept & book'));
  expect(router.push).toHaveBeenCalledWith('/book?expert=omar&service=bid-visit&quote=q-omar');
});
