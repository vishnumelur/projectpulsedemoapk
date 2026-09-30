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

test('?tab=site selects the Site tab initially', async () => {
  mockParams = { tab: 'site' }; await render(<Project />);
  expect(screen.getByText('Today · Site visit')).toBeTruthy();
});

test('pressing a site photo opens the full-screen viewer', async () => {
  mockParams = { tab: 'site' }; await render(<Project />);
  expect(screen.queryByLabelText('Close')).toBeNull();
  await fireEvent.press(screen.getByText('2 Oct'));
  expect(screen.getByLabelText('Close')).toBeTruthy();
  expect(screen.getAllByText('2 Oct').length).toBe(2);
  await fireEvent.press(screen.getByLabelText('Close'));
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('pressing a budget category shows its payments', async () => {
  mockParams = { tab: 'budget' }; await render(<Project />);
  await fireEvent.press(screen.getByText('Structure'));
  for (const t of ['Structure · payments', 'Gulf Foundations', 'AED 400,000', 'Emirates Steel', 'AED 310,000', 'Al Noor Concrete', 'AED 200,000']) expect(screen.getByText(t)).toBeTruthy();
});
