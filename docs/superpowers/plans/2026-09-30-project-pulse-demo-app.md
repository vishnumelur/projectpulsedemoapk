# Project Pulse Demo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Project Pulse demo Android app (Expo, React Native) so that every approved screen is reproduced exactly, and ship it as a shareable APK.

**Architecture:**
- An Expo Router app lives in `mobile/`. Every screen is composed from a small, strictly scaled component library (`s()` = mockup px × windowWidth/254).
- All data lives in one persisted Zustand store, seeded with the demo story and driven by a tiny "simulated time" scheduler. The Pulse AI guide is a deterministic on-device engine with a code-level safety gate.
- 3D buildings are the approved three.js models rendered with react-three-fiber. The fluid orb, aurora and gradient effects are Skia.

**Tech Stack:**
- Expo SDK 57 (React Native 0.86, React 19.2) and Expo Router.
- Reanimated 4.5 + react-native-worklets, Gesture Handler 2.32, @shopify/react-native-skia 2.6.
- expo-gl + @react-three/fiber 9 + three 0.170.
- expo-blur, expo-haptics, expo-linear-gradient, @react-native-masked-view/masked-view, react-native-svg, expo-image.
- Zustand 5 + AsyncStorage.
- Jest (jest-expo) + React Native Testing Library, Playwright (fidelity capture), and EAS Build.

**Spec:** `docs/superpowers/specs/2026-09-30-project-pulse-demo-design.md`. Executors must read it, especially **§0 Fidelity contract**. The visual source of truth is `design/approved/*.png` plus `design/mockups/*.html`.

## Global Constraints

- **The mockup wins.** Every screen must match its `design/approved/<id>.png`: layout, spacing, copy (every word), colours, imagery and order. Nothing may be added or removed without the client's approval.
- **All sizes use `s(px)`:** `s(px) = px × windowWidth / 254`. Mockup px values come from `design/mockups/*.html`.
- Text never scales with system font size (`allowFontScaling={false}` in `T`).
- **Colours:**
  - Navy `#16205A`, Pulse Blue `#0000FE`, Cyan `#31D1FF`, Light Grey `#EAEAEA`, White `#FFFFFF`, app background `#F7F8FC`.
  - Brand gradient: `#31D1FF → #0000FE (55%) → #7A5CFF`.
- **Font:** Hanken Grotesk (300/400/500/600/700/800) via `@expo-google-fonts/hanken-grotesk`.
- **Primary button:** solid `#0000FE` with a blue glow. The gradient primary is used **only** on Review (16).
- **The animated orb appears only on Pulse (AI) moments:** the Ask bar, Pulse screens, "Written by Pulse", "Pulse summary", match hints, the stage-track current dot, and the onboarding and welcome moments shown in the references. Everywhere else uses the static brand gradient.
- **No particle-dissolve effect, no coloured screen-edge glow and no chat bubble** on the Pulse thinking screen.
- Install native modules only with `npx expo install` (Expo Go SDK 57 compatible versions). Never `npm i` a native module.
- **Offline only:** no network calls at runtime. All photos and fonts are bundled.
- **Pulse:** answers come only from `src/pulse/kb.ts`. Structural, legal and safety questions are routed by `classifySafety()` in code, before matching, to the Flagged screen (09d).
- **Demo identity:** client "Sara Al Mansoori" (`sara@almansoori.ae`), Villa at Al Reem Island, stage Tender (3 of 6). Expert "Omar Haddad", cost engineer, 14 years.
- **App id:** `com.projectpulse.demo`. Name: "Project Pulse".

## Review Focus

1. **Varied Pulse phrasing.** Upper case, punctuation, plurals, emoji, Arabic text or an empty question must return an answer or a graceful fallback, never a crash or blank screen. Tests are in Task 6.
2. **Safety gate precision.** "Can I paint the kitchen wall?" and "wall tiles" must *not* be flagged. "knock down the wall", "is it load-bearing" and "I smell gas" *must* be flagged. Tests are in Task 6.
3. **Double taps on money and request buttons.** Pressing Pay or Send request twice must not create duplicate jobs or requests. Tests are in Task 5 (store guards).
4. **Restart mid-flow.** Killing the app after "Send request" (before quotes arrive) or after a flagged question must still deliver the quotes or team reply on next launch. Tests are in Task 7.
5. **Reset demo while timers are pending.** No late quotes or replies may appear after a reset. Tests are in Task 7.

---

## File Structure (all paths relative to `mobile/` unless stated)

```
mobile/
  app.json, eas.json, package.json, tsconfig.json, jest.config.js, jest.setup.ts
  assets/photos/*.jpg                 bundled Unsplash photos (Task 2)
  assets/fallback/*.png               3D fallback stills (Task 8)
  assets/icon.png, adaptive-icon.png, splash.png (Task 22)
  public/canvaskit.wasm               Skia web runtime, for fidelity capture (Task 21)
  src/theme/scale.ts                  s(), setScaleWidth(), MOCK_W
  src/theme/tokens.ts                 C (colours), GRAD, F (fonts), EASE
  src/theme/photos.ts                 PHOTOS map (require())
  src/ui/T.tsx                        scaled text
  src/ui/Icon.tsx                     line icons (svg paths from mockups)
  src/ui/LogoMark.tsx                 Project Pulse mark (svg)
  src/ui/Glass.tsx, Btn.tsx, Chip.tsx, Avatar.tsx, Segmented.tsx, Dock.tsx, Header.tsx, Screen.tsx, PageDots.tsx, Sheet.tsx, LiveDot.tsx, InboxView.tsx, RequestCard.tsx
  src/ui/TabBar.tsx                   floating glass tab bar (client & expert)
  src/ui/NoticeBanner.tsx             in-app notification banner
  src/fx/geometry.ts                  pure blob math (tested)
  src/fx/Orb.tsx                      fluid iridescent blob (Skia)
  src/fx/Aurora.tsx                   drifting background glow (Skia)
  src/fx/GradientText.tsx             gradient / shimmer text
  src/fx/IridescentBorder.tsx         rotating conic border
  src/fx/ProgressRing.tsx             conic gradient ring
  src/fx/StageTrack.tsx               Home stage track
  src/data/types.ts                   domain types
  src/data/seed.ts                    demo story seed
  src/store/demo.ts                   Zustand store + actions (persisted)
  src/sim/scheduler.ts                simulated time
  src/pulse/safety.ts                 classifySafety()
  src/pulse/kb.ts                     knowledge base (20 entries)
  src/pulse/match.ts                  askPulse()
  src/three/textures.ts               DataTexture helpers (no DOM)
  src/three/models.ts                 approved models ported from design/3d/models.js
  src/three/Scene.tsx                 lights/camera/turntable/rise (shared)
  src/three/CanvasHost.tsx / CanvasHost.web.tsx
  src/three/ModelView.tsx             public 3D component
  src/app/...                         Expo Router routes (see Task 9)
  tools/fetch-photos.sh, tools/make_icons.py, tools/fidelity/capture.mjs, tools/fidelity/compare.py
  __tests__/...                       Jest tests
```

---

### Task 1: Scaffold the Expo app, git and test runner

**Files:**
- Create: `.gitignore` (repo root), `mobile/` (via create-expo-app)
- Create: `mobile/src/theme/scale.ts`, `mobile/jest.config.js`, `mobile/jest.setup.ts`
- Test: `mobile/__tests__/scale.test.ts`

**Interfaces:**
- Produces: `MOCK_W = 254`, `s(px:number):number`, `setScaleWidth(width:number):void`, `scaleFactor():number` from `@/theme/scale`. The path alias `@/*` points to `src/*`.

- [ ] **Step 1: Initialise git at the repo root**

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
git init
printf ".superpowers/\n.playwright-mcp/\nnode_modules/\nmobile/node_modules/\nmobile/.expo/\nmobile/dist/\n*.log\n" > .gitignore
git add .gitignore docs design && git commit -m "chore: design spec, approved references and mockups"
```

- [ ] **Step 2: Create the Expo app (SDK 57, default template)**

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
npx create-expo-app@latest mobile --template default@sdk-57
cd mobile
# remove the template's example routes/components wherever the template put them
rm -rf app src/app components src/components hooks src/hooks constants src/constants scripts
mkdir -p src/app src/theme src/ui src/fx src/data src/store src/sim src/pulse src/three __tests__ tools
```

Expected: `mobile/package.json` exists, with `"expo": "~57.0.x"`.

- [ ] **Step 3: Install native modules with Expo-compatible versions, then the JS-only libraries**

```bash
cd "/home/vmj/projects/Projectpulse appdemo/mobile"
npx expo install expo-router react-native-reanimated react-native-worklets react-native-gesture-handler \
  @shopify/react-native-skia expo-gl expo-blur expo-haptics expo-linear-gradient \
  @react-native-masked-view/masked-view react-native-svg expo-image expo-font @expo-google-fonts/hanken-grotesk \
  @react-native-async-storage/async-storage expo-asset expo-file-system react-native-safe-area-context \
  react-native-screens expo-splash-screen expo-status-bar expo-linking expo-constants react-native-web react-dom
npm i zustand@5 three@0.170.0 @react-three/fiber@9
npm i -D jest-expo jest @testing-library/react-native @types/jest @types/three
npx expo install --check
```

Expected: `npx expo install --check` prints "Dependencies are up to date" (or lists nothing to fix).

- [ ] **Step 4: Configure the entry point, path alias and Jest**

Set `"main": "expo-router/entry"` in `mobile/package.json`, and add these scripts: `"test": "jest"`, `"web": "expo start --web"`.

`mobile/tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": { "strict": true, "baseUrl": ".", "paths": { "@/*": ["./src/*"] } },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

`mobile/jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['/node_modules/', '/tools/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg|zustand|three|@react-three/.*))',
  ],
};
```

`mobile/jest.setup.ts` (visual-effect and 3D components are replaced with plain Views in tests; Task 4 and Task 8 test their pure logic separately):

```ts
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
require('react-native-reanimated').setUpTests();
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-native-masked-view/masked-view', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: ({ children }: any) => require('react').createElement(View, null, children) };
});
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(), impactAsync: jest.fn(), notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' }, NotificationFeedbackType: { Success: 'success' } }));
const fx = (name: string) => () => {
  const { View } = require('react-native');
  const C = (p: any) => require('react').createElement(View, { testID: name }, p.children);
  return { __esModule: true, [name]: C, default: C };
};
jest.mock('@/fx/Orb', () => {
  const { View } = require('react-native');
  const C = (p: any) => require('react').createElement(View, { testID: 'Orb' }, p.children);
  return { __esModule: true, Orb: C, Halo: () => null, default: C };
});
jest.mock('@/fx/Aurora', fx('Aurora'));
jest.mock('@/fx/IridescentBorder', fx('IridescentBorder'));
jest.mock('@/fx/ProgressRing', fx('ProgressRing'));
jest.mock('@/three/ModelView', fx('ModelView'));
jest.mock('@/fx/GradientText', () => {
  const { Text } = require('react-native');
  const G = (p: any) => require('react').createElement(Text, null, p.children);
  return { __esModule: true, GradientText: G, default: G };
});
```

If Jest reports a missing worklets native module, add `jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'))` to `jest.setup.ts`. Check the mock's path with `ls node_modules/react-native-worklets/src | grep -i mock`.

- [ ] **Step 5: Write the failing test for the scale helper**

`mobile/__tests__/scale.test.ts`:

```ts
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
```

- [ ] **Step 6: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/scale.test.ts`
Expected: FAIL, "Cannot find module '@/theme/scale'".

- [ ] **Step 7: Implement `src/theme/scale.ts`**

```ts
import { Dimensions, PixelRatio } from 'react-native';

/** Width in CSS px of the phone screen area in the approved mockups. */
export const MOCK_W = 254;

let k = Dimensions.get('window').width / MOCK_W;

export function setScaleWidth(width: number) { k = width / MOCK_W; }
export function scaleFactor() { return k; }
/** Convert a mockup px value to device dp. */
export function s(px: number) { return px === 0 ? 0 : PixelRatio.roundToNearestPixel(px * k); }
```

- [ ] **Step 8: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/scale.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
git add mobile && git commit -m "feat(mobile): scaffold Expo SDK 57 app, jest, scale helper"
```

---

### Task 2: Theme tokens, scaled text, fonts and bundled photos

**Files:**
- Create: `mobile/src/theme/tokens.ts`, `mobile/src/ui/T.tsx`, `mobile/src/theme/photos.ts`, `mobile/tools/fetch-photos.sh`
- Test: `mobile/__tests__/T.test.tsx`

**Interfaces:**
- Consumes: `s()` from Task 1.
- Produces:
  - `C` (colour map), `GRAD` (gradient colour tuple), `GRAD_LOC`, `F` (font family by weight), `EASE` from `@/theme/tokens`.
  - `T` from `@/ui/T`. Props: `size`, `w`, `c`, `ls` (em), `lh` (multiplier), `align`, plus all TextProps.
  - `PHOTOS` and `PhotoKey` from `@/theme/photos`.

- [ ] **Step 1: Download the photos used by the mockups into the app bundle**

`mobile/tools/fetch-photos.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/photos
get() { curl -fsSL "https://images.unsplash.com/photo-$2?w=$3&h=$4&fit=crop&crop=faces&q=80" -o "assets/photos/$1.jpg"; }
getw() { curl -fsSL "https://images.unsplash.com/photo-$2?w=$3&q=80" -o "assets/photos/$1.jpg"; }
get sara   1494790108377-be9c29b29330 400 400
get omar   1500648767791-00dcc994a43e 900 980
get lina   1573496359142-b8d87734a5a2 600 680
get rashid 1560250097-0b93528c311a 600 680
get maya   1544005313-94ddf0286df2 600 680
get karim  1507003211169-0a1dd7228f2d 600 680
get nadia  1438761681033-6461ffad8d80 600 680
getw site1    1541888946425-d81bb19240f5 900
getw site2    1504307651254-35680f356dfd 600
getw drawings 1503387762-592deb58ef4e 600
getw port1    1600596542815-ffad4c1539a9 600
getw port2    1512917774080-9991f1c4c750 600
getw port3    1565008447742-97f6f38c985c 600
echo "photos: $(ls assets/photos | wc -l)"
```

Run: `cd mobile && bash tools/fetch-photos.sh`
Expected: `photos: 13`.

- [ ] **Step 2: Write `src/theme/tokens.ts` and `src/theme/photos.ts`**

```ts
// src/theme/tokens.ts
import { Easing } from 'react-native-reanimated';

export const C = {
  navy: '#16205A', blue: '#0000FE', cyan: '#31D1FF', grey: '#EAEAEA', white: '#FFFFFF', bg: '#F7F8FC',
  mute: '#6B7196', faint: '#8A90B0', faint2: '#9AA0BD', faint3: '#B3B8CF', line: 'rgba(22,32,90,0.07)',
  lineSolid: '#E6E8F0', violet: '#7A5CFF', lilac: '#B9A8FF', green: '#119A55', greenDot: '#1EC26B',
  greenBg: '#E5F8EE', star: '#F5B301', tint: 'rgba(0,0,254,0.07)', inputBg: '#F4F5FA', track: '#E6E9F2',
  amber: '#D27B00',
} as const;

/** Brand gradient cyan → Pulse Blue → violet. */
export const GRAD = ['#31D1FF', '#0000FE', '#7A5CFF'] as const;
export const GRAD_LOC = [0, 0.55, 1] as const;
/** Orb conic colours (motion language v2). */
export const ORB = ['#0000FE', '#31D1FF', '#B9A8FF', '#6F7BFF', '#31D1FF', '#0000FE'];

export const F = {
  300: 'HankenGrotesk_300Light', 400: 'HankenGrotesk_400Regular', 500: 'HankenGrotesk_500Medium',
  600: 'HankenGrotesk_600SemiBold', 700: 'HankenGrotesk_700Bold', 800: 'HankenGrotesk_800ExtraBold',
} as const;

/** cubic-bezier(.22,1,.36,1) used everywhere in the mockups. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
```

```ts
// src/theme/photos.ts
export const PHOTOS = {
  sara: require('../../assets/photos/sara.jpg'), omar: require('../../assets/photos/omar.jpg'),
  lina: require('../../assets/photos/lina.jpg'), rashid: require('../../assets/photos/rashid.jpg'),
  maya: require('../../assets/photos/maya.jpg'), karim: require('../../assets/photos/karim.jpg'),
  nadia: require('../../assets/photos/nadia.jpg'), site1: require('../../assets/photos/site1.jpg'),
  site2: require('../../assets/photos/site2.jpg'), drawings: require('../../assets/photos/drawings.jpg'),
  port1: require('../../assets/photos/port1.jpg'), port2: require('../../assets/photos/port2.jpg'),
  port3: require('../../assets/photos/port3.jpg'),
} as const;
export type PhotoKey = keyof typeof PHOTOS;
```

- [ ] **Step 3: Write the failing test for `T`**

`mobile/__tests__/T.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { T } from '@/ui/T';
import { setScaleWidth, s } from '@/theme/scale';

test('T scales size, applies weight font and ignores system font scaling', () => {
  setScaleWidth(390);
  render(<T size={20} w={700} ls={-0.03}>Hello</T>);
  const el = screen.getByText('Hello');
  const st = StyleSheet.flatten(el.props.style);
  expect(st.fontSize).toBe(s(20));
  expect(st.fontFamily).toBe('HankenGrotesk_700Bold');
  expect(st.letterSpacing).toBeCloseTo(s(20 * -0.03), 3);
  expect(el.props.allowFontScaling).toBe(false);
});
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/T.test.tsx`
Expected: FAIL, "Cannot find module '@/ui/T'".

- [ ] **Step 5: Implement `src/ui/T.tsx`**

```tsx
import { Text, TextProps, TextStyle } from 'react-native';
import { C, F } from '@/theme/tokens';
import { s } from '@/theme/scale';

type W = 300 | 400 | 500 | 600 | 700 | 800;
export type TProps = TextProps & { size?: number; w?: W; c?: string; ls?: number; lh?: number; align?: TextStyle['textAlign'] };

/** Scaled text. size/ls/lh are the mockup CSS values (ls in em, lh as a multiplier). */
export function T({ size = 12, w = 400, c = C.navy, ls = 0, lh, align, style, ...rest }: TProps) {
  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[{ fontFamily: F[w], fontSize: s(size), color: c, letterSpacing: s(size * ls), textAlign: align },
        lh ? { lineHeight: s(size * lh) } : null, style]}
    />
  );
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/T.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/theme mobile/src/ui/T.tsx mobile/tools/fetch-photos.sh mobile/assets/photos mobile/__tests__/T.test.tsx
git commit -m "feat(mobile): theme tokens, scaled text, bundled photos"
```

---

### Task 3: UI primitives (icons, logo, glass, buttons, chips, avatar, segmented, dock, header, screen, page dots, sheet, tab bar)

**Files:**
- Create: `mobile/src/ui/{Icon,LogoMark,Glass,Btn,Chip,Avatar,Segmented,Dock,Header,Screen,PageDots,Sheet,TabBar}.tsx`
- Test: `mobile/__tests__/primitives.test.tsx`

**Interfaces:**
- Consumes: `s`, `C`, `GRAD`, `GRAD_LOC`, `T`, `PHOTOS`.
- Produces:
  - `Icon({name,size,color,stroke})`, where `IconName` = `'home'|'proj'|'exp'|'inbox'|'req'|'jobs'|'earn'|'mic'|'send'|'search'|'chev'|'cal'|'shield'|'shieldCheck'|'check'|'mail'|'edit'|'chat'|'swap'|'arrowR'`.
  - `LogoMark({size,color,animated?})`.
  - `Glass({r,style,children})`.
  - `Btn({title,onPress,variant?:'primary'|'gradient'|'black',disabled?,busy?,done?,style,textStyle,children})`.
  - `Chip({label,on?,onPress?,style})`.
  - `Avatar({photo,size,ring?:'white'|'gradient',style})`.
  - `Segmented({options:string[],value:number,onChange,style})`.
  - `Dock({children,bg?:'bg'|'white'|'none'})`.
  - `Header({back?:boolean,onBack?,center?,right?,style})`.
  - `Screen({bg?:'aurora'|'aurora3'|'white'|'white3'|'review'|'verified'|'plain'|'pulse',px?,children,overlay?})`.
  - `PageDots({count,index})`.
  - `Sheet({visible,onClose,children})`.
  - `TabBar(props)`: an expo-router `tabBar` renderer taking an `items` prop.

- [ ] **Step 1: Write the failing tests**

`mobile/__tests__/primitives.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Btn } from '@/ui/Btn';
import { Segmented } from '@/ui/Segmented';
import { Chip } from '@/ui/Chip';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() } }));

test('Btn fires once and ignores taps while busy', () => {
  const onPress = jest.fn();
  const { rerender } = render(<Btn title="Pay" onPress={onPress} />);
  fireEvent.press(screen.getByText('Pay'));
  expect(onPress).toHaveBeenCalledTimes(1);
  rerender(<Btn title="Pay" onPress={onPress} busy />);
  fireEvent.press(screen.getByTestId('btn'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('Segmented reports the tapped index', () => {
  const onChange = jest.fn();
  render(<Segmented options={['Messages', 'Updates · 3']} value={0} onChange={onChange} />);
  fireEvent.press(screen.getByText('Updates · 3'));
  expect(onChange).toHaveBeenCalledWith(1);
});

test('Chip toggles via onPress', () => {
  const onPress = jest.fn();
  render(<Chip label="On time" onPress={onPress} />);
  fireEvent.press(screen.getByText('On time'));
  expect(onPress).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `cd mobile && npx jest __tests__/primitives.test.tsx`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the primitives**

`src/ui/Icon.tsx`. The paths are copied from the mockups (24×24 line icons, round caps):

```tsx
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export type IconName = 'home' | 'proj' | 'exp' | 'inbox' | 'req' | 'jobs' | 'earn' | 'mic' | 'send' | 'search' | 'chev'
  | 'cal' | 'shield' | 'shieldCheck' | 'check' | 'mail' | 'edit' | 'chat' | 'swap' | 'arrowR';

export function Icon({ name, size = 18, color = C.navy, stroke = 1.9 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d: Record<IconName, JSX.Element> = {
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
    arrowR: <Path {...p} d="M5 12h14M13 6l6 6-6 6" />,
  };
  return <Svg width={s(size)} height={s(size)} viewBox="0 0 24 24">{d[name]}</Svg>;
}
```

`src/ui/LogoMark.tsx`. These are the two logo polygons used in every mockup (viewBox 100). When `animated` is set, the left piece slides in from the left, the right piece rises, and both lock together (splash):

```tsx
import Animated, { useSharedValue, withDelay, withTiming, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useEffect } from 'react';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

const AP = Animated.createAnimatedComponent(Path);
export function LogoMark({ size = 22, color = C.blue, animated = false }: { size?: number; color?: string; animated?: boolean }) {
  const a = useSharedValue(animated ? 0 : 1);
  const b = useSharedValue(animated ? 0 : 1);
  useEffect(() => {
    if (!animated) return;
    a.value = withTiming(1, { duration: 840, easing: EASE });
    b.value = withDelay(360, withTiming(1, { duration: 720, easing: EASE }));
  }, [animated]);
  const pa = useAnimatedProps(() => ({ opacity: a.value, transform: [{ translateX: -40 * (1 - a.value) }] } as any));
  const pb = useAnimatedProps(() => ({ opacity: b.value, transform: [{ translateY: 40 * (1 - b.value) }] } as any));
  return (
    <Svg width={s(size)} height={s(size)} viewBox="0 0 100 100">
      <AP animatedProps={pa} d="M0 100V22Q0 0 22 0H72V20L34 40V100Z" fill={color} />
      <AP animatedProps={pb} d="M50 100V50L72 39V100Z" fill={color} />
    </Svg>
  );
}
```

`src/ui/Glass.tsx`. On Android, the frosted look comes from a 66% white fill over the aurora (the mockup `.glass`). A real blur is added where available:

```tsx
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { s } from '@/theme/scale';

export function Glass({ r = 18, style, children, ...rest }: ViewProps & { r?: number }) {
  return (
    <View {...rest} style={[{ borderRadius: s(r), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)',
      backgroundColor: 'rgba(255,255,255,0.66)', shadowColor: '#16205A', shadowOpacity: 0.07, shadowRadius: s(12),
      shadowOffset: { width: 0, height: s(6) }, elevation: 2 }, style]}>
      {Platform.OS !== 'android' && <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}
```

`src/ui/Btn.tsx`. The primary button is 16 radius, 13 padding and 12.5/700 white text with a blue glow. A busy button ignores taps (Review Focus #3):

```tsx
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { s } from '@/theme/scale';
import { C, GRAD, GRAD_LOC } from '@/theme/tokens';
import { T } from './T';
import { Icon } from './Icon';

type Props = { title?: string; onPress?: () => void; variant?: 'primary' | 'gradient' | 'black'; disabled?: boolean; busy?: boolean;
  done?: boolean; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; children?: React.ReactNode };

export function Btn({ title, onPress, variant = 'primary', disabled, busy, done, style, textStyle, children }: Props) {
  const inactive = disabled || busy || done;
  const body = children ?? (busy ? <ActivityIndicator color="#fff" /> : done ? <Icon name="check" color="#fff" size={16} stroke={2.6} />
    : <T size={12.5} w={700} c={variant === 'black' ? '#fff' : '#fff'} align="center" style={textStyle}>{title}</T>);
  const base: ViewStyle = { borderRadius: s(16), paddingVertical: s(13), alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    opacity: disabled ? 0.45 : 1 };
  const glow: ViewStyle = variant === 'black' ? {} : { shadowColor: C.blue, shadowOpacity: 0.28, shadowRadius: s(12), shadowOffset: { width: 0, height: s(10) }, elevation: 6 };
  return (
    <Pressable testID="btn" disabled={inactive} onPress={() => { Haptics.selectionAsync(); onPress?.(); }}
      style={({ pressed }) => [base, glow, { backgroundColor: variant === 'black' ? '#000' : C.blue, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      {variant === 'gradient' && <LinearGradient colors={GRAD} locations={GRAD_LOC} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      <View>{body}</View>
    </Pressable>
  );
}
```

`src/ui/Chip.tsx`:

```tsx
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { T } from './T';

export function Chip({ label, on, onPress, style }: { label: string; on?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={[{ paddingVertical: s(7), paddingHorizontal: s(12), borderRadius: s(16), borderWidth: 1,
      borderColor: on ? C.navy : 'rgba(22,32,90,0.06)', backgroundColor: on ? C.navy : 'rgba(255,255,255,0.7)' }, style]}>
      <T size={10.5} w={600} c={on ? '#fff' : C.navy} numberOfLines={1}>{label}</T>
    </Pressable>
  );
}
```

`src/ui/Avatar.tsx`. The `gradient` ring is Review 16 (3px gradient padding plus a 3px white border). The `white` ring gives a 2px white ring and a soft shadow:

```tsx
import { View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PHOTOS, PhotoKey } from '@/theme/photos';
import { s } from '@/theme/scale';
import { GRAD } from '@/theme/tokens';

export function Avatar({ photo, size, ring, style }: { photo: PhotoKey; size: number; ring?: 'white' | 'gradient' | 'white4'; style?: StyleProp<ViewStyle> }) {
  const img = <Image source={PHOTOS[photo]} contentFit="cover" style={{ width: s(size), height: s(size), borderRadius: s(size) / 2 }} />;
  if (ring === 'gradient')
    return (
      <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[{ padding: s(3), borderRadius: s(size), shadowColor: '#0000FE', shadowOpacity: 0.2, shadowRadius: s(14), shadowOffset: { width: 0, height: s(12) }, elevation: 6 }, style]}>
        <View style={{ borderWidth: s(3), borderColor: '#fff', borderRadius: s(size) }}>{img}</View>
      </LinearGradient>
    );
  const bw = ring === 'white' ? 2 : ring === 'white4' ? 4 : 0;
  return (
    <View style={[{ borderRadius: s(size), borderWidth: s(bw), borderColor: '#fff', shadowColor: '#16205A', shadowOpacity: ring ? 0.15 : 0,
      shadowRadius: s(8), shadowOffset: { width: 0, height: s(6) }, elevation: ring ? 4 : 0 }, style]}>{img}</View>
  );
}
```

`src/ui/Segmented.tsx`. This is the mockup `.seg2`: track `rgba(22,32,90,.05)`, radius 12, padding 3, with a white active pill:

```tsx
import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { T } from './T';

export function Segmented({ options, value, onChange, style, track = 'rgba(22,32,90,0.05)' }:
  { options: string[]; value: number; onChange: (i: number) => void; style?: StyleProp<ViewStyle>; track?: string }) {
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: track, borderRadius: s(12), padding: s(3) }, style]}>
      {options.map((o, i) => (
        <Pressable key={o} onPress={() => onChange(i)} style={{ flex: 1, alignItems: 'center', paddingVertical: s(7), borderRadius: s(9),
          backgroundColor: i === value ? '#fff' : 'transparent', shadowColor: '#16205A', shadowOpacity: i === value ? 0.08 : 0, shadowRadius: s(4), elevation: i === value ? 1 : 0 }}>
          <T size={10.5} w={600} c={i === value ? C.navy : C.mute}>{o}</T>
        </Pressable>
      ))}
    </View>
  );
}
```

`src/ui/Dock.tsx`. This is the pinned bottom action area (mockup `.dock`: padding 14/20/20, fading background). It never overlaps content because screens reserve its height with `DOCK_SPACE`:

```tsx
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';

export const DOCK_SPACE = 96; // mockup px reserved at the bottom of scrollable content
export function Dock({ children, bg = 'bg', px = 20 }: { children: React.ReactNode; bg?: 'bg' | 'white' | 'none'; px?: number }) {
  const insets = useSafeAreaInsets();
  const c = bg === 'white' ? '255,255,255' : '247,248,252';
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: s(14), paddingHorizontal: s(px), paddingBottom: s(20) + insets.bottom, zIndex: 15 }}>
      {bg !== 'none' && <LinearGradient colors={[`rgba(${c},0)`, `rgba(${c},1)`, `rgba(${c},1)`]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />}
      {children}
    </View>
  );
}
```

`src/ui/Header.tsx`. This is the mockup `.hd` row. The back button is a 32px glass circle with "‹" at size 14, or a grey `#F4F5FA` circle on white Pulse screens:

```tsx
import { Pressable, View, StyleProp, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { Glass } from './Glass';
import { T } from './T';

export function BackButton({ onPress, flat, label = '‹' }: { onPress?: () => void; flat?: boolean; label?: string }) {
  const inner = <T size={label === '‹' ? 14 : 12} w={500} align="center">{label}</T>;
  const box = { width: s(32), height: s(32), borderRadius: s(16), alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <Pressable onPress={onPress ?? (() => router.back())} hitSlop={10}>
      {flat ? <View style={[box, { backgroundColor: C.inputBg }]}>{inner}</View> : <Glass r={16} style={box}>{inner}</Glass>}
    </Pressable>
  );
}

export function Header({ back = true, flat, onBack, center, right, style, pt = 6 }:
  { back?: boolean; flat?: boolean; onBack?: () => void; center?: React.ReactNode; right?: React.ReactNode; style?: StyleProp<ViewStyle>; pt?: number }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: s(pt) }, style]}>
      {back ? <BackButton onPress={onBack} flat={flat} /> : <View style={{ width: s(32) }} />}
      {center ?? <View />}
      {right ?? <View style={{ width: s(32) }} />}
    </View>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return <T size={9} w={700} ls={0.16} c={C.mute}>{children}</T>;
}
```

`src/ui/Screen.tsx`. This provides the background variant plus the top inset. The mockup status bar area is 30px, so content starts at `max(insets.top, s(30))`:

```tsx
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Aurora } from '@/fx/Aurora';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export type Bg = 'aurora' | 'aurora3' | 'white' | 'white3' | 'review' | 'verified' | 'plain' | 'pulse';
export function Screen({ bg = 'aurora', px = 20, children, overlay }: { bg?: Bg; px?: number; children: React.ReactNode; overlay?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const base = bg === 'white' || bg === 'white3' || bg === 'review' ? '#FFFFFF' : bg === 'pulse' ? '#FBFCFF' : C.bg;
  return (
    <View style={{ flex: 1, backgroundColor: base }}>
      <StatusBar style="dark" />
      {bg === 'review' && <LinearGradient colors={['#E9F7FF', '#EEF0FF', '#FFFFFF']} locations={[0, 0.28, 0.55]} style={StyleSheet.absoluteFill} />}
      {bg === 'verified' && <LinearGradient colors={['#E9F7FF', '#EEF0FF', C.bg]} locations={[0, 0.3, 0.6]} style={StyleSheet.absoluteFill} />}
      {(bg === 'aurora' || bg === 'aurora3' || bg === 'white3' || bg === 'pulse') && <Aurora three={bg !== 'aurora'} />}
      <View style={{ flex: 1, paddingTop: Math.max(insets.top, s(30)), paddingHorizontal: s(px) }}>{children}</View>
      {overlay}
    </View>
  );
}
```

`src/ui/PageDots.tsx`. Inactive dots are 5px `#CFD4E6`. The active dot is 16px wide and navy:

```tsx
import { View } from 'react-native';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
export function PageDots({ count, index, activeColor = C.navy }: { count: number; index: number; activeColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: s(5), justifyContent: 'center' }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: s(i === index ? 16 : 5), height: s(5), borderRadius: s(5), backgroundColor: i === index ? activeColor : '#CFD4E6' }} />
      ))}
    </View>
  );
}
```

`src/ui/Sheet.tsx`. This is the bottom sheet (mockup `.sheet`: radius 26 top, grab bar 36×4, padding 10/16/18) over a 25% navy dim:

```tsx
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(22,32,90,0.25)' }} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: s(26), borderTopRightRadius: s(26), paddingTop: s(10),
        paddingHorizontal: s(16), paddingBottom: s(18) + insets.bottom, shadowColor: '#16205A', shadowOpacity: 0.18, shadowRadius: s(20), elevation: 20 }}>
        <View style={{ width: s(36), height: s(4), borderRadius: s(4), backgroundColor: '#D3D7E6', alignSelf: 'center', marginBottom: s(12) }} />
        {children}
      </View>
    </Modal>
  );
}
```

`src/ui/TabBar.tsx`. This is the floating glass pill (left/right 12, bottom 12, height 54 in the batch-1/2 mockups, 60 in Home). Items use 20px icons and 8px labels. Blue marks the active item, `#A3A9C4` the inactive ones:

```tsx
import { Pressable, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { Glass } from './Glass';
import { Icon, IconName } from './Icon';
import { T } from './T';

export type TabItem = { route: string; label: string; icon: IconName; also?: string[] };
export function TabBar({ state, navigation, items }: BottomTabBarProps & { items: TabItem[] }) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index].name;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: s(12), right: s(12), bottom: s(12) + insets.bottom }}>
      <Glass r={27} style={{ height: s(54), flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        {items.map((it) => {
          const on = current === it.route || (it.also ?? []).includes(current);
          return (
            <Pressable key={it.route} onPress={() => navigation.navigate(it.route as never)} style={{ alignItems: 'center', gap: s(2), minWidth: s(40) }}>
              <Icon name={it.icon} size={20} color={on ? C.blue : '#A3A9C4'} />
              <T size={8} w={600} c={on ? C.blue : C.faint}>{it.label}</T>
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/primitives.test.tsx`
Expected: PASS (3 tests). (`Screen` imports `@/fx/Aurora`, which is mocked in `jest.setup.ts`. Create an empty placeholder `src/fx/Aurora.tsx` exporting `export function Aurora(_: { three?: boolean }) { return null; }` so TypeScript resolves it until Task 4 replaces it.)

