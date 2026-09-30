import type { Expert, Job, Message, Notice, Quote, Request, Slot, Thread, Flag, ChecklistKey, Stage, BuildingType } from './types';

export const EXPERTS: Expert[] = [
  { id: 'omar', name: 'Omar Haddad', first: 'Omar', role: 'Cost engineer', category: 'Engineers', years: 14, rating: 4.9, reviews: 128, jobs: 312,
    photo: 'omar', match: 96, areas: 'Abu Dhabi & Dubai', licence: 'AD-ENG-20417', services: [
      { id: 'bid-visit', name: 'Bid review + visit', note: 'Report in 3 days', price: 2200 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1800 },
      { id: 'boq', name: 'BOQ cost check', note: 'Report in 2 days', price: 1500 }] },
  { id: 'lina', name: 'Lina Karim', first: 'Lina', role: 'Structural', category: 'Engineers', years: 11, rating: 4.8, reviews: 96, jobs: 204,
    photo: 'lina', match: 91, areas: 'Abu Dhabi', licence: 'AD-ENG-18322', services: [
      { id: 'struct', name: 'Structural review', note: 'Report in 5 days', price: 1800 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1500 }] },
  { id: 'rashid', name: 'Rashid Al Amri', first: 'Rashid', role: 'Project manager', category: 'Engineers', years: 18, rating: 5.0, reviews: 61, jobs: 140,
    photo: 'rashid', match: 88, areas: 'Abu Dhabi & Al Ain', licence: 'AD-ENG-11045', services: [
      { id: 'pm', name: 'Project health check', note: 'Report in 2 days', price: 3500 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 2400 }] },
  { id: 'maya', name: 'Maya Suleiman', first: 'Maya', role: 'MEP engineer', category: 'Engineers', years: 9, rating: 4.7, reviews: 54, jobs: 97,
    photo: 'maya', match: 84, areas: 'Dubai', licence: 'DXB-ENG-30671', services: [
      { id: 'mep', name: 'MEP design review', note: 'Report in 4 days', price: 1600 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1300 }] },
  { id: 'karim', name: 'Karim Nasser', first: 'Karim', role: 'Architect', category: 'Architects', years: 12, rating: 4.9, reviews: 77, jobs: 150,
    photo: 'karim', match: 80, areas: 'Abu Dhabi', licence: 'AD-ARC-09213', services: [
      { id: 'design', name: 'Design review', note: 'Notes in 3 days', price: 2800 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1900 }] },
  { id: 'nadia', name: 'Nadia Farouk', first: 'Nadia', role: 'Interior designer', category: 'Interiors', years: 8, rating: 4.8, reviews: 43, jobs: 88,
    photo: 'nadia', match: 76, areas: 'Abu Dhabi & Dubai', licence: 'AD-INT-04418', services: [
      { id: 'concept', name: 'Interior concept', note: 'Moodboard in 5 days', price: 2500 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1200 }] },
];

/** Market average used for "N% below average price" (Quotes 13: 2,200 vs 2,500 = 12%). */
export const MARKET_AVG: Record<string, number> = { 'bid-review': 2500, 'soil-test': 2200 };

export const CLIENT = { name: 'Sara Al Mansoori', first: 'Sara', email: 'sara@almansoori.ae', photo: 'sara' as const };
export const PROJECT = { type: 'villa' as BuildingType, stage: 3 as Stage, name: 'Villa · Al Reem', place: 'Al Reem Island',
  budget: 2_400_000, committed: 1_630_000 };

