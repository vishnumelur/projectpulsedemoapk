import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { Glass } from './Glass';
import { Icon, IconName } from './Icon';
import { T } from './T';

export type TabItem = { route: string; label: string; icon: IconName; also?: string[] };
// Structural subset of BottomTabBarProps (expo-router bundles its own copy of the react-navigation types).
export type TabBarProps = { state: { index: number; routes: { name: string }[] }; navigation: { navigate: (name: never) => void }; items: TabItem[] };
export function TabBar({ state, navigation, items }: TabBarProps) {
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