- [ ] **Step 5: Commit**

```bash
git add mobile/src/ui mobile/src/fx/Aurora.tsx mobile/__tests__/primitives.test.tsx
git commit -m "feat(mobile): UI primitives (icons, glass, buttons, avatar, segmented, dock, header, screen, sheet, tab bar)"
```

---

### Task 4: Brand effects: blob orb, aurora, gradient/shimmer text, iridescent border, progress ring, stage track

**Files:**
- Create: `mobile/src/fx/geometry.ts`, `mobile/src/fx/{Orb,Aurora,GradientText,IridescentBorder,ProgressRing,StageTrack}.tsx`
- Test: `mobile/__tests__/geometry.test.ts`

**Interfaces:**
- Consumes: `s`, `C`, `GRAD`, `ORB`, `T`, `EASE`.
- Produces:
  - `blobRadius(theta:number,t:number):number` (a multiplier around 1) and `blobPoints(t,r,cx,cy,n=48):[number,number][]`.
  - `Orb({size, soft?, calm?, ring?, halo?, style})`: size in mockup px.
  - `Aurora({three?})`.
  - `GradientText({children,size,w,ls,lh,shimmer?,base?,colors?,style})`.
  - `IridescentBorder({r,children,style})`.
  - `ProgressRing({size,thickness,progress,children,spin?})`.
  - `StageTrack({stage})`.

- [ ] **Step 1: Write the failing geometry test**

`mobile/__tests__/geometry.test.ts`:

```ts
import { blobRadius, blobPoints } from '@/fx/geometry';

test('blob radius stays within ±13% of the base radius at all angles and times', () => {
  for (let t = 0; t < 20; t += 0.37) for (let a = 0; a < Math.PI * 2; a += 0.1) {
    const m = blobRadius(a, t);
    expect(m).toBeGreaterThan(0.87); expect(m).toBeLessThan(1.13);
  }
});

test('blob points form a closed ring around the centre', () => {
  const pts = blobPoints(1.2, 50, 100, 100, 48);
  expect(pts).toHaveLength(48);
  for (const [x, y] of pts) { const d = Math.hypot(x - 100, y - 100); expect(d).toBeGreaterThan(43); expect(d).toBeLessThan(57); }
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/geometry.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/fx/geometry.ts`**

```ts
/** Morphing blob edge as a radius multiplier. The three sine waves reproduce the mockup's slow border-radius morph. */
export function blobRadius(theta: number, t: number) {
  'worklet';
  return 1 + 0.06 * Math.sin(3 * theta + t * 0.9) + 0.04 * Math.sin(5 * theta - t * 1.3) + 0.03 * Math.sin(2 * theta + t * 0.5);
}
export function blobPoints(t: number, r: number, cx: number, cy: number, n = 48): [number, number][] {
  'worklet';
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r * blobRadius(a, t); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return pts;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/geometry.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement the Skia and animated effect components**

`src/fx/Orb.tsx`. This is the fluid iridescent blob from motion language v2: a slowly rotating conic gradient, a morphing edge, blur, a white core and an outer halo. `soft` gives the heavier blur used on the Pulse Ask, Thinking, Sent and Flagged screens. `calm` gives a slower, dimmer orb (Flagged). `ring` gives a blurred donut (Sent 10b). `halo` adds two expanding rings (Welcome and Building):

```tsx
import { Canvas, Circle, Group, Path, RadialGradient, SweepGradient, Blur, Skia, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { View, StyleProp, ViewStyle, AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { blobPoints } from './geometry';
import { ORB } from '@/theme/tokens';
import { s } from '@/theme/scale';

function useReduceMotion() {
  const [r, setR] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setR); }, []);
  return r;
}

export function Orb({ size, soft, calm, ring, style }: { size: number; soft?: boolean; calm?: boolean; ring?: boolean; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const clock = useClock();
  const D = s(size); const pad = D * 0.45; const W = D + pad * 2; const c = W / 2; const r = D / 2;
  const speed = reduce ? 0 : calm ? 0.28 : 0.55;
  const path = useDerivedValue(() => {
    const t = (clock.value / 1000) * speed;
    const pts = blobPoints(t, r * (ring ? 0.8 : 1), c, c, 48);
    const p = Skia.Path.Make();
    const mid = (i: number) => { const a = pts[i]; const b = pts[(i + 1) % pts.length]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    const m0 = mid(pts.length - 1); p.moveTo(m0[0], m0[1]);
    for (let i = 0; i < pts.length; i++) { const m = mid(i); p.quadTo(pts[i][0], pts[i][1], m[0], m[1]); }
    p.close();
    return p;
  });
  const rot = useDerivedValue(() => [{ rotate: ((clock.value / 1000) * speed * 1.05) % (Math.PI * 2) }]);
  const blur = D * (soft ? 0.11 : 0.05);
  return (
    <View style={[{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }, style]} pointerEvents="none">
      <Canvas style={{ position: 'absolute', width: W, height: W, left: -pad, top: -pad, opacity: calm ? 0.8 : 1 }}>
        <Circle cx={c} cy={c} r={r * 1.35}>
          <RadialGradient c={vec(c, c)} r={r * 1.35} colors={['rgba(49,209,255,0.35)', 'rgba(0,0,254,0.12)', 'rgba(0,0,254,0)']} positions={[0, 0.45, 1]} />
          <Blur blur={D * 0.08} />
        </Circle>
        <Group origin={vec(c, c)} transform={rot}>
          <Path path={path} style={ring ? 'stroke' : 'fill'} strokeWidth={r * 0.55}>
            <SweepGradient c={vec(c, c)} colors={ORB} />
            <Blur blur={blur} />
          </Path>
        </Group>
        {!ring && (
          <Circle cx={c} cy={c} r={r * 0.56}>
            <RadialGradient c={vec(c, c)} r={r * 0.56} colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']} />
            <Blur blur={3} />
          </Circle>
        )}
      </Canvas>
    </View>
  );
}

/** Two expanding rings around an orb (mockup .halo): 4s loop, the second offset by 2s. */
export function Halo({ size }: { size: number }) {
  const clock = useClock();
  const D = s(size) + s(32); const c = D / 2;
  const r1 = useDerivedValue(() => { const p = ((clock.value % 4000) / 4000); return (c - 2) * (0.8 + 0.55 * p); });
  const o1 = useDerivedValue(() => 1 - ((clock.value % 4000) / 4000));
  const r2 = useDerivedValue(() => { const p = (((clock.value + 2000) % 4000) / 4000); return (c - 2) * (0.8 + 0.55 * p); });
  const o2 = useDerivedValue(() => 1 - (((clock.value + 2000) % 4000) / 4000));
  return (
    <Canvas style={{ position: 'absolute', width: D * 1.4, height: D * 1.4, left: -s(16) - D * 0.2, top: -s(16) - D * 0.2 }} pointerEvents="none">
      <Group transform={[{ translateX: D * 0.2 }, { translateY: D * 0.2 }]}>
        <Circle cx={c} cy={c} r={r1} style="stroke" strokeWidth={1} color="rgba(0,0,254,0.14)" opacity={o1} />
        <Circle cx={c} cy={c} r={r2} style="stroke" strokeWidth={1} color="rgba(0,0,254,0.14)" opacity={o2} />
      </Group>
    </Canvas>
  );
}
export default Orb;
```

`src/fx/Aurora.tsx`. These are the drifting blurred glows from the mockup `.aur` (a-c cyan 42% top-right, a-b blue 18% top-left, a-v violet 22% mid when `three`):

```tsx
import { Canvas, Circle, Blur, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { s } from '@/theme/scale';

export function Aurora({ three }: { three?: boolean }) {
  const { width } = useWindowDimensions();
  const clock = useClock();
  const cxC = useDerivedValue(() => width - s(115) - s(35) * (0.5 - 0.5 * Math.cos((clock.value / 12000) * Math.PI * 2)));
  const cyC = useDerivedValue(() => s(40) + s(20) * (0.5 - 0.5 * Math.cos((clock.value / 12000) * Math.PI * 2)));
  const cxB = useDerivedValue(() => -s(10) + s(35) * (0.5 - 0.5 * Math.cos((clock.value / 14000) * Math.PI * 2)));
  const cyB = useDerivedValue(() => s(65) + s(25) * (0.5 - 0.5 * Math.cos((clock.value / 14000) * Math.PI * 2)));
  const cxV = useDerivedValue(() => s(135) + s(35) * (0.5 - 0.5 * Math.cos((clock.value / 16000) * Math.PI * 2)));
  const cyV = useDerivedValue(() => s(285) + s(25) * (0.5 - 0.5 * Math.cos((clock.value / 16000) * Math.PI * 2)));
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Circle cx={cxC} cy={cyC} r={s(110)} color="rgba(49,209,255,0.42)"><Blur blur={s(45)} /></Circle>
      <Circle cx={cxB} cy={cyB} r={s(98)} color="rgba(0,0,254,0.18)"><Blur blur={s(45)} /></Circle>
      {three && <Circle cx={cxV} cy={cyV} r={s(85)} color="rgba(185,168,255,0.22)"><Blur blur={s(45)} /></Circle>}
    </Canvas>
  );
}
export default Aurora;
```

`src/fx/GradientText.tsx`. Static gradient text (mockup `.grad-t`, `.grad`) or a shimmer sweep (mockup `.shim`: navy → cyan → blue → lilac → navy, 3.2s loop). `base` sets the resting colour (use `#9AA0BD` for `.shim.lt`):

```tsx
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { T, TProps } from '@/ui/T';
import { GRAD } from '@/theme/tokens';

type Props = TProps & { shimmer?: boolean; base?: string; colors?: readonly string[] };
export function GradientText({ shimmer, base = '#16205A', colors = GRAD, children, ...t }: Props) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  useEffect(() => { if (shimmer) x.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, false); }, [shimmer]);
  const band = useAnimatedStyle(() => ({ transform: [{ translateX: -w * 1.5 + x.value * w * 2.5 }] }));
  const text = <T {...t}>{children}</T>;
  return (
    <MaskedView maskElement={text} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {shimmer ? (
        <View style={{ backgroundColor: base }}>
          <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: w * 2.5 }, band]}>
            <LinearGradient colors={[base, '#31D1FF', '#0000FE', '#B9A8FF', base]} locations={[0.35, 0.45, 0.52, 0.58, 0.68]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
          </Animated.View>
          <T {...t} style={[t.style, { opacity: 0 }]}>{children}</T>
        </View>
      ) : (
        <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <T {...t} style={[t.style, { opacity: 0 }]}>{children}</T>
        </LinearGradient>
      )}
    </MaskedView>
  );
}
export default GradientText;
```

`src/fx/IridescentBorder.tsx`. This is a rotating conic 2px border plus a soft blurred glow at 35% (mockup `.irid`, 4s rotation):

```tsx
import { Canvas, RoundedRect, SweepGradient, Blur, Group, vec, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { useState } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { s } from '@/theme/scale';

export function IridescentBorder({ r, children, style }: { r: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const clock = useClock();
  const rot = useDerivedValue(() => [{ rotate: ((clock.value % 4000) / 4000) * Math.PI * 2 }]);
  const pad = s(18); const R = s(r);
  const c = vec(box.w / 2 + pad, box.h / 2 + pad);
  const colors = ['#0000FE', '#31D1FF', '#B9A8FF', '#0000FE'];
  return (
    <View style={style} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box.w > 0 && (
        <Canvas style={{ position: 'absolute', left: -pad, top: -pad, width: box.w + pad * 2, height: box.h + pad * 2 }} pointerEvents="none">
          <Group opacity={0.35}>
            <RoundedRect x={pad + s(6)} y={pad + s(6)} width={box.w - s(12)} height={box.h - s(12)} r={R}>
              <SweepGradient c={c} colors={colors} transform={rot} origin={c} />
              <Blur blur={s(16)} />
            </RoundedRect>
          </Group>
          <RoundedRect x={pad - s(1)} y={pad - s(1)} width={box.w + s(2)} height={box.h + s(2)} r={R + s(1)} style="stroke" strokeWidth={s(2)}>
            <SweepGradient c={c} colors={colors} transform={rot} origin={c} />
          </RoundedRect>
        </Canvas>
      )}
      {children}
    </View>
  );
}
export default IridescentBorder;
```

`src/fx/ProgressRing.tsx`. This is a conic gradient ring with a track. `spin` rotates the whole ring (Booked 14c):

```tsx
import { Canvas, Path, Skia, SweepGradient, vec, Group, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { View } from 'react-native';
import { s } from '@/theme/scale';

export function ProgressRing({ size, thickness, progress, children, spin, colors = ['#31D1FF', '#0000FE', '#7A5CFF', '#31D1FF'], track = '#E6E9F2' }:
  { size: number; thickness: number; progress: number; children?: React.ReactNode; spin?: boolean; colors?: string[]; track?: string }) {
  const D = s(size); const t = s(thickness); const r = (D - t) / 2; const c = D / 2;
  const arc = (p: number) => { const path = Skia.Path.Make(); path.addArc({ x: t / 2, y: t / 2, width: D - t, height: D - t }, -90, 360 * p); return path; };
  const clock = useClock();
  const rot = useDerivedValue(() => (spin ? [{ rotate: ((clock.value % 3000) / 3000) * Math.PI * 2 }] : []));
  return (
    <View style={{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }}>
      <Canvas style={{ position: 'absolute', width: D, height: D }}>
        <Path path={arc(1)} style="stroke" strokeWidth={t} color={track} />
        <Group origin={vec(c, c)} transform={rot}>
          <Path path={arc(Math.max(0.001, Math.min(1, progress)))} style="stroke" strokeWidth={t} strokeCap="butt">
            <SweepGradient c={vec(c, c)} colors={colors} start={-90} end={270} />
          </Path>
        </Group>
      </Canvas>
      {children}
    </View>
  );
}
export default ProgressRing;
```

`src/fx/StageTrack.tsx`. This is the Home stage track (approved fix). Completed stops are blue 8px dots, the current stop is a 14px mini orb with a halo and a blue 8.5px label, and future stops are hollow. The gradient fill runs up to the current stop:

```tsx
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { T } from '@/ui/T';
import { Orb } from './Orb';
import { STAGES } from '@/data/types';

export function StageTrack({ stage }: { stage: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const pct = (stage - 1) / 5;
  return (
    <View style={{ marginTop: s(10), marginHorizontal: s(6), height: s(28) }}>
      <View style={{ position: 'absolute', left: s(4), right: s(4), top: s(10), height: s(2), borderRadius: s(2), backgroundColor: '#E1E5F0' }} />
      <View style={{ position: 'absolute', left: s(4), top: s(10), height: s(2), width: `${pct * 100}%`, borderRadius: s(2), overflow: 'hidden' }}>
        <LinearGradient colors={[C.blue, C.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {STAGES.map((name, i) => {
          const n = i + 1;
          if (n === stage) return (
            <View key={name} style={{ alignItems: 'center', marginTop: s(3) }}>
              <Orb size={14} />
              <T size={8.5} w={700} c={C.blue} style={{ marginTop: s(3) }}>{name}</T>
            </View>
          );
          return <View key={name} style={{ width: s(8), height: s(8), borderRadius: s(4), marginTop: s(6), backgroundColor: n < stage ? C.blue : '#fff',
            borderWidth: 1.5, borderColor: n < stage ? C.blue : '#CFD4E6' }} />;
        })}
      </View>
    </View>
  );
}
```

(`STAGES` is defined in Task 5. Implement Task 5 before running the app. Jest does not render StageTrack until the screen tasks.)

- [ ] **Step 6: Commit**

```bash
git add mobile/src/fx mobile/__tests__/geometry.test.ts
git commit -m "feat(mobile): brand effects — blob orb, aurora, gradient/shimmer text, iridescent border, rings, stage track"
```


---

### Task 5: Domain types, demo seed and the persisted store (with the cross-role link)

**Files:**
- Create: `mobile/src/data/types.ts`, `mobile/src/data/seed.ts`, `mobile/src/store/demo.ts`
- Test: `mobile/__tests__/store.test.ts`

**Interfaces:**
- Consumes: `PhotoKey` from Task 2.
- Produces (`@/data/types`):
  - `Stage = 1|2|3|4|5|6`, `STAGES` (names), `STAGE_DESC`, `BuildingType = 'villa'|'shop'|'tower'|'factory'|'reno'`, `BUILDINGS`.
  - `Expert`, `Service`, `Request`, `Quote`, `Job`, `Notice`, `Thread`, `Message`, `Flag`, `Slot`, `ChecklistKey`.
- Produces (`@/store/demo`): `useDemo` (a Zustand hook with `getState()`) and the `DemoState` actions below. It is persisted under the key `pulse-demo-v1`.
  - `setRole(r)`, `completeClientOnboarding(type, stage)`
  - `sendRequest({kbId, title, summary, expertType, when}) → requestId`
  - `receiveQuotes(requestId)`, `acceptQuote(quoteId)`
  - `bookAndPay({expertId, serviceId, slotId}) → jobId` (idempotent while a job for the same expert and slot exists)
  - `completeJob(jobId)`, `approveJob(jobId)`, `submitReview(jobId, stars, tags)`
  - `flagQuestion(question, category) → ref`, `teamReplied(ref)`
  - `pushNotice(n)`, `dismissBanner()`
  - `completeChecklist(key)`, `verifyExpert()`, `toggleSlot(id)`
  - `sendQuote(requestId, price, days)`, `sendMessage(threadId, text)`
  - `resetDemo()`
- Selectors: `newQuotesFor(state, requestId)`, `bestQuote(state, requestId)`, `expertRequests(state)`.

- [ ] **Step 1: Write `src/data/types.ts`**

```ts
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
```

- [ ] **Step 2: Write `src/data/seed.ts`**

The copy and numbers are exactly those in the approved references.

```ts
import type { Expert, Job, Message, Notice, Quote, Request, Slot, Thread, Flag, ChecklistKey, Stage, BuildingType } from './types';

export const EXPERTS: Expert[] = [
  { id: 'omar', name: 'Omar Haddad', first: 'Omar', role: 'Cost engineer', category: 'Engineers', years: 14, rating: 4.9, reviews: 128, jobs: 312,
    photo: 'omar', match: 96, areas: 'Abu Dhabi & Dubai', licence: 'AD-ENG-20417', services: [
      { id: 'bid-visit', name: 'Bid review + visit', note: 'Report in 3 days', price: 2200 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1800 },
      { id: 'boq', name: 'BOQ cost check', note: 'Report in 2 days', price: 1500 }] },
  { id: 'lina', name: 'Lina Karim', first: 'Lina', role: 'Structural', category: 'Engineers', years: 11, rating: 4.8, reviews: 96, jobs: 204,
    photo: 'lina', match: 91, areas: 'Abu Dhabi', licence: 'AD-ENG-18322', services: [
      { id: 'struct', name: 'Structural review', note: 'Report in 5 days', price: 1800 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1500 }] },
  { id: 'rashid', name: 'Rashid Al Amri', first: 'Rashid', role: 'Project manager', category: 'Engineers', years: 18, rating: 5.0, reviews: 61, jobs: 140,
    photo: 'rashid', match: 88, areas: 'Abu Dhabi & Al Ain', licence: 'AD-ENG-11045', services: [
      { id: 'pm', name: 'Project health check', note: 'Report in 2 days', price: 3500 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 2400 }] },
  { id: 'maya', name: 'Maya Suleiman', first: 'Maya', role: 'MEP engineer', category: 'Engineers', years: 9, rating: 4.7, reviews: 54, jobs: 97,
    photo: 'maya', match: 84, areas: 'Dubai', licence: 'DXB-ENG-30671', services: [
      { id: 'mep', name: 'MEP design review', note: 'Report in 4 days', price: 1600 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1300 }] },
  { id: 'karim', name: 'Karim Nasser', first: 'Karim', role: 'Architect', category: 'Architects', years: 12, rating: 4.9, reviews: 77, jobs: 150,
    photo: 'karim', match: 80, areas: 'Abu Dhabi', licence: 'AD-ARC-09213', services: [
      { id: 'design', name: 'Design review', note: 'Notes in 3 days', price: 2800 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1900 }] },
  { id: 'nadia', name: 'Nadia Farouk', first: 'Nadia', role: 'Interior designer', category: 'Interiors', years: 8, rating: 4.8, reviews: 43, jobs: 88,
    photo: 'nadia', match: 76, areas: 'Abu Dhabi & Dubai', licence: 'AD-INT-04418', services: [
      { id: 'concept', name: 'Interior concept', note: 'Moodboard in 5 days', price: 2500 },
      { id: 'visit', name: 'Site visit only', note: 'Same-day notes', price: 1200 }] },
];

/** Market average used for "N% below average price" (Quotes 13: 2,200 vs 2,500 = 12%). */
export const MARKET_AVG: Record<string, number> = { 'bid-review': 2500, 'soil-test': 2200 };

export const CLIENT = { name: 'Sara Al Mansoori', first: 'Sara', email: 'sara@almansoori.ae', photo: 'sara' as const };
export const PROJECT = { type: 'villa' as BuildingType, stage: 3 as Stage, name: 'Villa · Al Reem', place: 'Al Reem Island',
  budget: 2_400_000, committed: 1_630_000 };

export const BUDGET = [
  { name: 'Design & permits', amount: 180_000, pct: 1.0, color: '#0000FE' },
  { name: 'Structure', amount: 910_000, pct: 0.62, color: '#31D1FF' },
  { name: 'MEP', amount: 540_000, pct: 0.24, color: '#B9A8FF' },
];
export const MILESTONES = [
  { day: '12', month: 'MAR', title: 'Plot purchased', stage: 'Planning', status: 'done' as const },
  { day: '02', month: 'JUN', title: 'Permit approved', stage: 'Design', status: 'done' as const },
  { day: '20', month: 'OCT', title: 'Choose contractor', stage: 'Tender', status: 'next' as const },
  { day: '01', month: 'DEC', title: 'Construction starts', stage: 'Construction', status: 'planned' as const },
];
export const DOCS = [
  { name: 'Building permit.pdf', date: '2 Jun', size: '1.1 MB' },
  { name: 'Concept drawings.pdf', date: '18 May', size: '8.4 MB' },
  { name: 'Tender pack.pdf', date: '1 Oct', size: '3.2 MB' },
];
export const DECISIONS = [
  { day: '28', month: 'SEP', title: 'Shortlist 3 contractors', by: 'Sara' },
  { day: '14', month: 'AUG', title: 'Upgrade to solar-ready roof', by: 'Sara' },
];
export const SITE = [
  { photo: 'site1' as const, label: 'Today · Site visit', big: true },
  { photo: 'site2' as const, label: '2 Oct' },
  { photo: 'drawings' as const, label: 'Drawings · 2 Jun' },
];

export const T0 = 1_759_000_000_000; // fixed demo epoch so seed data is deterministic

export const SEED_REQUESTS: Request[] = [
  { id: 'req-soil', kbId: 'soil-test', title: 'Soil test report', summary: 'Soil investigation and geotechnical report for a 5-bed villa, needed before structural design. Within 2 weeks.',
    expertType: 'Geotechnical engineer', when: '2w', status: 'sent', createdAt: T0, clientName: 'Sara', place: 'Villa · Al Reem', distance: '2 km away' },
  { id: 'req-bid', kbId: 'bid-review', title: 'Bid review', summary: 'Review of 3 contractor bids for a 5-bedroom villa on Al Reem Island.',
    expertType: 'Cost engineer', when: '2w', status: 'booked', createdAt: T0, clientName: 'Sara', place: 'Villa · Al Reem', distance: '2 km away' },
  { id: 'req-boq', kbId: 'boq', title: 'BOQ cost check', summary: 'Check the bill of quantities for a retail fit-out.', expertType: 'Cost engineer',
    when: 'flex', status: 'sent', createdAt: T0, clientName: 'Khalid', place: 'Shop · Khalifa City', distance: '9 km away' },
];
export const SEED_QUOTES: Quote[] = [
  { id: 'q-omar', requestId: 'req-bid', expertId: 'omar', price: 2200, days: 3, visitIncluded: true, seen: false, createdAt: T0 },
  { id: 'q-lina', requestId: 'req-bid', expertId: 'lina', price: 2450, days: 5, visitIncluded: false, seen: false, createdAt: T0 },
  { id: 'q-rashid', requestId: 'req-bid', expertId: 'rashid', price: 3100, days: 2, visitIncluded: true, seen: true, createdAt: T0 },
];
export const SEED_JOBS: Job[] = [
  { id: 'job-1', requestId: 'req-bid', expertId: 'omar', serviceId: 'bid-visit', title: 'Bid review', slotId: 'thu-1000',
    dayLabel: 'Thu 9 Oct', timeLabel: '10:00', total: 2425.5, status: 'visit', due: 'Sun 12 Oct' },
];
export const SEED_NOTICES: Notice[] = [
  { id: 'n1', kind: 'quotes', title: 'New quotes', text: '2 experts quoted for your bid review.', at: T0 - 10 * 60e3, read: false, href: '/quotes', forRole: 'client' },
  { id: 'n2', kind: 'answered', title: 'Your question was answered', text: 'Rashid replied about the kitchen wall.', at: T0 - 2 * 3600e3, read: false, href: '/chat/team', forRole: 'client' },
  { id: 'n3', kind: 'payment', title: 'Payment held safely', text: 'AED 2,425.50 until you sign off.', at: T0 - 3 * 86400e3, read: false, href: '/job/job-1', forRole: 'client' },
];
export const SEED_THREADS: Thread[] = [
  { id: 'omar', title: 'Omar Haddad', kind: 'expert', expertId: 'omar', typing: true, unread: 2, preview: 'typing…', timeLabel: '11:42', forRole: 'client' },
  { id: 'team', title: 'Project Pulse team', kind: 'team', unread: 1, preview: 'Re: kitchen wall. Rashid replied', timeLabel: '09:15', forRole: 'client' },
  { id: 'lina', title: 'Lina Karim', kind: 'expert', expertId: 'lina', unread: 0, preview: 'Sent you a quote · AED 2,450', timeLabel: 'Mon', forRole: 'client' },
  { id: 'sara', title: 'Sara Al Mansoori', kind: 'expert', unread: 0, preview: 'Great, thanks! Is the access road OK?', timeLabel: '11:40', forRole: 'expert' },
];
export const SEED_MESSAGES: Message[] = [
  { id: 'm1', threadId: 'omar', from: 'them', text: 'Arrived on site. Checking the foundation area first.', at: T0 },
  { id: 'm2', threadId: 'omar', from: 'them', photo: 'site2', at: T0 + 1 },
  { id: 'm3', threadId: 'omar', from: 'me', text: 'Great, thanks! Is the access road OK for trucks?', at: T0 + 2 },
  { id: 'm4', threadId: 'omar', from: 'them', text: "Yes, it's wide enough. I'll note it in the report.", at: T0 + 3 },
  { id: 'm5', threadId: 'team', from: 'them', text: "Hi Sara, Rashid here. Please don't remove that wall yet — it may be load-bearing. I've booked a structural check for you; reply here with a good time.", at: T0 },
  { id: 'm6', threadId: 'lina', from: 'them', text: 'I can review the structure within 5 days. Quote sent: AED 2,450.', at: T0 },
];
export const SEED_FLAGS: Flag[] = [
  { ref: 'PP-2290', question: 'Can I remove the kitchen wall?', category: 'structural', at: T0 - 3 * 3600e3, replied: true },
];
export const SEED_SLOTS: Slot[] = [
  { id: 'thu-1000', day: 9, time: '10:00', state: 'booked', label: 'Sara · Bid review visit', sub: 'Al Reem Island', jobId: 'job-1' },
  { id: 'thu-1300', day: 9, time: '13:00', state: 'open' },
  { id: 'thu-1500', day: 9, time: '15:00', state: 'open' },
  { id: 'thu-1700', day: 9, time: '17:00', state: 'off' },
];
/** Client-facing booking slots for Omar on Thursday (14a). */
export const CLIENT_SLOTS = [
  { id: 'thu-0800', time: '08:00', free: true }, { id: 'thu-1000', time: '10:00', free: true }, { id: 'thu-1130', time: '11:30', free: true },
  { id: 'thu-1300', time: '13:00', free: false }, { id: 'thu-1500', time: '15:00', free: true }, { id: 'thu-1630', time: '16:30', free: true },
];
export const DAYS = [{ d: 'MON', n: 6, off: true }, { d: 'TUE', n: 7 }, { d: 'WED', n: 8 }, { d: 'THU', n: 9 }, { d: 'FRI', n: 10 }];
export const SEED_CHECKLIST: Record<ChecklistKey, boolean> = { licence: true, experience: true, services: false, areas: false, portfolio: false };
export const EARNINGS = { month: 'September', total: 18_400, trend: 12, weeks: [0.40, 0.62, 0.48, 0.92], withdrawable: 6200,
  payouts: [{ title: 'Bid review · Sara', when: 'Released 2 Oct', amount: 2090 }] };
export const FEE = 110; export const VAT_RATE = 0.05;
export const aed = (n: number, dp = 0) => `AED ${n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
```

- [ ] **Step 3: Write the failing store tests**

`mobile/__tests__/store.test.ts`:

```ts
import { useDemo, bestQuote, newQuotesFor, expertRequests } from '@/store/demo';

beforeEach(() => useDemo.getState().resetDemo());

test('seed matches the approved references', () => {
  const s = useDemo.getState();
  expect(newQuotesFor(s, 'req-bid')).toHaveLength(2);
  expect(bestQuote(s, 'req-bid')?.expertId).toBe('omar');
  expect(s.jobs[0].total).toBe(2425.5);
});

test('a client request appears in the expert Requests (cross-role link) and the expert quote comes back', () => {
  const id = useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report',
    summary: 'Soil investigation…', expertType: 'Geotechnical engineer', when: '2w' });
  expect(expertRequests(useDemo.getState()).map((r) => r.id)).toContain(id);
  useDemo.getState().sendQuote(id, 1900, 5);
  const q = useDemo.getState().quotes.find((q) => q.requestId === id && q.expertId === 'omar');
  expect(q?.price).toBe(1900);
  expect(useDemo.getState().notifications.some((n) => n.forRole === 'client' && n.kind === 'quotes')).toBe(true);
});

test('sending the same request twice in a row does not duplicate it (Review Focus #3)', () => {
  const before = useDemo.getState().requests.length;
  const a = useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report', summary: 'x', expertType: 'Geotechnical engineer', when: '2w' });
  const b = useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report', summary: 'x', expertType: 'Geotechnical engineer', when: '2w' });
  expect(b).toBe(a);
  expect(useDemo.getState().requests).toHaveLength(before + 1);
});

test('paying twice for the same expert and slot creates one job (Review Focus #3)', () => {
  const j1 = useDemo.getState().bookAndPay({ expertId: 'omar', serviceId: 'bid-visit', slotId: 'thu-1000' });
  const j2 = useDemo.getState().bookAndPay({ expertId: 'omar', serviceId: 'bid-visit', slotId: 'thu-1000' });
  expect(j2).toBe(j1);
  expect(useDemo.getState().jobs.filter((j) => j.expertId === 'omar' && j.slotId === 'thu-1000')).toHaveLength(1);
});

test('job lifecycle: complete → report notice → approve → review', () => {
  const s = useDemo.getState();
  s.completeJob('job-1');
  expect(useDemo.getState().jobs[0].status).toBe('report');
  expect(useDemo.getState().notifications.some((n) => n.kind === 'report')).toBe(true);
  useDemo.getState().approveJob('job-1');
  useDemo.getState().submitReview('job-1', 5, ['On time']);
  expect(useDemo.getState().jobs[0].status).toBe('reviewed');
});

test('flagged questions get sequential references and a later team reply', () => {
  const ref = useDemo.getState().flagQuestion('Can I remove the wall?', 'structural');
  expect(ref).toBe('PP-2291');
  useDemo.getState().teamReplied(ref);
  expect(useDemo.getState().flags.find((f) => f.ref === ref)?.replied).toBe(true);
});

test('resetDemo restores the seed', () => {
  useDemo.getState().setRole('expert');
  useDemo.getState().resetDemo();
  expect(useDemo.getState().role).toBeNull();
  expect(useDemo.getState().quotes).toHaveLength(3);
});
```

- [ ] **Step 4: Run them to confirm they fail**

Run: `cd mobile && npx jest __tests__/store.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 5: Implement `src/store/demo.ts`**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as S from '@/data/seed';
import type { BuildingType, ChecklistKey, FlagCategory, Job, Notice, Quote, Request, Stage, Flag, Slot, Message, Thread } from '@/data/types';

type Role = 'client' | 'expert' | null;
type NewRequest = { kbId: string; title: string; summary: string; expertType: string; when: Request['when'] };

export interface DemoState {
  role: Role; clientOnboarded: boolean; expertVerified: boolean;
  projectType: BuildingType; stage: Stage;
  requests: Request[]; quotes: Quote[]; jobs: Job[]; notifications: Notice[]; threads: Thread[]; messages: Message[];
  flags: Flag[]; slots: Slot[]; checklist: Record<ChecklistKey, boolean>; reviews: { jobId: string; stars: number; tags: string[] }[];
  withdrawable: number; payouts: typeof S.EARNINGS.payouts; banner: Notice | null;
  setRole(r: Role): void;
  completeClientOnboarding(type: BuildingType, stage: Stage): void;
  sendRequest(r: NewRequest): string;
  receiveQuotes(requestId: string): void;
  acceptQuote(quoteId: string): void;
  bookAndPay(b: { expertId: string; serviceId: string; slotId: string }): string;
  completeJob(jobId: string): void; approveJob(jobId: string): void; submitReview(jobId: string, stars: number, tags: string[]): void;
  flagQuestion(question: string, category: FlagCategory): string; teamReplied(ref: string): void;
  pushNotice(n: Omit<Notice, 'id' | 'at' | 'read'>): void; dismissBanner(): void; markNoticesRead(role: 'client' | 'expert'): void;
  completeChecklist(k: ChecklistKey): void; verifyExpert(): void; toggleSlot(id: string): void;
  sendQuote(requestId: string, price: number, days: number): void; withdraw(): void;
  sendMessage(threadId: string, text: string): void;
  resetDemo(): void;
}

const seed = () => ({
  role: null as Role, clientOnboarded: false, expertVerified: false, projectType: S.PROJECT.type, stage: S.PROJECT.stage,
  requests: S.SEED_REQUESTS.map((r) => ({ ...r })), quotes: S.SEED_QUOTES.map((q) => ({ ...q })), jobs: S.SEED_JOBS.map((j) => ({ ...j })),
  notifications: S.SEED_NOTICES.map((n) => ({ ...n })), threads: S.SEED_THREADS.map((t) => ({ ...t })), messages: S.SEED_MESSAGES.map((m) => ({ ...m })),
  flags: S.SEED_FLAGS.map((f) => ({ ...f })), slots: S.SEED_SLOTS.map((s) => ({ ...s })), checklist: { ...S.SEED_CHECKLIST },
  reviews: [] as DemoState['reviews'], withdrawable: S.EARNINGS.withdrawable, payouts: [...S.EARNINGS.payouts], banner: null as Notice | null,
});

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const useDemo = create<DemoState>()(persist((set, get) => ({
  ...seed(),
  setRole: (role) => set({ role }),
  completeClientOnboarding: (projectType, stage) => set({ projectType, stage, clientOnboarded: true }),

  sendRequest: (r) => {
    const dup = get().requests.find((x) => x.kbId === r.kbId && x.status === 'sent' && Date.now() - x.createdAt < 60_000);
    if (dup) return dup.id;
    const id = uid('req');
    const req: Request = { ...r, id, status: 'sent', createdAt: Date.now(), clientName: 'Sara', place: 'Villa · Al Reem', distance: '2 km away' };
    set((s) => ({ requests: [req, ...s.requests] }));
    get().pushNotice({ kind: 'request', title: `New request · ${r.title}`, text: 'From Sara · Villa, Al Reem Island', href: `/expert/request/${id}`, forRole: 'expert' });
    return id;
  },
  receiveQuotes: (requestId) => {
    const req = get().requests.find((r) => r.id === requestId);
    if (!req || req.status !== 'sent') return;
    const fresh: Quote[] = [
      { id: uid('q'), requestId, expertId: 'karim', price: 1900, days: 5, visitIncluded: true, seen: false, createdAt: Date.now() },
      { id: uid('q'), requestId, expertId: 'lina', price: 2300, days: 7, visitIncluded: false, seen: false, createdAt: Date.now() },
    ];
    set((s) => ({ quotes: [...fresh, ...s.quotes], requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'quoted' } : r)) }));
    get().pushNotice({ kind: 'quotes', title: 'New quotes', text: `2 experts quoted for your ${req.title.toLowerCase()}.`, href: `/quotes?request=${requestId}`, forRole: 'client' });
  },
  acceptQuote: (quoteId) => set((s) => ({ quotes: s.quotes.map((q) => (q.id === quoteId ? { ...q, seen: true } : q)) })),

  bookAndPay: ({ expertId, serviceId, slotId }) => {
    const existing = get().jobs.find((j) => j.expertId === expertId && j.slotId === slotId && j.status !== 'reviewed');
    if (existing) return existing.id;
    const ex = S.EXPERTS.find((e) => e.id === expertId)!; const sv = ex.services.find((x) => x.id === serviceId)!;
    const total = Math.round((sv.price + S.FEE) * (1 + S.VAT_RATE) * 100) / 100;
    const job: Job = { id: uid('job'), requestId: 'req-bid', expertId, serviceId, title: sv.name, slotId, dayLabel: 'Thu 9 Oct', timeLabel: '10:00', total, status: 'booked', due: 'Sun 12 Oct' };
    set((s) => ({ jobs: [job, ...s.jobs] }));
    get().pushNotice({ kind: 'payment', title: 'Payment held safely', text: `AED ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} until you sign off.`, href: `/job/${job.id}`, forRole: 'client' });
    return job.id;
  },
  completeJob: (jobId) => {
    set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'report' } : j)) }));
    get().pushNotice({ kind: 'report', title: 'Report ready', text: 'Omar delivered your bid review.', href: `/report/${jobId}`, forRole: 'client' });
  },
  approveJob: (jobId) => set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'approved' } : j)) })),
  submitReview: (jobId, stars, tags) => set((s) => ({ reviews: [...s.reviews, { jobId, stars, tags }],
    jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'reviewed' } : j)) })),

  flagQuestion: (question, category) => {
    const n = Math.max(...get().flags.map((f) => Number(f.ref.slice(3)))) + 1;
    const ref = `PP-${n}`;
    set((s) => ({ flags: [...s.flags, { ref, question, category, at: Date.now(), replied: false }] }));
    return ref;
  },
  teamReplied: (ref) => {
    const f = get().flags.find((x) => x.ref === ref);
    if (!f || f.replied) return;
    set((s) => ({ flags: s.flags.map((x) => (x.ref === ref ? { ...x, replied: true } : x)),
      messages: [...s.messages, { id: uid('m'), threadId: 'team', from: 'them', text: `Hi Sara, Rashid here about "${f.question}". I'll call you today to go through it safely.`, at: Date.now() }],
      threads: s.threads.map((t) => (t.id === 'team' ? { ...t, unread: t.unread + 1, preview: `Re: ${f.question}` } : t)) }));
    get().pushNotice({ kind: 'answered', title: 'Your question was answered', text: 'Rashid from Project Pulse replied.', href: '/chat/team', forRole: 'client' });
  },

  pushNotice: (n) => {
    const notice: Notice = { ...n, id: uid('n'), at: Date.now(), read: false };
    set((s) => ({ notifications: [notice, ...s.notifications], banner: s.role === n.forRole ? notice : s.banner }));
  },
  dismissBanner: () => set({ banner: null }),
  markNoticesRead: (role) => set((s) => ({ notifications: s.notifications.map((n) => (n.forRole === role ? { ...n, read: true } : n)) })),

  completeChecklist: (k) => set((s) => ({ checklist: { ...s.checklist, [k]: true } })),
  verifyExpert: () => set({ expertVerified: true }),
  toggleSlot: (id) => set((s) => ({ slots: s.slots.map((x) => (x.id === id && x.state !== 'booked' ? { ...x, state: x.state === 'open' ? 'off' : 'open' } : x)) })),
  sendQuote: (requestId, price, days) => {
    if (get().quotes.some((q) => q.requestId === requestId && q.expertId === 'omar')) return;
    set((s) => ({ quotes: [{ id: uid('q'), requestId, expertId: 'omar', price, days, visitIncluded: true, seen: false, createdAt: Date.now() }, ...s.quotes],
      requests: s.requests.map((r) => (r.id === requestId ? { ...r, status: 'quoted' } : r)) }));
    get().pushNotice({ kind: 'quotes', title: 'New quote', text: `Omar quoted AED ${price.toLocaleString('en-US')}.`, href: `/quotes?request=${requestId}`, forRole: 'client' });
    get().pushNotice({ kind: 'quoteSent', title: 'Quote sent', text: 'Sara will be notified.', href: '/expert/requests', forRole: 'expert' });
  },
  withdraw: () => set((s) => ({ payouts: [{ title: 'Withdrawal to bank', when: 'Just now', amount: -s.withdrawable }, ...s.payouts], withdrawable: 0 })),
  sendMessage: (threadId, text) => set((s) => ({ messages: [...s.messages, { id: uid('m'), threadId, from: 'me', text, at: Date.now() }] })),

  resetDemo: () => { require('@/sim/scheduler').cancelAll(); set(seed()); },
}), { name: 'pulse-demo-v1', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ ...s, banner: null }) }));

