// Home · Requests · Jobs · Earnings · Inbox
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
