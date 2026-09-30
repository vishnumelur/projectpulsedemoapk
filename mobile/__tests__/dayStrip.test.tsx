// Client Task 8: every calendar scrolls both ways and every day is tappable (14a Pick a time, E6 Availability).
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import Book from '@/app/(client)/book/index';
import Jobs from '@/app/(expert)/pro/(tabs)/jobs';
import { useDemo } from '@/store/demo';
import { STRIP_DAYS, DEMO_TODAY, DEFAULT_DAY } from '@/ui/DayStrip';

let mockParams: Record<string, string> = { expert: 'omar', service: 'bid-visit' };
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => mockParams, useFocusEffect: jest.fn() }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); mockParams = { expert: 'omar', service: 'bid-visit' }; });

const selected = (key: string) => screen.getByTestId(`day-${key}`).props.accessibilityState?.selected;

test('the strip spans 3 weeks back and 5 weeks forward around Mon 6 Oct', () => {
  expect(DEMO_TODAY).toBe('2025-10-06');
  expect(STRIP_DAYS[0].key).toBe('2025-09-15'); expect(STRIP_DAYS[STRIP_DAYS.length - 1].key).toBe('2025-11-10');
  expect(STRIP_DAYS.find((d) => d.key === DEFAULT_DAY)?.wd).toBe('THU');
});

test('14a: the default selection is as approved (Thursday 9, 10:00, 13:00 struck)', async () => {
  await render(<Book />);
  expect(selected('2025-10-09')).toBe(true);
  expect(selected('2025-10-10')).toBe(false);
  expect(screen.getByText("Omar's free times on Thursday")).toBeTruthy();
  expect(screen.getByText('13:00').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ textDecorationLine: 'line-through' })]));
  expect(screen.getByText('Thu 9 Oct · 10:00 · Al Reem Island')).toBeTruthy();
});

test('14a: tapping another day changes the slot heading and the slots', async () => {
  await render(<Book />);
  await fireEvent.press(screen.getByTestId('day-2025-10-10'));
  expect(Haptics.selectionAsync).toHaveBeenCalled();
  expect(selected('2025-10-10')).toBe(true); expect(selected('2025-10-09')).toBe(false);
  expect(screen.getByText("Omar's free times on Friday")).toBeTruthy();
  expect(screen.queryByText("Omar's free times on Thursday")).toBeNull();
  // Friday's times differ from Thursday's (08:00 10:00 11:30 13:00 15:00 16:30)
  expect(screen.getByText('09:00')).toBeTruthy(); expect(screen.queryByText('08:00')).toBeNull();
  expect(screen.getByText('Fri 10 Oct · 10:00 · Al Reem Island')).toBeTruthy(); // the picked time carries over when free
});

test('14a: today and past days are dimmed and not selectable', async () => {
  await render(<Book />);
  const mon = screen.getByTestId('day-2025-10-06');
  expect(mon.props.accessibilityState?.disabled).toBe(true);
  await fireEvent.press(mon);
  expect(selected('2025-10-06')).toBe(false); expect(selected('2025-10-09')).toBe(true);
  expect(screen.getByText("Omar's free times on Thursday")).toBeTruthy();
});

test('E6: the default is Thursday as approved; tapping a day changes the schedule, toggles are kept per day', async () => {
  await render(<Jobs />);
  expect(selected('2025-10-09')).toBe(true);
  expect(screen.getByText('Sara · Bid review visit')).toBeTruthy();
  expect(screen.getAllByText('Open for bookings')).toHaveLength(2);
  expect(screen.getByText('Off · tap to open')).toBeTruthy();

  await fireEvent.press(screen.getByTestId('day-2025-10-06'));
  expect(selected('2025-10-06')).toBe(true);
  expect(screen.queryByText('Sara · Bid review visit')).toBeNull();
  expect(screen.getByText('Khalid · Site inspection')).toBeTruthy(); // Mon 6: 09:00 11:00 14:00 16:00, 11:00 booked
  expect(screen.getAllByText('Open for bookings')).toHaveLength(1);
  await fireEvent.press(screen.getAllByText('Off · tap to open')[0]);
  expect(screen.getAllByText('Open for bookings')).toHaveLength(2);

  await fireEvent.press(screen.getByTestId('day-2025-10-09'));
  expect(screen.getByText('Sara · Bid review visit')).toBeTruthy();
  expect(screen.getAllByText('Open for bookings')).toHaveLength(2); // Thursday untouched
  await fireEvent.press(screen.getByTestId('day-2025-10-06'));
  expect(screen.getAllByText('Open for bookings')).toHaveLength(2); // Monday's toggle kept
});