// ---------- selectors ----------
export const newQuotesFor = (s: DemoState, requestId: string) => s.quotes.filter((q) => q.requestId === requestId && !q.seen);
export const bestQuote = (s: DemoState, requestId: string) =>
  [...s.quotes.filter((q) => q.requestId === requestId)].sort((a, b) => a.price - b.price)[0];
export const expertRequests = (s: DemoState) => s.requests.filter((r) => r.status === 'sent');
export const expertById = (id: string) => S.EXPERTS.find((e) => e.id === id)!;
```

(`resetDemo` requires `@/sim/scheduler`, which is written in Task 7. Until then, create `src/sim/scheduler.ts` exporting `export function cancelAll() {}` so this task's tests run.)

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/store.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
git add mobile/src/data mobile/src/store mobile/src/sim/scheduler.ts mobile/__tests__/store.test.ts
git commit -m "feat(mobile): demo seed + persisted store with cross-role link and double-submit guards"
```

---

### Task 6: Pulse engine: safety gate, knowledge base and matcher

**Files:**
- Create: `mobile/src/pulse/safety.ts`, `mobile/src/pulse/kb.ts`, `mobile/src/pulse/match.ts`
- Test: `mobile/__tests__/pulse.test.ts`

**Interfaces:**
- Consumes: `Stage`, `BuildingType`, `FlagCategory` (Task 5).
- Produces:
  - `classifySafety(q:string): FlagCategory|null`.
  - `KB: KBEntry[]`, where `KBEntry = { id, stages:Stage[], types:BuildingType[], keywords:string[], lead, body, source, keyPhrase, requestTitle, requestSummary, recommend:{expertType,count,fromPrice,avatars:PhotoKey[]} }`.
  - `askPulse(q, ctx:{stage, projectType}): PulseResult`, where `PulseResult = {kind:'flagged',category} | {kind:'answer',entry} | {kind:'fallback',stage}`.
  - `SUGGESTIONS: Record<Stage,string[]>`, `STAGE_EXPERTS: Record<Stage,string[]>`, `renderBody(entry, type)`.

- [ ] **Step 1: Write the failing tests** (they include Review Focus #1 and #2)

`mobile/__tests__/pulse.test.ts`:

```ts
import { classifySafety } from '@/pulse/safety';
import { askPulse, SUGGESTIONS } from '@/pulse/match';
import { KB } from '@/pulse/kb';

const ctx = { stage: 2 as const, projectType: 'villa' as const };

describe('safety gate (enforced in code)', () => {
  test.each([
    ['Can I remove the kitchen wall?', 'structural'], ['Is this wall load-bearing?', 'structural'],
    ['can we knock down the wall between rooms', 'structural'], ['There is a crack in the column', 'structural'],
    ['Can I add another floor?', 'structural'], ['My contractor wants to terminate the contract', 'legal'],
    ['Should I sue the builder?', 'legal'], ['I smell gas on site', 'safety'], ['exposed wires near the pool!!', 'safety'],
  ])('%s → %s', (q, cat) => expect(classifySafety(q)).toBe(cat));
  test.each(['Can I paint the kitchen wall?', 'What wall tiles should I choose?', 'Do I need a soil test?',
    'What does a bid review cost?', '', '   ', '🙂', 'هل أحتاج اختبار التربة؟'])('not flagged: %p', (q) => expect(classifySafety(q)).toBeNull());
});

describe('askPulse', () => {
  test('soil test at Design → geotechnical engineer (approved 9c copy)', () => {
    const r = askPulse('Do I need a soil test?', ctx);
    expect(r.kind).toBe('answer');
    if (r.kind === 'answer') {
      expect(r.entry.recommend.expertType).toBe('Geotechnical engineer');
      expect(r.entry.lead).toBe('Yes.');
      expect(r.entry.source).toBe('Project Pulse Villa Guide');
    }
  });
  test('case, punctuation and plurals do not matter', () => {
    const r = askPulse('DO I NEED SOIL TESTS???', ctx);
    expect(r.kind === 'answer' && r.entry.id).toBe('soil-test');
  });
  test('safety wins over a matching answer', () => {
    expect(askPulse('Can I remove a wall before the soil test?', ctx).kind).toBe('flagged');
  });
  test('unknown, empty, emoji or Arabic questions fall back gracefully (never throw)', () => {
    for (const q of ['asdf qwerty', '', '🙂🙂', 'هل أحتاج اختبار التربة؟']) expect(askPulse(q, ctx).kind).toBe('fallback');
  });
  test('stage breaks ties: "bids" at Tender → bid review', () => {
    const r = askPulse('Can someone check my bids?', { stage: 3, projectType: 'villa' });
    expect(r.kind === 'answer' && r.entry.id).toBe('bid-review');
  });
  test('KB has 20 entries, each with a recommendation and a source', () => {
    expect(KB).toHaveLength(20);
    for (const e of KB) { expect(e.source).toBeTruthy(); expect(e.recommend.count).toBeGreaterThan(0); }
  });
  test('Tender suggestions match the approved Pulse opening screen', () => {
    expect(SUGGESTIONS[3]).toEqual(['Review my 3 contractor bids', 'Book a site visit', 'Check my budget']);
  });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `cd mobile && npx jest __tests__/pulse.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `src/pulse/safety.ts`**

```ts
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
```

- [ ] **Step 4: Implement `src/pulse/kb.ts`**

This covers 20 entries across all stages. **Rule:** entries never invent fees or durations. Prices are the "from" prices of verified experts shown in the app.

```ts
import type { BuildingType, Stage } from '@/data/types';
import type { PhotoKey } from '@/theme/photos';

export interface KBEntry {
  id: string; stages: Stage[]; types: BuildingType[]; keywords: string[];
  lead: string; body: string; source: string; keyPhrase: string;
  requestTitle: string; requestSummary: string;
  recommend: { expertType: string; count: number; fromPrice: number; avatars: PhotoKey[] };
}
const ALL: BuildingType[] = ['villa', 'shop', 'tower', 'factory', 'reno'];
const AV: PhotoKey[] = ['karim', 'lina', 'rashid'];

export const KB: KBEntry[] = [
  { id: 'soil-test', stages: [1, 2], types: ALL, keywords: ['soil', 'geotechnical', 'geotech', 'ground investigation', 'borehole'],
    lead: 'Yes.', body: "A soil test is needed before your {type}'s structure is designed. It decides the foundation.",
    source: 'Project Pulse Villa Guide', keyPhrase: 'soil test', requestTitle: 'Soil test report',
    requestSummary: 'Soil investigation and geotechnical report for a 5-bedroom villa on Al Reem Island, needed before structural design.',
    recommend: { expertType: 'Geotechnical engineer', count: 14, fromPrice: 1800, avatars: AV } },
  { id: 'bid-review', stages: [3, 4], types: ALL, keywords: ['bid', 'bids', 'tender', 'contractor bids', 'compare quotes'],
    lead: 'Yes.', body: 'An independent cost engineer can compare your contractor bids line by line and spot missing scope before you sign.',
    source: 'Project Pulse Tender Guide', keyPhrase: 'bids', requestTitle: 'Bid review',
    requestSummary: 'Review of 3 contractor bids for a 5-bedroom villa on Al Reem Island, with a site visit.',
    recommend: { expertType: 'Cost engineer', count: 9, fromPrice: 2200, avatars: ['omar', 'lina', 'rashid'] } },
  { id: 'boq', stages: [3], types: ALL, keywords: ['boq', 'bill of quantities', 'quantities'],
    lead: 'Good idea.', body: 'A cost engineer checks your bill of quantities against the drawings so bids are priced on the same scope.',
    source: 'Project Pulse Tender Guide', keyPhrase: 'bill of quantities', requestTitle: 'BOQ cost check',
    requestSummary: 'Check of the bill of quantities against the latest drawings before tender.',
    recommend: { expertType: 'Cost engineer', count: 9, fromPrice: 1500, avatars: ['omar', 'rashid', 'lina'] } },
  { id: 'budget', stages: [1], types: ALL, keywords: ['budget', 'afford', 'feasibility', 'how much'],
    lead: 'Start with a feasibility check.', body: 'A cost engineer turns your brief into a realistic budget range using Project Pulse baseline costs.',
    source: 'Project Pulse Planning Guide', keyPhrase: 'budget', requestTitle: 'Budget feasibility',
    requestSummary: 'Feasibility check and budget range for a new villa on Al Reem Island.',
    recommend: { expertType: 'Cost engineer', count: 9, fromPrice: 1500, avatars: ['omar', 'rashid', 'lina'] } },
  { id: 'plot', stages: [1], types: ALL, keywords: ['plot', 'land', 'site survey', 'survey'],
    lead: 'Survey the plot first.', body: 'A topographic survey fixes levels and boundaries so your architect designs to the real site.',
    source: 'Project Pulse Planning Guide', keyPhrase: 'plot', requestTitle: 'Plot survey',
    requestSummary: 'Topographic survey of the plot at Al Reem Island before design starts.',
    recommend: { expertType: 'Civil engineer', count: 11, fromPrice: 1600, avatars: AV } },
  { id: 'permit', stages: [2], types: ALL, keywords: ['permit', 'permits', 'approval', 'municipality', 'building permit'],
    lead: 'Your architect leads this.', body: 'The permit application is prepared from your approved drawings and submitted by a licensed consultant.',
    source: 'Project Pulse Design Guide', keyPhrase: 'permit', requestTitle: 'Permit drawings',
    requestSummary: 'Preparation of permit drawings and submission support for a villa on Al Reem Island.',
    recommend: { expertType: 'Architect', count: 12, fromPrice: 2800, avatars: ['karim', 'nadia', 'lina'] } },
  { id: 'design-review', stages: [2], types: ALL, keywords: ['design', 'drawings', 'second opinion', 'design review', 'layout'],
    lead: 'A second opinion helps.', body: 'An independent architect can review your drawings for buildability and cost before they go to tender.',
    source: 'Project Pulse Design Guide', keyPhrase: 'drawings', requestTitle: 'Design review',
    requestSummary: 'Independent review of concept drawings for buildability and cost.',
    recommend: { expertType: 'Architect', count: 12, fromPrice: 2800, avatars: ['karim', 'nadia', 'lina'] } },
  { id: 'mep', stages: [2, 5], types: ALL, keywords: ['mep', 'electrical', 'plumbing', 'hvac', 'ac', 'air conditioning'],
    lead: 'Check it early.', body: 'An MEP engineer reviews power, cooling and water design so services fit the structure and ceilings.',
    source: 'Project Pulse MEP Guide', keyPhrase: 'MEP', requestTitle: 'MEP design review',
    requestSummary: 'Review of MEP drawings (power, cooling, water) for a villa on Al Reem Island.',
    recommend: { expertType: 'MEP engineer', count: 8, fromPrice: 1600, avatars: ['maya', 'lina', 'rashid'] } },
  { id: 'contractor-choice', stages: [3, 4], types: ALL, keywords: ['choose contractor', 'which contractor', 'contractor', 'builder'],
    lead: 'Compare more than price.', body: 'Check scope, programme and past work. A cost engineer can score the bids for you.',
    source: 'Project Pulse Tender Guide', keyPhrase: 'contractor', requestTitle: 'Bid review',
    requestSummary: 'Scoring of contractor bids on price, scope and programme.',
    recommend: { expertType: 'Cost engineer', count: 9, fromPrice: 2200, avatars: ['omar', 'lina', 'rashid'] } },
  { id: 'contract', stages: [4], types: ALL, keywords: ['contract', 'sign', 'signing', 'agreement'],
    lead: 'Use a standard form.', body: 'Project Pulse recommends its standard contract template, reviewed with your project manager before signing.',
    source: 'Project Pulse Contract Templates', keyPhrase: 'contract', requestTitle: 'Contract review',
    requestSummary: 'Project manager review of the construction contract before signing.',
    recommend: { expertType: 'Project manager', count: 6, fromPrice: 3500, avatars: ['rashid', 'omar', 'lina'] } },
  { id: 'schedule', stages: [4, 5], types: ALL, keywords: ['schedule', 'programme', 'program', 'timeline', 'how long', 'delay', 'delays'],
    lead: 'Follow your baseline schedule.', body: 'Your project manager tracks progress against the Project Pulse baseline schedule and flags slippage early.',
    source: 'Project Pulse Baseline Schedules', keyPhrase: 'schedule', requestTitle: 'Programme check',
    requestSummary: 'Check of the contractor programme against the baseline schedule.',
    recommend: { expertType: 'Project manager', count: 6, fromPrice: 3500, avatars: ['rashid', 'omar', 'lina'] } },
  { id: 'site-visit', stages: [5], types: ALL, keywords: ['site visit', 'inspection', 'inspect', 'quality', 'check the work'],
    lead: 'Yes, regular visits help.', body: 'An engineer inspects the work at key stages and reports with photos, so issues are fixed before they are covered up.',
    source: 'Project Pulse Construction Guide', keyPhrase: 'site visit', requestTitle: 'Site inspection',
    requestSummary: 'Stage inspection of works in progress with a photo report.',
    recommend: { expertType: 'Project manager', count: 6, fromPrice: 2400, avatars: ['rashid', 'omar', 'maya'] } },
  { id: 'concrete', stages: [5], types: ALL, keywords: ['concrete', 'pour', 'rebar', 'reinforcement', 'foundation'],
    lead: 'Inspect before the pour.', body: 'Reinforcement should be checked against the drawings before concrete is poured.',
    source: 'Project Pulse Construction Specifications', keyPhrase: 'pour', requestTitle: 'Pre-pour inspection',
    requestSummary: 'Reinforcement inspection before the concrete pour.',
    recommend: { expertType: 'Structural engineer', count: 7, fromPrice: 1800, avatars: ['lina', 'rashid', 'karim'] } },
  { id: 'waterproofing', stages: [5], types: ALL, keywords: ['waterproofing', 'leak', 'leaks', 'damp', 'roof'],
    lead: 'Test it before finishes.', body: 'Waterproofing is flood-tested before tiles go down. An engineer can witness the test.',
    source: 'Project Pulse Construction Specifications', keyPhrase: 'waterproofing', requestTitle: 'Waterproofing test',
    requestSummary: 'Witnessing of the waterproofing flood test before finishes.',
    recommend: { expertType: 'Project manager', count: 6, fromPrice: 2400, avatars: ['rashid', 'maya', 'omar'] } },
  { id: 'payments', stages: [5], types: ALL, keywords: ['payment', 'invoice', 'valuation', 'pay the contractor'],
    lead: 'Pay against progress.', body: 'Contractor payments should follow certified progress valuations from your cost engineer.',
    source: 'Project Pulse Advisory Articles', keyPhrase: 'payments', requestTitle: 'Progress valuation',
    requestSummary: 'Certification of the contractor progress valuation.',
    recommend: { expertType: 'Cost engineer', count: 9, fromPrice: 2200, avatars: ['omar', 'rashid', 'lina'] } },
  { id: 'snagging', stages: [6], types: ALL, keywords: ['snagging', 'snag', 'defects', 'handover', 'finishing'],
    lead: 'Book a snagging inspection.', body: 'An engineer lists every defect before you accept the keys, so the contractor fixes them first.',
    source: 'Project Pulse Handover Checklist', keyPhrase: 'snagging', requestTitle: 'Snagging inspection',
    requestSummary: 'Snagging inspection before handover with a full defects list.',
    recommend: { expertType: 'Project manager', count: 6, fromPrice: 2400, avatars: ['rashid', 'maya', 'omar'] } },
  { id: 'handover-docs', stages: [6], types: ALL, keywords: ['documents', 'warranty', 'warranties', 'as built', 'manuals'],
    lead: 'Collect them at handover.', body: 'Ask for as-built drawings, warranties and equipment manuals before the final payment.',
    source: 'Project Pulse Handover Checklist', keyPhrase: 'handover documents', requestTitle: 'Handover documents check',
    requestSummary: 'Check that all handover documents and warranties are complete.',
    recommend: { expertType: 'Project manager', count: 6, fromPrice: 2400, avatars: ['rashid', 'omar', 'maya'] } },
  { id: 'interior', stages: [2, 5, 6], types: ALL, keywords: ['interior', 'interiors', 'finishes', 'furniture', 'kitchen design', 'tiles'],
    lead: 'Plan finishes early.', body: 'An interior designer can set finishes and a budget before the contractor orders materials.',
    source: 'Project Pulse Advisory Articles', keyPhrase: 'finishes', requestTitle: 'Interior concept',
    requestSummary: 'Interior concept and finishes schedule for a villa on Al Reem Island.',
    recommend: { expertType: 'Interior designer', count: 10, fromPrice: 2500, avatars: ['nadia', 'karim', 'lina'] } },
  { id: 'value-engineering', stages: [2, 3], types: ALL, keywords: ['save money', 'cheaper', 'reduce cost', 'value engineering', 'over budget'],
    lead: 'Value engineering can help.', body: 'A cost engineer suggests equivalent specifications that cost less without changing the design intent.',
    source: 'Project Pulse Advisory Articles', keyPhrase: 'reduce cost', requestTitle: 'Value engineering review',
    requestSummary: 'Value engineering review to bring the project back within budget.',
    recommend: { expertType: 'Cost engineer', count: 9, fromPrice: 2200, avatars: ['omar', 'lina', 'rashid'] } },
  { id: 'shop-fitout', stages: [2, 5], types: ['shop'], keywords: ['fit out', 'fitout', 'fit-out', 'storefront', 'retail'],
    lead: 'Check landlord rules first.', body: 'Retail fit-outs follow the landlord design guide. An architect aligns your design before works start.',
    source: 'Project Pulse Retail Guide', keyPhrase: 'fit-out', requestTitle: 'Fit-out design check',
    requestSummary: 'Design check of the retail fit-out against the landlord guide.',
    recommend: { expertType: 'Architect', count: 12, fromPrice: 2800, avatars: ['karim', 'nadia', 'lina'] } },
];
```

- [ ] **Step 5: Implement `src/pulse/match.ts`**

```ts
import type { BuildingType, FlagCategory, Stage } from '@/data/types';
import { BUILDINGS } from '@/data/types';
import { classifySafety } from './safety';
import { KB, KBEntry } from './kb';

export type PulseResult = { kind: 'flagged'; category: FlagCategory } | { kind: 'answer'; entry: KBEntry } | { kind: 'fallback'; stage: Stage };

export const SUGGESTIONS: Record<Stage, string[]> = {
  1: ['Is my budget realistic?', 'Do I need a plot survey?', 'Check my budget'],
  2: ['Do I need a soil test?', 'Review my drawings', 'Help with permits'],
  3: ['Review my 3 contractor bids', 'Book a site visit', 'Check my budget'],
  4: ['Help me choose a contractor', 'Review my contract', 'Check my budget'],
  5: ['Book a site inspection', 'Check the concrete pour', 'Check my budget'],
  6: ['Book a snagging inspection', 'What documents do I need?', 'Check my budget'],
};
/** Suggestion text → question sent to the engine. */
export const SUGGESTION_QUERY: Record<string, string> = {
  'Review my 3 contractor bids': 'review my contractor bids', 'Book a site visit': 'site visit', 'Check my budget': 'budget',
  'Review my drawings': 'design review drawings', 'Help with permits': 'permit',
};
export const STAGE_EXPERTS: Record<Stage, string[]> = {
  1: ['Cost engineer', 'Civil engineer'], 2: ['Architect', 'Geotechnical engineer'], 3: ['Cost engineer', 'Project manager'],
  4: ['Project manager', 'Cost engineer'], 5: ['Project manager', 'Structural engineer'], 6: ['Project manager', 'MEP engineer'],
};

export function tokenize(q: string): Set<string> {
  const words = (q ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/[\s-]+/).filter(Boolean);
  const out = new Set<string>();
  for (const w of words) { out.add(w); if (w.length > 3 && w.endsWith('s')) out.add(w.slice(0, -1)); }
  return out;
}

export function askPulse(question: string, ctx: { stage: Stage; projectType: BuildingType }): PulseResult {
  const category = classifySafety(question);
  if (category) return { kind: 'flagged', category };
  const words = tokenize(question);
  let best: KBEntry | null = null; let bestScore = 0;
  for (const e of KB) {
    let score = 0;
    for (const k of e.keywords) {
      const parts = k.split(/[\s-]+/);
      if (parts.every((p) => words.has(p))) score += parts.length > 1 ? 2 : 1;
    }
    if (!score) continue;
    if (e.stages.includes(ctx.stage)) score += 0.5;
    if (e.types.includes(ctx.projectType) && e.types.length < 5) score += 0.25;
    if (score > bestScore) { best = e; bestScore = score; }
  }
  return best ? { kind: 'answer', entry: best } : { kind: 'fallback', stage: ctx.stage };
}

export const renderBody = (e: KBEntry, type: BuildingType) =>
  e.body.replace('{type}', (BUILDINGS.find((b) => b.id === type)?.name ?? 'building').toLowerCase());
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/pulse.test.ts`
Expected: PASS (all). If "Can someone check my bids?" picks `contractor-choice`, check that `bid-review` is listed before it in `KB`. A tie keeps the first entry, and `bid-review` has the `bids` keyword.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/pulse mobile/__tests__/pulse.test.ts
git commit -m "feat(mobile): Pulse engine — code-level safety gate, 20-entry KB, stage-aware matcher"
```

---

### Task 7: Simulated time: quotes arrive, team replies, and resume after restart

**Files:**
- Modify: `mobile/src/sim/scheduler.ts` (replace the Task 5 stub)
- Test: `mobile/__tests__/sim.test.ts`

**Interfaces:**
- Consumes: `useDemo` actions `receiveQuotes`, `teamReplied`.
- Produces:
  - `SIM = { quotesMs: 8000, teamReplyMs: 20000, reportMs: 4000 }`.
  - `after(ms, fn): () => void`, `cancelAll()`.
  - `simulateQuotes(requestId)`, `simulateTeamReply(ref)`.
  - `resumeSimulations()`, called once at app start.

- [ ] **Step 1: Write the failing tests** (Review Focus #4 and #5)

`mobile/__tests__/sim.test.ts`:

```ts
import { useDemo } from '@/store/demo';
import { SIM, simulateQuotes, simulateTeamReply, resumeSimulations, cancelAll } from '@/sim/scheduler';

beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); });
afterEach(() => { cancelAll(); jest.useRealTimers(); });

const newReq = () => useDemo.getState().sendRequest({ kbId: 'soil-test', title: 'Soil test report', summary: 's', expertType: 'Geotechnical engineer', when: '2w' });

test('quotes arrive after SIM.quotesMs', () => {
  const id = newReq(); simulateQuotes(id);
  jest.advanceTimersByTime(SIM.quotesMs - 1);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === id)).toHaveLength(0);
  jest.advanceTimersByTime(1);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === id)).toHaveLength(2);
});

test('reset while quotes are pending: no late quotes appear (Review Focus #5)', () => {
  const id = newReq(); simulateQuotes(id);
  useDemo.getState().resetDemo();
  jest.advanceTimersByTime(SIM.quotesMs * 2);
  expect(useDemo.getState().quotes.some((q) => q.requestId === id)).toBe(false);
});

test('after a restart, pending requests and flags resume (Review Focus #4)', () => {
  const id = newReq();
  const ref = useDemo.getState().flagQuestion('Can I remove the wall?', 'structural');
  // app restarted: no timers exist, state was persisted
  resumeSimulations();
  jest.advanceTimersByTime(SIM.teamReplyMs);
  expect(useDemo.getState().quotes.filter((q) => q.requestId === id)).toHaveLength(2);
  expect(useDemo.getState().flags.find((f) => f.ref === ref)?.replied).toBe(true);
});

test('team reply is delivered once', () => {
  const ref = useDemo.getState().flagQuestion('Is it load-bearing?', 'structural');
  simulateTeamReply(ref); simulateTeamReply(ref);
  jest.advanceTimersByTime(SIM.teamReplyMs);
  expect(useDemo.getState().messages.filter((m) => m.threadId === 'team' && m.text?.includes('load-bearing'))).toHaveLength(1);
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `cd mobile && npx jest __tests__/sim.test.ts`
Expected: FAIL (`simulateQuotes` is not exported).

- [ ] **Step 3: Implement `src/sim/scheduler.ts`**

```ts
export const SIM = { quotesMs: 8000, teamReplyMs: 20000, reportMs: 4000 };

const timers = new Set<ReturnType<typeof setTimeout>>();
export function after(ms: number, fn: () => void) {
  const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
  timers.add(t);
  return () => { clearTimeout(t); timers.delete(t); };
}
export function cancelAll() { timers.forEach(clearTimeout); timers.clear(); }

const store = () => require('@/store/demo').useDemo.getState();
export function simulateQuotes(requestId: string) { after(SIM.quotesMs, () => store().receiveQuotes(requestId)); }
export function simulateTeamReply(ref: string) { after(SIM.teamReplyMs, () => store().teamReplied(ref)); }

/** Call once after the store rehydrates: re-arm anything that was waiting when the app closed. */
export function resumeSimulations() {
  const s = store();
  const { T0 } = require('@/data/seed'); // seeded requests (createdAt === T0) are part of the demo story and never auto-quote
  s.requests.filter((r: any) => r.status === 'sent' && r.clientName === 'Sara' && r.createdAt > T0).forEach((r: any) => simulateQuotes(r.id));
  s.flags.filter((f: any) => !f.replied).forEach((f: any) => simulateTeamReply(f.ref));
}
```

(`receiveQuotes` and `teamReplied` are already no-ops if they run twice, which Task 5 guarantees.)

- [ ] **Step 4: Run all the tests and confirm they pass**

Run: `cd mobile && npx jest`
Expected: PASS (all suites so far).

- [ ] **Step 5: Commit**

```bash
git add mobile/src/sim mobile/__tests__/sim.test.ts
git commit -m "feat(mobile): simulated time with reset-safe timers and resume after restart"
```

---

### Task 8: 3D: port the approved models to react-three-fiber (native and web)

**Files:**
- Create: `mobile/src/three/textures.ts`, `mobile/src/three/models.ts` (ported from `design/3d/models.js`), `mobile/src/three/Scene.tsx`, `mobile/src/three/CanvasHost.tsx`, `mobile/src/three/CanvasHost.web.tsx`, `mobile/src/three/ModelView.tsx`, `mobile/assets/fallback/{villa,shop,tower,factory,reno}.png`
- Test: `mobile/__tests__/three.test.ts`

**Interfaces:**
- Consumes: `three`, `@react-three/fiber`.
- Produces:
  - `ModelView({ model:'villa'|'shop'|'tower'|'factory'|'reno', stage?:1..6|'solid', lights?:number, radius:number, target:[number,number,number], height?:number, spin?:number, yaw0?:number, shadows?:boolean, interactive?:boolean, riseKey?:string|number, style })`.
  - `FRAME` presets per model, taken from the approved page: `{villa:{radius:9.2,target:[0,1.8,0],height:0.5}, shop:{radius:10.2,target:[0.6,3.2,0],height:0.42}, tower:{radius:17.5,target:[0,13,0],height:0.22}, factory:{radius:14.2,target:[0.5,3,0],height:0.5}, reno:{radius:10,target:[0.5,3,0.5],height:0.45}}`.

- [ ] **Step 1: Write the failing test for the DOM-free texture helpers and model building**

`mobile/__tests__/three.test.ts`:

```ts
import * as THREE from 'three';
import { noiseTex, stripeTex, contactTex } from '@/three/textures';
import { buildVilla, buildShop, buildTower, buildFactory, buildReno, villaStages } from '@/three/models';

test('textures are DataTextures (no DOM canvas needed on React Native)', () => {
  for (const t of [noiseTex(), stripeTex(40, 6), contactTex(0.28)]) expect(t).toBeInstanceOf(THREE.DataTexture);
});

test('every approved model builds with rising parts and no trees', () => {
  for (const b of [buildVilla, buildShop, buildTower, buildFactory, buildReno]) {
    const m = b();
    expect(m.solid.children.some((c: any) => c.userData.rise != null)).toBe(true);
    let fronds = 0; m.root.traverse((o: any) => { if (o.geometry?.type === 'PlaneGeometry' && o.material?.side === THREE.DoubleSide) fronds++; });
    expect(fronds).toBe(0);
  }
});

test('villa stage variants exist (survey, wireframe, construction)', () => {
  const v = villaStages(buildVilla());
  expect(v.wire.children.length).toBeGreaterThan(0);
  expect(v.survey.children.length).toBeGreaterThan(0);
  expect(v.build.children.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/three.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `src/three/textures.ts`** (it replaces the three DOM-canvas functions in `models.js`)

```ts
import * as THREE from 'three';

function tex(data: Uint8Array, w: number, h: number, rx = 1, ry = 1) {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t;
}
export function noiseTex(size = 128, base = 200, amp = 40, rep = 4) {
  const d = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) { const v = Math.max(0, Math.min(255, base + (Math.random() - 0.5) * amp)); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  return tex(d, size, size, rep, rep);
}
/** Ribbed cladding bump: n bright/dark stripes across 256px. */
export function stripeTex(n = 24, rep = 1) {
  const w = 256, h = 8, d = new Uint8Array(w * h * 4);
  for (let x = 0; x < w; x++) { const f = ((x * n) / w) % 1; const v = Math.round(68 + 187 * (1 - Math.abs(2 * f - 1)));
    for (let y = 0; y < h; y++) { const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } }
  return tex(d, w, h, rep, 1);
}
/** Soft navy contact shadow (radial alpha). */
export function contactTex(op = 0.35, size = 64) {
  const d = new Uint8Array(size * size * 4); const c = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const r = Math.hypot(x - c, y - c) / c; const a = Math.max(0, 1 - Math.max(0, r - 0.15) / 0.85) * op;
    const i = (y * size + x) * 4; d[i] = 22; d[i + 1] = 32; d[i + 2] = 90; d[i + 3] = Math.round(a * 255);
  }
  const t = new THREE.DataTexture(d, size, size, THREE.RGBAFormat); t.needsUpdate = true; return t;
}
```

- [ ] **Step 4: Port `design/3d/models.js` to `src/three/models.ts`**

Copy the approved file, then make exactly these edits:

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
cp design/3d/models.js mobile/src/three/models.ts
```

1. Replace the header (the first 3 import lines) with:
   ```ts
   // @ts-nocheck — procedural port of the approved design/3d/models.js
   import * as THREE from 'three';
   import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
   import { noiseTex, stripeTex, contactTex } from './textures';
   ```
2. Delete the original `function noiseTex(...) {...}` and `function stripeTex(...) {...}` definitions (the canvas-based ones). Keep the line `const nz = noiseTex(), nzFine = noiseTex(256, 190, 70, 10);`, changing `256` to `128` for mobile memory: `noiseTex(128, 190, 70, 10)`.
3. Replace the body of `function contact(root, w, d, op = 0.35)` with:
   ```ts
   const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: contactTex(op), transparent: true, depthWrite: false }));
   m.rotation.x = -Math.PI / 2; m.position.y = -0.41; root.add(m);
   ```
4. Delete everything from the comment `// ---------- viewer ----------` to the end of the file (the viewer moves to `Scene.tsx`).
5. Delete the unused `palm` and `shrub` functions (the client asked for no trees; no model calls them any more).
6. Delete the line `solid.children.slice(-1)[0].parent; // noop` if it is present.

Run: `cd mobile && npx jest __tests__/three.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement `Scene.tsx`** (the approved viewer behaviour, ported: lights, auto-fit camera, turntable with drag momentum, springy part "rise" and stage variants)

```tsx
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useEffect, useMemo, useRef } from 'react';
import { buildVilla, buildShop, buildTower, buildFactory, buildReno, villaStages, M } from './models';

