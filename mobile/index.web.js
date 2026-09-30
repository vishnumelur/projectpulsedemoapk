// Skia's web API is built from global.CanvasKit when @shopify/react-native-skia is first evaluated, and expo-router
// (dev) evaluates every route at mount. CanvasKit must therefore be loaded before the router entry is required.
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';

LoadSkiaWeb({ locateFile: () => '/canvaskit.wasm' }).then(() => require('expo-router/entry'));
