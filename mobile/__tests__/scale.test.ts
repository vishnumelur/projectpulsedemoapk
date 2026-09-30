import { s, setScaleWidth, MOCK_W, scaleFactor } from '@/theme/scale';

test('the mockup screen width maps to the device width', () => {
  setScaleWidth(390);
  expect(scaleFactor()).toBeCloseTo(390 / 254, 5);
  expect(s(MOCK_W)).toBeCloseTo(390, 0);
  expect(s(20)).toBeCloseTo(30.7, 0);
});

test('zero stays zero and scaling is proportional on a small phone', () => {
  setScaleWidth(320);
  expect(s(0)).toBe(0);
  expect(s(127)).toBeCloseTo(160, 0);
});
