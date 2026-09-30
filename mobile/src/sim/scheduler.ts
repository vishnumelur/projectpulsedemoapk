export const SIM = { quotesMs: 8000, teamReplyMs: 20000, reportMs: 4000 };

const timers = new Set<ReturnType<typeof setTimeout>>();
export function after(ms: number, fn: () => void) {
  const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
  timers.add(t);
  return () => { clearTimeout(t); timers.delete(t); };
}
export function cancelAll() { timers.forEach(clearTimeout); timers.clear(); }

const store = () => require('@/store/demo').useDemo.getState();
export function simulateQuotes(requestId: string) { after(SIM.quotesMs, () => store().receiveQuotes(requestId)); }
export function simulateTeamReply(ref: string) { after(SIM.teamReplyMs, () => store().teamReplied(ref)); }

/** Call once after the store rehydrates: re-arm anything that was waiting when the app closed. */
export function resumeSimulations() {
  const s = store();
  const { T0 } = require('@/data/seed'); // seeded requests (createdAt === T0) are part of the demo story and never auto-quote
  s.requests.filter((r: any) => r.status === 'sent' && r.clientName === 'Sara' && r.createdAt > T0).forEach((r: any) => simulateQuotes(r.id));
  s.flags.filter((f: any) => !f.replied).forEach((f: any) => simulateTeamReply(f.ref));
}