export type ModelId = 'villa' | 'shop' | 'tower' | 'factory' | 'reno';
export type StageView = 1 | 2 | 3 | 4 | 5 | 6 | 'solid';
const BUILD = { villa: buildVilla, shop: buildShop, tower: buildTower, factory: buildFactory, reno: buildReno };
const easeOutBack = (t: number) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

export type SceneProps = { model: ModelId; stage?: StageView; lights?: number; radius: number; target: [number, number, number];
  height?: number; spin?: number; yaw0?: number; shadows?: boolean; riseKey?: string | number; yawVel: { current: number } };

export function Scene({ model, stage = 'solid', lights = 0.25, radius, target, height = 0.5, spin = 0.1, yaw0 = -0.62, shadows = true, riseKey, yawVel }: SceneProps) {
  const { gl, scene, camera, size } = useThree();
  const m = useMemo(() => { const x = BUILD[model](); return model === 'villa' ? villaStages(x) : x; }, [model]);
  const warm = useMemo(() => { const w = M.warm.clone(); m.solid.traverse((o: any) => { if (o.isMesh && o.material === M.warm) o.material = w; }); return w; }, [m]);
  const yaw = useRef(yaw0); const riseT0 = useRef<number | null>(null); const buildT0 = useRef<number | null>(null);

  useEffect(() => { // environment + lights once
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; (scene as any).environmentIntensity = 0.6;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; gl.shadowMap.enabled = shadows; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    return () => pm.dispose();
  }, [gl, scene, shadows]);
  useEffect(() => { warm.emissiveIntensity = lights; }, [lights, warm]);
  useEffect(() => { // stage variants (villa only) — same rules as the approved page
    const v: any = m; if (!v.wire) return;
    const st = stage === 'solid' ? 6 : stage;
    v.survey.visible = st === 1; v.wire.visible = st >= 2 && st <= 4; v.build.visible = st === 5; v.solid.visible = stage === 'solid' || st >= 5;
    v.solid.children.forEach((g: any) => { const r = g.userData.rise; g.userData.hold = st === 5 && stage !== 'solid' && r != null && r >= 0.4 && r < 1.0; });
    riseT0.current = performance.now(); buildT0.current = performance.now();
  }, [stage, m]);
  useEffect(() => { riseT0.current = performance.now(); }, [riseKey, m]);

  const vh = THREE.MathUtils.degToRad(22) / 2;
  useFrame(() => {
    const now = performance.now();
    if (Math.abs(yawVel.current) > 0.0001) { yaw.current += yawVel.current; yawVel.current *= 0.94; } else yaw.current += spin * 0.01;
    const aspect = size.width / Math.max(1, size.height); const hh = Math.atan(Math.tan(vh) * aspect);
    const d = Math.max(radius / Math.tan(vh), radius / Math.tan(hh));
    camera.position.set(target[0] + Math.sin(yaw.current) * d, target[1] + d * height, target[2] + Math.cos(yaw.current) * d);
    camera.lookAt(target[0], target[1], target[2]);
    const tick = (group: any, t0: number | null) => {
      if (!group?.visible || t0 == null) return; const el = (now - t0) / 1000;
      for (const o of group.children) { if (o.userData.rise == null) continue;
        const t = Math.min(1, Math.max(0, (el - o.userData.rise * 0.9) / 1.0));
        o.scale.y = Math.max(t === 0 ? 0.0001 : easeOutBack(t), 0.0001); o.visible = t > 0 && !o.userData.hold; }
    };
    tick(m.solid, riseT0.current); tick((m as any).build, buildT0.current);
  });

  return (
    <>
      <directionalLight color={0xffedd6} intensity={2.6} position={[14, 22, 10]} castShadow={shadows}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={18} shadow-camera-bottom={-16} shadow-bias={-0.0003} shadow-normalBias={0.02} />
      <directionalLight color={0xcfe0ff} intensity={0.5} position={[-12, 8, -6]} />
      <hemisphereLight args={[0xe3ecff, 0xf0e8da, 0.5]} />
      <primitive object={m.root} />
    </>
  );
}
```

- [ ] **Step 6: Implement the canvas hosts and `ModelView`** (with the PNG fallback if GL fails)

`src/three/CanvasHost.tsx` (native):

```tsx
import { Canvas } from '@react-three/fiber/native';
export function CanvasHost({ children, shadows }: { children: React.ReactNode; shadows: boolean }) {
  return (
    <Canvas shadows={shadows} camera={{ fov: 22, near: 0.1, far: 400 }} gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }} style={{ flex: 1, backgroundColor: 'transparent' }}>
      {children}
    </Canvas>
  );
}
```

`src/three/CanvasHost.web.tsx` (web, used for fidelity capture):

```tsx
import { Canvas } from '@react-three/fiber';
export function CanvasHost({ children, shadows }: { children: React.ReactNode; shadows: boolean }) {
  return (
    <Canvas shadows={shadows} camera={{ fov: 22, near: 0.1, far: 400 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)} style={{ width: '100%', height: '100%', background: 'transparent' }}>
      {children}
    </Canvas>
  );
}
```

`src/three/ModelView.tsx`:

```tsx
import { Component, useRef } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CanvasHost } from './CanvasHost';
import { Scene, ModelId, StageView } from './Scene';

export const FRAME: Record<ModelId, { radius: number; target: [number, number, number]; height: number }> = {
  villa: { radius: 9.2, target: [0, 1.8, 0], height: 0.5 }, shop: { radius: 10.2, target: [0.6, 3.2, 0], height: 0.42 },
  tower: { radius: 17.5, target: [0, 13, 0], height: 0.22 }, factory: { radius: 14.2, target: [0.5, 3.0, 0], height: 0.5 },
  reno: { radius: 10.0, target: [0.5, 3.0, 0.5], height: 0.45 },
};
const FALLBACK = { villa: require('../../assets/fallback/villa.png'), shop: require('../../assets/fallback/shop.png'),
  tower: require('../../assets/fallback/tower.png'), factory: require('../../assets/fallback/factory.png'), reno: require('../../assets/fallback/reno.png') };

class GLBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

type Props = { model: ModelId; stage?: StageView; lights?: number; radius?: number; target?: [number, number, number]; height?: number;
  spin?: number; yaw0?: number; shadows?: boolean; interactive?: boolean; riseKey?: string | number; style?: StyleProp<ViewStyle> };

export function ModelView({ model, interactive = true, shadows = true, style, ...rest }: Props) {
  const f = FRAME[model]; const yawVel = useRef(0);
  const push = (dx: number) => { yawVel.current = dx * -0.01; };
  const pan = Gesture.Pan().enabled(interactive).runOnJS(true).onChange((e) => push(e.changeX));
  return (
    <GLBoundary fallback={<Image source={FALLBACK[model]} contentFit="contain" style={[{ flex: 1 }, style]} />}>
      <GestureDetector gesture={pan}>
        <View style={[{ flex: 1 }, style]}>
          <CanvasHost shadows={shadows}>
            <Scene model={model} radius={rest.radius ?? f.radius} target={rest.target ?? f.target} height={rest.height ?? f.height}
              stage={rest.stage} lights={rest.lights} spin={rest.spin} yaw0={rest.yaw0} shadows={shadows} riseKey={rest.riseKey} yawVel={yawVel} />
          </CanvasHost>
        </View>
      </GestureDetector>
    </GLBoundary>
  );
}
export default ModelView;
```

- [ ] **Step 7: Create the fallback stills from the approved 3D reference**

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
mkdir -p mobile/assets/fallback
python3 - <<'EOF'
from PIL import Image
im = Image.open('design/approved/3d-building-set.png').convert('RGBA')
W, H = im.size; n = 5; tile = W // n
for i, name in enumerate(['villa','shop','tower','factory','reno']):
    im.crop((i*tile, 0, (i+1)*tile, int(H*0.8))).save(f'mobile/assets/fallback/{name}.png')
print('ok')
EOF
```

Expected: `ok`. There are 5 PNGs in `mobile/assets/fallback/`. (Open one and check it shows the right building. If the gallery layout has gaps, adjust the crop boxes so each tile contains one building.)

- [ ] **Step 8: Device spike, where the phone is required (the user's Android phone with Expo Go installed)**

Add a temporary route `mobile/src/app/spike.tsx`:

```tsx
import { View } from 'react-native';
import { ModelView } from '@/three/ModelView';
export default function Spike() { return <View style={{ flex: 1, backgroundColor: '#F7F8FC' }}><ModelView model="villa" lights={0.5} /></View>; }
```

Run: `cd mobile && npx expo start`. Ask the user to scan the QR code with Expo Go and open `/spike` (press `s` to switch to Expo Go if prompted). Check each of these:
- (a) the villa renders on a transparent background over `#F7F8FC`;
- (b) the glass looks like glass;
- (c) dragging spins it;
- (d) the frame rate is smooth.

If the glass renders black or opaque on the device, fall back to simple glass. Append this to `models.ts`, and call `useSimpleGlass()` once at the top of `Scene.tsx` behind a `Platform.OS === 'android'` check:

```ts
export function useSimpleGlass() {
  M.glass = new THREE.MeshStandardMaterial({ color: 0xcfe9ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.45 });
  M.glassDark = new THREE.MeshStandardMaterial({ color: 0x7fa6c9, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.8 });
}
```

If shadows are too slow, pass `shadows={false}` on Home and Project (small views). Record the outcome in the commit message. Delete `spike.tsx` afterwards.

- [ ] **Step 9: Commit**

```bash
git add mobile/src/three mobile/assets/fallback mobile/__tests__/three.test.ts
git commit -m "feat(mobile): approved 3D building set on react-three-fiber (native + web) with PNG fallback"
```

---

### Task 9: App shell: root layout, splash routing, tab bars, notification banner and dev screen gallery

**Files:**
- Create:
  - `mobile/src/app/_layout.tsx`, `mobile/src/app/index.tsx` (01 Splash), `mobile/src/nav/next.ts`, `mobile/src/nav/gallery.ts`, `mobile/src/ui/NoticeBanner.tsx`
  - `mobile/src/app/(client)/_layout.tsx`, `mobile/src/app/(client)/(tabs)/_layout.tsx`
  - `mobile/src/app/(expert)/_layout.tsx`, `mobile/src/app/(expert)/pro/(tabs)/_layout.tsx`
  - `mobile/src/app/dev/gallery.tsx`
- Test: `mobile/__tests__/nav.test.ts`

**Route map:** Expo Router groups `(…)` don't appear in URLs, and the `/dev/gallery` list doubles as the fidelity capture list.

| Screen | URL |
|---|---|
| 01 | `/` |
| 02 | `/onboarding/welcome` |
| 03 | `/onboarding/signup` |
| 04 | `/onboarding/building` |
| 04b | `/onboarding/chosen` |
| 05 | `/onboarding/stage` |
| 06 | `/onboarding/creating` |
| 08 | `/home` |
| 09 | `/pulse` |
| 09a | `/pulse?state=ask` |
| 09b | `/pulse?state=thinking&q=Do%20I%20need%20a%20soil%20test%3F` |
| 09c | `/pulse?state=answer&q=…` |
| 09d | `/pulse?state=flagged&q=Can%20I%20remove%20the%20kitchen%20wall%3F` |
| 10 | `/request?kb=soil-test` |
| 10b | `/request/sent` |
| 11 | `/experts` |
| 12 | `/expert/omar` |
| 13 | `/quotes?request=req-bid` |
| 14a | `/book?expert=omar&service=bid-visit` |
| 14b | `/book?expert=omar&service=bid-visit&pay=1` |
| 14c | `/book/done` |
| 15 | `/job/job-1` |
| 15b | `/report/job-1` |
| 16 | `/review/job-1` |
| 17 | `/project` |
| 17b | `/project?tab=budget` |
| 17c | `/project?tab=site` |
| 18 | `/inbox` |
| 18b | `/chat/omar` |
| 19 | `/inbox?tab=updates` |
| 20 | `/profile` |
| E1 | `/expert-role` |
| E2 | `/expert-setup` |
| E3 | `/expert-verified` |
| E4 | `/pro` |
| E5 | `/pro/request/req-soil` |
| E6 | `/pro/jobs` |
| E7 | `/pro/job/job-1` |
| E8 | `/pro/earnings` |

**Interfaces:**
- Consumes: `useDemo`, `resumeSimulations`, `TabBar`, `Screen`, `LogoMark`, `T`.
- Produces: `nextRoute(s: Pick<DemoState,'role'|'clientOnboarded'|'expertVerified'>): string` and `GALLERY: {id:string; label:string; href:string}[]` (39 entries, ids matching `design/approved/<id>.png`).

- [ ] **Step 1: Write the failing test**

`mobile/__tests__/nav.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/nav.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/nav/next.ts` and `src/nav/gallery.ts`**

```ts
// src/nav/next.ts
import type { DemoState } from '@/store/demo';
export function nextRoute(s: Pick<DemoState, 'role' | 'clientOnboarded' | 'expertVerified'>) {
  if (s.role === 'client') return s.clientOnboarded ? '/home' : '/onboarding/building';
  if (s.role === 'expert') return s.expertVerified ? '/pro' : '/expert-role';
  return '/onboarding/welcome';
}
```

```ts
// src/nav/gallery.ts — ids = file names in design/approved/ (a plain array literal: tools/fidelity/capture.mjs reads this file)
export const GALLERY = [
  { id: '01-splash', label: 'Splash', href: '/?stay=1' }, { id: '02-welcome-role', label: 'Welcome + role', href: '/onboarding/welcome' },
  { id: '03-sign-up', label: 'Sign up', href: '/onboarding/signup' }, { id: '04-building-type', label: 'What are you building?', href: '/onboarding/building' },
  { id: '04b-building-chosen', label: 'Building chosen', href: '/onboarding/chosen?stay=1' }, { id: '05-stage', label: 'Stage', href: '/onboarding/stage' },
  { id: '06-building-your-project', label: 'Building your project', href: '/onboarding/creating?stay=1' },
  { id: '08-home', label: 'Home', href: '/home' }, { id: '09-pulse-opening', label: 'Pulse opening', href: '/pulse' },
  { id: '09a-ask', label: 'Pulse · Ask', href: '/pulse?state=ask' },
  { id: '09b-thinking', label: 'Pulse · Thinking', href: '/pulse?state=thinking&stay=1&q=Do%20I%20need%20a%20soil%20test%3F' },
  { id: '09c-answer', label: 'Pulse · Answer', href: '/pulse?state=answer&q=Do%20I%20need%20a%20soil%20test%3F' },
  { id: '09d-flagged', label: 'Pulse · Flagged', href: '/pulse?state=flagged&q=Can%20I%20remove%20the%20kitchen%20wall%3F' },
  { id: '10-request-quote', label: 'Request a quote', href: '/request?kb=soil-test' }, { id: '10b-sent', label: 'Sent', href: '/request/sent' },
  { id: '11-experts', label: 'Experts', href: '/experts' }, { id: '12-expert-profile', label: 'Expert profile', href: '/expert/omar' },
  { id: '13-quotes', label: 'Quotes', href: '/quotes?request=req-bid' },
  { id: '14a-pick-time', label: 'Pick a time', href: '/book?expert=omar&service=bid-visit' },
  { id: '14b-payment', label: 'Payment', href: '/book?expert=omar&service=bid-visit&pay=1' }, { id: '14c-booked', label: 'Booked', href: '/book/done' },
  { id: '15-job-tracking', label: 'Job tracking', href: '/job/job-1' }, { id: '15b-report', label: 'Report ready', href: '/report/job-1' },
  { id: '16-review', label: 'Review', href: '/review/job-1' }, { id: '17-project-milestones', label: 'Project · Milestones', href: '/project' },
  { id: '17b-budget', label: 'Project · Budget', href: '/project?tab=budget' }, { id: '17c-site', label: 'Project · Site', href: '/project?tab=site' },
  { id: '18-inbox', label: 'Inbox', href: '/inbox' }, { id: '18b-chat', label: 'Chat', href: '/chat/omar' },
  { id: '19-updates', label: 'Updates', href: '/inbox?tab=updates' }, { id: '20-profile', label: 'Profile', href: '/profile' },
  { id: 'E1-role', label: 'Expert · Role', href: '/expert-role' }, { id: 'E2-profile-setup', label: 'Expert · Profile', href: '/expert-setup' },
  { id: 'E3-verified', label: 'Expert · Verified', href: '/expert-verified?stay=1' }, { id: 'E4-dashboard', label: 'Expert · Dashboard', href: '/pro' },
  { id: 'E5-send-quote', label: 'Expert · Send quote', href: '/pro/request/req-soil' }, { id: 'E6-availability', label: 'Expert · Availability', href: '/pro/jobs' },
  { id: 'E7-deliverables', label: 'Expert · Deliverables', href: '/pro/job/job-1' }, { id: 'E8-earnings', label: 'Expert · Earnings', href: '/pro/earnings' },
];
```

(`?stay=1` tells a screen with an auto-advance timer to stay put, so the gallery and fidelity capture can screenshot it.)

- [ ] **Step 4: Implement the root layout, splash (01) and banner**

`src/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, HankenGrotesk_300Light, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold } from '@expo-google-fonts/hanken-grotesk';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useDemo } from '@/store/demo';
import { resumeSimulations } from '@/sim/scheduler';
import { NoticeBanner } from '@/ui/NoticeBanner';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fonts] = useFonts({ HankenGrotesk_300Light, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold });
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== 'web');
  const [hydrated, setHydrated] = useState(useDemo.persist.hasHydrated());
  useEffect(() => { if (Platform.OS === 'web') require('@shopify/react-native-skia/lib/module/web').LoadSkiaWeb({ locateFile: () => '/canvaskit.wasm' }).then(() => setSkiaReady(true)); }, []);
  useEffect(() => useDemo.persist.onFinishHydration(() => setHydrated(true)), []);
  useEffect(() => { if (hydrated) resumeSimulations(); }, [hydrated]);
  const ready = fonts && skiaReady && hydrated;
  useEffect(() => { if (ready) SplashScreen.hideAsync(); }, [ready]);
  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#F7F8FC' } }} />
        <NoticeBanner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

`src/app/index.tsx`. This is 01 Splash: white background with the 3-colour aurora, the animated logo (84px) and "Project / Pulse" at 26/800. After 1.6s it routes on via `nextRoute`:

```tsx
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Screen } from '@/ui/Screen';
import { LogoMark } from '@/ui/LogoMark';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';
import { useDemo } from '@/store/demo';
import { nextRoute } from '@/nav/next';

export default function Splash() {
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  useEffect(() => { if (stay) return; const t = setTimeout(() => router.replace(nextRoute(useDemo.getState()) as any), 1600); return () => clearTimeout(t); }, [stay]);
  return (
    <Screen bg="white3">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -s(30) }}>
        <LogoMark size={84} animated />
        <T size={26} w={800} ls={-0.03} lh={1} align="center" style={{ marginTop: s(18) }}>{'Project\nPulse'}</T>
      </View>
    </Screen>
  );
}
```

(The splash uses `bg="white3"`: a white base with the 3-colour aurora, defined in Task 3.)

`src/ui/NoticeBanner.tsx`. This is a glass banner that slides down from the top, auto-hides after 3.5s, and opens `href` when tapped:

```tsx
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemo } from '@/store/demo';
import { Glass } from './Glass';
import { T } from './T';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export function NoticeBanner() {
  const banner = useDemo((st) => st.banner); const dismiss = useDemo((st) => st.dismissBanner);
  const insets = useSafeAreaInsets();
  useEffect(() => { if (!banner) return; Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); const t = setTimeout(dismiss, 3500); return () => clearTimeout(t); }, [banner?.id]);
  if (!banner) return null;
  return (
    <Animated.View entering={SlideInUp.springify().damping(18)} exiting={SlideOutUp} style={{ position: 'absolute', top: insets.top + s(6), left: s(12), right: s(12), zIndex: 100 }}>
      <Pressable onPress={() => { dismiss(); router.push(banner.href as any); }}>
        <Glass r={18} style={{ padding: s(12), flexDirection: 'row', gap: s(10), alignItems: 'center' }}>
          <View style={{ width: s(8), height: s(8), borderRadius: s(4), backgroundColor: C.blue }} />
          <View style={{ flex: 1 }}><T size={12} w={700}>{banner.title}</T><T size={10.5} c={C.mute}>{banner.text}</T></View>
        </Glass>
      </Pressable>
    </Animated.View>
  );
}
```

- [ ] **Step 5: Implement the group layouts with tab bars**

```tsx
// src/app/(client)/_layout.tsx
import { Stack } from 'expo-router';
export default function ClientLayout() { return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />; }
```

```tsx
// src/app/(client)/(tabs)/_layout.tsx — Home · Project · Experts · Inbox (Profile is a hidden tab that keeps Home highlighted)
import { Tabs } from 'expo-router';
import { TabBar, TabItem } from '@/ui/TabBar';
const ITEMS: TabItem[] = [
  { route: 'home', label: 'Home', icon: 'home', also: ['profile'] }, { route: 'project', label: 'Project', icon: 'proj' },
  { route: 'experts', label: 'Experts', icon: 'exp' }, { route: 'inbox', label: 'Inbox', icon: 'inbox' },
];
export default function ClientTabs() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} items={ITEMS} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#F7F8FC' } }}>
      <Tabs.Screen name="home" /><Tabs.Screen name="project" /><Tabs.Screen name="experts" /><Tabs.Screen name="inbox" />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
```

```tsx
// src/app/(expert)/_layout.tsx
import { Stack } from 'expo-router';
export default function ExpertLayout() { return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />; }
```

```tsx
// src/app/(expert)/pro/(tabs)/_layout.tsx — Home · Requests · Jobs · Earnings · Inbox
import { Tabs } from 'expo-router';
import { TabBar, TabItem } from '@/ui/TabBar';
const ITEMS: TabItem[] = [
  { route: 'index', label: 'Home', icon: 'home' }, { route: 'requests', label: 'Requests', icon: 'req' },
  { route: 'jobs', label: 'Jobs', icon: 'jobs' }, { route: 'earnings', label: 'Earnings', icon: 'earn' }, { route: 'inbox', label: 'Inbox', icon: 'inbox' },
];
export default function ExpertTabs() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} items={ITEMS} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#F7F8FC' } }}>
      <Tabs.Screen name="index" /><Tabs.Screen name="requests" /><Tabs.Screen name="jobs" /><Tabs.Screen name="earnings" /><Tabs.Screen name="inbox" />
    </Tabs>
  );
}
```

Folder layout for the expert URLs: `src/app/(expert)/pro/(tabs)/{index,requests,jobs,earnings,inbox}.tsx` → `/pro`, `/pro/requests`, …; `src/app/(expert)/pro/request/[id].tsx` → `/pro/request/:id`; `src/app/(expert)/pro/job/[id].tsx` → `/pro/job/:id`; `src/app/(expert)/expert-role.tsx`, `expert-setup.tsx`, `expert-verified.tsx`.

Client URLs: `src/app/(client)/(tabs)/{home,project,experts,inbox,profile}.tsx`, and `src/app/(client)/{pulse,request/index,request/sent,expert/[id],quotes,book/index,book/done,job/[id],report/[id],review/[id],chat/[id]}.tsx`. Onboarding: `src/app/onboarding/{welcome,signup,building,chosen,stage,creating}.tsx`.

Create every one of these route files now as a one-line placeholder, so navigation compiles (each is replaced by its screen task):

```tsx
import { View } from 'react-native';
export default function Placeholder() { return <View style={{ flex: 1, backgroundColor: '#F7F8FC' }} />; }
```

- [ ] **Step 6: Implement the dev gallery `src/app/dev/gallery.tsx`** (resets the demo first so every screen shows seed data)

```tsx
import { FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Screen } from '@/ui/Screen';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';
import { useDemo } from '@/store/demo';
import { GALLERY } from '@/nav/gallery';

export default function Gallery() {
  useEffect(() => { const st = useDemo.getState(); st.resetDemo(); useDemo.setState({ role: 'client', clientOnboarded: true, expertVerified: true }); }, []);
  return (
    <Screen bg="plain">
      <T size={22} w={700} style={{ marginVertical: s(10) }}>Screen gallery</T>
      <FlatList data={GALLERY} keyExtractor={(g) => g.id} contentContainerStyle={{ gap: s(6), paddingBottom: s(40) }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(item.href as any)}>
            <Glass r={12} style={{ padding: s(10) }}><T size={11} w={600}>{item.id} · {item.label}</T></Glass>
          </Pressable>
        )} />
    </Screen>
  );
}
```

- [ ] **Step 7: Run the tests, then run the app and confirm it boots to Welcome**

Run: `cd mobile && npx jest && npx tsc --noEmit`
Expected: all tests PASS, and tsc reports no errors.

Run: `cd mobile && npx expo start --web`. Open the printed URL. The splash animates and then shows the (placeholder) Welcome. Visit `/dev/gallery`, and check that all 39 entries are listed and each one navigates.

- [ ] **Step 8: Commit**

```bash
git add mobile/src mobile/__tests__/nav.test.ts
git commit -m "feat(mobile): app shell — splash routing, tab bars, notice banner, 39-screen dev gallery"
```

---

### Task 10: Onboarding screens 02–06 (Welcome, Sign up, Building, Chosen, Stage, Creating)

Reference images: `design/approved/02-welcome-role.png`, `03-sign-up.png`, `04-building-type.png`, `04b-building-chosen.png`, `05-stage.png`, `06-building-your-project.png`. Mockup CSS: `design/mockups/batch1-welcome-signup.html`, `batch1-approved.html` and `batch1-building-moment.html`. These screens use **16px** side padding (`px={16}`), as in their mockups.

**Files:**
- Modify (replace placeholders): `mobile/src/app/onboarding/{welcome,signup,building,chosen,stage,creating}.tsx`
- Test: `mobile/__tests__/onboarding.test.tsx`

**Interfaces:**
- Consumes: `Screen`, `Header`, `Eyebrow`, `T`, `Btn`, `Glass`, `LogoMark`, `Orb`, `Halo`, `GradientText`, `ModelView`, `PageDots`, `useDemo`, `BUILDINGS`, `STAGES`, `STAGE_DESC`.

- [ ] **Step 1: Write the failing flow test**

`mobile/__tests__/onboarding.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Welcome from '@/app/onboarding/welcome';
import Building from '@/app/onboarding/building';
import Stage from '@/app/onboarding/stage';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Welcome: the role buttons set the role and go to sign up', () => {
  render(<Welcome />);
  expect(screen.getByText('Ask. Get matched.')).toBeTruthy();
  fireEvent.press(screen.getByText('I need an expert'));
  expect(useDemo.getState().role).toBe('client');
  expect(router.push).toHaveBeenCalledWith('/onboarding/signup');
});

