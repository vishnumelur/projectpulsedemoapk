import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export type IconName = 'home' | 'proj' | 'exp' | 'inbox' | 'req' | 'jobs' | 'earn' | 'mic' | 'send' | 'search' | 'chev'
  | 'cal' | 'shield' | 'shieldCheck' | 'check' | 'mail' | 'edit' | 'chat' | 'swap' | 'arrowR' | 'eye' | 'eyeOff';

export function Icon({ name, size = 18, color = C.navy, stroke = 1.9 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<IconName, React.JSX.Element> = {
    home: <Path {...p} d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />,
    proj: <><Path {...p} d="M12 3 3 8l9 5 9-5-9-5z" /><Path {...p} d="M3 12.5l9 5 9-5" /><Path {...p} d="M3 17l9 5 9-5" /></>,
    exp: <><Circle {...p} cx={9} cy={8} r={3.5} /><Path {...p} d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><Path {...p} d="M16 4.5a3.5 3.5 0 0 1 0 7" /><Path {...p} d="M18.5 14.8c1.6.8 2.7 2.6 3 5.2" /></>,
    inbox: <Path {...p} d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.5-4.6A8.5 8.5 0 1 1 20.5 12z" />,
    chat: <Path {...p} d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.5-4.6A8.5 8.5 0 1 1 20.5 12z" />,
    req: <><Rect {...p} x={4} y={3.5} width={16} height={17} rx={2.5} /><Path {...p} d="M8 9h8M8 13h8M8 17h5" /></>,
    jobs: <><Rect {...p} x={3} y={7} width={18} height={13} rx={2.5} /><Path {...p} d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><Path {...p} d="M3 13h18" /></>,
    earn: <Path {...p} d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
    mic: <><Rect {...p} x={9} y={3} width={6} height={11} rx={3} /><Path {...p} d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
    send: <Path {...p} d="M12 19V5M5 12l7-7 7 7" />,
    search: <><Circle {...p} cx={11} cy={11} r={7} /><Path {...p} d="M20 20l-3.5-3.5" /></>,
    chev: <Path {...p} d="M6 9l6 6 6-6" />,
    cal: <><Rect {...p} x={3.5} y={5} width={17} height={15.5} rx={2.5} /><Path {...p} d="M3.5 10h17M8 3v4M16 3v4" /></>,
    shield: <Path {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    shieldCheck: <><Path {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><Path {...p} d="M8.5 12l2.5 2.5 4.5-4.5" /></>,
    check: <Path {...p} d="M5 12.5l4.5 4.5L19 7.5" />,
    mail: <><Rect {...p} x={3} y={5} width={18} height={14} rx={2.5} /><Path {...p} d="M3.5 6.5l8.5 6 8.5-6" /></>,
    edit: <Path {...p} d="M4 20h4L19 9l-4-4L4 16z" />,
    swap: <Path {...p} d="M7 7h11l-3-3M17 17H6l3 3" />,
    eye: <><Path {...p} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><Circle {...p} cx={12} cy={12} r={3} /></>,
    eyeOff: <><Path {...p} d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.9C4 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3" /><Path {...p} d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><Path {...p} d="M3.5 3.5l17 17" /></>,
    arrowR: <Path {...p} d="M5 12h14M13 6l6 6-6 6" />,
  };
  return <Svg width={s(size)} height={s(size)} viewBox="0 0 24 24">{d[name]}</Svg>;
}
