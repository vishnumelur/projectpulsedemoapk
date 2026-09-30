function scaleAt(width: number) {
  let mod!: typeof import('@/theme/scale');
  jest.isolateModules(() => {
    jest.spyOn(require('react-native').Dimensions, 'get').mockReturnValue({ width, height: 844, scale: 3, fontScale: 1 });
    mod = require('@/theme/scale');
  });
  return mod;
}
afterEach(() => jest.restoreAllMocks());

test('the mockup screen width maps to the device width', () => {
  const { s, MOCK_W, scaleFactor } = scaleAt(390);
  expect(scaleFactor()).toBeCloseTo(390 / 254, 5);
  expect(s(MOCK_W)).toBeCloseTo(390, 0);
  expect(s(20)).toBeCloseTo(30.7, 0);
});

test('zero stays zero and scaling is proportional on a small phone', () => {
  const { s } = scaleAt(320);
  expect(s(0)).toBe(0);
  expect(s(127)).toBeCloseTo(160, 0);
});
