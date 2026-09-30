import { Redirect } from 'expo-router';

// The role choice now lives on the A3 welcome as two one-tap replies (client Task 1); the A2 photo-card role screen left
// the flow. Old links to /onboarding/role land on the welcome.
export default function RoleScreen() {
  return <Redirect href="/onboarding/welcome" />;
}