test('Building: shows Villa first with its subtitle; Continue goes to chosen', () => {
  render(<Building />);
  expect(screen.getByText('Villa')).toBeTruthy(); expect(screen.getByText('Private residence')).toBeTruthy();
  fireEvent.press(screen.getByText('Continue'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/chosen?type=villa');
});

test('Stage: defaults to Tender with its description; Continue goes to creating', () => {
  render(<Stage />);
  expect(screen.getByText('Collecting contractor bids')).toBeTruthy();
  fireEvent.press(screen.getByText('Continue'));
  expect(router.push).toHaveBeenCalledWith('/onboarding/creating?type=villa&stage=3');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/onboarding.test.tsx`
Expected: FAIL (placeholders render nothing).

- [ ] **Step 3: Implement the screens**

`src/app/onboarding/welcome.tsx` (02). The hero is a 118px orb with halo rings and three glass chips. Below it: the headline, the gradient line, the paragraph and two role buttons:

```tsx
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { LogoMark } from '@/ui/LogoMark';
import { Orb, Halo } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { useDemo } from '@/store/demo';

const chip = (label: string, pos: object, ver = false) => (
  <Glass r={14} style={[{ position: 'absolute', paddingVertical: s(7), paddingHorizontal: s(10), flexDirection: 'row', alignItems: 'center', gap: s(4) }, pos]}>
    {ver && <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>}
    <T size={9.5} w={600}>{label}</T>
  </Glass>
);

export default function Welcome() {
  const go = (role: 'client' | 'expert') => { useDemo.getState().setRole(role); router.push('/onboarding/signup'); };
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(6) }}>
        <LogoMark size={22} />
        <Pressable onPress={() => router.push('/onboarding/signup?mode=signin')}><T size={11} w={600} c={C.mute}>Sign in</T></Pressable>
      </View>
      <View style={{ alignItems: 'center', marginTop: s(30), height: s(118) }}>
        <View><Halo size={118} /><Orb size={118} /></View>
        {chip('Villa · Design stage', { left: 0, top: s(6) })}
        {chip('Geotech Engineer', { right: -s(4), top: s(66) }, true)}
        {chip('Quote in 24h', { left: s(12), bottom: -s(24) })}
      </View>
      <View style={{ marginTop: 'auto', paddingBottom: s(20) }}>
        <T size={24} w={700} ls={-0.03} lh={1.12}>Ask. Get matched.</T>
        <GradientText size={24} w={700} ls={-0.03} lh={1.12} colors={[C.blue, C.cyan]}>Build with confidence.</GradientText>
        <T size={11} c={C.mute} lh={1.5} style={{ marginTop: s(7) }}>Verified answers and vetted experts for your construction project.</T>
        <Pressable onPress={() => go('client')} style={{ marginTop: s(16), backgroundColor: C.blue, borderRadius: s(20), paddingVertical: s(8), paddingLeft: s(18), paddingRight: s(8),
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: C.blue, shadowOpacity: 0.28, shadowRadius: s(12), shadowOffset: { width: 0, height: s(10) }, elevation: 6 }}>
          <View><T size={13} w={700} c="#fff">I need an expert</T><T size={9.5} w={500} c="rgba(255,255,255,0.75)" style={{ marginTop: 1 }}>Advice, quotes & site visits</T></View>
          <View style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}><T size={13} c="#fff">→</T></View>
        </Pressable>
        <Pressable onPress={() => go('expert')}>
          <Glass r={20} style={{ marginTop: s(8), paddingVertical: s(8), paddingLeft: s(18), paddingRight: s(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View><T size={13} w={700}>I'm an expert</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>Engineers, architects, designers</T></View>
            <View style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><T size={13} c={C.blue}>→</T></View>
          </Glass>
        </Pressable>
      </View>
    </Screen>
  );
}
```

`src/app/onboarding/signup.tsx` (03). It has the email field (focused style), the saved-account suggestion ("Use"), the password field, **Create account**, then a busy spinner, a tick and navigation:

```tsx
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';
import { useDemo } from '@/store/demo';

export default function SignUp() {
  const role = useDemo((st) => st.role) ?? 'client';
  const acct = role === 'expert' ? { name: 'Omar Haddad', email: 'omar.haddad@mail.ae', initial: 'O' } : { name: 'Sara Al Mansoori', email: 'sara@almansoori.ae', initial: 'S' };
  const [email, setEmail] = useState(acct.email); const [pw, setPw] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const input = { fontFamily: F[400], fontSize: s(11.5), color: C.navy, padding: s(14), borderRadius: s(14), borderWidth: 1.5, backgroundColor: '#fff' } as const;
  const submit = () => { setState('busy'); setTimeout(() => setState('done'), 600); setTimeout(() => router.push(role === 'expert' ? '/expert-role' : '/onboarding/building'), 900); };
  return (
    <Screen bg="aurora" px={16}>
      <Header />
      <T size={22} w={700} ls={-0.03} lh={1.12} style={{ marginTop: s(18) }}>{'Create your\naccount'}</T>
      <T size={11} c={C.mute} style={{ marginTop: s(6) }}>Takes 10 seconds.</T>
      <View style={{ marginTop: s(20), gap: s(10) }}>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" allowFontScaling={false}
          style={[input, { borderColor: C.blue, shadowColor: C.blue, shadowOpacity: 0.08, shadowRadius: s(4) }]} />
        <Pressable onPress={() => { setEmail(acct.email); setPw('••••••••'); }}>
          <Glass r={14} style={{ marginTop: -s(4), paddingVertical: s(9), paddingHorizontal: s(12), flexDirection: 'row', alignItems: 'center', gap: s(9) }}>
            <View style={{ width: s(24), height: s(24), borderRadius: s(12), backgroundColor: '#AEBCFF', alignItems: 'center', justifyContent: 'center' }}><T size={10} w={700} c="#fff">{acct.initial}</T></View>
            <View style={{ flex: 1 }}><T size={11} w={600}>{acct.name}</T><T size={9.5} c={C.mute}>{acct.email}</T></View>
            <T size={9.5} w={700} c={C.blue}>Use</T>
          </Glass>
        </Pressable>
        <View style={[input, { borderColor: C.lineSolid, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 0, paddingRight: s(14) }]}>
          <TextInput value={pw} onChangeText={setPw} placeholder="Password" placeholderTextColor="#9AA0BD" secureTextEntry allowFontScaling={false}
            style={{ flex: 1, padding: s(14), fontFamily: F[400], fontSize: s(11.5), color: C.navy }} />
          <T size={11} c="#9AA0BD">◌</T>
        </View>
      </View>
      <View style={{ marginTop: 'auto', marginBottom: s(10) }}><Btn title="Create account" onPress={submit} busy={state === 'busy'} done={state === 'done'} /></View>
      <T size={9.5} c={C.mute} align="center" style={{ marginBottom: s(20) }}>Already a member? <T size={9.5} w={700} c={C.blue}>Sign in</T></T>
    </Screen>
  );
}
```

`src/app/onboarding/building.tsx` (04). A swipeable 3D model (262 tall, bleeding to the edges), the name with a cross-fade, the subtitle, 5 page dots and **Continue**:

```tsx
import { View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { PageDots } from '@/ui/PageDots';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS } from '@/data/types';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Building() {
  const [i, setI] = useState(0); const b = BUILDINGS[i];
  const step = (d: number) => { const n = (i + d + BUILDINGS.length) % BUILDINGS.length; setI(n); Haptics.selectionAsync(); };
  const swipe = Gesture.Fling().direction(1 | 2).runOnJS(true).onEnd((e: any) => step(e.velocityX < 0 ? 1 : -1));
  return (
    <Screen bg="aurora" px={16}>
      <Header center={<Eyebrow>1 OF 2</Eyebrow>} />
      <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>{'What are you\nbuilding?'}</T>
      <GestureDetector gesture={swipe}>
        <View style={{ height: s(262), marginHorizontal: -s(16), marginTop: s(6) }}><ModelView model={b.id} riseKey={b.id} lights={0.25} /></View>
      </GestureDetector>
      <View style={{ alignItems: 'center', marginTop: -s(4) }}>
        <Animated.View key={b.id} entering={FadeIn.duration(220)} exiting={FadeOut.duration(150)}><T size={26} w={700} ls={-0.035}>{b.name}</T></Animated.View>
        <T size={9.5} c={C.mute} style={{ marginTop: s(2) }}>{b.sub}</T>
      </View>
      <View style={{ marginTop: s(10) }}><PageDots count={5} index={i} /></View>
      <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title="Continue" onPress={() => router.push(`/onboarding/chosen?type=${b.id}`)} /></View>
    </Screen>
  );
}
```

`src/app/onboarding/chosen.tsx` (04b). A tick pops in, the model (320 tall) appears with lights at 0.9, then the name and "Lights on. Let's find your stage…". It auto-advances after 1.4s:

```tsx
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS, BuildingType } from '@/data/types';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Chosen() {
  const { type = 'villa', stay } = useLocalSearchParams<{ type?: BuildingType; stay?: string }>();
  const b = BUILDINGS.find((x) => x.id === type) ?? BUILDINGS[0];
  useEffect(() => { if (stay) return; const t = setTimeout(() => router.replace(`/onboarding/stage?type=${b.id}`), 1400); return () => clearTimeout(t); }, [stay]);
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Animated.View entering={ZoomIn.springify().damping(9)} style={{ marginTop: s(34), width: s(44), height: s(44), borderRadius: s(22), backgroundColor: C.blue,
          alignItems: 'center', justifyContent: 'center', shadowColor: C.blue, shadowOpacity: 0.35, shadowRadius: s(15), shadowOffset: { width: 0, height: s(12) }, elevation: 8 }}>
          <T size={20} c="#fff">✓</T>
        </Animated.View>
        <View style={{ height: s(320), alignSelf: 'stretch', marginHorizontal: -s(16), marginTop: s(10) }}><ModelView model={b.id} lights={0.9} spin={0.25} radius={9.8} target={[0, 1.8, 0]} /></View>
        <T size={27} w={700} ls={-0.035} style={{ marginTop: s(6) }}>{b.name}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Lights on. Let's find your stage…</T>
      </View>
    </Screen>
  );
}
```

`src/app/onboarding/stage.tsx` (05). The model shows the stage variant. Below it is the iOS-style picker: 118-wide slots, the selected one at 23/700 navy and the rest at 15/600 `#B3B8CF`, with faded edges. Below that, a one-line description and **Continue**:

```tsx
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Animated, { useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { ModelView } from '@/three/ModelView';
import { BUILDINGS, BuildingType, STAGES, STAGE_DESC, Stage as StageN } from '@/data/types';
import { s } from '@/theme/scale';
import { C, EASE } from '@/theme/tokens';

const SLOT = 118;
export default function StageScreen() {
  const { type = 'villa' } = useLocalSearchParams<{ type?: BuildingType }>();
  const b = BUILDINGS.find((x) => x.id === type) ?? BUILDINGS[0];
  const [st, setSt] = useState<StageN>(3); const [w, setW] = useState(0);
  const pick = (n: number) => { const v = Math.min(6, Math.max(1, n)) as StageN; if (v !== st) { setSt(v); Haptics.selectionAsync(); } };
  const row = useAnimatedStyle(() => ({ transform: [{ translateX: withTiming(w / 2 - ((st - 1) * s(SLOT) + s(SLOT) / 2), { duration: 800, easing: EASE }) }] }));
  const swipe = Gesture.Fling().direction(1 | 2).runOnJS(true).onEnd((e: any) => pick(st + (e.velocityX < 0 ? 1 : -1)));
  return (
    <Screen bg="aurora" px={16}>
      <Header center={<Eyebrow>2 OF 2</Eyebrow>} />
      <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(14) }}>{`Where is your\n${b.name.toLowerCase()} today?`}</T>
      <View style={{ height: s(262), marginHorizontal: -s(16), marginTop: s(6) }}>
        <ModelView model={b.id} stage={b.id === 'villa' ? st : 'solid'} radius={11.2} target={[0, 3.4, 0]} spin={0.08} lights={st === 6 ? 0.9 : 0} />
      </View>
      <GestureDetector gesture={swipe}>
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: s(38), marginHorizontal: -s(16), marginTop: s(2) }}>
          <MaskedView style={{ flex: 1 }} maskElement={<LinearGradient colors={['transparent', '#000', '#000', 'transparent']} locations={[0, 0.3, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />}>
            <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', height: s(38) }, row]}>
              {STAGES.map((name, i) => (
                <Pressable key={name} onPress={() => pick(i + 1)} style={{ width: s(SLOT), alignItems: 'center' }}>
                  <T size={i + 1 === st ? 23 : 15} w={i + 1 === st ? 700 : 600} ls={i + 1 === st ? -0.035 : -0.02} c={i + 1 === st ? C.navy : C.faint3}>{name}</T>
                </Pressable>
              ))}
            </Animated.View>
          </MaskedView>
        </View>
      </GestureDetector>
      <Animated.View key={st} entering={FadeIn.duration(250)}><T size={11} c={C.mute} align="center" style={{ marginTop: s(4) }}>{STAGE_DESC[st - 1]}</T></Animated.View>
      <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title="Continue" onPress={() => router.push(`/onboarding/creating?type=${b.id}&stage=${st}`)} /></View>
    </Screen>
  );
}
```

`src/app/onboarding/creating.tsx` (06). The Pulse moment: a 110px orb with halos on `#FBFCFF` with the 3-colour aurora, "Building your project…" and a 4-line checklist that ticks in. After 2.6s it completes onboarding and goes to Home:

```tsx
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Orb, Halo } from '@/fx/Orb';
import { BUILDINGS, BuildingType, STAGES, Stage } from '@/data/types';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Creating() {
  const p = useLocalSearchParams<{ type?: BuildingType; stage?: string; stay?: string }>();
  const type = (p.type ?? 'villa') as BuildingType; const stage = Number(p.stage ?? 3) as Stage;
  const name = BUILDINGS.find((b) => b.id === type)!.name;
  useEffect(() => {
    if (p.stay) return;
    const t = setTimeout(() => { useDemo.getState().completeClientOnboarding(type, stage); router.replace('/home'); }, 2600);
    return () => clearTimeout(t);
  }, [p.stay]);
  const lines = [`✓ ${name} · ${STAGES[stage - 1]} stage`, '✓ 6 milestones created', '✓ Pulse tuned to your stage', '◌ Matching experts near Al Reem…'];
  return (
    <Screen bg="pulse" px={16}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View><Halo size={110} /><Orb size={110} /></View>
        <T size={17} w={700} ls={-0.02} style={{ marginTop: s(34) }}>Building your project…</T>
        <View style={{ marginTop: s(16), gap: s(8), alignItems: 'flex-start' }}>
          {lines.map((l, i) => (
            <Animated.View key={l} entering={FadeInDown.delay(100 * (i + 1)).duration(1000)}>
              <T size={11} c={i === 3 ? C.mute : C.navy}>{l}</T>
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/onboarding.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Fidelity check (visual)**

Run: `cd mobile && npx expo start --web`. Visit each of the 6 URLs at a 254×554 browser window (Chrome DevTools device toolbar → responsive, 254 × 554), and compare side by side with the reference PNGs. Fix any spacing, size or copy difference before committing. (Task 21 automates this for the whole app.)

- [ ] **Step 6: Commit**

```bash
git add mobile/src/app/onboarding mobile/__tests__/onboarding.test.tsx
git commit -m "feat(mobile): onboarding screens 02–06 matching approved references"
```

---

### Task 11: Home (08) and Profile (20)

Reference images: `design/approved/08-home.png` and `20-profile.png`. Mockup CSS: `design/mockups/batch2-home-experts-approved.html` (Home) and `batch3b-job-project-inbox.html` (Profile).

**Files:**
- Modify: `mobile/src/app/(client)/(tabs)/home.tsx`, `mobile/src/app/(client)/(tabs)/profile.tsx`
- Test: `mobile/__tests__/home.test.tsx`

**Interfaces:**
- Consumes: `StageTrack`, `IridescentBorder`, `Orb`, `GradientText`, `ModelView`, `Avatar`, `Glass`, `useDemo`, `newQuotesFor`, `bestQuote`, `NEXT_STEP`, `BUILDINGS`.

- [ ] **Step 1: Write the failing test**

`mobile/__tests__/home.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import Home from '@/app/(client)/(tabs)/home';
import Profile from '@/app/(client)/(tabs)/profile';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({}) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Home shows the approved content and wires the actions', () => {
  render(<Home />);
  for (const t of ['Good evening', 'Sara', 'Villa · Al Reem Island', 'NEXT STEP', 'Choose a contractor', 'Start', 'Ask Pulse anything…',
    'NEEDS YOU', 'Quotes ready', 'Bid review · from AED 2,200', 'Site visit', 'Thu 9 Oct · 10:00 · Omar']) expect(screen.getByText(t)).toBeTruthy();
  expect(screen.getByText('2')).toBeTruthy();
  fireEvent.press(screen.getByText('Ask Pulse anything…'));
  expect(router.push).toHaveBeenCalledWith('/pulse');
  fireEvent.press(screen.getByText('Quotes ready'));
  expect(router.push).toHaveBeenCalledWith('/quotes?request=req-bid');
});

test('Profile switch goes to the expert side', () => {
  render(<Profile />);
  fireEvent.press(screen.getByText('Switch to Expert app'));
  expect(useDemo.getState().role).toBe('expert');
  expect(router.replace).toHaveBeenCalledWith('/expert-role');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/home.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `home.tsx`**

The glass project card has the model breaking out of its top edge (190×140 at `top:-74`). Below it are the stage track and the Next-step row, then the Ask bar with an iridescent border, then the "Needs you" list:

```tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { StageTrack } from '@/fx/StageTrack';
import { ModelView } from '@/three/ModelView';
import { useDemo, newQuotesFor } from '@/store/demo';
import { BUILDINGS, NEXT_STEP } from '@/data/types';
import { EXPERTS, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Home() {
  const { stage, projectType, jobs } = useDemo();
  const fresh = useDemo((st) => newQuotesFor(st, 'req-bid'));
  const from = Math.min(...fresh.map((q) => q.price));
  const job = jobs.find((j) => j.status === 'visit' || j.status === 'booked');
  const b = BUILDINGS.find((x) => x.id === projectType)!;
  return (
    <Screen bg="aurora3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
          <View><T size={9.5} c={C.mute}>Good evening</T><GradientText shimmer size={22} w={700} ls={-0.035} style={{ marginTop: s(2) }}>Sara</GradientText></View>
          <Pressable onPress={() => router.push('/profile')}><Avatar photo="sara" size={34} ring="white" /></Pressable>
        </View>

        <Glass r={22} style={{ marginTop: s(58), paddingTop: s(54), paddingHorizontal: s(12), paddingBottom: s(10), overflow: 'visible' }}>
          <View style={{ position: 'absolute', left: '50%', marginLeft: -s(95), top: -s(74), width: s(190), height: s(140) }}>
            <ModelView model={b.id} lights={0.5} radius={9.4} target={[0, 2.2, 0]} height={0.42} spin={0.15} shadows={false} />
          </View>
          <T size={13} w={700} ls={-0.01} align="center">{b.name} · Al Reem Island</T>
          <StageTrack stage={stage} />
          <Pressable onPress={() => router.push('/quotes?request=req-bid')}>
            <LinearGradient colors={['rgba(0,0,254,0.06)', 'rgba(49,209,255,0.08)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.3 }}
              style={{ marginTop: s(8), borderRadius: s(14), paddingVertical: s(7), paddingLeft: s(7), paddingRight: s(12), flexDirection: 'row', alignItems: 'center', gap: s(9) }}>
              <View style={{ width: s(28), height: s(28), borderRadius: s(14), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
                shadowColor: C.blue, shadowOpacity: 0.12, shadowRadius: s(5), elevation: 2 }}><Icon name="arrowR" size={12} color={C.blue} stroke={2.4} /></View>
              <View style={{ flex: 1 }}>
                <T size={8.5} w={700} ls={0.12} c={C.mute}>NEXT STEP</T>
                <GradientText shimmer size={11.5} w={700} numberOfLines={1} style={{ marginTop: 1 }}>{NEXT_STEP[stage - 1]}</GradientText>
              </View>
              <T size={10} w={700} c={C.blue}>Start</T>
            </LinearGradient>
          </Pressable>
        </Glass>

        <Pressable onPress={() => router.push('/pulse')} style={{ marginTop: s(12) }}>
          <IridescentBorder r={24}>
            <Glass r={24} style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(6), paddingLeft: s(8), paddingRight: s(6) }}>
              <Orb size={30} />
              <GradientText shimmer base={C.faint2} size={12} style={{ flex: 1 }}>Ask Pulse anything…</GradientText>
              <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><Icon name="mic" size={13} color="#fff" stroke={2} /></View>
            </Glass>
          </IridescentBorder>
        </Pressable>

        <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(12), marginBottom: s(8) }}>NEEDS YOU</T>
        <Glass r={20} style={{ paddingHorizontal: s(14) }}>
          {fresh.length > 0 && (
            <Pressable onPress={() => router.push('/quotes?request=req-bid')} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11), borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', borderWidth: s(4), borderColor: 'rgba(0,0,254,0.12)' }}><T size={12} w={700} c="#fff">{String(fresh.length)}</T></View>
              <View style={{ flex: 1 }}><T size={12} w={700} ls={-0.01}>Quotes ready</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{`Bid review · from ${aed(from)}`}</T></View>
              <T size={15} c={C.faint3}>›</T>
            </Pressable>
          )}
          {job && (
            <Pressable onPress={() => router.push(`/job/${job.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11) }}>
              <View style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: 'rgba(0,0,254,0.08)', alignItems: 'center', justifyContent: 'center' }}><Icon name="cal" size={15} color={C.blue} stroke={2} /></View>
              <View style={{ flex: 1 }}><T size={12} w={700} ls={-0.01}>Site visit</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{`${job.dayLabel} · ${job.timeLabel} · ${EXPERTS.find((e) => e.id === job.expertId)!.first}`}</T></View>
              <T size={15} c={C.faint3}>›</T>
            </Pressable>
          )}
        </Glass>
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 4: Implement `profile.tsx`** (20)

It has a 70px avatar (4px white ring), the name, the email, a settings list and the "Switch to Expert app" card with a gradient icon tile. A long press on the version label resets the demo:

```tsx
import { Alert, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { useDemo } from '@/store/demo';
import { CLIENT } from '@/data/seed';
import { GRAD } from '@/theme/tokens';
import { nextRoute } from '@/nav/next';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const Row = ({ label, value, last }: { label: string; value?: string; last?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(12), borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
    <T size={12} w={600}>{label}</T>
    <View style={{ marginLeft: 'auto' }}>{value ? <T size={11} c={C.mute} w={500}>{value}</T> : <T size={12} c={C.faint3}>›</T>}</View>
  </View>
);

export default function Profile() {
  const toExpert = () => { const st = useDemo.getState(); st.setRole('expert'); router.replace(nextRoute({ ...st, role: 'expert' }) as any); };
  const reset = () => Alert.alert('Reset demo?', 'Restores the original demo data.', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive',
    onPress: () => { useDemo.getState().resetDemo(); router.replace('/'); } }]);
  return (
    <Screen bg="aurora3">
      <View style={{ alignItems: 'center', marginTop: s(18) }}>
        <Avatar photo="sara" size={70} ring="white4" />
        <T size={20} w={700} ls={-0.035} style={{ marginTop: s(12) }}>{CLIENT.name}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{CLIENT.email}</T>
      </View>
      <Glass r={18} style={{ marginTop: s(18), paddingHorizontal: s(14) }}>
        <Row label="My projects" value="1" /><Row label="Payments" /><Row label="Notifications" /><Row label="Language" value="English" last />
      </Glass>
      <Pressable onPress={toExpert}>
        <Glass r={18} style={{ marginTop: s(14), padding: s(14), flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(32), height: s(32), borderRadius: s(10), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="swap" size={15} color="#fff" stroke={2.2} />
          </LinearGradient>
          <View style={{ flex: 1 }}><T size={12} w={700}>Switch to Expert app</T><T size={9.5} c={C.mute}>Demo: see the engineer side</T></View>
          <T size={14} w={700} c={C.blue}>›</T>
        </Glass>
      </Pressable>
      <Pressable onLongPress={reset} style={{ marginTop: 'auto', marginBottom: s(84), alignSelf: 'center' }}><T size={9} c={C.faint3}>Project Pulse demo · v1.0</T></Pressable>
    </Screen>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/home.test.tsx`
Expected: PASS.

- [ ] **Step 6: Visual check against `08-home.png` and `20-profile.png`** (web, at 254×554). Fix any differences.

- [ ] **Step 7: Commit**

```bash
git add "mobile/src/app/(client)/(tabs)/home.tsx" "mobile/src/app/(client)/(tabs)/profile.tsx" mobile/__tests__/home.test.tsx
git commit -m "feat(mobile): Home (08) and Profile (20)"
```

---

### Task 12: Pulse AI guide: Opening (09), Ask (09a), Thinking (09b), Answer (09c), Flagged (09d)

Reference images: `design/approved/09-pulse-opening.png`, `09a-ask.png`, `09b-thinking.png`, `09c-answer.png`, `09d-flagged.png`. Mockup CSS: `batch2-home-experts-approved.html` (opening) and `batch3a-pulse-ai.html` (the rest). **Rules:** plain white background, no coloured screen-edge glow, no chat bubble on Thinking, and the same slow soft orb as Ask.

**Files:**
- Modify: `mobile/src/app/(client)/pulse.tsx`
- Create: `mobile/src/pulse/usePulseFlow.ts`
- Test: `mobile/__tests__/pulseScreen.test.tsx`

**Interfaces:**
- Consumes: `askPulse`, `renderBody`, `SUGGESTIONS`, `SUGGESTION_QUERY`, `STAGE_EXPERTS`, `useDemo.flagQuestion`, `simulateTeamReply`, `Orb`, `GradientText`, `IridescentBorder`, `Avatar`, `Btn`, `Sheet`.
- Produces: the route `/pulse?state=open|ask|thinking|answer|flagged&q=…`. The Thinking state lasts 1.8s, then moves to answer or flagged unless `stay=1`.

- [ ] **Step 1: Write the failing tests**

`mobile/__tests__/pulseScreen.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Pulse from '@/app/(client)/pulse';
import { useDemo } from '@/store/demo';

let params: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() }, useLocalSearchParams: () => params }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); useDemo.setState({ stage: 3 }); jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test('Opening shows the Tender suggestions', () => {
  params = {}; render(<Pulse />);
  expect(screen.getByText('Review my 3 contractor bids')).toBeTruthy();
  expect(screen.getByText('or just ask. Type, or hold the mic to speak')).toBeTruthy();
});

test('Soil test question → thinking → answer with a Request a quote CTA', () => {
  params = { state: 'thinking', q: 'Do I need a soil test?' };
  render(<Pulse />);
  expect(screen.getByText('Finding your answer…')).toBeTruthy();
  act(() => { jest.advanceTimersByTime(1900); });
  expect(screen.getByText('Geotechnical engineer')).toBeTruthy();
  expect(screen.getByText('◆ Project Pulse Villa Guide')).toBeTruthy();
  fireEvent.press(screen.getByText('Request a quote'));
  expect(router.push).toHaveBeenCalledWith('/request?kb=soil-test');
});

test('Structural question is flagged by code: fixed response, flag stored', () => {
  params = { state: 'thinking', q: 'Can I remove the kitchen wall?' };
  render(<Pulse />);
  act(() => { jest.advanceTimersByTime(1900); });
  expect(screen.getByText('An engineer will\nanswer this one')).toBeTruthy();
  expect(useDemo.getState().flags.some((f) => f.question === 'Can I remove the kitchen wall?' && !f.replied)).toBe(true);
});

test('Unknown question falls back gracefully', () => {
  params = { state: 'thinking', q: 'qwerty zzz' };
  render(<Pulse />);
  act(() => { jest.advanceTimersByTime(1900); });
  expect(screen.getByText("I don't have a verified answer for that yet.")).toBeTruthy();
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `cd mobile && npx jest __tests__/pulseScreen.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/pulse/usePulseFlow.ts`**

```ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { askPulse, PulseResult } from './match';
import { useDemo } from '@/store/demo';
import { simulateTeamReply } from '@/sim/scheduler';
import type { Stage } from '@/data/types';

export type PulseState = 'open' | 'ask' | 'thinking' | 'answer' | 'flagged' | 'fallback';
export function usePulseFlow(initial: { state?: string; q?: string; stay?: string }) {
  const projectType = useDemo((s) => s.projectType); const projectStage = useDemo((s) => s.stage);
  const [askStage, setAskStage] = useState<Stage>(projectStage);
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
```

- [ ] **Step 4: Implement `src/app/(client)/pulse.tsx`**

```tsx
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { BackButton } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Icon } from '@/ui/Icon';
import { Avatar } from '@/ui/Avatar';
import { Sheet } from '@/ui/Sheet';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { usePulseFlow } from '@/pulse/usePulseFlow';
import { SUGGESTIONS, SUGGESTION_QUERY, STAGE_EXPERTS, renderBody } from '@/pulse/match';
import { STAGES, Stage } from '@/data/types';
import { CLIENT, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

function Counter({ to, ms }: { to: number; ms: number }) {
  const [n, setN] = useState(0);
  useEffect(() => { const t0 = Date.now(); const id = setInterval(() => { const p = Math.min(1, (Date.now() - t0) / ms); setN(Math.round(to * p)); if (p === 1) clearInterval(id); }, 40); return () => clearInterval(id); }, []);
  return <T size={13} w={700} style={{ fontVariant: ['tabular-nums'] }}>{n.toLocaleString('en-US')}</T>;
}

function Streamed({ text, lead }: { text: string; lead: string }) {
  const words = text.split(' '); const [k, setK] = useState(0);
  useEffect(() => { const id = setInterval(() => setK((x) => (x >= words.length ? (clearInterval(id), x) : x + 1)), 45); return () => clearInterval(id); }, [text]);
  return <T size={12.5} lh={1.6}><T size={12.5} w={700}>{lead}</T>{' '}{words.slice(0, k).join(' ')}</T>;
}

const Head = ({ right }: { right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), paddingTop: s(8) }}>
    <BackButton flat /><T size={13} w={700} ls={-0.01}>Pulse</T><View style={{ marginLeft: 'auto' }}>{right}</View>
  </View>
);

