import { classifySafety } from '@/pulse/safety';
import { askPulse, SUGGESTIONS } from '@/pulse/match';
import { KB } from '@/pulse/kb';

const ctx = { stage: 2 as const, projectType: 'villa' as const };

describe('safety gate (enforced in code)', () => {
  test.each([
    ['Can I remove the kitchen wall?', 'structural'], ['Is this wall load-bearing?', 'structural'],
    ['can we knock down the wall between rooms', 'structural'], ['There is a crack in the column', 'structural'],
    ['Can I add another floor?', 'structural'], ['My contractor wants to terminate the contract', 'legal'],
    ['Should I sue the builder?', 'legal'], ['I smell gas on site', 'safety'], ['exposed wires near the pool!!', 'safety'],
  ])('%s → %s', (q, cat) => expect(classifySafety(q)).toBe(cat));
  test.each(['Can I paint the kitchen wall?', 'What wall tiles should I choose?', 'Do I need a soil test?',
    'What does a bid review cost?', '', '   ', '🙂', 'هل أحتاج اختبار التربة؟'])('not flagged: %p', (q) => expect(classifySafety(q)).toBeNull());
});

describe('askPulse', () => {
  test('soil test at Design → geotechnical engineer (approved 9c copy)', () => {
    const r = askPulse('Do I need a soil test?', ctx);
    expect(r.kind).toBe('answer');
    if (r.kind === 'answer') {
      expect(r.entry.recommend.expertType).toBe('Geotechnical engineer');
      expect(r.entry.lead).toBe('Yes.');
      expect(r.entry.source).toBe('Project Pulse Villa Guide');
    }
  });
  test('case, punctuation and plurals do not matter', () => {
    const r = askPulse('DO I NEED SOIL TESTS???', ctx);
    expect(r.kind === 'answer' && r.entry.id).toBe('soil-test');
  });
  test('safety wins over a matching answer', () => {
    expect(askPulse('Can I remove a wall before the soil test?', ctx).kind).toBe('flagged');
  });
  test('unknown, empty, emoji or Arabic questions fall back gracefully (never throw)', () => {
    for (const q of ['asdf qwerty', '', '🙂🙂', 'هل أحتاج اختبار التربة؟']) expect(askPulse(q, ctx).kind).toBe('fallback');
  });
  test('stage breaks ties: "bids" at Tender → bid review', () => {
    const r = askPulse('Can someone check my bids?', { stage: 3, projectType: 'villa' });
    expect(r.kind === 'answer' && r.entry.id).toBe('bid-review');
  });
  test('KB has 20 entries, each with a recommendation and a source', () => {
    expect(KB).toHaveLength(20);
    for (const e of KB) { expect(e.source).toBeTruthy(); expect(e.recommend.count).toBeGreaterThan(0); }
  });
  test('Tender suggestions match the approved Pulse opening screen', () => {
    expect(SUGGESTIONS[3]).toEqual(['Review my 3 contractor bids', 'Book a site visit', 'Check my budget']);
  });
});
