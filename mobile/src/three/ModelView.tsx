import { Component, useRef } from 'react';
import { View, StyleProp, ViewStyle, ImageStyle } from 'react-native';
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
    <GLBoundary fallback={<Image source={FALLBACK[model]} contentFit="contain" style={[{ flex: 1 }, style as StyleProp<ImageStyle>]} />}>
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