export default function PulseScreen() {
  const params = useLocalSearchParams<{ state?: string; q?: string; stay?: string }>();
  const f = usePulseFlow(params);
  const [text, setText] = useState(params.state === 'ask' ? 'Do I need a soil test?' : '');
  const [stageSheet, setStageSheet] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  if (f.state === 'open') return (
    <Screen bg="white">
      <View style={{ alignItems: 'center', flex: 1 }}>
        <View style={{ marginTop: s(40) }}><Orb size={90} /></View>
        <View style={{ marginTop: s(34), alignItems: 'center' }}>
          <T size={15} w={600} ls={-0.02} lh={1.35} align="center">What would you like</T>
          <View style={{ flexDirection: 'row' }}><T size={15} w={600} ls={-0.02} lh={1.35}>help with, </T><GradientText shimmer size={15} w={600} ls={-0.02} lh={1.35}>{CLIENT.first}</GradientText><T size={15} w={600} lh={1.35}>?</T></View>
        </View>
        <View style={{ marginTop: s(22), gap: s(8), alignSelf: 'stretch' }}>
          {SUGGESTIONS[f.askStage].map((sug) => (
            <Pressable key={sug} onPress={() => { Haptics.selectionAsync(); setPicked(sug); setTimeout(() => f.submit(SUGGESTION_QUERY[sug] ?? sug), 260); }}>
              <Glass r={16} style={[{ paddingVertical: s(12), paddingHorizontal: s(14) }, picked === sug && { borderColor: C.blue, borderWidth: 1.5 }]}><T size={12} w={600}>{sug}</T></Glass>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => f.setState('ask')} style={{ marginTop: 'auto', marginBottom: s(22) }}><T size={9.5} c={C.mute}>or just ask. Type, or hold the mic to speak</T></Pressable>
      </View>
    </Screen>
  );

  if (f.state === 'ask') return (
    <Screen bg="white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Head right={
          <Pressable onPress={() => setStageSheet(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(5), backgroundColor: C.inputBg, paddingVertical: s(7), paddingHorizontal: s(11), borderRadius: s(16) }}>
            <T size={10.5} w={700}>{STAGES[f.askStage - 1]} stage</T><Icon name="chev" size={9} stroke={3} />
          </Pressable>} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Orb size={96} soft />
          <T size={16} w={600} ls={-0.02} lh={1.4} align="center" style={{ marginTop: s(30) }}>{'What would you\nlike to know?'}</T>
          <T size={9.5} c={C.mute} style={{ marginTop: s(8) }}>Answers from Project Pulse experts</T>
        </View>
        <View style={{ marginBottom: s(20), flexDirection: 'row', alignItems: 'center', gap: s(8), backgroundColor: C.inputBg, borderRadius: s(22), paddingVertical: s(6), paddingLeft: s(14), paddingRight: s(6) }}>
          <TextInput value={text} onChangeText={setText} onSubmitEditing={() => f.submit(text)} placeholder="Ask about your project" placeholderTextColor={C.faint2}
            allowFontScaling={false} style={{ flex: 1, fontFamily: F[400], fontSize: s(11.5), color: C.navy, paddingVertical: 0 }} />
          <Pressable onPress={() => f.submit(text)} style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center',
            shadowColor: C.blue, shadowOpacity: 0.3, shadowRadius: s(7), elevation: 4 }}><Icon name="send" size={14} color="#fff" stroke={2.4} /></Pressable>
        </View>
      </KeyboardAvoidingView>
      <Sheet visible={stageSheet} onClose={() => setStageSheet(false)}>
        <T size={15} w={700} style={{ marginBottom: s(8) }}>Asking about stage</T>
        {STAGES.map((n, i) => (
          <Pressable key={n} onPress={() => { f.setAskStage((i + 1) as Stage); setStageSheet(false); }} style={{ paddingVertical: s(10), borderBottomWidth: 1, borderBottomColor: C.line }}>
            <T size={13} w={i + 1 === f.askStage ? 700 : 500} c={i + 1 === f.askStage ? C.blue : C.navy}>{n}</T>
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );

  if (f.state === 'thinking') {
    const key = f.result?.kind === 'answer' ? f.result.entry.keyPhrase : '';
    const idx = key ? f.q.toLowerCase().indexOf(key.toLowerCase()) : -1;
    return (
      <Screen bg="white">
        <View style={{ paddingTop: s(8) }}><BackButton flat /></View>
        <View style={{ alignItems: 'center' }}>
          <View style={{ marginTop: s(62) }}><Orb size={132} soft /></View>
          <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: s(34), flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {idx >= 0 ? (<>
              <T size={14} w={500} ls={-0.01} c={C.faint}>{f.q.slice(0, idx)}</T>
              <GradientText shimmer size={14} w={600} ls={-0.01}>{f.q.slice(idx, idx + key.length)}</GradientText>
              <T size={14} w={500} ls={-0.01} c={C.faint}>{f.q.slice(idx + key.length)}</T>
            </>) : <T size={14} w={500} c={C.faint} align="center">{f.q}</T>}
          </Animated.View>
          <T size={9.5} c={C.faint3} style={{ marginTop: s(6) }}>Finding your answer…</T>
          <LinearGradient colors={['#B9A8FF', 'rgba(185,168,255,0)']} style={{ width: 1, height: s(60), marginTop: s(22) }} />
          <View style={{ width: s(52), height: s(52), borderRadius: s(26), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: s(6),
            shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(10), elevation: 3 }}>
            <Counter to={1240} ms={1700} /><T size={6.5} w={700} ls={0.12} c={C.mute}>GUIDES</T>
          </View>
        </View>
      </Screen>
    );
  }

  if (f.state === 'flagged') return (
    <Screen bg="white">
      <View style={{ paddingTop: s(8) }}><BackButton flat /></View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <T size={13} c={C.faint} style={{ marginTop: s(20) }}>{`"${f.q}"`}</T>
        <View style={{ marginTop: s(30), width: s(104), height: s(104), alignItems: 'center', justifyContent: 'center' }}>
          <Orb size={104} soft calm style={{ position: 'absolute' }} />
          <Avatar photo="rashid" size={58} ring="white" />
        </View>
        <T size={21} w={700} ls={-0.035} lh={1.2} align="center" style={{ marginTop: s(24) }}>{'An engineer will\nanswer this one'}</T>
        <T size={11} c={C.mute} lh={1.55} align="center" style={{ marginTop: s(10), maxWidth: s(210) }}>
          {/wall/i.test(f.q) ? 'Wall changes affect' : f.result?.kind === 'flagged' && f.result.category === 'legal' ? 'Legal questions need' : f.result?.kind === 'flagged' && f.result.category === 'safety' ? 'Safety issues need' : 'This affects'}
          {f.result?.kind === 'flagged' && f.result.category !== 'structural' ? ' a person, so ' : " your building's structure, so "}
          <T size={11} w={700}>Rashid from Project Pulse</T> will reply to you personally.
        </T>
        <Glass r={14} style={{ marginTop: s(18), flexDirection: 'row', alignItems: 'center', gap: s(8), paddingVertical: s(9), paddingHorizontal: s(14) }}>
          <Icon name="mail" size={14} color={C.blue} stroke={2} /><T size={10.5} w={600}>Reply by email <T size={10.5} w={500} c={C.faint}>· within 24h</T></T>
        </Glass>
        <View style={{ alignSelf: 'stretch', marginTop: 'auto', marginBottom: s(18) }}>
          <Btn title="Got it" onPress={() => router.replace('/home')} />
          <Pressable onPress={() => router.replace('/experts')} style={{ marginTop: s(12), alignItems: 'center' }}><T size={11} w={600} c={C.blue}>Book a structural engineer instead</T></Pressable>
        </View>
      </View>
    </Screen>
  );

  // answer + fallback
  const e = f.result?.kind === 'answer' ? f.result.entry : null;
  return (
    <Screen bg="white">
      <Head />
      <View style={{ alignItems: 'flex-end', marginTop: s(14) }}>
        <View style={{ maxWidth: '78%', backgroundColor: C.navy, paddingVertical: s(10), paddingHorizontal: s(13), borderTopLeftRadius: s(18), borderTopRightRadius: s(18), borderBottomLeftRadius: s(18), borderBottomRightRadius: s(5) }}>
          <T size={11.5} c="#fff" lh={1.45}>{f.q}</T>
        </View>
      </View>
      {e ? (<>
        <View style={{ marginTop: s(14) }}><Streamed lead={e.lead} text={renderBody(e, f.projectType)} /></View>
        <Animated.View entering={FadeIn.delay(600)} style={{ flexDirection: 'row', marginTop: s(8) }}>
          <View style={{ backgroundColor: 'rgba(0,0,254,0.06)', paddingVertical: s(4), paddingHorizontal: s(9), borderRadius: s(10) }}><T size={9} w={700} c={C.blue}>{`◆ ${e.source}`}</T></View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(900).springify().damping(16)} style={{ marginTop: s(14) }}>
          <IridescentBorder r={22}>
            <View style={{ borderRadius: s(22), backgroundColor: '#fff', padding: s(14), overflow: 'hidden', shadowColor: C.blue, shadowOpacity: 0.12, shadowRadius: s(20), elevation: 6 }}>
              <LinearGradient colors={['rgba(49,209,255,0.32)', 'rgba(185,168,255,0.32)', 'rgba(0,0,254,0.16)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, height: s(64), opacity: 0.8 }} />
              <T size={9} w={700} ls={0.13} c={C.blue}>YOU'LL NEED</T>
              <T size={15} w={700} ls={-0.02} style={{ marginTop: s(6) }}>{e.recommend.expertType}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), marginTop: s(8) }}>
                <View style={{ flexDirection: 'row' }}>{e.recommend.avatars.map((p, i) => <Avatar key={p} photo={p} size={26} ring="white" style={{ marginLeft: i ? -s(8) : 0 }} />)}</View>
                <T size={9.5} c={C.mute} numberOfLines={1}>{`${e.recommend.count} verified · from ${aed(e.recommend.fromPrice)}`}</T>
              </View>
              <Btn title="Request a quote" style={{ marginTop: s(12), paddingVertical: s(11) }} onPress={() => router.push(`/request?kb=${e.id}`)} />
            </View>
          </IridescentBorder>
        </Animated.View>
      </>) : (<>
        <T size={12.5} lh={1.6} style={{ marginTop: s(14) }}>I don't have a verified answer for that yet.</T>
        <T size={11} c={C.mute} lh={1.5} style={{ marginTop: s(4) }}>{`Here's the right expert to ask for your ${STAGES[f.askStage - 1].toLowerCase()} stage:`}</T>
        <View style={{ marginTop: s(12), gap: s(8) }}>
          {STAGE_EXPERTS[f.askStage].map((x) => (
            <Pressable key={x} onPress={() => router.push('/experts')}><Glass r={16} style={{ padding: s(12), flexDirection: 'row', justifyContent: 'space-between' }}><T size={12} w={700}>{x}</T><T size={12} c={C.blue} w={700}>›</T></Glass></Pressable>
          ))}
        </View>
      </>)}
    </Screen>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/pulseScreen.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Visual check** of 09, 09a, 09b, 09c and 09d against their references at 254×554 (web). Check: the thinking screen has no bubble and no edge glow; the orb is soft and slow.

- [ ] **Step 7: Commit**

```bash
git add "mobile/src/app/(client)/pulse.tsx" mobile/src/pulse/usePulseFlow.ts mobile/__tests__/pulseScreen.test.tsx
git commit -m "feat(mobile): Pulse AI guide screens 09–09d with code-level flagging and graceful fallback"
```

---

### Task 13: Request a quote (10) and Sent (10b)

Reference images: `design/approved/10-request-quote.png` and `10b-sent.png`. Mockup CSS: `batch3a-pulse-ai.html`.

**Files:**
- Modify: `mobile/src/app/(client)/request/index.tsx`, `mobile/src/app/(client)/request/sent.tsx`
- Test: `mobile/__tests__/request.test.tsx`

**Interfaces:**
- Consumes: `KB`, `useDemo.sendRequest`, `simulateQuotes`, `Segmented`, `Dock`, `Avatar`, `Orb`, `GradientText`.

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/request.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import RequestQuote from '@/app/(client)/request/index';
import { useDemo } from '@/store/demo';
import * as sim from '@/sim/scheduler';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({ kb: 'soil-test' }) }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Pulse-written summary, one tap to send, double tap sends once', () => {
  const spy = jest.spyOn(sim, 'simulateQuotes').mockImplementation(() => {});
  render(<RequestQuote />);
  expect(screen.getByText('Soil investigation and geotechnical report for a 5-bedroom villa on Al Reem Island, needed before structural design.')).toBeTruthy();
  expect(screen.getByText('Within 2 weeks')).toBeTruthy();
  fireEvent.press(screen.getByText('Send request'));
  fireEvent.press(screen.getByTestId('btn'));
  expect(useDemo.getState().requests.filter((r) => r.kbId === 'soil-test')).toHaveLength(1);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith('/request/sent');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/request.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `request/index.tsx`** (10)

```tsx
import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Orb } from '@/fx/Orb';
import { KB } from '@/pulse/kb';
import { useDemo } from '@/store/demo';
import { simulateQuotes } from '@/sim/scheduler';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

const WHEN = [['asap', 'ASAP'], ['2w', 'Within 2 weeks'], ['flex', 'Flexible']] as const;
export default function RequestQuote() {
  const { kb = 'soil-test' } = useLocalSearchParams<{ kb?: string }>();
  const e = KB.find((x) => x.id === kb) ?? KB[0];
  const [summary, setSummary] = useState(e.requestSummary); const [edit, setEdit] = useState(false);
  const [when, setWhen] = useState<'asap' | '2w' | 'flex'>('2w'); const [busy, setBusy] = useState(false);
  const send = () => {
    if (busy) return; setBusy(true);
    const id = useDemo.getState().sendRequest({ kbId: e.id, title: e.requestTitle, summary, expertType: e.recommend.expertType, when });
    simulateQuotes(id); router.replace('/request/sent');
  };
  const kv = (label: string, right: React.ReactNode, last = false) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(12), borderBottomWidth: last ? 0 : 1, borderBottomColor: '#EEF0F6' }}>
      <T size={11.5} c={C.mute}>{label}</T>{right}
    </View>
  );
  return (
    <Screen bg="white">
      <Header flat />
      <T size={24} w={700} ls={-0.035} style={{ marginTop: s(12) }}>Request a quote</T>
      <View style={{ marginTop: s(14), borderRadius: s(18), padding: s(14), backgroundColor: 'rgba(0,0,254,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,254,0.08)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}><Orb size={12} /><T size={9} w={700} ls={0.08} c={C.blue}>WRITTEN BY PULSE</T></View>
        {edit ? <TextInput value={summary} onChangeText={setSummary} multiline autoFocus allowFontScaling={false}
          style={{ marginTop: s(8), fontFamily: F[400], fontSize: s(11.5), lineHeight: s(11.5 * 1.55), color: C.navy, padding: 0 }} />
          : <T size={11.5} lh={1.55} style={{ marginTop: s(8) }}>{summary}</T>}
        <Pressable onPress={() => setEdit(!edit)}><T size={10} w={700} c={C.blue} style={{ marginTop: s(8) }}>{edit ? 'Done' : 'Edit'}</T></Pressable>
      </View>
      <View style={{ marginTop: s(6) }}>
        {kv('Location', <T size={11.5} w={700}>Al Reem Island</T>)}
        <View style={{ paddingTop: s(12), paddingBottom: s(6) }}><T size={11.5} c={C.mute}>When</T></View>
        <View style={{ flexDirection: 'row', backgroundColor: '#F1F3F9', borderRadius: s(12), padding: s(3) }}>
          {WHEN.map(([k, label]) => (
            <Pressable key={k} onPress={() => setWhen(k)} style={{ flex: 1, alignItems: 'center', paddingVertical: s(7), borderRadius: s(9), backgroundColor: when === k ? '#fff' : 'transparent', elevation: when === k ? 1 : 0 }}>
              <T size={10} w={600} c={when === k ? C.navy : C.mute}>{label}</T>
            </Pressable>
          ))}
        </View>
        <View style={{ marginTop: s(4) }}>{kv('Sending to', (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
            <View style={{ flexDirection: 'row' }}>{e.recommend.avatars.map((p, i) => <Avatar key={p} photo={p} size={22} ring="white" style={{ marginLeft: i ? -s(8) : 0 }} />)}</View>
            <T size={11.5} w={700}>5 experts</T>
          </View>), true)}</View>
      </View>
      <Dock bg="white"><Btn title="Send request" busy={busy} onPress={send} /></Dock>
    </Screen>
  );
}
```

- [ ] **Step 4: Implement `request/sent.tsx`** (10b)

The five expert avatars orbit a soft orb on a dashed ring, each ticking in turn. Below: the title, the shimmer line, the 3-step line and **Done**:

```tsx
import { View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import type { PhotoKey } from '@/theme/photos';

const PEOPLE: PhotoKey[] = ['karim', 'lina', 'rashid', 'maya', 'omar'];
function Orbiter({ i, spin }: { i: number; spin: Animated.SharedValue<number> }) {
  const R = s(86);
  const st = useAnimatedStyle(() => { const a = ((i * 72 - 90) * Math.PI) / 180 + spin.value; return { transform: [{ translateX: Math.cos(a) * R }, { translateY: Math.sin(a) * R }] }; });
  return (
    <Animated.View style={[{ position: 'absolute', left: s(100) - s(17), top: s(100) - s(17) }, st]}>
      <Avatar photo={PEOPLE[i]} size={34} ring="white" />
      <Animated.View entering={ZoomIn.delay(350 * i + 400).springify()} style={{ position: 'absolute', right: -s(4), bottom: -s(3), width: s(15), height: s(15), borderRadius: s(8),
        backgroundColor: C.blue, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></Animated.View>
    </Animated.View>
  );
}
export default function Sent() {
  const spin = useSharedValue(0);
  useEffect(() => { spin.value = withRepeat(withTiming(Math.PI * 2, { duration: 24000, easing: Easing.linear }), -1, false);
    const t = setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 2200); return () => clearTimeout(t); }, []);
  const step = (label: string, when: string, on = false) => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ width: s(12), height: s(12), borderRadius: s(6), backgroundColor: on ? C.blue : '#fff', borderWidth: 2, borderColor: on ? C.blue : '#D3D8E8' }} />
      <T size={11} w={700} style={{ marginTop: s(7) }}>{label}</T><T size={9} c={C.faint} style={{ marginTop: 1 }}>{when}</T>
    </View>
  );
  return (
    <Screen bg="white">
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ marginTop: s(40), width: s(200), height: s(200) }}>
          <Svg width={s(200)} height={s(200)} style={{ position: 'absolute' }}><Circle cx={s(100)} cy={s(100)} r={s(86)} stroke="rgba(0,0,254,0.18)" strokeDasharray="4 4" fill="none" /></Svg>
          <View style={{ position: 'absolute', left: s(100) - s(39), top: s(100) - s(39) }}><Orb size={78} soft /></View>
          {PEOPLE.map((_, i) => <Orbiter key={i} i={i} spin={spin} />)}
        </View>
        <T size={23} w={700} ls={-0.035} style={{ marginTop: s(22) }}>Sent to 5 experts</T>
        <View style={{ flexDirection: 'row', marginTop: s(6) }}><T size={11} c={C.mute}>Quotes usually arrive </T><GradientText shimmer base={C.navy} size={11} w={600}>within 24 hours</GradientText></View>
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: s(22) }}>
          <View style={{ position: 'absolute', left: '16%', right: '16%', top: s(5), height: 2, backgroundColor: '#E6E9F2' }} />
          {step('Sent', 'Now', true)}{step('Quotes', '~24h')}{step('You choose', 'Then')}
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 'auto', marginBottom: s(20) }}><Btn title="Done" onPress={() => router.replace('/home')} /></View>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/request.test.tsx`
Expected: PASS.

- [ ] **Step 6: Visual check** of 10 and 10b against their references. **Commit.**

```bash
git add "mobile/src/app/(client)/request" mobile/__tests__/request.test.tsx
git commit -m "feat(mobile): Request a quote (10) with Pulse-written summary and Sent orbit (10b)"
```

---

### Task 14: Experts (11), Expert profile → book (12), Quotes (13)

Reference images: `design/approved/11-experts.png`, `12-expert-profile.png` and `13-quotes.png`. Mockup CSS: `batch2-home-experts-approved.html` (11) and `batch2-profile-quotes-booking.html` (12, 13).

**Files:**
- Modify: `mobile/src/app/(client)/(tabs)/experts.tsx`, `mobile/src/app/(client)/expert/[id].tsx`, `mobile/src/app/(client)/quotes.tsx`
- Test: `mobile/__tests__/experts.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/experts.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import Experts from '@/app/(client)/(tabs)/experts';
import ExpertProfile from '@/app/(client)/expert/[id]';
import Quotes from '@/app/(client)/quotes';
import { useDemo } from '@/store/demo';

let params: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => params }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); });

test('Experts grid is sorted by Pulse match with the approved badges', () => {
  params = {}; render(<Experts />);
  expect(screen.getByText('96% match')).toBeTruthy(); expect(screen.getByText('Matched by Pulse to your Tender stage')).toBeTruthy();
  fireEvent.press(screen.getByText('Omar Haddad'));
  expect(router.push).toHaveBeenCalledWith('/expert/omar');
});
test('Profile: choosing the second service updates the Book button', () => {
  params = { id: 'omar' }; render(<ExpertProfile />);
  expect(screen.getByText('Book · AED 2,200')).toBeTruthy();
  fireEvent.press(screen.getByText('Site visit only'));
  fireEvent.press(screen.getByText('Book · AED 1,800'));
  expect(router.push).toHaveBeenCalledWith('/book?expert=omar&service=visit');
});
test('Quotes: best match is Omar at 12% below average; Accept goes to booking', () => {
  params = { request: 'req-bid' }; render(<Quotes />);
  expect(screen.getByText('AED 2,200')).toBeTruthy(); expect(screen.getByText('12% below average price')).toBeTruthy();
  expect(screen.getByText('2 more · from AED 2,450')).toBeTruthy();
  fireEvent.press(screen.getByText('Accept & book'));
  expect(router.push).toHaveBeenCalledWith('/book?expert=omar&service=bid-visit&quote=q-omar');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/experts.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `experts.tsx`** (11)

It has the title with a search button, the Pulse match line, the filter chips and the two-column photo grid. The top match gets an iridescent border and a shimmer badge:

```tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { IridescentBorder } from '@/fx/IridescentBorder';
import { EXPERTS, aed } from '@/data/seed';
import { STAGES } from '@/data/types';
import { PHOTOS } from '@/theme/photos';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const FILTERS = ['For you', 'Engineers', 'Architects', 'Interiors'] as const;
export default function Experts() {
  const stage = useDemo((st) => st.stage); const [f, setF] = useState<(typeof FILTERS)[number]>('For you');
  const list = [...EXPERTS].filter((e) => f === 'For you' || e.category === f).sort((a, b) => b.match - a.match);
  return (
    <Screen bg="aurora">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
        <T size={24} w={700} ls={-0.035}>Experts</T>
        <Glass r={17} style={{ width: s(34), height: s(34), alignItems: 'center', justifyContent: 'center' }}><Icon name="search" size={14} stroke={2.2} /></Glass>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(6) }}>
        <Orb size={14} /><GradientText shimmer base={C.faint2} size={9.5}>{`Matched by Pulse to your ${STAGES[stage - 1]} stage`}</GradientText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: s(12), flexGrow: 0 }} contentContainerStyle={{ gap: s(6) }}>
        {FILTERS.map((x) => <Chip key={x} label={x} on={x === f} onPress={() => setF(x)} />)}
      </ScrollView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(12), marginTop: s(14), paddingBottom: s(110) }}>
        {list.map((e, i) => {
          const top = i === 0 && f === 'For you';
          const photo = (
            <View style={{ height: s(124), borderRadius: s(18), overflow: 'hidden' }}>
              <Image source={PHOTOS[e.photo]} contentFit="cover" contentPosition="top" style={{ flex: 1 }} />
              <View style={{ position: 'absolute', left: s(8), top: s(8), backgroundColor: '#fff', paddingVertical: s(3), paddingHorizontal: s(8), borderRadius: s(10) }}>
                {top ? <GradientText shimmer size={9} w={700}>{`${e.match}% match`}</GradientText> : <T size={9} w={700}>{`${e.match}% match`}</T>}
              </View>
            </View>
          );
          return (
            <Pressable key={e.id} onPress={() => router.push(`/expert/${e.id}`)} style={{ width: '48%' }}>
              {top ? <IridescentBorder r={18}>{photo}</IridescentBorder> : photo}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(3), marginTop: s(7) }}>
                <T size={12} w={700} ls={-0.01} numberOfLines={1}>{e.name}</T>
                {i < 2 && <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>}
              </View>
              <T size={9.5} c={C.mute} numberOfLines={1}>{`${e.role} · ★ ${e.rating.toFixed(1)}`}</T>
              <T size={11} w={700} style={{ marginTop: s(3) }}>{aed(e.services[0].price)}</T>
            </Pressable>
          );
        })}
      </ScrollView>
      <LinearGradient pointerEvents="none" colors={['rgba(247,248,252,0)', 'rgba(247,248,252,1)', 'rgba(247,248,252,1)']} locations={[0, 0.55, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: s(96) }} />
    </Screen>
  );
}
```

Show the verified tick on the grid **only for the first two tiles**. This matches `11-experts.png`, where the second-row names have no tick.

- [ ] **Step 4: Implement `expert/[id].tsx`** (12)

It has a 250-tall full-bleed portrait fading to the background, glass back and mail buttons, then the name, the credential line and the verified mark. "CHOOSE A SERVICE" shows two radio cards, and a pinned `Book · AED X` button sits below. Portfolio, licence and reviews continue below the fold:

```tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/ui/Header';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock, DOCK_SPACE } from '@/ui/Dock';
import { Icon } from '@/ui/Icon';
import { EXPERTS, aed } from '@/data/seed';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function ExpertProfile() {
  const { id = 'omar' } = useLocalSearchParams<{ id?: string }>();
  const e = EXPERTS.find((x) => x.id === id) ?? EXPERTS[0];
  const [svc, setSvc] = useState(e.services[0].id); const price = e.services.find((x) => x.id === svc)!.price;
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: s(DOCK_SPACE) }} showsVerticalScrollIndicator={false}>
        <View style={{ height: s(250) }}>
          <Image source={PHOTOS[e.photo]} contentFit="cover" contentPosition="top" style={{ flex: 1 }} />
          <LinearGradient colors={['rgba(247,248,252,0)', C.bg]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: s(110) }} />
          <View style={{ position: 'absolute', top: Math.max(insets.top, s(30)) + s(8), left: s(20), right: s(20), flexDirection: 'row', justifyContent: 'space-between' }}>
            <BackButton />
            <Pressable onPress={() => router.push(`/chat/${e.id}`)}><Glass r={16} style={{ width: s(32), height: s(32), alignItems: 'center', justifyContent: 'center' }}><Icon name="mail" size={13} stroke={2} /></Glass></Pressable>
          </View>
        </View>
        <View style={{ marginTop: -s(46), paddingHorizontal: s(20) }}>
          <T size={25} w={700} ls={-0.035}>{e.name}</T>
          <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{e.role === 'Structural' ? 'Structural engineer' : e.role} · <T size={11} c={C.star}>★</T> {e.rating.toFixed(1)} · {e.jobs} jobs</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5), marginTop: s(8) }}>
            <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>
            <T size={10} w={600} c={C.blue}>Verified by Project Pulse</T>
          </View>
          <T size={9.5} w={700} ls={0.1} c={C.mute} style={{ marginTop: s(20) }}>CHOOSE A SERVICE</T>
          {e.services.slice(0, 2).map((x) => {
            const on = x.id === svc;
            return (
              <Pressable key={x.id} onPress={() => setSvc(x.id)} style={{ marginTop: s(10), flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(14), paddingHorizontal: s(16),
                borderRadius: s(18), backgroundColor: '#fff', borderWidth: on ? 1.5 : 0, borderColor: C.blue, shadowColor: on ? C.blue : '#16205A', shadowOpacity: on ? 0.12 : 0.05, shadowRadius: s(10), elevation: 2 }}>
                <View style={{ width: s(18), height: s(18), borderRadius: s(9), borderWidth: on ? s(5) : 2, borderColor: on ? C.blue : '#CFD4E6' }} />
                <View style={{ flex: 1 }}><T size={12.5} w={600}>{x.name}</T><T size={10} w={500} c={C.mute} style={{ marginTop: 2 }}>{x.note}</T></View>
                <T size={13} w={700}>{x.price.toLocaleString('en-US')}</T>
              </Pressable>
            );
          })}
          <T size={9.5} w={700} ls={0.1} c={C.mute} style={{ marginTop: s(24) }}>RECENT WORK</T>
          <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
            {(['port1', 'port2', 'port3'] as const).map((p) => <Image key={p} source={PHOTOS[p]} contentFit="cover" style={{ flex: 1, height: s(62), borderRadius: s(12) }} />)}
          </View>
          <T size={10} c={C.mute} style={{ marginTop: s(14) }}>{`Licence ${e.licence} · ${e.areas}`}</T>
        </View>
      </ScrollView>
      <Dock><Btn title={`Book · ${aed(price)}`} onPress={() => router.push(`/book?expert=${e.id}&service=${svc}`)} /></Dock>
    </View>
  );
}
```

- [ ] **Step 5: Implement `quotes.tsx`** (13)

It shows "Your best match", one recommendation card with the price and the Pulse reason, the "2 more" line with Compare (a sheet listing all quotes), and a pinned **Accept & book**:

```tsx
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Sheet } from '@/ui/Sheet';
import { Orb } from '@/fx/Orb';
import { useDemo, bestQuote } from '@/store/demo';
import { EXPERTS, MARKET_AVG, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Quotes() {
  const { request = 'req-bid' } = useLocalSearchParams<{ request?: string }>();
  const all = useDemo((st) => st.quotes.filter((q) => q.requestId === request)).sort((a, b) => a.price - b.price);
  const req = useDemo((st) => st.requests.find((r) => r.id === request));
  const best = useDemo((st) => bestQuote(st, request));
  const [cmp, setCmp] = useState(false);
  if (!best) return <Screen><Header /><T size={14} style={{ marginTop: s(20) }}>Quotes are on their way.</T></Screen>;
  const ex = EXPERTS.find((e) => e.id === best.expertId)!; const others = all.filter((q) => q.id !== best.id);
  const avg = MARKET_AVG[req?.kbId ?? 'bid-review'] ?? best.price; const below = Math.round(((avg - best.price) / avg) * 100);
  const service = ex.services[0].id;
  return (
    <Screen bg="aurora">
      <Header />
      <T size={25} w={700} ls={-0.035} style={{ marginTop: s(14) }}>Your best match</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`From ${all.length} quotes for your ${(req?.title ?? 'bid review').toLowerCase()}`}</T>
      <View style={{ marginTop: s(18), padding: s(18), borderRadius: s(24), backgroundColor: '#fff', alignItems: 'center', shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(10), elevation: 3 }}>
        <Avatar photo={ex.photo} size={64} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4), marginTop: s(10) }}>
          <T size={14} w={700}>{ex.name}</T>
          <View style={{ width: s(13), height: s(13), borderRadius: s(7), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={8} c="#fff">✓</T></View>
        </View>
        <T size={9.5} c={C.mute} style={{ marginTop: s(2) }}><T size={9.5} c={C.star}>★</T>{` ${ex.rating.toFixed(1)} · Report in ${best.days} days`}</T>
        <T size={30} w={700} ls={-0.04} style={{ marginTop: s(12) }}>{aed(best.price)}</T>
        {below > 0 && <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(10) }}><Orb size={14} /><T size={10} w={600} c={C.blue}>{`${below}% below average price`}</T></View>}
      </View>
      {others.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), marginTop: s(14), paddingHorizontal: s(4) }}>
          <View style={{ flexDirection: 'row' }}>{others.slice(0, 2).map((q, i) => <Avatar key={q.id} photo={EXPERTS.find((e) => e.id === q.expertId)!.photo} size={24} ring="white" style={{ marginLeft: i ? -s(8) : 0 }} />)}</View>
          <T size={9.5} c={C.mute} style={{ flex: 1 }} numberOfLines={1}>{`${others.length} more · from ${aed(others[0].price)}`}</T>
          <Pressable onPress={() => setCmp(true)}><T size={11} w={700} c={C.blue}>Compare</T></Pressable>
        </View>
      )}
      <Dock><Btn title="Accept & book" onPress={() => { useDemo.getState().acceptQuote(best.id); router.push(`/book?expert=${ex.id}&service=${service}&quote=${best.id}`); }} /></Dock>
      <Sheet visible={cmp} onClose={() => setCmp(false)}>
        <T size={15} w={700} style={{ marginBottom: s(6) }}>All quotes</T>
        {all.map((q) => { const e = EXPERTS.find((x) => x.id === q.expertId)!; return (
          <View key={q.id} style={{ flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(10), borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Avatar photo={e.photo} size={34} /><View style={{ flex: 1 }}><T size={12} w={700}>{e.name}</T><T size={9.5} c={C.mute}>{`★ ${e.rating.toFixed(1)} · ${q.days} days${q.visitIncluded ? ' · visit included' : ''}`}</T></View>
            <T size={15} w={700}>{q.price.toLocaleString('en-US')}</T>
          </View>); })}
      </Sheet>
    </Screen>
  );
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/experts.test.tsx`
Expected: PASS.

- [ ] **Step 7: Visual check** of 11, 12 and 13. **Commit.**

```bash
git add "mobile/src/app/(client)/(tabs)/experts.tsx" "mobile/src/app/(client)/expert" "mobile/src/app/(client)/quotes.tsx" mobile/__tests__/experts.test.tsx
git commit -m "feat(mobile): Experts grid (11), profile→book (12), best-match quotes (13)"
```

---

### Task 15: Booking: Pick a time (14a), Payment sheet (14b), Booked (14c)

Reference images: `design/approved/14a-pick-time.png`, `14b-payment.png` and `14c-booked.png`. Mockup CSS: `batch2-profile-quotes-booking.html` (these screens use **16px** side padding).

**Files:**
- Modify: `mobile/src/app/(client)/book/index.tsx`, `mobile/src/app/(client)/book/done.tsx`
- Test: `mobile/__tests__/booking.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/booking.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Book from '@/app/(client)/book/index';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({ expert: 'omar', service: 'bid-visit' }) }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); useDemo.setState({ jobs: [] }); jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test('pick a time, pay once (double tap safe), land on booked', () => {
  render(<Book />);
  expect(screen.getByText("Omar's free times on Thursday")).toBeTruthy();
  fireEvent.press(screen.getByText('Continue · AED 2,200'));
  expect(screen.getByText('AED 2,425.50')).toBeTruthy();
  fireEvent.press(screen.getByText('Pay AED 2,425.50'));
  fireEvent.press(screen.getAllByTestId('btn')[0]);
  act(() => { jest.advanceTimersByTime(1200); });
  expect(useDemo.getState().jobs).toHaveLength(1);
  expect(router.replace).toHaveBeenCalledWith(expect.stringMatching(/^\/book\/done\?job=/));
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/booking.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `book/index.tsx`** (14a + 14b)

The payment is a sheet over the booking screen; the background blurs and dims when it opens:

```tsx
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { Sheet } from '@/ui/Sheet';
import { EXPERTS, DAYS, CLIENT_SLOTS, FEE, VAT_RATE, aed } from '@/data/seed';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Book() {
  const p = useLocalSearchParams<{ expert?: string; service?: string; pay?: string }>();
  const e = EXPERTS.find((x) => x.id === (p.expert ?? 'omar'))!; const sv = e.services.find((x) => x.id === (p.service ?? e.services[0].id))!;
  const [day, setDay] = useState(9); const [slot, setSlot] = useState('thu-1000');
  const [pay, setPay] = useState(!!p.pay); const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const vat = (sv.price + FEE) * VAT_RATE; const total = sv.price + FEE + vat;
  const time = CLIENT_SLOTS.find((x) => x.id === slot)!.time;
  const doPay = () => {
    if (state !== 'idle') return; setState('busy');
    setTimeout(() => { const job = useDemo.getState().bookAndPay({ expertId: e.id, serviceId: sv.id, slotId: slot }); setState('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setTimeout(() => { setPay(false); router.replace(`/book/done?job=${job}`); }, 400); }, 700);
  };
  const line = (l: string, v: string) => <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: s(5) }}><T size={11} c={C.mute}>{l}</T><T size={11} w={700}>{v}</T></View>;
  return (
    <Screen bg="aurora" px={16}>
      <View style={{ flex: 1, opacity: pay ? 0.6 : 1 }}>
        <Header center={<Eyebrow>BOOK</Eyebrow>} />
        <T size={27} w={700} ls={-0.035} lh={1.05} style={{ marginTop: s(12) }}>{'When suits\nyou?'}</T>
        <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(12) }}>
          {DAYS.map((d) => {
            const on = d.n === day;
            const inner = <><T size={9} w={600} c={on ? 'rgba(255,255,255,0.8)' : C.mute} align="center">{d.d}</T><T size={16} w={700} ls={-0.02} c={on ? '#fff' : C.navy} align="center" style={{ marginTop: 2 }}>{String(d.n)}</T></>;
            return (
              <Pressable key={d.n} disabled={d.off} onPress={() => { setDay(d.n); Haptics.selectionAsync(); }} style={{ flex: 1, opacity: d.off ? 0.35 : 1 }}>
                {on ? <View style={{ paddingVertical: s(9), borderRadius: s(14), backgroundColor: C.blue, shadowColor: C.blue, shadowOpacity: 0.3, shadowRadius: s(11), elevation: 6 }}>{inner}</View>
                  : d.off ? <View style={{ paddingVertical: s(9) }}>{inner}</View> : <Glass r={14} style={{ paddingVertical: s(9) }}>{inner}</Glass>}
              </Pressable>
            );
          })}
        </View>
        <T size={9.5} w={600} c={C.mute} style={{ marginTop: s(14) }}>{`${e.first}'s free times on Thursday`}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(6), marginTop: s(10) }}>
          {CLIENT_SLOTS.map((x) => {
            const on = x.id === slot;
            const label = <T size={11} w={600} c={on ? '#fff' : C.navy} align="center" style={!x.free ? { textDecorationLine: 'line-through' } : undefined}>{x.time}</T>;
            return (
              <Pressable key={x.id} disabled={!x.free} onPress={() => setSlot(x.id)} style={{ width: '31.7%', opacity: x.free ? 1 : 0.3 }}>
                {on ? <View style={{ paddingVertical: s(10), borderRadius: s(12), backgroundColor: C.navy }}>{label}</View> : <Glass r={12} style={{ paddingVertical: s(10) }}>{label}</Glass>}
              </Pressable>
            );
          })}
        </View>
        <Glass r={18} style={{ marginTop: s(12), padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={e.photo} size={34} />
          <View style={{ flex: 1 }}><T size={11.5} w={700}>{sv.name === 'Bid review + visit' ? 'Bid review + site visit' : sv.name}</T><T size={9.5} c={C.mute}>{`Thu ${day} Oct · ${time} · Al Reem Island`}</T></View>
        </Glass>
        <View style={{ marginTop: 'auto', marginBottom: s(18) }}><Btn title={`Continue · ${aed(sv.price)}`} onPress={() => setPay(true)} /></View>
      </View>
      <Sheet visible={pay} onClose={() => state === 'idle' && setPay(false)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><T size={19} w={700} ls={-0.03}>Pay securely</T><T size={9.5} c={C.mute}>Held until job sign-off</T></View>
        <LinearGradient colors={[C.navy, C.blue, C.cyan]} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ marginTop: s(12), height: s(66), borderRadius: s(14), paddingVertical: s(10), paddingHorizontal: s(12), overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -s(20), top: -s(30), width: s(90), height: s(90), borderRadius: s(45), backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <T size={10} c="rgba(255,255,255,0.8)">Visa</T><T size={13} w={600} ls={0.12} c="#fff" style={{ marginTop: s(14) }}>•••• 4242</T>
        </LinearGradient>
        <View style={{ marginTop: s(10) }}>
          {line(sv.name === 'Bid review + visit' ? 'Bid review + site visit' : sv.name, aed(sv.price))}{line('Service fee', aed(FEE))}{line('VAT 5%', aed(vat, 2))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E9EBF3', marginTop: s(4), paddingTop: s(9) }}>
            <T size={11} w={700}>Total</T><T size={15} w={700}>{aed(total, 2)}</T>
          </View>
        </View>
        <Btn title={`Pay ${aed(total, 2)}`} busy={state === 'busy'} done={state === 'done'} onPress={doPay} style={{ marginTop: s(12) }} />
        <Btn variant="black" onPress={doPay} style={{ marginTop: s(8), borderRadius: s(14) }}><T size={13} w={600} c="#fff">Pay with <T size={13} w={800} c="#fff">G</T> Pay</T></Btn>
      </Sheet>
    </Screen>
  );
}
```

- [ ] **Step 4: Implement `book/done.tsx`** (14c)

It has a 92px spinning gradient ring with a tick, "You're booked", a two-line summary, the booking card, **Track this job** and "Add to calendar":

```tsx
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Avatar } from '@/ui/Avatar';
import { ProgressRing } from '@/fx/ProgressRing';
import { useDemo } from '@/store/demo';
import { EXPERTS, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Booked() {
  const { job: jobId } = useLocalSearchParams<{ job?: string }>();
  const job = useDemo((st) => st.jobs.find((j) => j.id === jobId) ?? st.jobs[0]);
  const e = EXPERTS.find((x) => x.id === job.expertId)!;
  return (
    <Screen bg="aurora3" px={16}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ marginTop: s(70), shadowColor: C.blue, shadowOpacity: 0.3, shadowRadius: s(25), elevation: 10 }}>
          <ProgressRing size={92} thickness={6} progress={1} spin colors={['#0000FE', '#31D1FF', '#0000FE']} track="transparent">
            <Animated.View entering={ZoomIn.delay(300).springify().damping(9)}><T size={34} c={C.blue}>✓</T></Animated.View>
          </ProgressRing>
        </View>
        <T size={27} w={700} ls={-0.035} style={{ marginTop: s(26) }}>You're booked</T>
        <T size={11} c={C.mute} lh={1.5} align="center" style={{ marginTop: s(6) }}>{`${e.first} will review your 3 bids and\nvisit the site on Thursday.`}</T>
        <Glass r={18} style={{ alignSelf: 'stretch', marginTop: s(20), padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={e.photo} size={38} />
          <View style={{ flex: 1 }}><T size={12} w={700}>{`${job.dayLabel} · ${job.timeLabel}`}</T><T size={9.5} c={C.mute}>{`Al Reem Island · ${aed(job.total, 2)} paid`}</T></View>
        </Glass>
        <View style={{ alignSelf: 'stretch', marginTop: 'auto', marginBottom: s(18) }}>
          <Btn title="Track this job" onPress={() => router.replace(`/job/${job.id}`)} />
          <Pressable style={{ marginTop: s(12), alignItems: 'center' }}><T size={11} w={600} c={C.blue}>Add to calendar</T></Pressable>
        </View>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/booking.test.tsx`
Expected: PASS.

- [ ] **Step 6: Visual check** of 14a, 14b (`/book?…&pay=1`) and 14c. **Commit.**

```bash
git add "mobile/src/app/(client)/book" mobile/__tests__/booking.test.tsx
git commit -m "feat(mobile): booking — time (14a), payment sheet (14b), booked (14c) with double-pay guard"
```

---

### Task 16: Job tracking (15), Report & sign-off (15b), Review (16)

Reference images: `design/approved/15-job-tracking.png`, `15b-report.png` and `16-review.png`. Mockup CSS: `batch3b-job-project-inbox.html`. **The Review screen uses the gradient primary button and the gradient photo ring, with no orb.**

**Files:**
- Create: `mobile/src/ui/LiveDot.tsx`
- Modify: `mobile/src/app/(client)/job/[id].tsx`, `mobile/src/app/(client)/report/[id].tsx`, `mobile/src/app/(client)/review/[id].tsx`
- Test: `mobile/__tests__/job.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/job.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Job from '@/app/(client)/job/[id]';
import Report from '@/app/(client)/report/[id]';
import Review from '@/app/(client)/review/[id]';
import { useDemo } from '@/store/demo';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => ({ id: 'job-1' }) }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); jest.clearAllMocks(); });
afterEach(() => jest.useRealTimers());

test('job tracking shows the 4 approved steps and the live status', () => {
  render(<Job />);
  for (const t of ['Bid review', 'On site now', 'Booked & paid', 'Site visit', 'Report', 'Your sign-off', 'Foundations and site access checked. Report on Sunday.']) expect(screen.getByText(t)).toBeTruthy();
});
test('approve → review → submit returns home', () => {
  render(<Report />);
  fireEvent.press(screen.getByText('Approve & release payment'));
  expect(useDemo.getState().jobs[0].status).toBe('approved');
  expect(router.replace).toHaveBeenCalledWith('/review/job-1');
  render(<Review />);
  expect(screen.getByText('Excellent')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('3 stars'));
  expect(screen.getByText('Good')).toBeTruthy();
  fireEvent.press(screen.getByText('Submit review'));
  act(() => { jest.advanceTimersByTime(1500); });
  expect(useDemo.getState().jobs[0].status).toBe('reviewed');
  expect(router.replace).toHaveBeenCalledWith('/home');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/job.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/ui/LiveDot.tsx` (a pulsing green "live" dot, shared by Job and Chat), then `job/[id].tsx`** (15)

```tsx
// src/ui/LiveDot.tsx
import { View } from 'react-native';
import { useEffect } from 'react';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { T } from './T';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export function LiveDot({ label, size = 10 }: { label: string; size?: number }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false); }, []);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: 1 + p.value * 1.3 }], opacity: 0.5 * (1 - p.value) }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5) }}>
      <View style={{ width: s(7), height: s(7) }}>
        <Animated.View style={[{ position: 'absolute', width: s(7), height: s(7), borderRadius: s(4), backgroundColor: C.greenDot }, ring]} />
        <View style={{ width: s(7), height: s(7), borderRadius: s(4), backgroundColor: C.greenDot }} />
      </View>
      <T size={size} w={700} c={C.green}>{label}</T>
    </View>
  );
}
```


```tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { LiveDot } from '@/ui/LiveDot';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock, DOCK_SPACE } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { useDemo } from '@/store/demo';
import { EXPERTS } from '@/data/seed';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const STEPS = (job: { dayLabel: string; timeLabel: string; due: string; status: string }) => [
  { t: 'Booked & paid', s: 'Mon 6 Oct', st: 'dn' },
  { t: 'Site visit', s: `Today · ${job.timeLabel}, in progress`, st: job.status === 'visit' || job.status === 'booked' ? 'now' : 'dn' },
  { t: 'Report', s: `Due ${job.due}`, st: job.status === 'report' ? 'now' : job.status === 'approved' || job.status === 'reviewed' ? 'dn' : 'fut' },
  { t: 'Your sign-off', s: 'Payment released after', st: job.status === 'approved' || job.status === 'reviewed' ? 'dn' : 'fut' },
];

