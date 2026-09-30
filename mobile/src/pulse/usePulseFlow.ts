import { useEffect, useMemo, useRef, useState } from 'react';
import { askPulse, PulseResult } from './match';
import { useDemo } from '@/store/demo';
import { simulateTeamReply } from '@/sim/scheduler';
import type { Stage } from '@/data/types';

export type PulseState = 'open' | 'ask' | 'thinking' | 'answer' | 'flagged' | 'fallback';
export function usePulseFlow(initial: { state?: string; q?: string; stay?: string }) {
  const projectType = useDemo((s) => s.projectType); const projectStage = useDemo((s) => s.stage);
  const [askStage, setAskStage] = useState<Stage>(initial.state === 'ask' ? 2 : projectStage);
  const [q, setQ] = useState(initial.q ?? '');
  const [state, setState] = useState<PulseState>(() => {
    const s0 = (initial.state as PulseState) ?? 'open';
    if ((s0 === 'answer' || s0 === 'flagged') && initial.q) { const r = askPulse(initial.q, { stage: projectStage, projectType }); return r.kind === 'answer' ? 'answer' : r.kind === 'flagged' ? 'flagged' : 'fallback'; }
    return s0;
  });
  const result: PulseResult | null = useMemo(() => (q ? askPulse(q, { stage: askStage, projectType }) : null), [q, askStage, projectType]);
  const flagged = useRef(false);
  useEffect(() => {
    if (state !== 'thinking' || initial.stay) return;
    const t = setTimeout(() => setState(result?.kind === 'answer' ? 'answer' : result?.kind === 'flagged' ? 'flagged' : 'fallback'), 1800);
    return () => clearTimeout(t);
  }, [state, result, initial.stay]);
  useEffect(() => {
    if (state === 'flagged' && result?.kind === 'flagged' && !flagged.current) {
      flagged.current = true; const ref = useDemo.getState().flagQuestion(q, result.category); simulateTeamReply(ref);
    }
  }, [state]);
  const submit = (text: string) => { const t = text.trim(); if (!t) return; setQ(t); setState('thinking'); };
  return { state, setState, q, setQ, submit, result, askStage, setAskStage, projectType };
}
