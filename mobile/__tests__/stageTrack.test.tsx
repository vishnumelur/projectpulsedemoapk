import { render, screen } from '@testing-library/react-native';
import { StageTrack, stageLabels } from '@/fx/StageTrack';

test('B1 stage track: pill names the current stage, "Stage N of 6", first · Next · last labels', async () => {
  await render(<StageTrack stage={3} />);
  expect(screen.getByText('Tender')).toBeTruthy();
  expect(screen.getByText('Stage 3 of 6')).toBeTruthy();
  expect(screen.getByText('Planning')).toBeTruthy();
  expect(screen.getByText('Next: Contractor')).toBeTruthy();
  expect(screen.getByText('Handover')).toBeTruthy();
  expect(screen.getByTestId('RoundOrb')).toBeTruthy();
});

test('B1 stage track follows the project stage (not hard-coded)', async () => {
  await render(<StageTrack stage={5} />);
  expect(screen.getByText('Construction')).toBeTruthy();
  expect(screen.getByText('Stage 5 of 6')).toBeTruthy();
  expect(screen.getByText('Next: Handover')).toBeTruthy();
});

test('stageLabels: the last stage has no next stage', () => {
  expect(stageLabels(6)).toEqual({ first: 'Planning', next: null, last: 'Handover' });
  expect(stageLabels(1).next).toBe('Design');
});