export default function Job() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const job = useDemo((st) => st.jobs.find((j) => j.id === id) ?? st.jobs[0]);
  const e = EXPERTS.find((x) => x.id === job.expertId)!; const steps = STEPS(job);
  const fill = steps.filter((x) => x.st === 'dn').length / 3 * 0.88;
  return (
    <Screen bg="aurora">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(job.status === 'report' ? DOCK_SPACE : 30) }}>
        <Header />
        <T size={22} w={700} ls={-0.035} style={{ marginTop: s(12) }}>{job.title === 'Bid review + visit' ? 'Bid review' : job.title}</T>
        <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Villa · Al Reem Island</T>
        <Glass r={18} style={{ marginTop: s(14), paddingVertical: s(12), paddingHorizontal: s(14), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={e.photo} size={40} />
          <View style={{ flex: 1 }}><T size={12.5} w={700}>{e.name}</T><LiveDot label="On site now" /></View>
          <Pressable onPress={() => router.push(`/chat/${e.id}`)} style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chat" size={14} color="#fff" stroke={2} />
          </Pressable>
        </Glass>
        <View style={{ marginTop: s(16), paddingLeft: s(22) }}>
          <View style={{ position: 'absolute', left: s(6), top: s(6), bottom: s(6), width: 2, borderRadius: 2, backgroundColor: '#E3E6F0' }} />
          <LinearGradient colors={[C.blue, C.cyan]} style={{ position: 'absolute', left: s(6), top: s(6), width: 2, height: `${Math.max(fill, 0.44) * 100}%`, borderRadius: 2 }} />
          {steps.map((x, i) => (
            <View key={x.t} style={{ paddingBottom: i === 3 ? 0 : s(14) }}>
              <View style={{ position: 'absolute', left: -s(21), top: s(2), width: s(12), height: s(12), borderRadius: s(6),
                backgroundColor: x.st === 'dn' ? C.blue : '#fff', borderWidth: x.st === 'now' ? 3 : 2, borderColor: x.st === 'fut' ? '#D3D8E8' : C.blue }} />
              <T size={12} w={700} ls={-0.01} c={x.st === 'fut' ? C.faint2 : C.navy}>{x.t}</T>
              <T size={10} c={C.mute}>{x.s}</T>
            </View>
          ))}
        </View>
        <Glass r={18} style={{ marginTop: s(14), padding: s(12) }}>
          <T size={10} c={C.mute}><T size={10} w={700}>Latest</T> · 11:40</T>
          <T size={11} lh={1.45} style={{ marginTop: s(4) }}>Foundations and site access checked. Report on Sunday.</T>
          <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
            {(['site1', 'site2'] as const).map((p) => <Image key={p} source={PHOTOS[p]} contentFit="cover" style={{ flex: 1, height: s(58), borderRadius: s(12) }} />)}
          </View>
        </Glass>
      </ScrollView>
      {job.status === 'report' && <Dock><Btn title="View report" onPress={() => router.push(`/report/${job.id}`)} /></Dock>}
    </Screen>
  );
}
```

- [ ] **Step 4: Implement `report/[id].tsx`** (15b)

```tsx
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Orb } from '@/fx/Orb';
import { useDemo } from '@/store/demo';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { Pressable } from 'react-native';

const BULLETS: [string, string][] = [['', 'Gulf Construction is lowest once MEP is added.'], ['', 'Al Noor has the strongest schedule.'], ['Recommended: ', 'Gulf, with an MEP clause.']];
export default function Report() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  return (
    <Screen bg="aurora">
      <Header />
      <T size={22} w={700} ls={-0.035} style={{ marginTop: s(12) }}>Report ready</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Omar delivered your bid review</T>
      <Glass r={18} style={{ marginTop: s(14), padding: s(14), flexDirection: 'row', alignItems: 'center', gap: s(12) }}>
        <View style={{ width: s(40), height: s(48), borderRadius: s(10), backgroundColor: '#F4F6FD', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(6),
          shadowColor: '#16205A', shadowOpacity: 0.1, shadowRadius: s(6), elevation: 2 }}><T size={8} w={800} c={C.blue}>PDF</T></View>
        <View style={{ flex: 1 }}><T size={12} w={700}>Bid review report</T><T size={9.5} c={C.mute}>14 pages · 2.4 MB</T></View>
        <T size={11} w={700} c={C.blue}>Open</T>
      </Glass>
      <View style={{ marginTop: s(12), borderRadius: s(18), padding: s(14), backgroundColor: '#fff', shadowColor: C.blue, shadowOpacity: 0.08, shadowRadius: s(14), elevation: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(7) }}><Orb size={14} /><T size={9} w={700} ls={0.08} c={C.blue}>PULSE SUMMARY</T></View>
        {BULLETS.map(([b, t], i) => (
          <Animated.View key={i} entering={FadeInDown.delay(150 * i)} style={{ flexDirection: 'row', marginTop: s(6), marginLeft: s(4), gap: s(6) }}>
            <T size={11}>•</T><T size={11} lh={1.5} style={{ flex: 1 }}>{b ? <T size={11} w={700}>{b}</T> : null}{t}</T>
          </Animated.View>
        ))}
      </View>
      <Dock>
        <Btn title="Approve & release payment" onPress={() => { useDemo.getState().approveJob(id); router.replace(`/review/${id}`); }} />
        <Pressable style={{ marginTop: s(10), alignItems: 'center' }}><T size={11} w={600} c={C.blue}>Ask for changes</T></Pressable>
      </Dock>
    </Screen>
  );
}
```

- [ ] **Step 5: Implement `review/[id].tsx`** (16)

It has the gradient wash background, a gradient photo ring, gradient stars with a glow, a gradient label, gradient-filled selected chips, a dashed "Add a note" row and a gradient Submit button:

```tsx
import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { BackButton } from '@/ui/Header';
import { T } from '@/ui/T';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

const LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
const TAGS = ['On time', 'Clear report', 'Professional', 'Great value'];
function Star({ on, i, onPress }: { on: boolean; i: number; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={`${i} stars`} onPress={onPress}>
      <Animated.View entering={ZoomIn.delay(100 * i).springify().damping(10)} style={on ? { shadowColor: C.blue, shadowOpacity: 0.28, shadowRadius: s(5), shadowOffset: { width: 0, height: s(6) }, elevation: 4 } : undefined}>
        <Svg width={s(36)} height={s(36)} viewBox="0 0 24 24">
          <Defs><SvgGrad id="sg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#31D1FF" /><Stop offset="0.55" stopColor="#0000FE" /><Stop offset="1" stopColor="#7A5CFF" /></SvgGrad></Defs>
          <Path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3L2.9 9.5l6.3-.9z" fill={on ? 'url(#sg)' : '#E3E6F0'} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
export default function Review() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const [stars, setStars] = useState(5); const [tags, setTags] = useState(['On time', 'Clear report', 'Great value']);
  const [note, setNote] = useState<string | null>(null); const [done, setDone] = useState(false);
  const toggle = (t: string) => { Haptics.selectionAsync(); setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t])); };
  const submit = () => { if (done) return; useDemo.getState().submitReview(id, stars, tags); setDone(true); setTimeout(() => router.replace('/home'), 1200); };
  return (
    <Screen bg="review">
      <View style={{ paddingTop: s(6) }}><BackButton flat label="✕" onPress={() => router.replace('/home')} /></View>
      <View style={{ alignItems: 'center' }}>
        <Avatar photo="omar" size={76} ring="gradient" style={{ marginTop: s(18) }} />
        <T size={20} w={700} ls={-0.035} lh={1.25} align="center" style={{ marginTop: s(18) }}>{"How was Omar's\nbid review?"}</T>
        <View style={{ flexDirection: 'row', gap: s(8), marginTop: s(12) }}>
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} i={i} on={i <= stars} onPress={() => { Haptics.selectionAsync(); setStars(i); }} />)}
        </View>
        <GradientText size={14} w={800} ls={-0.01} style={{ marginTop: s(10) }}>{LABEL[stars]}</GradientText>
        <T size={9.5} w={700} ls={0.12} c={C.mute} style={{ marginTop: s(14) }}>WHAT STOOD OUT?</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(7), justifyContent: 'center', marginTop: s(10) }}>
          {TAGS.map((t) => tags.includes(t) ? (
            <Pressable key={t} onPress={() => toggle(t)}>
              <LinearGradient colors={GRAD} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: s(8), paddingHorizontal: s(12), borderRadius: s(16) }}>
                <T size={10.5} w={600} c="#fff">{`✓ ${t}`}</T>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable key={t} onPress={() => toggle(t)} style={{ paddingVertical: s(8), paddingHorizontal: s(12), borderRadius: s(16), backgroundColor: C.inputBg }}><T size={10.5} w={600} c={C.mute}>{t}</T></Pressable>
          ))}
        </View>
        {note === null ? (
          <Pressable onPress={() => setNote('')} style={{ marginTop: s(12), flexDirection: 'row', alignItems: 'center', gap: s(7), paddingVertical: s(9), paddingHorizontal: s(14), borderRadius: s(14), borderWidth: 1, borderStyle: 'dashed', borderColor: '#D9DDE9' }}>
            <Icon name="edit" size={13} color={C.mute} stroke={2} /><T size={11} w={600} c={C.mute}>Add a note <T size={11} w={500} c={C.faint3}>(optional)</T></T>
          </Pressable>
        ) : <TextInput value={note} onChangeText={setNote} autoFocus placeholder="Add a note" allowFontScaling={false}
            style={{ marginTop: s(12), alignSelf: 'stretch', borderRadius: s(14), borderWidth: 1, borderColor: '#D9DDE9', padding: s(10), fontFamily: F[400], fontSize: s(11), color: C.navy }} />}
      </View>
      <Dock bg="white">
        <Btn variant="gradient" title={done ? 'Thanks, Sara' : 'Submit review'} onPress={submit} />
      </Dock>
    </Screen>
  );
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/job.test.tsx`
Expected: PASS.

- [ ] **Step 7: Visual check** of 15, 15b and 16. **Commit.**

```bash
git add mobile/src/ui/LiveDot.tsx "mobile/src/app/(client)/job" "mobile/src/app/(client)/report" "mobile/src/app/(client)/review" mobile/__tests__/job.test.tsx
git commit -m "feat(mobile): job tracking (15), report sign-off (15b), gradient review (16)"
```

---

### Task 17: Project record: Milestones (17), Budget (17b), Site (17c), Docs and Decisions

Reference images: `design/approved/17-project-milestones.png`, `17b-budget.png` and `17c-site.png`. Mockup CSS: `batch3b-job-project-inbox.html`.

**Files:**
- Modify: `mobile/src/app/(client)/(tabs)/project.tsx`
- Test: `mobile/__tests__/project.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/project.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import Project from '@/app/(client)/(tabs)/project';
import { useDemo } from '@/store/demo';

let params: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), setParams: jest.fn() }, useLocalSearchParams: () => params }));
beforeEach(() => useDemo.getState().resetDemo());

test('milestones, budget and site tabs show the approved content', () => {
  params = {}; const r = render(<Project />);
  for (const t of ['Villa · Al Reem', 'Tender · step 3 of 6', 'Plot purchased', 'Permit approved', 'Choose contractor', 'Construction starts', 'Next', 'Planned']) expect(screen.getByText(t)).toBeTruthy();
  fireEvent.press(screen.getByText('Budget'));
  for (const t of ['68%', 'committed', 'Design & permits', 'AED 180K', 'Structure', 'AED 910K', 'MEP', 'AED 540K']) expect(screen.getByText(t)).toBeTruthy();
  fireEvent.press(screen.getByText('Site'));
  expect(screen.getByText('Today · Site visit')).toBeTruthy();
  fireEvent.press(screen.getByText('Docs'));
  expect(screen.getByText('Building permit.pdf')).toBeTruthy();
  fireEvent.press(screen.getByText('Decisions'));
  expect(screen.getByText('Shortlist 3 contractors')).toBeTruthy();
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/project.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `project.tsx`**

```tsx
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { ProgressRing } from '@/fx/ProgressRing';
import { ModelView } from '@/three/ModelView';
import { useDemo } from '@/store/demo';
import { BUDGET, DECISIONS, DOCS, MILESTONES, SITE, PROJECT } from '@/data/seed';
import { STAGES, BUILDINGS } from '@/data/types';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const TABS = ['Milestones', 'Budget', 'Site', 'Docs', 'Decisions'] as const;
type Tab = (typeof TABS)[number];
const tag = (label: string, bg: string, fg: string) => <View style={{ paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8), backgroundColor: bg }}><T size={8.5} w={700} c={fg}>{label}</T></View>;
const k = (n: number) => `AED ${Math.round(n / 1000)}K`;

export default function Project() {
  const p = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(p.tab === 'budget' ? 'Budget' : p.tab === 'site' ? 'Site' : 'Milestones');
  const { stage, projectType } = useDemo(); const name = BUILDINGS.find((b) => b.id === projectType)!.name;
  const tabs = (
    <View style={{ flexDirection: 'row', gap: s(16), marginTop: s(14) }}>
      {TABS.map((t) => (
        <Pressable key={t} onPress={() => setTab(t)}>
          <T size={11.5} w={600} c={t === tab ? C.navy : C.faint2}>{t}</T>
          {t === tab && <View style={{ position: 'absolute', left: 0, right: 0, bottom: -s(7), height: 2, borderRadius: 2, backgroundColor: C.blue }} />}
        </Pressable>
      ))}
    </View>
  );
  const compactHeader = (title: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(10) }}>
      <T size={20} w={700} ls={-0.035}>{title}</T><T size={9.5} c={C.mute}>{`${name} · Al Reem`}</T>
    </View>
  );
  const dateRow = (key: string, day: string, month: string, title: string, sub: string, right: React.ReactNode, last: boolean) => (
    <View key={key} style={{ flexDirection: 'row', gap: s(12), alignItems: 'center', paddingVertical: s(11), borderBottomWidth: last ? 0 : 1, borderBottomColor: C.line }}>
      <View style={{ width: s(30), alignItems: 'center' }}><T size={14} w={700} ls={-0.02}>{day}</T><T size={8.5} w={700} ls={0.06} c={C.mute}>{month}</T></View>
      <View style={{ flex: 1, minWidth: 0 }}><T size={11.5} w={700} numberOfLines={1}>{title}</T><T size={10} c={C.mute}>{sub}</T></View>
      {right}
    </View>
  );
  return (
    <Screen bg="aurora">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        {tab === 'Milestones' ? (<>
          <View style={{ height: s(118), marginHorizontal: -s(20) }}><ModelView model={projectType} stage={projectType === 'villa' ? stage : 'solid'} radius={8.5} target={[0, 2.8, 0]} spin={0.12} shadows={false} /></View>
          <T size={20} w={700} ls={-0.035}>{`${name} · Al Reem`}</T>
          <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`${STAGES[stage - 1]} · step ${stage} of 6`}</T>
          {tabs}
          <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
            {MILESTONES.map((m, i) => dateRow(m.title, m.day, m.month, m.title, m.stage,
              m.status === 'done' ? tag('Done', C.greenBg, C.green) : m.status === 'next' ? tag('Next', 'rgba(0,0,254,0.08)', C.blue) : <T size={9.5} c={C.mute}>Planned</T>, i === MILESTONES.length - 1))}
          </Glass>
        </>) : tab === 'Budget' ? (<>
          {compactHeader('Budget')}{tabs}
          <View style={{ alignItems: 'center', marginTop: s(18) }}>
            <ProgressRing size={118} thickness={15} progress={PROJECT.committed / PROJECT.budget} colors={['#0000FE', '#0000FE', '#31D1FF', '#B9A8FF']}>
              <T size={20} w={700} ls={-0.03}>{`${Math.round((PROJECT.committed / PROJECT.budget) * 100)}%`}</T><T size={8.5} c={C.mute}>committed</T>
            </ProgressRing>
            <T size={15} w={700} ls={-0.02} style={{ marginTop: s(10) }}>AED 1.63M <T size={15} w={500} c={C.faint2}>of 2.4M</T></T>
          </View>
          <Glass r={18} style={{ marginTop: s(12), paddingVertical: s(2), paddingHorizontal: s(14) }}>
            {BUDGET.map((b) => (
              <View key={b.name} style={{ paddingVertical: s(9) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T size={11} w={700}>{b.name}</T><T size={11} c={C.mute}>{k(b.amount)}</T></View>
                <View style={{ height: s(5), borderRadius: s(5), backgroundColor: '#E6E9F2', marginTop: s(6), overflow: 'hidden' }}><View style={{ width: `${b.pct * 100}%`, height: '100%', borderRadius: s(5), backgroundColor: b.color }} /></View>
              </View>
            ))}
          </Glass>
        </>) : tab === 'Site' ? (<>
          {compactHeader('Site')}{tabs}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginTop: s(14) }}>
            {SITE.map((x) => (
              <View key={x.label} style={{ width: x.big ? '100%' : '48.4%', height: s(x.big ? 122 : 104), borderRadius: s(16), overflow: 'hidden' }}>
                <Image source={PHOTOS[x.photo]} contentFit="cover" style={{ flex: 1 }} />
                <View style={{ position: 'absolute', left: s(8), bottom: s(8), backgroundColor: 'rgba(10,16,50,0.45)', paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8) }}><T size={9} w={700} c="#fff">{x.label}</T></View>
              </View>
            ))}
          </View>
        </>) : tab === 'Docs' ? (<>
          {compactHeader('Docs')}{tabs}
          <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
            {DOCS.map((d, i) => (
              <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(11), borderBottomWidth: i === DOCS.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
                <View style={{ width: s(30), height: s(36), borderRadius: s(8), backgroundColor: '#F4F6FD', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(4) }}><T size={7} w={800} c={C.blue}>PDF</T></View>
                <View style={{ flex: 1 }}><T size={11.5} w={700}>{d.name}</T><T size={10} c={C.mute}>{`${d.date} · ${d.size}`}</T></View>
              </View>
            ))}
          </Glass>
        </>) : (<>
          {compactHeader('Decisions')}{tabs}
          <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
            {DECISIONS.map((d, i) => dateRow(d.title, d.day, d.month, d.title, `Decided by ${d.by}`, tag('Approved', C.greenBg, C.green), i === DECISIONS.length - 1))}
          </Glass>
        </>)}
      </ScrollView>
    </Screen>
  );
}
```

`ProgressRing` draws one gradient arc. For Budget, the reference shows a blue → cyan → lilac conic segment from 0–68%, which this colours list reproduces. If the visual check shows the segment colours sitting at different positions than in `17b-budget.png`, replace the gradient with three explicit arcs (blue 0–38%, cyan 38–58%, lilac 58–68%) drawn as separate `Path`s in a small `BudgetRing` component inside this file.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/project.test.tsx`
Expected: PASS.

- [ ] **Step 5: Visual check** of 17, 17b and 17c. **Commit.**

```bash
git add "mobile/src/app/(client)/(tabs)/project.tsx" mobile/__tests__/project.test.tsx
git commit -m "feat(mobile): project record — milestones (17), budget (17b), site (17c), docs, decisions"
```

---

### Task 18: Inbox (18), Chat (18b), Updates (19)

Reference images: `design/approved/18-inbox.png`, `18b-chat.png` and `19-updates.png`.

**Files:**
- Create: `mobile/src/ui/InboxView.tsx` (shared by the client and expert Inbox tabs)
- Modify: `mobile/src/app/(client)/(tabs)/inbox.tsx`, `mobile/src/app/(client)/chat/[id].tsx`
- Test: `mobile/__tests__/inbox.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/inbox.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import Inbox from '@/app/(client)/(tabs)/inbox';
import Chat from '@/app/(client)/chat/[id]';
import { useDemo } from '@/store/demo';

let params: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => params }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); });
afterEach(() => jest.useRealTimers());

