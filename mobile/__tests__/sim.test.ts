import { useDemo } from '@/store/demo';
import { SIM, simulateQuotes, simulateTeamReply, resumeSimulations, cancelAll } from '@/sim/scheduler';

beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); });
afterEach(() => { cancelAll(); jest.useRealTimers(); });

const newReq = () => useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report', summary: 's', expertType: 'Geotechnical engineer', when: '2w' });

test('quotes arrive after SIM.quotesMs', () => {
  const id = newReq(); simulateQuotes(id);
  jest.advanceTimersByTime(SIM.quotesMs - 1);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === id)).toHaveLength(0);
  jest.advanceTimersByTime(1);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === id)).toHaveLength(2);
});

test('reset while quotes are pending: no late quotes appear (Review Focus #5)', () => {
  const id = newReq(); simulateQuotes(id);
  useDemo.getState().resetDemo();
  jest.advanceTimersByTime(SIM.quotesMs * 2);
  expect(useDemo.getState().quotes.some((q) => q.requestId === id)).toBe(false);
});

test('after a restart, pending requests and flags resume (Review Focus #4)', () => {
  const id = newReq();
  const ref = useDemo.getState().flagQuestion('Can I remove the wall?', 'structural');
  // app restarted: no timers exist, state was persisted
  resumeSimulations();
  jest.advanceTimersByTime(SIM.teamReplyMs);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === id)).toHaveLength(2);
  expect(useDemo.getState().flags.find((f) => f.ref === ref)?.replied).toBe(true);
});

test('team reply is delivered once', () => {
  const ref = useDemo.getState().flagQuestion('Is it load-bearing?', 'structural');
  simulateTeamReply(ref); simulateTeamReply(ref);
  jest.advanceTimersByTime(SIM.teamReplyMs);
  expect(useDemo.getState().messages.filter((m) => m.threadId === 'team' && m.text?.includes('load-bearing'))).toHaveLength(1);
});
