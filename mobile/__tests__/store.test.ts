import { useDemo, bestQuote, newQuotesFor, expertRequests } from '@/store/demo';

beforeEach(() => useDemo.getState().resetDemo());

test('seed matches the approved references', () => {
  const s = useDemo.getState();
  expect(newQuotesFor(s, 'req-bid')).toHaveLength(2);
  expect(bestQuote(s, 'req-bid')?.expertId).toBe('omar');
  expect(s.jobs[0].total).toBe(2425.5);
});

test('a client request appears in the expert Requests (cross-role link) and the expert quote comes back', () => {
  const id = useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report',
    summary: 'Soil investigation…', expertType: 'Geotechnical engineer', when: '2w' });
  expect(expertRequests(useDemo.getState()).map((r) => r.id)).toContain(id);
  useDemo.getState().sendQuote(id, 1900, 5);
  const q = useDemo.getState().quotes.find((q) => q.requestId === id && q.expertId === 'omar');
  expect(q?.price).toBe(1900);
  expect(useDemo.getState().notifications.some((n) => n.forRole === 'client' && n.kind === 'quotes')).toBe(true);
});

test('sending the same request twice in a row does not duplicate it (Review Focus #3)', () => {
  const before = useDemo.getState().requests.length;
  const a = useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report', summary: 'x', expertType: 'Geotechnical engineer', when: '2w' });
  const b = useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report', summary: 'x', expertType: 'Geotechnical engineer', when: '2w' });
  expect(b).toBe(a);
  expect(useDemo.getState().requests).toHaveLength(before + 1);
});

test('paying twice for the same expert and slot creates one job (Review Focus #3)', () => {
  const j1 = useDemo.getState().bookAndPay({ expertId: 'omar', serviceId: 'bid-visit', slotId: 'thu-1000' });
  const j2 = useDemo.getState().bookAndPay({ expertId: 'omar', serviceId: 'bid-visit', slotId: 'thu-1000' });
  expect(j2).toBe(j1);
  expect(useDemo.getState().jobs.filter((j) => j.expertId === 'omar' && j.slotId === 'thu-1000')).toHaveLength(1);
});

test('job lifecycle: complete → report notice → approve → review', () => {
  const s = useDemo.getState();
  s.completeJob('job-1');
  expect(useDemo.getState().jobs[0].status).toBe('report');
  expect(useDemo.getState().notifications.some((n) => n.kind === 'report')).toBe(true);
  useDemo.getState().approveJob('job-1');
  useDemo.getState().submitReview('job-1', 5, ['On time']);
  expect(useDemo.getState().jobs[0].status).toBe('reviewed');
});

test('flagged questions get sequential references and a later team reply', () => {
  const ref = useDemo.getState().flagQuestion('Can I remove the wall?', 'structural');
  expect(ref).toBe('PP-2291');
  useDemo.getState().teamReplied(ref);
  expect(useDemo.getState().flags.find((f) => f.ref === ref)?.replied).toBe(true);
});

test('resetDemo restores the seed', () => {
  useDemo.getState().setRole('expert');
  useDemo.getState().resetDemo();
  expect(useDemo.getState().role).toBeNull();
  expect(useDemo.getState().quotes).toHaveLength(3);
});