test('messages and updates tabs', () => {
  params = {}; render(<Inbox />);
  for (const t of ['Omar Haddad', 'typing…', 'Project Pulse team', 'Lina Karim']) expect(screen.getByText(t)).toBeTruthy();
  fireEvent.press(screen.getByText('Updates · 3'));
  for (const t of ['TODAY', 'New quotes', 'Your question was answered', 'EARLIER', 'Payment held safely']) expect(screen.getByText(t)).toBeTruthy();
});
test('sending a chat message appends it and Omar replies', () => {
  params = { id: 'omar' }; render(<Chat />);
  fireEvent.changeText(screen.getByPlaceholderText('Message…'), 'Thanks Omar');
  fireEvent.press(screen.getByLabelText('Send'));
  expect(screen.getByText('Thanks Omar')).toBeTruthy();
  act(() => { jest.advanceTimersByTime(2500); });
  expect(screen.getByText("Noted. I'll include it in the report.")).toBeTruthy();
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/inbox.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/ui/InboxView.tsx` and the client `inbox.tsx`**

```tsx
// src/ui/InboxView.tsx
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Screen } from './Screen';
import { T } from './T';
import { Glass } from './Glass';
import { Avatar } from './Avatar';
import { Segmented } from './Segmented';
import { Icon } from './Icon';
import { LogoMark } from './LogoMark';
import { useDemo } from '@/store/demo';
import { EXPERTS, CLIENT } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const ago = (at: number, now: number) => { const m = Math.round((now - at) / 60000); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : 'Mon'; };
export function InboxView({ role, initialTab = 0, chatBase }: { role: 'client' | 'expert'; initialTab?: number; chatBase: string }) {
  const [tab, setTab] = useState(initialTab);
  const threads = useDemo((st) => st.threads.filter((t) => t.forRole === role));
  const notes = useDemo((st) => st.notifications.filter((n) => n.forRole === role));
  const unread = notes.filter((n) => !n.read).length;
  const now = notes.length ? Math.max(...notes.map((n) => n.at)) + 10 * 60e3 : Date.now();
  const today = notes.filter((n) => now - n.at < 20 * 3600e3); const earlier = notes.filter((n) => now - n.at >= 20 * 3600e3);
  const icon = (k: string) => k === 'quotes' ? <View style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}><T size={12} w={700} c="#fff">2</T></View>
    : k === 'answered' ? <View style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: 'rgba(0,0,254,0.08)', alignItems: 'center', justifyContent: 'center' }}><Icon name="shieldCheck" size={15} color={C.blue} stroke={2} /></View>
    : <View style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: 'rgba(17,154,85,0.1)', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={15} color={C.green} stroke={2.2} /></View>;
  const group = (label: string, list: typeof notes) => list.length ? (<>
    <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(14), marginBottom: s(8) }}>{label}</T>
    <Glass r={18} style={{ paddingHorizontal: s(14) }}>
      {list.map((n, i) => (
        <Pressable key={n.id} onPress={() => router.push(n.href as any)} style={{ flexDirection: 'row', gap: s(11), paddingVertical: s(11), borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
          {icon(n.kind)}
          <View style={{ flex: 1 }}><T size={12} w={700}>{n.title}</T><T size={10.5} c={C.mute} lh={1.4}>{n.text}</T><T size={9} c={C.faint2} style={{ marginTop: s(3) }}>{ago(n.at, now)}</T></View>
        </Pressable>
      ))}
    </Glass>
  </>) : null;
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} style={{ marginTop: s(10) }}>Inbox</T>
      <Segmented options={['Messages', `Updates · ${unread}`]} value={tab} onChange={setTab} style={{ marginTop: s(12) }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        {tab === 0 ? (
          <Glass r={18} style={{ marginTop: s(14), paddingHorizontal: s(14) }}>
            {threads.map((t, i) => (
              <Pressable key={t.id} onPress={() => router.push(`${chatBase}/${t.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(11), borderBottomWidth: i === threads.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
                {t.kind === 'team' ? <View style={{ width: s(42), height: s(42), borderRadius: s(21), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><LogoMark size={18} color="#fff" /></View>
                  : <Avatar photo={t.expertId ? EXPERTS.find((e) => e.id === t.expertId)!.photo : CLIENT.photo} size={42} />}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T size={12.5} w={700} numberOfLines={1}>{t.title}</T>
                  <T size={10.5} w={t.typing ? 600 : 400} c={t.typing ? C.blue : C.mute} numberOfLines={1} style={{ marginTop: 2 }}>{t.preview}</T>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T size={9} c={C.faint}>{t.timeLabel}</T>
                  {t.unread > 0 && <View style={{ marginTop: s(4), minWidth: s(16), height: s(16), borderRadius: s(8), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: s(4) }}><T size={9} w={700} c="#fff">{String(t.unread)}</T></View>}
                </View>
              </Pressable>
            ))}
          </Glass>
        ) : (<>{group('TODAY', today)}{group('EARLIER', earlier)}</>)}
      </ScrollView>
    </Screen>
  );
}
```

```tsx
// src/app/(client)/(tabs)/inbox.tsx
import { useLocalSearchParams } from 'expo-router';
import { InboxView } from '@/ui/InboxView';
export default function Inbox() { const { tab } = useLocalSearchParams<{ tab?: string }>(); return <InboxView role="client" initialTab={tab === 'updates' ? 1 : 0} chatBase="/chat" />; }
```

- [ ] **Step 4: Implement `chat/[id].tsx`** (18b)

```tsx
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Animated, { FadeInUp, useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle, withDelay } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Screen } from '@/ui/Screen';
import { BackButton } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Avatar } from '@/ui/Avatar';
import { Icon } from '@/ui/Icon';
import { LogoMark } from '@/ui/LogoMark';
import { LiveDot } from '@/ui/LiveDot';
import { useDemo } from '@/store/demo';
import { EXPERTS } from '@/data/seed';
import { PHOTOS } from '@/theme/photos';
import { s } from '@/theme/scale';
import { C, F } from '@/theme/tokens';

function Dot({ d }: { d: number }) {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withDelay(d, withRepeat(withSequence(withTiming(-3, { duration: 360 }), withTiming(0, { duration: 360 }), withTiming(0, { duration: 480 })), -1)); }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: y.value < -1 ? 1 : 0.5 }));
  return <Animated.View style={[{ width: s(5), height: s(5), borderRadius: s(3), backgroundColor: C.faint2 }, st]} />;
}
export default function Chat() {
  const { id = 'omar' } = useLocalSearchParams<{ id?: string }>();
  const thread = useDemo((st) => st.threads.find((t) => t.id === id));
  const msgs = useDemo((st) => st.messages.filter((m) => m.threadId === id));
  const ex = EXPERTS.find((e) => e.id === (thread?.expertId ?? id));
  const [text, setText] = useState(''); const [typing, setTyping] = useState(!!thread?.typing);
  const scroll = useRef<ScrollView>(null);
  const send = () => {
    const t = text.trim(); if (!t) return; useDemo.getState().sendMessage(id, t); setText(''); setTyping(true);
    setTimeout(() => { useDemo.setState((st) => ({ messages: [...st.messages, { id: `r-${Date.now()}`, threadId: id, from: 'them', text: "Noted. I'll include it in the report.", at: Date.now() }] })); setTyping(false); }, 2000);
  };
  const bubble = (m: (typeof msgs)[number]) => m.photo
    ? <Image key={m.id} source={PHOTOS[m.photo]} contentFit="cover" style={{ width: s(150), height: s(96), borderRadius: s(14), marginTop: s(8) }} />
    : (
      <Animated.View key={m.id} entering={FadeInUp.springify().damping(16)} style={[{ maxWidth: '76%', paddingVertical: s(9), paddingHorizontal: s(12), borderRadius: s(16), marginTop: s(8) },
        m.from === 'me' ? { alignSelf: 'flex-end', backgroundColor: C.blue, borderBottomRightRadius: s(5) } : { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: s(5), shadowColor: '#16205A', shadowOpacity: 0.06, shadowRadius: s(5), elevation: 1 }]}>
        <T size={11} lh={1.45} c={m.from === 'me' ? '#fff' : C.navy}>{m.text}</T>
      </Animated.View>
    );
  return (
    <Screen bg="aurora">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: s(6) }}>
          <BackButton />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), marginLeft: s(10) }}>
            {thread?.kind === 'team' ? <View style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><LogoMark size={14} color="#fff" /></View>
              : <Avatar photo={ex?.photo ?? 'sara'} size={30} />}
            <View><T size={12} w={700}>{thread?.title ?? ex?.name}</T>{thread?.kind !== 'team' && <LiveDot label="On site" size={9} />}</View>
          </View>
        </View>
        <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ paddingTop: s(10), paddingBottom: s(20) }}>
          <T size={9.5} c={C.mute} align="center" style={{ marginVertical: s(4) }}>Today</T>
          {msgs.map(bubble)}
          {typing && (
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: s(3), paddingVertical: s(10), paddingHorizontal: s(12), backgroundColor: '#fff', borderRadius: s(16), borderBottomLeftRadius: s(5), marginTop: s(8) }}>
              <Dot d={0} /><Dot d={150} /><Dot d={300} />
            </View>
          )}
        </ScrollView>
        <Glass r={22} style={{ marginBottom: s(20), flexDirection: 'row', alignItems: 'center', gap: s(8), paddingVertical: s(6), paddingLeft: s(14), paddingRight: s(6) }}>
          <TextInput value={text} onChangeText={setText} placeholder="Message…" placeholderTextColor={C.faint2} onSubmitEditing={send} allowFontScaling={false}
            style={{ flex: 1, fontFamily: F[400], fontSize: s(11.5), color: C.navy, paddingVertical: 0 }} />
          <Pressable accessibilityLabel="Send" onPress={send} style={{ width: s(32), height: s(32), borderRadius: s(16), backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={13} color="#fff" stroke={2.4} />
          </Pressable>
        </Glass>
      </KeyboardAvoidingView>
    </Screen>
  );
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/inbox.test.tsx`
Expected: PASS.

- [ ] **Step 6: Visual check** of 18, 18b and 19. **Commit.**

```bash
git add mobile/src/ui/InboxView.tsx "mobile/src/app/(client)/(tabs)/inbox.tsx" "mobile/src/app/(client)/chat" mobile/__tests__/inbox.test.tsx
git commit -m "feat(mobile): inbox (18), chat (18b), updates (19)"
```

---

### Task 19: Expert onboarding: What do you do? (E1), Your profile (E2), Verified (E3)

Reference images: `design/approved/E1-role.png`, `E2-profile-setup.png` and `E3-verified.png`. Mockup CSS: `batch4-engineer.html`.

**Files:**
- Modify: `mobile/src/app/(expert)/expert-role.tsx`, `mobile/src/app/(expert)/expert-setup.tsx`, `mobile/src/app/(expert)/expert-verified.tsx`
- Test: `mobile/__tests__/expertOnboarding.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// mobile/__tests__/expertOnboarding.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import Role from '@/app/(expert)/expert-role';
import Setup from '@/app/(expert)/expert-setup';
import Verified from '@/app/(expert)/expert-verified';
import { useDemo } from '@/store/demo';

let params: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => params }));
beforeEach(() => { jest.useFakeTimers(); useDemo.getState().resetDemo(); jest.clearAllMocks(); params = {}; });
afterEach(() => jest.useRealTimers());

test('E1 one tap auto-advances', () => {
  render(<Role />); fireEvent.press(screen.getByText('Architect'));
  act(() => { jest.advanceTimersByTime(700); });
  expect(router.push).toHaveBeenCalledWith('/expert-setup');
});
test('E2 checklist: 2/5 done; completing items enables Submit for review', () => {
  render(<Setup />);
  expect(screen.getByText('2/5')).toBeTruthy();
  for (let i = 0; i < 3; i++) { fireEvent.press(screen.getAllByText('Add')[0]); fireEvent.press(screen.getByText('Save')); }
  expect(screen.getByText('5/5')).toBeTruthy();
  fireEvent.press(screen.getByText('Submit for review'));
  expect(router.push).toHaveBeenCalledWith('/expert-verified');
});
test('E3 review → verified → dashboard', () => {
  render(<Verified />);
  expect(screen.getByText('Under review')).toBeTruthy();
  act(() => { jest.advanceTimersByTime(1900); });
  fireEvent.press(screen.getByText('Go to dashboard'));
  expect(useDemo.getState().expertVerified).toBe(true);
  expect(router.replace).toHaveBeenCalledWith('/pro');
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/expertOnboarding.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement E1 `expert-role.tsx`**

```tsx
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { GradientText } from '@/fx/GradientText';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const ROLES = [['Engineer', 'Civil · Structural · MEP'], ['Architect', 'Design & drawings'], ['Interior designer', 'Fit-out & finishes'], ['Contractor', 'Build & renovate']] as const;
export default function ExpertRole() {
  const [on, setOn] = useState<string>('Engineer');
  const pick = (r: string) => { setOn(r); Haptics.selectionAsync(); setTimeout(() => router.push('/expert-setup'), 600); };
  return (
    <Screen bg="aurora">
      <Header center={<Eyebrow>1 OF 2</Eyebrow>} />
      <T size={26} w={700} ls={-0.035} lh={1.1} style={{ marginTop: s(16) }}>{'What do\nyou do?'}</T>
      <View style={{ marginTop: s(18) }}>
        {ROLES.map(([name, sub], i) => (
          <Pressable key={name} onPress={() => pick(name)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: s(13), borderBottomWidth: i === 3 ? 0 : 1, borderBottomColor: C.line }}>
            {on === name ? <GradientText size={22} w={700} ls={-0.025}>{name}</GradientText> : <T size={18} w={600} ls={-0.025}>{name}</T>}
            <T size={10} c={C.faint}>{sub}</T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
```

- [ ] **Step 4: Implement E2 `expert-setup.tsx`** (the checklist with a gradient ring; each row opens a small sheet with Save)

```tsx
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { Header, Eyebrow } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Sheet } from '@/ui/Sheet';
import { Chip } from '@/ui/Chip';
import { Icon } from '@/ui/Icon';
import { ProgressRing } from '@/fx/ProgressRing';
import { useDemo } from '@/store/demo';
import type { ChecklistKey } from '@/data/types';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const ITEMS: { k: ChecklistKey; t: string; done: string; hint: string; options: string[] }[] = [
  { k: 'licence', t: 'Licence', done: 'Scanned · AD-ENG-20417', hint: 'Scan with your camera', options: ['Scan licence'] },
  { k: 'experience', t: 'Experience', done: 'Cost engineer · 14 years', hint: 'Your role and years', options: ['10+ years'] },
  { k: 'services', t: 'Services & prices', done: 'Bid review · Site visit · BOQ', hint: 'What you offer', options: ['Bid review · AED 2,200', 'Site visit · AED 1,800', 'BOQ check · AED 1,500'] },
  { k: 'areas', t: 'Service areas', done: 'Abu Dhabi & Dubai', hint: 'Where you work', options: ['Abu Dhabi', 'Dubai', 'Al Ain'] },
  { k: 'portfolio', t: 'Portfolio', done: '3 photos added', hint: '3+ photos of past work', options: ['Add 3 photos'] },
];
export default function ExpertSetup() {
  const checklist = useDemo((st) => st.checklist); const n = Object.values(checklist).filter(Boolean).length;
  const [open, setOpen] = useState<ChecklistKey | null>(null); const item = ITEMS.find((i) => i.k === open);
  return (
    <Screen bg="aurora">
      <Header center={<Eyebrow>2 OF 2</Eyebrow>} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(14), marginTop: s(16) }}>
        <ProgressRing size={84} thickness={7} progress={n / 5} colors={['#31D1FF', '#0000FE', '#7A5CFF']}><T size={18} w={700} ls={-0.03}>{`${n}/5`}</T><T size={8} c={C.mute}>done</T></ProgressRing>
        <View><T size={20} w={700} ls={-0.035}>Your profile</T><T size={11} c={C.mute} style={{ marginTop: s(4) }}>{n === 5 ? 'All set' : 'About 3 minutes to finish'}</T></View>
      </View>
      <Glass r={18} style={{ marginTop: s(16), paddingHorizontal: s(14) }}>
        {ITEMS.map((it, i) => {
          const done = checklist[it.k];
          return (
            <View key={it.k} style={{ flexDirection: 'row', alignItems: 'center', gap: s(11), paddingVertical: s(12), borderBottomWidth: i === 4 ? 0 : 1, borderBottomColor: C.line }}>
              {done ? <LinearGradient colors={GRAD} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(24), height: s(24), borderRadius: s(12), alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></LinearGradient>
                : <View style={{ width: s(24), height: s(24), borderRadius: s(12), borderWidth: 1.5, borderColor: '#D3D8E8' }} />}
              <View style={{ flex: 1 }}><T size={12} w={700}>{it.t}</T><T size={10} c={C.mute}>{done ? it.done : it.hint}</T></View>
              {!done && <Pressable onPress={() => setOpen(it.k)}><T size={10.5} w={700} c={C.blue}>Add</T></Pressable>}
            </View>
          );
        })}
      </Glass>
      <Dock><Btn title={n === 5 ? 'Submit for review' : 'Continue'} onPress={() => (n === 5 ? router.push('/expert-verified') : setOpen(ITEMS.find((i) => !checklist[i.k])!.k))} /></Dock>
      <Sheet visible={!!open} onClose={() => setOpen(null)}>
        {item && (<>
          <T size={17} w={700} ls={-0.02}>{item.t}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(6), marginTop: s(12) }}>{item.options.map((o) => <Chip key={o} label={o} on />)}</View>
          <Btn title="Save" style={{ marginTop: s(16) }} onPress={() => { useDemo.getState().completeChecklist(item.k); setOpen(null); }} />
        </>)}
      </Sheet>
    </Screen>
  );
}
```

- [ ] **Step 5: Implement E3 `expert-verified.tsx`** ("Under review" for 1.8s, unless `stay=1` shows verified straight away, then the verified celebration)

```tsx
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Icon } from '@/ui/Icon';
import { ProgressRing } from '@/fx/ProgressRing';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function ExpertVerified() {
  const { stay } = useLocalSearchParams<{ stay?: string }>();
  const [ok, setOk] = useState(!!stay);
  useEffect(() => { if (ok) return; const t = setTimeout(() => { setOk(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, 1800); return () => clearTimeout(t); }, []);
  if (!ok) return (
    <Screen bg="verified">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ProgressRing size={84} thickness={5} progress={0.3} spin colors={['#31D1FF', '#0000FE', '#7A5CFF']} />
        <T size={22} w={700} ls={-0.035} style={{ marginTop: s(26) }}>Under review</T>
        <T size={11} c={C.mute} lh={1.55} align="center" style={{ marginTop: s(8) }}>{'Project Pulse is checking your licence.\nThis usually takes 1–2 days.'}</T>
      </View>
    </Screen>
  );
  return (
    <Screen bg="verified">
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Animated.View entering={ZoomIn.springify().damping(9)} style={{ marginTop: s(84), transform: [{ rotate: '-8deg' }], shadowColor: C.blue, shadowOpacity: 0.3, shadowRadius: s(22), shadowOffset: { width: 0, height: s(20) }, elevation: 10 }}>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(96), height: s(96), borderRadius: s(30), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shieldCheck" size={44} color="#fff" stroke={2.4} />
          </LinearGradient>
        </Animated.View>
        <View style={{ flexDirection: 'row', marginTop: s(34) }}><T size={26} w={700} ls={-0.035}>You're </T><GradientText size={26} w={700} ls={-0.035}>verified</GradientText></View>
        <T size={11} c={C.mute} lh={1.55} align="center" style={{ marginTop: s(8) }}>{'Project Pulse approved your profile.\nYou\'ll now get requests in\n'}<T size={11} w={700}>Abu Dhabi & Dubai</T>.</T>
        <Glass r={14} style={{ marginTop: s(22), paddingVertical: s(8), paddingHorizontal: s(14) }}><T size={10} c={C.mute}>Under review took <T size={10} w={700}>2 days</T> · you'll hear by email</T></Glass>
      </View>
      <Dock bg="none"><Btn title="Go to dashboard" onPress={() => { useDemo.getState().verifyExpert(); router.replace('/pro'); }} /></Dock>
    </Screen>
  );
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `cd mobile && npx jest __tests__/expertOnboarding.test.tsx`
Expected: PASS.

- [ ] **Step 7: Visual check** of E1, E2 and E3. **Commit.**

```bash
git add "mobile/src/app/(expert)/expert-role.tsx" "mobile/src/app/(expert)/expert-setup.tsx" "mobile/src/app/(expert)/expert-verified.tsx" mobile/__tests__/expertOnboarding.test.tsx
git commit -m "feat(mobile): expert onboarding E1–E3"
```

---

### Task 20: Expert work: Dashboard (E4), Send quote (E5), Availability (E6), Deliverables (E7), Earnings (E8), Requests and Inbox tabs

Reference images: `design/approved/E4-dashboard.png`, `E5-send-quote.png`, `E6-availability.png`, `E7-deliverables.png` and `E8-earnings.png`.

**Files:**
- Modify: `mobile/src/app/(expert)/pro/(tabs)/{index,requests,jobs,earnings,inbox}.tsx`, `mobile/src/app/(expert)/pro/request/[id].tsx`, `mobile/src/app/(expert)/pro/job/[id].tsx`
- Create: `mobile/src/ui/RequestCard.tsx`
- Test: `mobile/__tests__/expertWork.test.tsx`

- [ ] **Step 1: Write the failing test** (it includes the cross-role link end to end)

```tsx
// mobile/__tests__/expertWork.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import Dash from '@/app/(expert)/pro/(tabs)/index';
import SendQuote from '@/app/(expert)/pro/request/[id]';
import Jobs from '@/app/(expert)/pro/(tabs)/jobs';
import Deliver from '@/app/(expert)/pro/job/[id]';
import Earnings from '@/app/(expert)/pro/(tabs)/earnings';
import { useDemo } from '@/store/demo';

let params: Record<string, string> = {};
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() }, useLocalSearchParams: () => params }));
beforeEach(() => { useDemo.getState().resetDemo(); jest.clearAllMocks(); params = {}; });

test('client request shows on the dashboard; the quote goes back to the client', () => {
  const id = 'req-soil'; // seeded request from Sara (Task 5)
  render(<Dash />);
  expect(screen.getByText('AED 18,400')).toBeTruthy(); expect(screen.getByText('Soil test report')).toBeTruthy();
  params = { id }; render(<SendQuote />);
  expect(screen.getByText('Typical for this job: AED 1,800–2,600')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Decrease price'));
  fireEvent.press(screen.getByText('Send quote'));
  expect(useDemo.getState().quotes.find((q) => q.requestId === id && q.expertId === 'omar')?.price).toBe(1800);
});
test('availability toggle, deliver, earnings withdraw', () => {
  render(<Jobs />);
  fireEvent.press(screen.getByText('Off · tap to open'));
  expect(useDemo.getState().slots.find((x) => x.id === 'thu-1700')?.state).toBe('open');
  params = { id: 'job-1' }; render(<Deliver />);
  fireEvent.press(screen.getByText('Mark as complete'));
  expect(useDemo.getState().jobs[0].status).toBe('report');
  render(<Earnings />);
  fireEvent.press(screen.getByText('Withdraw'));
  fireEvent.press(screen.getByText('Withdraw AED 6,200'));
  expect(useDemo.getState().withdrawable).toBe(0);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd mobile && npx jest __tests__/expertWork.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/ui/RequestCard.tsx`, E4 `index.tsx` and `requests.tsx`**

```tsx
// src/ui/RequestCard.tsx
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Glass } from './Glass';
import { Avatar } from './Avatar';
import { T } from './T';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import type { Request } from '@/data/types';

export function RequestCard({ r, compact }: { r: Request; compact?: boolean }) {
  const photo = r.clientName === 'Sara' ? 'sara' : 'karim';
  return (
    <Pressable onPress={() => router.push(`/pro/request/${r.id}` as any)}>
      <Glass r={18} style={{ paddingVertical: s(12), paddingHorizontal: s(14), opacity: compact ? 0.9 : 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
          <Avatar photo={photo} size={34} />
          <View style={{ flex: 1 }}><T size={12.5} w={700}>{r.title}</T><T size={9.5} c={C.mute} style={{ marginTop: 1 }}>{r.clientName === 'Sara' ? 'Villa · Al Reem · Design stage' : r.place}</T></View>
          {compact && <T size={9.5} c={C.mute}>1h</T>}
        </View>
        {!compact && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: s(10) }}>
            <T size={9.5} c={C.mute}>{`Within 2 weeks · ${r.distance}`}</T>
            <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: s(7), paddingHorizontal: s(14), borderRadius: s(12) }}><T size={10.5} w={700} c="#fff">Quote</T></LinearGradient>
          </View>
        )}
      </Glass>
    </Pressable>
  );
}
```

```tsx
// src/app/(expert)/pro/(tabs)/index.tsx — E4
import { ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Avatar } from '@/ui/Avatar';
import { RequestCard } from '@/ui/RequestCard';
import { useDemo, expertRequests } from '@/store/demo';
import { EARNINGS, aed } from '@/data/seed';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function ExpertHome() {
  const reqs = useDemo(expertRequests);
  return (
    <Screen bg="aurora3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(90) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
          <View><T size={9.5} c={C.mute}>Good morning</T><T size={22} w={700} ls={-0.035} style={{ marginTop: s(2) }}>Omar</T></View>
          <Avatar photo="omar" size={34} ring="white" />
        </View>
        <LinearGradient colors={[C.navy, C.blue, C.cyan]} locations={[0, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ marginTop: s(14), borderRadius: s(22), padding: s(16), overflow: 'hidden' }}>
          <T size={10} w={600} c="rgba(255,255,255,0.75)">This month</T>
          <T size={26} w={700} ls={-0.04} c="#fff" style={{ marginTop: s(4) }}>{aed(EARNINGS.total)}</T>
          <T size={10} c="rgba(255,255,255,0.7)" style={{ marginTop: s(2) }}><T size={10} w={700} c="#8FF0C0">{`↑ ${EARNINGS.trend}%`}</T> vs last month</T>
          <Svg width={s(70)} height={s(28)} viewBox="0 0 120 40" style={{ position: 'absolute', right: s(16), bottom: s(16) }}>
            <Path d="M0 34 L20 28 L40 30 L60 18 L80 22 L100 10 L120 6" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
          </Svg>
        </LinearGradient>
        <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(16), marginBottom: s(8) }}>{`NEW REQUESTS · ${reqs.length}`}</T>
        <View style={{ gap: s(8) }}>{reqs.map((r, i) => <RequestCard key={r.id} r={r} compact={i > 0} />)}</View>
      </ScrollView>
    </Screen>
  );
}
```

```tsx
// src/app/(expert)/pro/(tabs)/requests.tsx
import { ScrollView, View } from 'react-native';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { RequestCard } from '@/ui/RequestCard';
import { useDemo, expertRequests } from '@/store/demo';
import { s } from '@/theme/scale';
export default function Requests() {
  const reqs = useDemo(expertRequests);
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} style={{ marginTop: s(10) }}>Requests</T>
      <ScrollView contentContainerStyle={{ gap: s(8), paddingTop: s(14), paddingBottom: s(90) }}>{reqs.map((r) => <RequestCard key={r.id} r={r} />)}</ScrollView>
    </Screen>
  );
}
```

E4 shows the seeded "Soil test report" (`req-soil`, from Sara, seeded in Task 5) first and "BOQ cost check" second, matching `E4-dashboard.png`.

- [ ] **Step 4: Implement E5 `pro/request/[id].tsx`**

```tsx
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { Orb } from '@/fx/Orb';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

const RANGE: Record<string, [number, number]> = { 'soil-test': [1800, 2600], boq: [1200, 1800], 'bid-review': [2000, 2800] };
export default function SendQuote() {
  const { id = 'req-soil' } = useLocalSearchParams<{ id?: string }>();
  const r = useDemo((st) => st.requests.find((x) => x.id === id))!;
  const [lo, hi] = RANGE[r.kbId] ?? [1500, 2500];
  const [price, setPrice] = useState(r.kbId === 'soil-test' ? 1900 : Math.round((lo + hi) / 2 / 100) * 100);
  const [days, setDays] = useState(5); const out = price < lo || price > hi;
  const stepBtn = (label: string, d: number, a11y: string) => (
    <Pressable accessibilityLabel={a11y} onPress={() => { setPrice((p) => Math.max(100, p + d)); Haptics.selectionAsync(); }}>
      <Glass r={20} style={{ width: s(40), height: s(40), alignItems: 'center', justifyContent: 'center' }}><T size={18}>{label}</T></Glass>
    </Pressable>
  );
  return (
    <Screen bg="aurora">
      <Header />
      <T size={20} w={700} ls={-0.035} style={{ marginTop: s(10) }}>{r.title}</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`From ${r.clientName} · ${r.clientName === 'Sara' ? 'Villa, Al Reem Island' : r.place}`}</T>
      <Glass r={16} style={{ marginTop: s(12), padding: s(12) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}><Orb size={12} /><T size={8.5} w={700} ls={0.08} c={C.blue}>WRITTEN BY PULSE</T></View>
        <T size={11} lh={1.5} style={{ marginTop: s(6) }}>{r.summary}</T>
      </Glass>
      <T size={9} w={700} ls={0.14} c={C.mute} align="center" style={{ marginTop: s(16) }}>YOUR PRICE</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: s(10) }}>
        {stepBtn('−', -100, 'Decrease price')}
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}><T size={30} w={700} ls={-0.04}>AED </T><GradientText size={30} w={700} ls={-0.04}>{price.toLocaleString('en-US')}</GradientText></View>
        {stepBtn('+', 100, 'Increase price')}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(7), marginTop: s(6) }}>
        <Orb size={12} /><T size={10} w={600} c={out ? C.amber : C.blue}>{`Typical for this job: AED ${lo.toLocaleString('en-US')}–${hi.toLocaleString('en-US')}`}</T>
      </View>
      <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(16) }}>REPORT IN</T>
      <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>
        {[3, 5, 7].map((d) => d === days ? (
          <LinearGradient key={d} colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, paddingVertical: s(9), borderRadius: s(12), alignItems: 'center' }}><T size={10.5} w={600} c="#fff">{`${d} days`}</T></LinearGradient>
        ) : (
          <Pressable key={d} onPress={() => setDays(d)} style={{ flex: 1 }}><Glass r={12} style={{ paddingVertical: s(9), alignItems: 'center' }}><T size={10.5} w={600} c={C.mute}>{`${d} days`}</T></Glass></Pressable>
        ))}
      </View>
      <Dock><Btn title="Send quote" onPress={() => { useDemo.getState().sendQuote(r.id, price, days); router.replace('/pro'); }} /></Dock>
    </Screen>
  );
}
```

- [ ] **Step 5: Implement E6 `jobs.tsx`, E7 `pro/job/[id].tsx`, E8 `earnings.tsx` and the expert `inbox.tsx`**

```tsx
// src/app/(expert)/pro/(tabs)/jobs.tsx — E6
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { useDemo } from '@/store/demo';
import { DAYS } from '@/data/seed';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Availability() {
  const slots = useDemo((st) => st.slots); const toggle = useDemo((st) => st.toggleSlot);
  const [on, setOn] = useState(true);
  return (
    <Screen bg="aurora">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: s(8) }}>
        <T size={22} w={700} ls={-0.035}>Availability</T>
        <Pressable onPress={() => setOn(!on)}>
          <LinearGradient colors={on ? GRAD : ['#D3D8E8', '#D3D8E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(38), height: s(22), borderRadius: s(11), justifyContent: 'center', paddingHorizontal: s(3), alignItems: on ? 'flex-end' : 'flex-start' }}>
            <View style={{ width: s(16), height: s(16), borderRadius: s(8), backgroundColor: '#fff' }} />
          </LinearGradient>
        </Pressable>
      </View>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>Clients can book your open slots</T>
      <View style={{ flexDirection: 'row', gap: s(5), marginTop: s(12) }}>
        {DAYS.map((d) => d.n === 9 ? (
          <LinearGradient key={d.n} colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, paddingVertical: s(8), borderRadius: s(12), alignItems: 'center' }}>
            <T size={8.5} w={700} c="rgba(255,255,255,0.8)">{d.d}</T><T size={14} w={700} c="#fff" style={{ marginTop: 1 }}>{String(d.n)}</T>
          </LinearGradient>
        ) : (
          <Glass key={d.n} r={12} style={{ flex: 1, paddingVertical: s(8), alignItems: 'center' }}><T size={8.5} w={700} c={C.mute}>{d.d}</T><T size={14} w={700} style={{ marginTop: 1 }}>{String(d.n)}</T></Glass>
        ))}
      </View>
      <View style={{ marginTop: s(12), opacity: on ? 1 : 0.5 }}>
        {slots.map((x) => {
          const time = <T size={10} w={700} c={x.state === 'off' ? C.mute : x.state === 'booked' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.75)'} style={{ width: s(44) }}>{x.time}</T>;
          const row = { flexDirection: 'row', alignItems: 'center', gap: s(10), paddingVertical: s(11), paddingHorizontal: s(12), borderRadius: s(14), marginTop: s(8) } as const;
          if (x.state === 'booked') return (
            <Pressable key={x.id} onPress={() => router.push(`/pro/job/${x.jobId}` as any)} style={[row, { backgroundColor: C.navy }]}>
              {time}<View style={{ flex: 1 }}><T size={11.5} w={600} c="#fff">{x.label}</T><T size={9.5} w={500} c="rgba(255,255,255,0.65)">{x.sub}</T></View>
            </Pressable>);
          if (x.state === 'open') return (
            <Pressable key={x.id} onPress={() => toggle(x.id)}>
              <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={row}>{time}<T size={11.5} w={600} c="#fff">Open for bookings</T></LinearGradient>
            </Pressable>);
          return <Pressable key={x.id} onPress={() => toggle(x.id)} style={[row, { backgroundColor: 'rgba(22,32,90,0.04)' }]}>{time}<T size={11.5} w={600} c={C.faint2}>Off · tap to open</T></Pressable>;
        })}
      </View>
    </Screen>
  );
}
```

```tsx
// src/app/(expert)/pro/job/[id].tsx — E7
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { Header } from '@/ui/Header';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Dock } from '@/ui/Dock';
import { useDemo } from '@/store/demo';
import { PHOTOS } from '@/theme/photos';
import { GRAD, EASE } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Deliver() {
  const { id = 'job-1' } = useLocalSearchParams<{ id?: string }>();
  const job = useDemo((st) => st.jobs.find((j) => j.id === id) ?? st.jobs[0]);
  const p = useSharedValue(0); useEffect(() => { p.value = withTiming(1, { duration: 2400, easing: EASE }); }, []);
  const bar = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  const [photos, setPhotos] = useState<(keyof typeof PHOTOS)[]>(['site1', 'site2', 'drawings']);
  return (
    <Screen bg="aurora">
      <Header right={<View style={{ paddingVertical: s(3), paddingHorizontal: s(7), borderRadius: s(8), backgroundColor: 'rgba(0,0,254,0.08)' }}><T size={8.5} w={700} c={C.blue}>{job.status === 'report' ? 'Delivered' : 'In progress'}</T></View>} />
      <T size={20} w={700} ls={-0.035} style={{ marginTop: s(10) }}>Bid review</T>
      <T size={11} c={C.mute} style={{ marginTop: s(4) }}>{`Sara · Villa, Al Reem · Due ${job.due}`}</T>
      <T size={9} w={700} ls={0.14} c={C.mute} style={{ marginTop: s(16), marginBottom: s(8) }}>DELIVERABLES</T>
      <Glass r={16} style={{ padding: s(12), flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
        <View style={{ width: s(34), height: s(40), borderRadius: s(8), backgroundColor: '#F4F6FD', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: s(4) }}><T size={7} w={800} c={C.blue}>PDF</T></View>
        <View style={{ flex: 1 }}>
          <T size={11.5} w={700}>Bid review report.pdf</T>
          <View style={{ height: s(4), borderRadius: s(4), backgroundColor: '#E6E9F2', marginTop: s(6), overflow: 'hidden' }}>
            <Animated.View style={[{ height: '100%' }, bar]}><LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} /></Animated.View>
          </View>
        </View>
      </Glass>
      <Pressable onPress={() => setPhotos((x) => x)} style={{ marginTop: s(8), borderRadius: s(18), padding: s(16), alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(0,0,254,0.3)', backgroundColor: 'rgba(0,0,254,0.03)' }}>
        <T size={11} w={700} c={C.blue}>+ Add file or photos</T><T size={9.5} c={C.mute} style={{ marginTop: 2 }}>PDF, drawings, site photos</T>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: s(6), marginTop: s(8) }}>{photos.map((ph) => <Image key={ph} source={PHOTOS[ph]} contentFit="cover" style={{ flex: 1, height: s(56), borderRadius: s(12) }} />)}</View>
      <Dock><Btn title={job.status === 'report' ? 'Delivered' : 'Mark as complete'} done={job.status === 'report'} onPress={() => { useDemo.getState().completeJob(job.id); router.back(); }} /></Dock>
    </Screen>
  );
}
```

```tsx
// src/app/(expert)/pro/(tabs)/earnings.tsx — E8
import { Pressable, View } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Screen } from '@/ui/Screen';
import { T } from '@/ui/T';
import { Glass } from '@/ui/Glass';
import { Btn } from '@/ui/Btn';
import { Sheet } from '@/ui/Sheet';
import { Segmented } from '@/ui/Segmented';
import { GradientText } from '@/fx/GradientText';
import { useDemo } from '@/store/demo';
import { EARNINGS, aed } from '@/data/seed';
import { GRAD } from '@/theme/tokens';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';

export default function Earnings() {
  const [seg, setSeg] = useState(1); const [sheet, setSheet] = useState(false);
  const { withdrawable, payouts } = useDemo();
  return (
    <Screen bg="aurora">
      <T size={22} w={700} ls={-0.035} style={{ marginTop: s(10) }}>Earnings</T>
      <Segmented options={['Week', 'Month', 'Year']} value={seg} onChange={setSeg} style={{ marginTop: s(12) }} />
      <View style={{ alignItems: 'center', marginTop: s(14) }}>
        <T size={9.5} c={C.mute}>{EARNINGS.month}</T>
        <View style={{ flexDirection: 'row', marginTop: s(2) }}><T size={28} w={700} ls={-0.04}>AED </T><GradientText size={28} w={700} ls={-0.04}>{EARNINGS.total.toLocaleString('en-US')}</GradientText></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: s(8), height: s(110), marginTop: s(16), paddingHorizontal: s(4) }}>
        {EARNINGS.weeks.map((h, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: s(5), height: '100%', justifyContent: 'flex-end' }}>
            <Animated.View entering={FadeInUp.delay(120 * i)} style={{ width: '100%', height: `${h * 82}%`, borderTopLeftRadius: s(8), borderTopRightRadius: s(8), borderBottomLeftRadius: s(4), borderBottomRightRadius: s(4), overflow: 'hidden', backgroundColor: 'rgba(22,32,90,0.08)' }}>
              {i === EARNINGS.weeks.length - 1 && <LinearGradient colors={GRAD} locations={[0, 0.6, 1]} style={{ flex: 1 }} />}
            </Animated.View>
            <T size={8} w={700} c={C.faint}>{`W${i + 1}`}</T>
          </View>
        ))}
      </View>
      <Glass r={16} style={{ marginTop: s(14), paddingVertical: s(12), paddingHorizontal: s(14), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View><T size={9.5} c={C.mute}>Ready to withdraw</T><T size={15} w={700} ls={-0.02}>{aed(withdrawable)}</T></View>
        <Pressable disabled={!withdrawable} onPress={() => setSheet(true)}>
          <LinearGradient colors={GRAD} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: s(9), paddingHorizontal: s(14), borderRadius: s(12), opacity: withdrawable ? 1 : 0.4 }}><T size={10.5} w={700} c="#fff">Withdraw</T></LinearGradient>
        </Pressable>
      </Glass>
      <Glass r={16} style={{ marginTop: s(10), paddingHorizontal: s(14) }}>
        {payouts.map((p, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(10), borderBottomWidth: i === payouts.length - 1 ? 0 : 1, borderBottomColor: C.line }}>
            <View><T size={11.5}>{p.title}</T><T size={9.5} c={C.faint}>{p.when}</T></View>
            <T size={11.5} w={700}>{`${p.amount > 0 ? '+' : '−'}${Math.abs(p.amount).toLocaleString('en-US')}`}</T>
          </View>
        ))}
      </Glass>
      <Sheet visible={sheet} onClose={() => setSheet(false)}>
        <T size={17} w={700}>Withdraw to bank</T><T size={11} c={C.mute} style={{ marginTop: s(4) }}>Emirates NBD •••• 2210 · arrives in 1–2 working days</T>
        <Btn title={`Withdraw ${aed(withdrawable)}`} style={{ marginTop: s(14) }} onPress={() => { useDemo.getState().withdraw(); setSheet(false); }} />
      </Sheet>
    </Screen>
  );
}
```

```tsx
// src/app/(expert)/pro/(tabs)/inbox.tsx
import { InboxView } from '@/ui/InboxView';
export default function ExpertInbox() { return <InboxView role="expert" chatBase="/chat" />; }
```

- [ ] **Step 6: Run the full test suite and the type check**

Run: `cd mobile && npx jest && npx tsc --noEmit`
Expected: all suites PASS, and tsc reports no errors.

- [ ] **Step 7: Visual check** of E4–E8. **Commit.**

```bash
git add "mobile/src/app/(expert)" mobile/src/ui/RequestCard.tsx mobile/__tests__/expertWork.test.tsx
git commit -m "feat(mobile): expert dashboard, send quote, availability, deliverables, earnings"
```

---

### Task 21: Automated fidelity check against the 39 approved references (acceptance gate)

**Files:**
- Create: `mobile/tools/fidelity/capture.mjs`, `mobile/tools/fidelity/compare.py`, `mobile/public/canvaskit.wasm` (copied)
- Output: `design/fidelity/<id>.png` (side-by-side images) and `design/fidelity/report.md`

**Interfaces:**
- Consumes: `GALLERY` (Task 9), the web build and `design/approved/*.png`.

**How it works:**
- The web app is rendered at **exactly the mockup screen size (254×554 CSS px, device scale 2)**, so `s()` has k = 1 and every pixel is directly comparable to the reference.
- The reference PNGs include the 8px phone bezel (16px at 2×), which `compare.py` crops off.

- [ ] **Step 1: Set up Skia web and Playwright**

```bash
cd "/home/vmj/projects/Projectpulse appdemo/mobile"
mkdir -p public && cp node_modules/canvaskit-wasm/bin/full/canvaskit.wasm public/canvaskit.wasm
npm i -D playwright pixelmatch pngjs && npx playwright install chromium
```

Expected: `public/canvaskit.wasm` exists. (If the path differs in this Skia version, run `find node_modules -name canvaskit.wasm | head -1` and copy that file.)

- [ ] **Step 2: Write `tools/fidelity/capture.mjs`**

```js
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import url from 'url';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '../../src/nav/gallery.ts'), 'utf8');
const GALLERY = eval(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1)); // gallery.ts holds a plain array literal
const BASE = process.env.BASE ?? 'http://localhost:8081';
const out = path.join(here, '../../../design/fidelity/shots'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 254, height: 554 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${BASE}/dev/gallery`); await page.waitForTimeout(3000); // seeds the demo state
for (const g of GALLERY) {
  const sep = g.href.includes('?') ? '&' : '?';
  await page.goto(`${BASE}${g.href}${g.href.includes('stay=') ? '' : sep + 'stay=1'}`);
  await page.waitForTimeout(g.id.startsWith('04') || g.id.startsWith('05') || g.id === '08-home' || g.id.startsWith('17') ? 4500 : 2500);
  await page.screenshot({ path: path.join(out, `${g.id}.png`) });
  console.log('captured', g.id);
}
await browser.close();
```

- [ ] **Step 3: Write `tools/fidelity/compare.py`** (side-by-side images plus a pixel-difference score)

```python
import os, sys, json
from PIL import Image, ImageChops, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
REF, SHOT, OUT = f'{ROOT}/design/approved', f'{ROOT}/design/fidelity/shots', f'{ROOT}/design/fidelity'
rows = []
for f in sorted(os.listdir(SHOT)):
    rid = f[:-4]; ref = Image.open(f'{REF}/{f}').convert('RGB'); shot = Image.open(f'{SHOT}/{f}').convert('RGB')
    ref = ref.crop((16, 16, ref.width - 16, ref.height - 16)).resize(shot.size)   # strip the 8px (×2) phone bezel
    diff = ImageChops.difference(ref, shot).convert('L')
    score = sum(1 for p in diff.getdata() if p > 40) / (shot.width * shot.height)
    canvas = Image.new('RGB', (shot.width * 3 + 40, shot.height + 40), 'white'); d = ImageDraw.Draw(canvas)
    for i, (im, label) in enumerate([(ref, 'approved'), (shot, 'app'), (diff.point(lambda p: 255 if p > 40 else 0).convert('RGB'), f'diff {score:.1%}')]):
        canvas.paste(im, (i * (shot.width + 20), 30)); d.text((i * (shot.width + 20), 8), f'{rid} · {label}', fill='black')
    canvas.save(f'{OUT}/{rid}.png'); rows.append((rid, score))
with open(f'{OUT}/report.md', 'w') as fh:
    fh.write('| screen | differing pixels |\n|---|---|\n' + '\n'.join(f'| {r} | {s:.1%} |' for r, s in rows) + '\n')
print(json.dumps({r: round(s, 3) for r, s in rows}, indent=1))
```

- [ ] **Step 4: Run the capture and comparison**

```bash
cd "/home/vmj/projects/Projectpulse appdemo/mobile"
npx expo start --web --port 8081 &   # wait until "Web is waiting on http://localhost:8081"
node tools/fidelity/capture.mjs
python3 tools/fidelity/compare.py
```

Expected: 39 `captured` lines, then a JSON map of scores, and `design/fidelity/report.md`.

- [ ] **Step 5: Review every side-by-side image and fix the differences** (this is the acceptance gate)

Open each `design/fidelity/<id>.png`, look at it, and compare the approved and app panels. A screen **passes** only when layout, spacing, sizes, copy, colours and imagery match. The allowed differences are the animation frame (orb, aurora, shimmer position, 3D rotation angle) and font anti-aliasing. For each failure:
1. Find the element's value in the mockup CSS (`design/mockups/…html`).
2. Correct the screen code.
3. Re-run Steps 4–5.

As a guide, most static screens should land under ~6% differing pixels. Animated or 3D screens will be higher, so judge those by eye. Record the final verdict per screen in `design/fidelity/report.md` (add a "verdict" column: `pass` plus a note).

- [ ] **Step 6: Commit**

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
printf "design/fidelity/shots/\n" >> .gitignore
git add .gitignore mobile/tools/fidelity mobile/public/canvaskit.wasm mobile/package.json mobile/package-lock.json design/fidelity/*.png design/fidelity/report.md
git commit -m "test(mobile): automated fidelity capture vs approved references — all 39 screens pass"
```

---

### Task 22: App identity, device pass and the shareable APK

**Files:**
- Modify: `mobile/app.json`
- Create: `mobile/eas.json`, `mobile/tools/make_icons.py`, `mobile/assets/{icon,adaptive-icon,splash}.png`

- [ ] **Step 1: Generate the icon and splash from the logo mark**

`mobile/tools/make_icons.py`:

```python
from PIL import Image, ImageDraw
import os
here = os.path.dirname(__file__); out = os.path.join(here, '..', 'assets')
def mark(size, fg, bg, pad):
    im = Image.new('RGBA', (size, size), bg); d = ImageDraw.Draw(im); s = (size - 2 * pad) / 100; o = pad
    P = lambda pts: [(o + x * s, o + y * s) for x, y in pts]
    d.polygon(P([(0,100),(0,22),(6,6),(22,0),(72,0),(72,20),(34,40),(34,100)]), fill=fg)
    d.polygon(P([(50,100),(50,50),(72,39),(72,100)]), fill=fg)
    return im
mark(1024, '#FFFFFF', '#0000FE', 220).save(os.path.join(out, 'icon.png'))
mark(1024, '#FFFFFF', (0, 0, 0, 0), 300).save(os.path.join(out, 'adaptive-icon.png'))
mark(1242, '#0000FE', '#FFFFFF', 470).save(os.path.join(out, 'splash.png'))
print('icons ok')
```

Run: `cd mobile && python3 tools/make_icons.py`
Expected: `icons ok`.

- [ ] **Step 2: Configure `app.json` and `eas.json`**

`mobile/app.json` (merge these keys into the template's file):

```json
{
  "expo": {
    "name": "Project Pulse",
    "slug": "project-pulse-demo",
    "scheme": "projectpulse",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#FFFFFF" },
    "android": { "package": "com.projectpulse.demo", "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#0000FE" } },
    "web": { "bundler": "metro", "output": "single" },
    "plugins": ["expo-router", "expo-font", "expo-splash-screen"],
    "experiments": { "typedRoutes": false }
  }
}
```

`mobile/eas.json`:

```json
{
  "cli": { "version": ">= 16.0.0", "appVersionSource": "local" },
  "build": {
    "preview": { "android": { "buildType": "apk" }, "distribution": "internal" },
    "production": { "android": { "buildType": "app-bundle" } }
  }
}
```

- [ ] **Step 3: Device pass on the user's Android phone (Expo Go)**

Run: `cd mobile && npx expo start`. The user scans the QR code with Expo Go. Walk through every flow and confirm there are no dead ends:
- (a) Welcome → I need an expert → Sign up → Building (swipe all 5) → Stage (swipe) → Creating → Home.
- (b) Ask bar → Pulse → "Do I need a soil test?" → Answer → Request a quote → Sent. Wait about 8s: the "New quotes" banner appears.
- (c) Ask "Can I remove the kitchen wall?" → Flagged. About 20s later, the "Your question was answered" banner appears.
- (d) Home → Quotes ready → Accept & book → time → Pay → Booked → Track this job.
- (e) Experts → Omar → Book → Pay.
- (f) Project tabs, Inbox, Chat (send a message and see the reply), Updates.
- (g) Profile → Switch to Expert app → E1 → E2 (complete all) → E3 → Dashboard → Quote the soil test → Availability toggle → job → Mark as complete → Earnings → Withdraw.
- (h) Switch back via Profile (expert Inbox tab link, or Reset demo with a long press on the version label).

Also check a smooth 60fps feel, haptics on selections, and 3D drag. Fix anything found, re-running `npx jest` after each fix.

- [ ] **Step 4: Build the APK with EAS** (the user logs in; this needs their Expo account)

Ask the user to run in the session: `! cd mobile && npx eas-cli@latest login`
Then run: `cd mobile && npx eas-cli@latest build -p android --profile preview --non-interactive`
Expected: the build finishes with an **APK download URL** (for example `https://expo.dev/artifacts/eas/….apk`).

- [ ] **Step 5: Install the APK on the phone and repeat the Step 3 walkthrough on the installed build.** Confirm it works fully offline: turn on airplane mode and relaunch.

- [ ] **Step 6: Commit and report**

```bash
cd "/home/vmj/projects/Projectpulse appdemo"
git add mobile/app.json mobile/eas.json mobile/tools/make_icons.py mobile/assets/icon.png mobile/assets/adaptive-icon.png mobile/assets/splash.png
git commit -m "chore(mobile): app identity, EAS preview APK profile"
```

Report the APK URL, the fidelity report (`design/fidelity/report.md`) and the device-pass results to the user.
