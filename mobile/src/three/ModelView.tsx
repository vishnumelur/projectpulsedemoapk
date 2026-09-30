import { Component, useMemo, useRef } from 'react';
import { View, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CanvasHost } from './CanvasHost';
import { Scene, ModelId, StageView } from './Scene';
import type { Frame } from './frame';

/** Default framing, as approved for the villa. A screen's radius/target/height are always given in villa terms; Scene
 *  fits every other model to its own bounding box with the same zoom and offset (see three/frame.ts), so all five
 *  models appear whole, centred and at a consistent size on every screen. */
export const VILLA_FRAME: Frame = { radius: 9.2, target: [0, 1.8, 0], height: 0.5 };
const FALLBACK = { villa: require('../../assets/fallback/villa.png'), shop: require('../../assets/fallback/shop.png'),
  tower: require('../../assets/fallback/tower.png'), factory: require('../../assets/fallback/factory.png'), reno: require('../../assets/fallback/reno.png') };

class GLBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

type Props = { model: ModelId; stage?: StageView; lights?: number; radius?: number; target?: [number, number, number]; height?: number;
  spin?: number; yaw0?: number; shadows?: boolean; interactive?: boolean; riseKey?: string | number; style?: StyleProp<ViewStyle> };

export function ModelView({ model, interactive = true, shadows = true, style, ...rest }: Props) {
  const yawVel = useRef(0);
  const [tx, ty, tz] = rest.target ?? VILLA_FRAME.target;
  const frame = useMemo<Frame>(() => ({ radius: rest.radius ?? VILLA_FRAME.radius, target: [tx, ty, tz], height: rest.height ?? VILLA_FRAME.height }),
    [rest.radius, rest.height, tx, ty, tz]);
  const pan = useMemo(() => Gesture.Pan().enabled(interactive).runOnJS(true).activeOffsetX([-10, 10]).failOffsetY([-10, 10])
    .onChange((e) => { yawVel.current = e.changeX * -0.01; }), [interactive]);
  return (
    <GLBoundary fallback={<Image source={FALLBACK[model]} contentFit="contain" style={[{ flex: 1 }, style as StyleProp<ImageStyle>]} />}>
      <GestureDetector gesture={pan}>
        <View style={[{ flex: 1 }, style]}>
          <CanvasHost shadows={shadows}>
            <Scene model={model} frame={frame}
              stage={rest.stage} lights={rest.lights} spin={rest.spin} yaw0={rest.yaw0} shadows={shadows} riseKey={rest.riseKey} yawVel={yawVel} />
          </CanvasHost>
        </View>
      </GestureDetector>
    </GLBoundary>
  );
}
export default ModelView;