export const BUDGET = [
  { name: 'Design & permits', amount: 180_000, pct: 1.0, color: '#0000FE' },
  { name: 'Structure', amount: 910_000, pct: 0.62, color: '#31D1FF' },
  { name: 'MEP', amount: 540_000, pct: 0.24, color: '#B9A8FF' },
];
export const MILESTONES = [
  { day: '12', month: 'MAR', title: 'Plot purchased', stage: 'Planning', status: 'done' as const },
  { day: '02', month: 'JUN', title: 'Permit approved', stage: 'Design', status: 'done' as const },
  { day: '20', month: 'OCT', title: 'Choose contractor', stage: 'Tender', status: 'next' as const },
  { day: '01', month: 'DEC', title: 'Construction starts', stage: 'Construction', status: 'planned' as const },
];
export const DOCS = [
  { name: 'Building permit.pdf', date: '2 Jun', size: '1.1 MB' },
  { name: 'Concept drawings.pdf', date: '18 May', size: '8.4 MB' },
  { name: 'Tender pack.pdf', date: '1 Oct', size: '3.2 MB' },
];
export const DECISIONS = [
  { day: '28', month: 'SEP', title: 'Shortlist 3 contractors', by: 'Sara' },
  { day: '14', month: 'AUG', title: 'Upgrade to solar-ready roof', by: 'Sara' },
];
export const SITE = [
  { photo: 'site1' as const, label: 'Today · Site visit', big: true },
  { photo: 'site2' as const, label: '2 Oct' },
  { photo: 'drawings' as const, label: 'Drawings · 2 Jun' },
];

export const T0 = 1_759_000_000_000; // fixed demo epoch so seed data is deterministic

