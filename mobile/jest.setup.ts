import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
require('react-native-reanimated').setUpTests();
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-native-masked-view/masked-view', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: ({ children }: any) => require('react').createElement(View, null, children) };
});
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(), impactAsync: jest.fn(), notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' }, NotificationFeedbackType: { Success: 'success' } }));
const mockFx = (name: string) => () => {
  const { View } = require('react-native');
  const C = (p: any) => require('react').createElement(View, { testID: name }, p.children);
  return { __esModule: true, [name]: C, default: C };
};
jest.mock(__dirname + '/src/fx/Orb', () => {
  const { View } = require('react-native');
  const C = (p: any) => require('react').createElement(View, { testID: 'Orb' }, p.children);
  return { __esModule: true, Orb: C, Halo: () => null, default: C };
}, { virtual: true });
jest.mock('@/fx/Aurora', () => mockFx('Aurora')(), { virtual: true });
jest.mock(__dirname + '/src/fx/IridescentBorder', () => mockFx('IridescentBorder')(), { virtual: true });
jest.mock(__dirname + '/src/fx/ProgressRing', () => mockFx('ProgressRing')(), { virtual: true });
jest.mock(__dirname + '/src/three/ModelView', () => mockFx('ModelView')(), { virtual: true });
jest.mock(__dirname + '/src/fx/GradientText', () => {
  const { Text } = require('react-native');
  const G = (p: any) => require('react').createElement(Text, null, p.children);
  return { __esModule: true, GradientText: G, default: G };
}, { virtual: true });
