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
