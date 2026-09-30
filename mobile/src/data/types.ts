import type { PhotoKey } from '@/theme/photos';

export type Stage = 1 | 2 | 3 | 4 | 5 | 6;
export const STAGES = ['Planning', 'Design', 'Tender', 'Contractor', 'Construction', 'Handover'] as const;
export const STAGE_DESC = ['Budget, plot and feasibility', 'Drawings and permits', 'Collecting contractor bids',
  'Choosing who builds it', 'Work under way on site', 'Finishing and moving in'] as const;
export const NEXT_STEP = ['Set your budget', 'Finalise your drawings', 'Choose a contractor', 'Sign the contract',
  'Book a site visit', 'Book a snagging inspection'] as const;

export type BuildingType = 'villa' | 'shop' | 'tower' | 'factory' | 'reno';
export const BUILDINGS: { id: BuildingType; name: string; sub: string }[] = [
  { id: 'villa', name: 'Villa', sub: 'Private residence' },
  { id: 'shop', name: 'Shop', sub: 'Retail & F&B' },
  { id: 'tower', name: 'Tower', sub: 'Residential or commercial' },
  { id: 'factory', name: 'Factory', sub: 'Industrial & warehouse' },
  { id: 'reno', name: 'Renovation', sub: 'Upgrade an existing property' },
];

export type ExpertCategory = 'Engineers' | 'Architects' | 'Interiors' | 'Contractors';
export interface Service { id: string; name: string; note: string; price: number }
export interface Expert {
  id: string; name: string; first: string; role: string; category: ExpertCategory; years: number; rating: number;
  reviews: number; jobs: number; photo: PhotoKey; match: number; areas: string; licence: string; services: Service[];
}
export type RequestStatus = 'sent' | 'quoted' | 'booked';
export interface Request { id: string; kbId: string; title: string; summary: string; expertType: string; when: 'asap' | '2w' | 'flex';
  status: RequestStatus; createdAt: number; clientName: string; place: string; distance: string }
export interface Quote { id: string; requestId: string; expertId: string; price: number; days: number; visitIncluded: boolean; seen: boolean; createdAt: number }
export type JobStatus = 'booked' | 'visit' | 'report' | 'approved' | 'reviewed';
export interface Job { id: string; requestId: string; expertId: string; serviceId: string; title: string; slotId: string; dayLabel: string;
  timeLabel: string; total: number; status: JobStatus; due: string }
export interface Notice { id: string; kind: 'quotes' | 'answered' | 'payment' | 'report' | 'request' | 'quoteSent';
  title: string; text: string; at: number; read: boolean; href: string; forRole: 'client' | 'expert' }
export interface Message { id: string; threadId: string; from: 'me' | 'them'; text?: string; photo?: PhotoKey; at: number }
export interface Thread { id: string; title: string; kind: 'expert' | 'team'; expertId?: string; typing?: boolean; unread: number; preview: string; timeLabel: string; forRole: 'client' | 'expert' }
export type FlagCategory = 'structural' | 'legal' | 'safety';
export interface Flag { ref: string; question: string; category: FlagCategory; at: number; replied: boolean }
export interface Slot { id: string; day: number; time: string; state: 'booked' | 'open' | 'off'; label?: string; sub?: string; jobId?: string }
export type ChecklistKey = 'licence' | 'experience' | 'services' | 'areas' | 'portfolio';
