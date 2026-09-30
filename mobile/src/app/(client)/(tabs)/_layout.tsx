// Home · Project · Experts · Inbox (Profile is a hidden tab that keeps Home highlighted)
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
