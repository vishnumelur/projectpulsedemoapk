import { FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Screen } from '@/ui/Screen';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';
import { useDemo } from '@/store/demo';
import { GALLERY } from '@/nav/gallery';

export default function Gallery() {
  useEffect(() => { const st = useDemo.getState(); st.resetDemo(); useDemo.setState({ role: 'client', clientOnboarded: true, expertVerified: true }); }, []);
  return (
    <Screen bg="plain">
      <T size={22} w={700} style={{ marginVertical: s(10) }}>Screen gallery</T>
      <FlatList data={GALLERY} keyExtractor={(g) => g.id} contentContainerStyle={{ gap: s(6), paddingBottom: s(40) }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(item.href as any)}>
            <Glass r={12} style={{ padding: s(10) }}><T size={11} w={600}>{item.id} · {item.label}</T></Glass>
          </Pressable>
        )} />
    </Screen>
  );
}
