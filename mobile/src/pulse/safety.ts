import type { FlagCategory } from '@/data/types';

const RULES: [FlagCategory, RegExp][] = [
  ['structural', new RegExp([
    String.raw`\b(remove|removing|demolish\w*|tear(?:ing)?\s+down|take\s+out|taking\s+out|knock(?:ing)?\s*(?:it\s+)?(?:down|through)|break(?:ing)?\s+(?:down|through)|drill\w*|hack\w*|dismantl\w*|cut(?:ting)?|move|moving|open(?:ing)?\s+up)\b[^?.!]*\b(wall|walls|column|columns|beam|beams|slab|slabs|partition|partitions|ceiling|ceilings|lintel|lintels|balcony|balconies|roof|foundation|foundations|pillar|pillars)\b`,
    String.raw`\bload[-\s]?bearing\b`,
    String.raw`\b(crack\w*|sag\w*|settl\w*|bulg\w*|tilt\w*|leaning)\b[^?.!]*\b(wall|column|beam|slab|partition|ceiling|lintel|balcony|roof|foundation|pillar)s?\b`,
    String.raw`\b(wall|column|beam|slab|partition|ceiling|lintel|balcony|roof|foundation|pillar)s?\b[^?.!]*\b(crack\w*|sag\w*|settl\w*|bulg\w*|tilt\w*|leaning)\b`,
    String.raw`\b(add|adding|another|extra)\s+(an?\s+)?(floor|storey|story|level)\b`,
  ].join('|'), 'i')],
  ['legal', /\b(lawsuit|sue|suing|court|legal action|legal dispute|lawyer|solicitor|liability|liable|compensation|enforceable|breach of contract|contract dispute|terminat\w*\s+(?:the\s+|my\s+|our\s+)?contract|penalt(?:y|ies)|arbitration|permit violation|without (?:a )?permit)\b|\bcontract\b[^?.!]*\blegal\b/i],
  ['safety', /\b(collaps\w*|fire|smoke|gas leak|smell(?:s|ing)?\s+(?:of\s+)?gas|electrocut\w*|electric(?:al)?\s+shock|exposed\s+wires?|sparking|unsafe|dangerous|injur(?:y|ed|ies)|risk of (?:falling|collapse))\b|\bis\s+(?:[\w']+\s+){0,3}(?:safe|stable)\b/i],
];

/** Code-level rule (client requirement): structural/legal/safety questions never reach the answer engine. */
export function classifySafety(question: string): FlagCategory | null {
  const q = (question ?? '').normalize('NFKC');
  if (!q.trim()) return null;
  for (const [cat, re] of RULES) if (re.test(q)) return cat;
  return null;
}
