// Static guard for the motion system (src/theme/motion.ts): no bounce, overshoot or pop anywhere in src/.
// Banned: springify(), ZoomIn*/ZoomOut*, Bounce*, ad-hoc spring configs (`damping:`), and withSpring() with any config
// other than SPRING / SPRING_SOFT imported from '@/theme/motion'.
import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '../src');
const MOTION = 'theme/motion.ts';

/** Files other agents are rebuilding right now (client Task 9 brief). Remove each entry once its rebuild merges. */
const PENDING = [
  'app/onboarding/welcome.tsx', 'app/onboarding/role.tsx', 'app/onboarding/signup.tsx',
  'app/(client)/(tabs)/profile.tsx',
  'app/(client)/_layout.tsx', /^app\/\(expert\)\/.*_layout\.tsx$/,
  /^store\//, /^three\//,
  'ui/DayStrip.tsx',
  // their day strips only (DayCell in book/index.tsx still springs with a local damping-14 config)
  'app/(client)/book/index.tsx', 'app/(expert)/pro/(tabs)/jobs.tsx', 'app/(expert)/pro/request/[id].tsx',
];
const pending = (rel: string) => PENDING.some((p) => (typeof p === 'string' ? p === rel : p.test(rel)));

/** Top-level arguments of the call whose '(' is at `open`. */
function callArgs(src: string, open: number): string[] {
  const args: string[] = []; let depth = 0; let cur = '';
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if ('([{'.includes(ch)) { depth++; if (depth === 1) continue; }
    if (')]}'.includes(ch)) { depth--; if (depth === 0) { args.push(cur.trim()); return args; } }
    if (ch === ',' && depth === 1) { args.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  return args;
}

export function motionViolations(src: string): string[] {
  const out: string[] = [];
  const lineOf = (i: number) => src.slice(0, i).split('\n').length;
  const scan = (re: RegExp, why: string) => { for (const m of src.matchAll(re)) out.push(`${lineOf(m.index!)}: ${why} (${m[0]})`); };
  scan(/\.springify\s*\(/g, 'springify() overshoots');
  scan(/\bZoom(In|Out)\w*/g, 'ZoomIn/ZoomOut pops');
  scan(/\bBounce\w*/g, 'Bounce* bounces');
  scan(/\bdamping\s*:/g, 'ad-hoc spring config: use SPRING / SPRING_SOFT');
  const imported = new Set<string>();
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'@\/theme\/motion'/g)) m[1].split(',').forEach((n) => imported.add(n.trim()));
  for (const m of src.matchAll(/\bwithSpring\s*\(/g)) {
    const cfg = callArgs(src, m.index! + m[0].length - 1)[1];
    if (!cfg || !['SPRING', 'SPRING_SOFT'].includes(cfg) || !imported.has(cfg)) out.push(`${lineOf(m.index!)}: withSpring needs SPRING / SPRING_SOFT from '@/theme/motion' (got ${cfg ?? 'none'})`);
  }
  return out;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(d.name) ? [p] : [];
  });
}

test('the checker catches bouncy motion and accepts the house configs', () => {
  expect(motionViolations("x.entering = FadeInDown.springify().damping(16);")).toHaveLength(1);
  expect(motionViolations("<A entering={ZoomIn.delay(100)} /> <B entering={BounceIn} />")).toHaveLength(2);
  expect(motionViolations("v.value = withSpring(1, { damping: 30, stiffness: 200, overshootClamping: true });")).toHaveLength(2);
  expect(motionViolations("const SPRING = 1; v.value = withSpring(f(a, b), SPRING);")).toHaveLength(1); // a local SPRING doesn't count
  expect(motionViolations("import { SPRING, ease } from '@/theme/motion';\nv.value = withSpring(f(a, b), SPRING);")).toEqual([]);
});

test('src/ uses only the calm motion system (no springify, ZoomIn, Bounce, ad-hoc springs)', () => {
  const bad: string[] = [];
  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file).split(path.sep).join('/');
    if (rel === MOTION || pending(rel)) continue;
    for (const v of motionViolations(fs.readFileSync(file, 'utf8'))) bad.push(`src/${rel}:${v}`);
  }
  expect(bad).toEqual([]);
});
