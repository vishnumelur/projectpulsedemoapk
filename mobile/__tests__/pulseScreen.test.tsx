import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Pulse from '@/app/(client)/pulse';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() }, useLocalSearchParams: () => mockParams }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); useDemo.setState({ stage: 3 }); jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test('Opening shows the Tender suggestions', async () => {
  mockParams = {}; await render(<Pulse />);
  expect(screen.getByText('Review my 3 contractor bids')).toBeTruthy();
  expect(screen.getByText('or just ask. Type, or hold the mic to speak')).toBeTruthy();
});

test('Soil test question → thinking → answer with a Request a quote CTA', async () => {
  mockParams = { state: 'thinking', q: 'Do I need a soil test?' };
  await render(<Pulse />);
  expect(screen.getByText('Finding your answer…')).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(1900); });
  expect(screen.getByText('Geotechnical engineer')).toBeTruthy();
  expect(screen.getByText('◆ Project Pulse Villa Guide')).toBeTruthy();
  await fireEvent.press(screen.getByText('Request a quote'));
  expect(router.push).toHaveBeenCalledWith('/request?kb=soil-test');
});

test('Structural question is flagged by code: fixed response, flag stored', async () => {
  mockParams = { state: 'thinking', q: 'Can I remove the kitchen wall?' };
  await render(<Pulse />);
  await act(async () => { jest.advanceTimersByTime(1900); });
  expect(screen.getByText('An engineer will\nanswer this one')).toBeTruthy();
  expect(useDemo.getState().flags.some((f) => f.question === 'Can I remove the kitchen wall?' && !f.replied)).toBe(true);
});

test('Unknown question falls back gracefully', async () => {
  mockParams = { state: 'thinking', q: 'qwerty zzz' };
  await render(<Pulse />);
  await act(async () => { jest.advanceTimersByTime(1900); });
  expect(screen.getByText("I don't have a verified answer for that yet.")).toBeTruthy();
});
