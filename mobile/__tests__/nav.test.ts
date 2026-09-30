import { nextRoute } from '@/nav/next';
import { GALLERY } from '@/nav/gallery';
import fs from 'fs'; import path from 'path';

test('routing after splash', () => {
  expect(nextRoute({ role: null, clientOnboarded: false, expertVerified: false })).toBe('/onboarding/welcome');
  expect(nextRoute({ role: 'client', clientOnboarded: false, expertVerified: false })).toBe('/onboarding/building');
  expect(nextRoute({ role: 'client', clientOnboarded: true, expertVerified: false })).toBe('/home');
  expect(nextRoute({ role: 'expert', clientOnboarded: false, expertVerified: false })).toBe('/expert-role');
  expect(nextRoute({ role: 'expert', clientOnboarded: true, expertVerified: true })).toBe('/pro');
});

test('gallery lists exactly the 39 approved screens', () => {
  const approved = fs.readdirSync(path.join(__dirname, '../../design/approved')).filter((f) => f.endsWith('.png') && f !== '3d-building-set.png').map((f) => f.replace('.png', ''));
  expect(GALLERY.map((g) => g.id).sort()).toEqual(approved.sort());
});
