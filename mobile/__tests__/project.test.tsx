import { render, screen, fireEvent } from '@testing-library/react-native';
import Project from '@/app/(client)/(tabs)/project';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), setParams: jest.fn() }, useLocalSearchParams: () => mockParams }));
beforeEach(() => useDemo.getState().resetDemo());

test('milestones, budget and site tabs show the approved content', async () => {
  mockParams = {}; await render(<Project />);
  for (const t of ['Villa · Al Reem', 'Tender · step 3 of 6', 'Plot purchased', 'Permit approved', 'Choose contractor', 'Construction starts', 'Next', 'Planned']) expect(screen.getByText(t)).toBeTruthy();
  await fireEvent.press(screen.getByText('Budget'));
  for (const t of ['68%', 'committed', 'Design & permits', 'AED 180K', 'Structure', 'AED 910K', 'MEP', 'AED 540K']) expect(screen.getByText(t)).toBeTruthy();
  await fireEvent.press(screen.getByText('Site'));
  expect(screen.getByText('Today · Site visit')).toBeTruthy();
  await fireEvent.press(screen.getByText('Docs'));
  expect(screen.getByText('Building permit.pdf')).toBeTruthy();
  await fireEvent.press(screen.getByText('Decisions'));
  expect(screen.getByText('Shortlist 3 contractors')).toBeTruthy();
});
