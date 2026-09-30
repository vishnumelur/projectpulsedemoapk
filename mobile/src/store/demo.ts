import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as S from '@/data/seed';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, PortalRole } from '@/data/accounts';
import type { BuildingType, ChecklistKey, FlagCategory, Job, Notice, Quote, Request, Stage, Flag, Slot, Message, Thread } from '@/data/types';

type Role = 'client' | 'expert' | null;
export type Session = { role: PortalRole; email: string };
export type SignInResult = { ok: true; role: PortalRole } | { ok: false; error: string };
type NewRequest = { kbId: string; title: string; summary: string; expertType: string; when: Request['when'] };

export interface DemoState {
  role: Role; session: Session | null;
  /** Dev only: the screen gallery (and the fidelity capture that loads it) may open either portal without signing in. */
  devGallery: boolean;
  clientOnboarded: boolean; expertVerified: boolean;
  projectType: BuildingType; stage: Stage;
  requests: Request[]; quotes: Quote[]; jobs: Job[]; notifications: Notice[]; threads: Thread[]; messages: Message[];
  flags: Flag[]; slots: Slot[]; checklist: Record<ChecklistKey, boolean>; reviews: { jobId: string; stars: number; tags: string[] }[];
  withdrawable: number; payouts: typeof S.EARNINGS.payouts; banner: Notice | null;
  setRole(r: Role): void;
  signIn(email: string, password: string): SignInResult;
  signOut(): void;
  completeClientOnboarding(type: BuildingType, stage: Stage): void;
  sendRequest(r: NewRequest): string;
  receiveQuotes(requestId: string): void;
  acceptQuote(quoteId: string): void;
  bookAndPay(b: { expertId: string; serviceId: string; slotId: string }): string;
  completeJob(jobId: string): void; approveJob(jobId: string): void; submitReview(jobId: string, stars: number, tags: string[]): void;
  flagQuestion(question: string, category: FlagCategory): string; teamReplied(ref: string): void;
  pushNotice(n: Omit<Notice, 'id' | 'at' | 'read'>): void; dismissBanner(): void; markNoticesRead(role: 'client' | 'expert'): void;
  completeChecklist(k: ChecklistKey): void; verifyExpert(): void; toggleSlot(id: string): void;
  sendQuote(requestId: string, price: number, days: number): void; withdraw(): void;
  sendMessage(threadId: string, text: string): void;
  resetDemo(): void;
}

