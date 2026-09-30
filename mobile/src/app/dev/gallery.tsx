import { FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Screen } from '@/ui/Screen';
import { Glass } from '@/ui/Glass';
import { T } from '@/ui/T';
import { s } from '@/theme/scale';
import { useDemo } from '@/store/demo';
import { GALLERY } from '@/nav/gallery';
import { accountFor } from '@/data/accounts';

export default function Gallery() {
  // Seeds the demo and opens the portals for dev: `devGallery` lets either portal's guard through (dev builds only), so
  // tools/fidelity/capture.mjs, which loads this page once and then every screen by URL, needs no sign in. Any real
  // sign in / sign out clears it. A tap also sets the session of the screen's own portal (E* = engineer).
  useEffect(() => { const st = useDemo.getState(); st.resetDemo(); useDemo.setState({ role: 'client', clientOnboarded: true, expertVerified: true,
    session: { role: 'client', email: accountFor('client').email }, devGallery: true }); }, []);
  const open = (id: string, href: string) => {
    const role = id.startsWith('E') ? 'expert' : 'client';
    useDemo.setState({ role, session: { role, email: accountFor(role).email }, devGallery: true });
    router.push(href as any);
  };
  return (
    <Screen bg="plain">
      <T size={22} w={700} style={{ marginVertical: s(10) }}>Screen gallery</T>
      <FlatList data={GALLERY} keyExtractor={(g) => g.id} contentContainerStyle={{ gap: s(6), paddingBottom: s(40) }}
        renderItem={({ item }) => (
          <Pressable onPress={() => open(item.id, item.href)}>
            <Glass r={12} style={{ padding: s(10) }}><T size={11} w={600}>{item.id} · {item.label}</T></Glass>
          </Pressable>
        )} />
    </Screen>
  );
}
