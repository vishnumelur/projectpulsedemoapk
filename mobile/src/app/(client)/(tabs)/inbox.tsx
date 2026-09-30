// src/app/(client)/(tabs)/inbox.tsx
import { useLocalSearchParams } from 'expo-router';
import { InboxView } from '@/ui/InboxView';
export default function Inbox() { const { tab } = useLocalSearchParams<{ tab?: string }>(); return <InboxView role="client" initialTab={tab === 'updates' ? 1 : 0} chatBase="/chat" />; }
