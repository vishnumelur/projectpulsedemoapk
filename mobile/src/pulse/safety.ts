import type { FlagCategory } from '@/data/types';

const RULES: [FlagCategory, RegExp][] = [
  ['structural', new RegExp([
    String.raw`\b(remove|removing|demolish\w*|knock(?:ing)?\s*(?:it\s+)?down|cut(?:ting)?|move|moving|open(?:ing)?\s+up)\b[^?.!]*\b(wall|walls|column|columns|beam|beams|slab|slabs)\b`,
    String.raw`\bload[-\s]?bearing\b`,
    String.raw`\b(crack|cracks|cracking|cracked)\b[^?.!]*\b(wall|column|beam|slab|foundation)s?\b`,
    String.raw`\b(add|adding|another|extra)\s+(an?\s+)?(floor|storey|story|level)\b`,
  ].join('|'), 'i')],
  ['legal', /\b(lawsuit|sue|suing|court|legal action|breach of contract|contract dispute|terminat\w*\s+(?:the\s+|my\s+|our\s+)?contract|penalt(?:y|ies)|arbitration|permit violation|without (?:a )?permit)\b/i],
  ['safety', /\b(collaps\w*|fire|smoke|gas leak|smell(?:s|ing)?\s+(?:of\s+)?gas|electrocut\w*|electric(?:al)?\s+shock|exposed\s+wires?|sparking|unsafe|dangerous|injur(?:y|ed|ies))\b/i],
];

/** Code-level rule (client requirement): structural/legal/safety questions never reach the answer engine. */
export function classifySafety(question: string): FlagCategory | null {
  const q = (question ?? '').normalize('NFKC');
  if (!q.trim()) return null;
  for (const [cat, re] of RULES) if (re.test(q)) return cat;
  return null;
}
