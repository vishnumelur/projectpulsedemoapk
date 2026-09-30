import type { BuildingType, FlagCategory, Stage } from '@/data/types';
import { BUILDINGS } from '@/data/types';
import { classifySafety } from './safety';
import { KB, KBEntry } from './kb';

export type PulseResult = { kind: 'flagged'; category: FlagCategory } | { kind: 'answer'; entry: KBEntry } | { kind: 'fallback'; stage: Stage };

export const SUGGESTIONS: Record<Stage, string[]> = {
  1: ['Is my budget realistic?', 'Do I need a plot survey?', 'Check my budget'],
  2: ['Do I need a soil test?', 'Review my drawings', 'Help with permits'],
  3: ['Review my 3 contractor bids', 'Book a site visit', 'Check my budget'],
  4: ['Help me choose a contractor', 'Review my contract', 'Check my budget'],
  5: ['Book a site inspection', 'Check the concrete pour', 'Check my budget'],
  6: ['Book a snagging inspection', 'What documents do I need?', 'Check my budget'],
};
/** Suggestion text → question sent to the engine. */
export const SUGGESTION_QUERY: Record<string, string> = {
  'Review my 3 contractor bids': 'review my contractor bids', 'Book a site visit': 'site visit', 'Check my budget': 'budget',
  'Review my drawings': 'design review drawings', 'Help with permits': 'permit',
};
export const STAGE_EXPERTS: Record<Stage, string[]> = {
  1: ['Cost engineer', 'Civil engineer'], 2: ['Architect', 'Geotechnical engineer'], 3: ['Cost engineer', 'Project manager'],
  4: ['Project manager', 'Cost engineer'], 5: ['Project manager', 'Structural engineer'], 6: ['Project manager', 'MEP engineer'],
};

export function tokenize(q: string): Set<string> {
  const words = (q ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/[\s-]+/).filter(Boolean);
  const out = new Set<string>();
  for (const w of words) { out.add(w); if (w.length > 3 && w.endsWith('s')) out.add(w.slice(0, -1)); }
  return out;
}

export function askPulse(question: string, ctx: { stage: Stage; projectType: BuildingType }): PulseResult {
  const category = classifySafety(question);
  if (category) return { kind: 'flagged', category };
  const words = tokenize(question);
  let best: KBEntry | null = null; let bestScore = 0;
  for (const e of KB) {
    let score = 0;
    for (const k of e.keywords) {
      const parts = k.split(/[\s-]+/);
      if (parts.every((p) => words.has(p))) score += parts.length > 1 ? 2 : 1;
    }
    if (!score) continue;
    if (e.stages.includes(ctx.stage)) score += 0.5;
    if (e.types.includes(ctx.projectType) && e.types.length < 5) score += 0.25;
    if (score > bestScore) { best = e; bestScore = score; }
  }
  return best ? { kind: 'answer', entry: best } : { kind: 'fallback', stage: ctx.stage };
}

export const renderBody = (e: KBEntry, type: BuildingType) =>
  e.body.replace('{type}', (BUILDINGS.find((b) => b.id === type)?.name ?? 'building').toLowerCase());
