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