export const SEED_REQUESTS: Request[] = [
  { id: 'req-soil', kbId: 'soil-test', title: 'Soil test report', summary: 'Soil investigation and geotechnical report for a 5-bed villa, needed before structural design. Within 2 weeks.',
    expertType: 'Geotechnical engineer', when: '2w', status: 'sent', createdAt: T0, clientName: 'Sara', place: 'Villa · Al Reem', distance: '2 km away' },
  { id: 'req-bid', kbId: 'bid-review', title: 'Bid review', summary: 'Review of 3 contractor bids for a 5-bedroom villa on Al Reem Island.',
    expertType: 'Cost engineer', when: '2w', status: 'booked', createdAt: T0, clientName: 'Sara', place: 'Villa · Al Reem', distance: '2 km away' },
  { id: 'req-boq', kbId: 'boq', title: 'BOQ cost check', summary: 'Check the bill of quantities for a retail fit-out.', expertType: 'Cost engineer',
    when: 'flex', status: 'sent', createdAt: T0, clientName: 'Khalid', place: 'Shop · Khalifa City', distance: '9 km away' },
];
export const SEED_QUOTES: Quote[] = [
  { id: 'q-omar', requestId: 'req-bid', expertId: 'omar', price: 2200, days: 3, visitIncluded: true, seen: false, createdAt: T0 },
  { id: 'q-lina', requestId: 'req-bid', expertId: 'lina', price: 2450, days: 5, visitIncluded: false, seen: false, createdAt: T0 },
  { id: 'q-rashid', requestId: 'req-bid', expertId: 'rashid', price: 3100, days: 2, visitIncluded: true, seen: true, createdAt: T0 },
];
export const SEED_JOBS: Job[] = [
  { id: 'job-1', requestId: 'req-bid', expertId: 'omar', serviceId: 'bid-visit', title: 'Bid review', slotId: 'thu-1000',
    dayLabel: 'Thu 9 Oct', timeLabel: '10:00', total: 2425.5, status: 'visit', due: 'Sun 12 Oct' },
];
export const SEED_NOTICES: Notice[] = [
  { id: 'n1', kind: 'quotes', title: 'New quotes', text: '2 experts quoted for your bid review.', at: T0 - 10 * 60e3, read: false, href: '/quotes', forRole: 'client' },
  { id: 'n2', kind: 'answered', title: 'Your question was answered', text: 'Rashid replied about the kitchen wall.', at: T0 - 2 * 3600e3, read: false, href: '/chat/team', forRole: 'client' },
  { id: 'n3', kind: 'payment', title: 'Payment held safely', text: 'AED 2,425.50 until you sign off.', at: T0 - 3 * 86400e3, read: false, href: '/job/job-1', forRole: 'client' },
];
export const SEED_THREADS: Thread[] = [
  { id: 'omar', title: 'Omar Haddad', kind: 'expert', expertId: 'omar', typing: true, unread: 2, preview: 'typing…', timeLabel: '11:42', forRole: 'client' },
  { id: 'team', title: 'Project Pulse team', kind: 'team', unread: 1, preview: 'Re: kitchen wall. Rashid replied', timeLabel: '09:15', forRole: 'client' },
  { id: 'lina', title: 'Lina Karim', kind: 'expert', expertId: 'lina', unread: 0, preview: 'Sent you a quote · AED 2,450', timeLabel: 'Mon', forRole: 'client' },
  { id: 'sara', title: 'Sara Al Mansoori', kind: 'expert', unread: 0, preview: 'Great, thanks! Is the access road OK?', timeLabel: '11:40', forRole: 'expert' },
];
export const SEED_MESSAGES: Message[] = [
  { id: 'm1', threadId: 'omar', from: 'them', text: 'Arrived on site. Checking the foundation area first.', at: T0 },
  { id: 'm2', threadId: 'omar', from: 'them', photo: 'site2', at: T0 + 1 },
  { id: 'm3', threadId: 'omar', from: 'me', text: 'Great, thanks! Is the access road OK for trucks?', at: T0 + 2 },
  { id: 'm4', threadId: 'omar', from: 'them', text: "Yes, it's wide enough. I'll note it in the report.", at: T0 + 3 },
  { id: 'm5', threadId: 'team', from: 'them', text: "Hi Sara, Rashid here. Please don't remove that wall yet — it may be load-bearing. I've booked a structural check for you; reply here with a good time.", at: T0 },
  { id: 'm6', threadId: 'lina', from: 'them', text: 'I can review the structure within 5 days. Quote sent: AED 2,450.', at: T0 },
];
export const SEED_FLAGS: Flag[] = [
  { ref: 'PP-2290', question: 'Can I remove the kitchen wall?', category: 'structural', at: T0 - 3 * 3600e3, replied: true },
];
export const SEED_SLOTS: Slot[] = [
  { id: 'thu-1000', day: 9, time: '10:00', state: 'booked', label: 'Sara · Bid review visit', sub: 'Al Reem Island', jobId: 'job-1' },
  { id: 'thu-1300', day: 9, time: '13:00', state: 'open' },
  { id: 'thu-1500', day: 9, time: '15:00', state: 'open' },
  { id: 'thu-1700', day: 9, time: '17:00', state: 'off' },
];
/** Client-facing booking slots for Omar on Thursday (14a). */
export const CLIENT_SLOTS = [
  { id: 'thu-0800', time: '08:00', free: true }, { id: 'thu-1000', time: '10:00', free: true }, { id: 'thu-1130', time: '11:30', free: true },
  { id: 'thu-1300', time: '13:00', free: false }, { id: 'thu-1500', time: '15:00', free: true }, { id: 'thu-1630', time: '16:30', free: true },
];
export const DAYS = [{ d: 'MON', n: 6, off: true }, { d: 'TUE', n: 7 }, { d: 'WED', n: 8 }, { d: 'THU', n: 9 }, { d: 'FRI', n: 10 }];
export const SEED_CHECKLIST: Record<ChecklistKey, boolean> = { licence: true, experience: true, services: false, areas: false, portfolio: false };
export const EARNINGS = { month: 'September', total: 18_400, trend: 12, weeks: [0.40, 0.62, 0.48, 0.92], withdrawable: 6200,
  payouts: [{ title: 'Bid review · Sara', when: 'Released 2 Oct', amount: 2090 }] };
export const FEE = 110; export const VAT_RATE = 0.05;
export const aed = (n: number, dp = 0) => `AED ${n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
