// Learn more: https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// One Three.js instance: @react-three/fiber require()s 'three' (-> three.cjs) while our models and three/addons
// import it (-> three.module.js). Two copies break instanceof checks between the renderer and our scene.
const THREE_ENTRY = path.resolve(__dirname, 'node_modules/three/build/three.cjs');
const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') return { type: 'sourceFile', filePath: THREE_ENTRY };
  return (upstream ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
