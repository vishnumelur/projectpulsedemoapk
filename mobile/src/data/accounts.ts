import type { PhotoKey } from '@/theme/photos';

export type PortalRole = 'client' | 'expert';
export interface DemoAccount { role: PortalRole; name: string; email: string; tag: string; photo: PhotoKey }

/** The sealed demo's two sign-ins. The credentials decide the portal: Sara only ever sees the client app, Omar the engineer portal. */
export const DEMO_PASSWORD = 'pulse2026';
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'client', name: 'Sara Al Mansoori', email: 'sara@projectpulse.ae', tag: 'Client', photo: 'sara' },
  { role: 'expert', name: 'Omar Haddad', email: 'omar@projectpulse.ae', tag: 'Engineer', photo: 'omar' },
];
export const accountFor = (role: PortalRole) => DEMO_ACCOUNTS.find((a) => a.role === role)!;
