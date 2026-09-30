import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '@/theme/scale';
import { C } from '@/theme/tokens';
import { Glass } from './Glass';
import { Icon, IconName } from './Icon';
import { T } from './T';

export type TabItem = { route: string; label: string; icon: IconName; also?: string[] };
// Structural subset of BottomTabBarProps (expo-router bundles its own copy of the react-navigation types).
export type TabBarProps = { state: { index: number; routes: { name: string }[] }; navigation: { navigate: (name: never) => void }; items: TabItem[] };
const DOCK_H = 54;
// Mockup: the dock floats 12px above the screen's bottom edge. Android's gesture bar is a transparent inset only ~24dp
// high, and s(12) already clears its handle, so there the dock just keeps clear of the inset instead of stacking both
// (which lifted it ~15px and covered the list). iOS/web: 12px above the safe area.
const dockBottom = (inset: number) => (Platform.OS === 'android' ? Math.max(s(12), inset) : s(12) + inset);

/** Bottom padding a tab screen's scroll content needs so its last row scrolls fully clear of the floating tab bar
 *  (dock offset + dock height + a 12px gap, safe area included). Never less than the mockups' 90px. */
export function useTabClearance() {
  const insets = useSafeAreaInsets();
  return Math.max(s(90), dockBottom(insets.bottom) + s(DOCK_H) + s(12));
}

export function TabBar({ state, navigation, items }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index].name;
  const bottom = dockBottom(insets.bottom);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: s(12), right: s(12), bottom }}>
      <Glass r={27} style={{ height: s(DOCK_H), flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
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