const seed = () => ({
  role: null as Role, session: null as Session | null, devGallery: false, clientOnboarded: false, expertVerified: false, projectType: S.PROJECT.type, stage: S.PROJECT.stage,
  requests: S.SEED_REQUESTS.map((r) => ({ ...r })), quotes: S.SEED_QUOTES.map((q) => ({ ...q })), jobs: S.SEED_JOBS.map((j) => ({ ...j })),
  notifications: S.SEED_NOTICES.map((n) => ({ ...n })), threads: S.SEED_THREADS.map((t) => ({ ...t })), messages: S.SEED_MESSAGES.map((m) => ({ ...m })),
  flags: S.SEED_FLAGS.map((f) => ({ ...f })), slots: S.SEED_SLOTS.map((s) => ({ ...s })), checklist: { ...S.SEED_CHECKLIST },
  reviews: [] as DemoState['reviews'], withdrawable: S.EARNINGS.withdrawable, payouts: [...S.EARNINGS.payouts], banner: null as Notice | null,
});

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const useDemo = create<DemoState>()(persist((set, get) => ({
  ...seed(),
  setRole: (role) => set({ role }),
  signIn: (email, password) => {
    const acct = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase());
    if (!acct) return { ok: false, error: 'No account with that email. Tap a demo account below.' };
    if (password !== DEMO_PASSWORD) return { ok: false, error: 'That password isn\'t right. Try again.' };
    set({ session: { role: acct.role, email: acct.email }, role: acct.role, devGallery: false, banner: null });
    return { ok: true, role: acct.role };
  },
  // Keeps the demo data (Sara's project, Omar's quotes) and the last role, so Sign in pre-selects the same account.
  signOut: () => set({ session: null, devGallery: false, banner: null }),
  completeClientOnboarding: (projectType, stage) => set({ projectType, stage, clientOnboarded: true }),

  sendRequest: (r) => {
    const dup = get().requests.find((x) => x.kbId === r.kbId && x.status === 'sent' && Date.now() - x.createdAt < 60_000);
    if (dup) return dup.id;
    const id = uid('req');
    const req: Request = { ...r, id, status: 'sent', createdAt: Date.now(), clientName: 'Sara', place: 'Villa · Al Reem', distance: '2 km away' };
    set((s) => ({ requests: [req, ...s.requests] }));
    get().pushNotice({ kind: 'request', title: `New request · ${r.title}`, text: 'From Sara · Villa, Al Reem Island', href: `/pro/request/${id}`, forRole: 'expert' });
    return id;
  },
  receiveQuotes: (requestId) => {
    const req = get().requests.find((r) => r.id === requestId);
    if (!req || req.status !== 'sent') return;
    const fresh: Quote[] = [
      { id: uid('q'), requestId, expertId: 'karim', price: 1900, days: 5, visitIncluded: true, seen: false, createdAt: Date.now() },
      { id: uid('q'), requestId, expertId: 'lina', price: 2300, days: 7, visitIncluded: false, seen: false, createdAt: Date.now() },
    ];
    set((s) => ({ quotes: [...fresh, ...s.quotes], requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'quoted' as const } : r)) }));
    get().pushNotice({ kind: 'quotes', title: 'New quotes', text: `2 experts quoted for your ${req.title.toLowerCase()}.`, href: `/quotes?request=${requestId}`, forRole: 'client' });
  },
  acceptQuote: (quoteId) => set((s) => ({ quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, seen: true } : q)) })),

  bookAndPay: ({ expertId, serviceId, slotId }) => {
    const existing = get().jobs.find((j) => j.expertId === expertId && j.slotId === slotId && j.status !== 'reviewed');
    if (existing) return existing.id;
    const ex = S.EXPERTS.find((e) => e.id === expertId)!; const sv = ex.services.find((x) => x.id === serviceId)!;
    const total = Math.round((sv.price + S.FEE) * (1 + S.VAT_RATE) * 100) / 100;
    const job: Job = { id: uid('job'), requestId: 'req-bid', expertId, serviceId, title: sv.name, slotId, dayLabel: 'Thu 9 Oct', timeLabel: S.CLIENT_SLOTS.find((c) => c.id === slotId)?.time ?? '10:00', total, status: 'booked', due: 'Sun 12 Oct' };
    set((s) => ({ jobs: [job, ...s.jobs] }));
    get().pushNotice({ kind: 'payment', title: 'Payment held safely', text: `AED ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} until you sign off.`, href: `/job/${job.id}`, forRole: 'client' });
    return job.id;
  },
  completeJob: (jobId) => {
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'report' as const } : j)) }));
    get().pushNotice({ kind: 'report', title: 'Report ready', text: 'Omar delivered your bid review.', href: `/report/${jobId}`, forRole: 'client' });
  },
  approveJob: (jobId) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'approved' as const } : j)) })),
  submitReview: (jobId, stars, tags) => set((s) => ({ reviews: [...s.reviews, { jobId, stars, tags }],
    jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'reviewed' as const } : j)) })),

  flagQuestion: (question, category) => {
    const n = Math.max(...get().flags.map((f) => Number(f.ref.slice(3)))) + 1;
    const ref = `PP-${n}`;
    set((s) => ({ flags: [...s.flags, { ref, question, category, at: Date.now(), replied: false }] }));
    return ref;
  },
  teamReplied: (ref) => {
    const f = get().flags.find((x) => x.ref === ref);
    if (!f || f.replied) return;
    set((s) => ({ flags: s.flags.map((x) => (x.ref === ref ? { ...x, replied: true } : x)),
      messages: [...s.messages, { id: uid('m'), threadId: 'team', from: 'them' as const, text: `Hi Sara, Rashid here about "${f.question}". I'll call you today to go through it safely.`, at: Date.now() }],
      threads: s.threads.map((t) => (t.id === 'team' ? { ...t, unread: t.unread + 1, preview: `Re: ${f.question}` } : t)) }));
    get().pushNotice({ kind: 'answered', title: 'Your question was answered', text: 'Rashid from Project Pulse replied.', href: '/chat/team', forRole: 'client' });
  },

  pushNotice: (n) => {
    const notice: Notice = { ...n, id: uid('n'), at: Date.now(), read: false };
    // Banners only for the signed-in portal: a quote that lands after log out waits in the inbox, never over Sign in.
    // (Pending sims keep running on purpose, so the demo story is intact at the next sign in.)
    set((s) => ({ notifications: [notice, ...s.notifications], banner: s.session?.role === n.forRole ? notice : s.banner }));
  },
  dismissBanner: () => set({ banner: null }),
  markNoticesRead: (role) => set((s) => ({ notifications: s.notifications.map((n) => (n.forRole === role ? { ...n, read: true } : n)) })),

  completeChecklist: (k) => set((s) => ({ checklist: { ...s.checklist, [k]: true } })),
  verifyExpert: () => set({ expertVerified: true }),
  toggleSlot: (id) => set((s) => ({ slots: s.slots.map((x) => (x.id === id && x.state !== 'booked' ? { ...x, state: x.state === 'open' ? 'off' as const : 'open' as const } : x)) })),
  sendQuote: (requestId, price, days) => {
    if (get().quotes.some((q) => q.requestId === requestId && q.expertId === 'omar')) return;
    set((s) => ({ quotes: [{ id: uid('q'), requestId, expertId: 'omar', price, days, visitIncluded: true, seen: false, createdAt: Date.now() }, ...s.quotes],
      requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'quoted' as const } : r)) }));
    get().pushNotice({ kind: 'quotes', title: 'New quote', text: `Omar quoted AED ${price.toLocaleString('en-US')}.`, href: `/quotes?request=${requestId}`, forRole: 'client' });
    get().pushNotice({ kind: 'quoteSent', title: 'Quote sent', text: 'Sara will be notified.', href: '/pro/requests', forRole: 'expert' });
  },
  withdraw: () => set((s) => ({ payouts: [{ title: 'Withdrawal to bank', when: 'Just now', amount: -s.withdrawable }, ...s.payouts], withdrawable: 0 })),
  sendMessage: (threadId, text) => set((s) => ({ messages: [...s.messages, { id: uid('m'), threadId, from: 'me' as const, text, at: Date.now() }] })),

  resetDemo: () => { require('@/sim/scheduler').cancelAll(); set(seed()); },
}), { name: 'pulse-demo-v1', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ ...s, banner: null }) }));

// ---------- selectors ----------
export const newQuotesFor = (s: DemoState, requestId: string) => s.quotes.filter((q) => q.requestId === requestId && !q.seen);
export const bestQuote = (s: DemoState, requestId: string) =>
  [...s.quotes.filter((q) => q.requestId === requestId)].sort((a, b) => a.price - b.price)[0];
export const expertRequests = (s: DemoState) => s.requests.filter((r) => r.status === 'sent');
export const expertById = (id: string) => S.EXPERTS.find((e) => e.id === id)!;
