// Sealed demo login (client Task 2): Sign in, sessions, portal guards and Log out.
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import SignIn from '@/app/onboarding/signup';
import ClientLayout from '@/app/(client)/_layout';
import ExpertLayout from '@/app/(expert)/_layout';
import Profile from '@/app/(client)/(tabs)/profile';
import Dash from '@/app/(expert)/pro/(tabs)/index';
import Gallery from '@/app/dev/gallery';
import Building from '@/app/onboarding/building';
import Creating from '@/app/onboarding/creating';
import { PortalGuard } from '@/nav/PortalGuard';
import { useDemo } from '@/store/demo';

let mockParams: Record<string, string> = {};
const mockRedirect = jest.fn();
jest.mock('expo-router', () => {
  const { Text: MText } = require('react-native');
  const Stack: any = () => require('react').createElement(MText, null, 'portal stack');
  Stack.Screen = () => null;
  return {
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), dismissAll: jest.fn(), canDismiss: jest.fn(() => true) },
    useLocalSearchParams: () => mockParams, useFocusEffect: jest.fn(), usePathname: () => '/onboarding/signup', Stack,
    Redirect: ({ href }: { href: string }) => { mockRedirect(href); return null; },
  };
});
beforeEach(() => { jest.useFakeTimers({ advanceTimers: true }); useDemo.getState().resetDemo(); jest.clearAllMocks(); mockParams = {}; });
afterEach(() => jest.useRealTimers());

const SARA = 'sara@projectpulse.ae'; const OMAR = 'omar@projectpulse.ae';
const tick = (ms: number) => act(async () => { jest.advanceTimersByTime(ms); });

describe('store sessions', () => {
  test.each([[SARA, 'client'], [OMAR, 'expert'], ['  Sara@ProjectPulse.ae ', 'client']] as const)('%s signs in as %s', (email, role) => {
    expect(useDemo.getState().signIn(email, 'pulse2026')).toEqual({ ok: true, role });
    expect(useDemo.getState().session).toEqual({ role, email: email.trim().toLowerCase() });
    expect(useDemo.getState().role).toBe(role);
  });
  test.each([[SARA], [OMAR]])('%s with a wrong password fails and stays signed out', (email) => {
    const r = useDemo.getState().signIn(email, 'pulse2025');
    expect(r.ok).toBe(false); expect(useDemo.getState().session).toBeNull();
  });
  test('an unknown email fails', () => {
    expect(useDemo.getState().signIn('someone@mail.ae', 'pulse2026').ok).toBe(false);
    expect(useDemo.getState().session).toBeNull();
  });
  test('signOut clears the session but keeps the demo data and the last role', () => {
    useDemo.getState().signIn(SARA, 'pulse2026'); useDemo.getState().completeClientOnboarding('villa', 3);
    useDemo.setState({ devGallery: true });
    useDemo.getState().signOut();
    expect(useDemo.getState().session).toBeNull(); expect(useDemo.getState().devGallery).toBe(false);
    expect(useDemo.getState().clientOnboarded).toBe(true); expect(useDemo.getState().role).toBe('client');
  });
});

describe('Sign in screen', () => {
  test('shows the sign-in content and pre-selects the role chosen on Welcome', async () => {
    useDemo.getState().setRole('expert');
    await render(<SignIn />);
    for (const t of ['Welcome back', 'Sign in to Project Pulse', 'Sign in', 'Forgot password?', 'DEMO ACCOUNTS', 'Sara Al Mansoori', 'Omar Haddad',
      'CLIENT', 'ENGINEER', SARA, OMAR, 'pulse2026']) expect(screen.getAllByText(t).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Email').props.value).toBe(OMAR);
    expect(screen.getByLabelText('Password').props.value).toBe('pulse2026');
    expect(screen.getByLabelText('Use the engineer demo account').props.accessibilityState).toEqual({ selected: true });
  });
  test('a ?role= param wins over the store role', async () => {
    useDemo.getState().setRole('expert'); mockParams = { role: 'client' };
    await render(<SignIn />);
    expect(screen.getByLabelText('Email').props.value).toBe(SARA);
  });
  test('with no role chosen the fields start empty', async () => {
    await render(<SignIn />);
    expect(screen.getByLabelText('Email').props.value).toBe('');
    expect(screen.getByLabelText('Password').props.value).toBe('');
  });
  test('tapping a demo row fills both fields', async () => {
    await render(<SignIn />);
    await fireEvent.press(screen.getByLabelText('Use the client demo account'));
    expect(screen.getByLabelText('Email').props.value).toBe(SARA);
    expect(screen.getByLabelText('Password').props.value).toBe('pulse2026');
    await fireEvent.press(screen.getByLabelText('Use the engineer demo account'));
    expect(screen.getByLabelText('Email').props.value).toBe(OMAR);
  });
  test('the eye shows and hides the password', async () => {
    await render(<SignIn />);
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByLabelText('Show password'));
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
  });
  test('a wrong password shows a calm error and does not navigate', async () => {
    await render(<SignIn />);
    await fireEvent.press(screen.getByLabelText('Use the client demo account'));
    await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong');
    await fireEvent.press(screen.getByText('Sign in'));
    await tick(1000);
    expect(screen.getByText("That password isn't right. Try again.")).toBeTruthy();
    expect(useDemo.getState().session).toBeNull(); expect(router.replace).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText('Password'), 'pulse2026'); // editing clears it
    expect(screen.queryByText("That password isn't right. Try again.")).toBeNull();
  });
  test('an unknown email shows an error', async () => {
    await render(<SignIn />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'nobody@mail.ae');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'pulse2026');
    await fireEvent.press(screen.getByText('Sign in'));
    await tick(1000);
    expect(screen.getByText('No account with that email. Tap a demo account below.')).toBeTruthy();
  });
  test.each([
    ['client', false, '/onboarding/building'], ['client', true, '/home'], ['expert', false, '/expert-role'], ['expert', true, '/pro'],
  ] as const)('%s sign-in (set up: %s) resets the history into %s', async (role, done, href) => {
    useDemo.setState({ clientOnboarded: done, expertVerified: done });
    await render(<SignIn />);
    await fireEvent.press(screen.getByLabelText(`Use the ${role === 'client' ? 'client' : 'engineer'} demo account`));
    await fireEvent.press(screen.getByText('Sign in'));
    await tick(1200);
    expect(useDemo.getState().session?.role).toBe(role);
    expect(router.dismissAll).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledTimes(1); expect(router.replace).toHaveBeenCalledWith(href);
    expect(router.push).not.toHaveBeenCalled();
  });
  test('already signed in (web back button): Sign in forwards to the portal', async () => {
    useDemo.getState().signIn(OMAR, 'pulse2026'); useDemo.setState({ expertVerified: true });
    await render(<SignIn />);
    expect(router.dismissAll).toHaveBeenCalled(); expect(router.replace).toHaveBeenCalledWith('/pro'); // resetTo, not a plain redirect
    expect(screen.queryByText('Welcome back')).toBeNull();
  });
  test('a double submit signs in once', async () => {
    const orig = useDemo.getState().signIn; const spy = jest.fn(orig);
    useDemo.setState({ signIn: spy }); // the store's state object is replaced on every set, so wrap the action itself
    useDemo.getState().setRole('client');
    await render(<SignIn />);
    const pw = screen.getByLabelText('Password');
    await fireEvent.press(screen.getByText('Sign in'));
    await fireEvent(pw, 'submitEditing'); // keyboard "go" in the same burst
    await tick(1200);
    expect(spy).toHaveBeenCalledTimes(1); expect(router.replace).toHaveBeenCalledTimes(1);
    useDemo.setState({ signIn: orig });
  });
});

describe('portal guards', () => {
  test.each([
    ['client layout', ClientLayout, null, '/onboarding/signup'], ['client layout', ClientLayout, 'expert', '/pro'],
    ['expert layout', ExpertLayout, null, '/onboarding/signup'], ['expert layout', ExpertLayout, 'client', '/home'],
  ] as const)('%s with session %s redirects to %s', async (_n, Layout, role, href) => {
    useDemo.setState({ clientOnboarded: true, expertVerified: true, session: role ? { role, email: role === 'client' ? SARA : OMAR } : null });
    await render(<Layout />);
    expect(mockRedirect).toHaveBeenCalledWith(href); expect(screen.queryByText('portal stack')).toBeNull();
  });
  test.each([[ClientLayout, 'client'], [ExpertLayout, 'expert']] as const)('the matching session gets in', async (Layout, role) => {
    useDemo.setState({ session: { role, email: 'x' } });
    await render(<Layout />);
    expect(screen.getByText('portal stack')).toBeTruthy(); expect(mockRedirect).not.toHaveBeenCalled();
  });
  test('the dev gallery flag lets either portal open', async () => {
    useDemo.setState({ session: { role: 'client', email: SARA }, devGallery: true });
    await render(<ExpertLayout />);
    expect(screen.getByText('portal stack')).toBeTruthy();
  });
});

describe('Log out', () => {
  test('client Profile: no Expert mode; Log out → confirm sheet → Sign in', async () => {
    useDemo.getState().signIn(SARA, 'pulse2026'); useDemo.getState().completeClientOnboarding('villa', 3);
    await render(<Profile />);
    expect(screen.queryByText('Switch to Expert app')).toBeNull(); expect(screen.queryByText(/Expert/)).toBeNull();
    await fireEvent.press(screen.getByText('Log out'));
    expect(screen.getByText('Log out of Project Pulse?')).toBeTruthy();
    await fireEvent.press(screen.getByText('Cancel'));
    await tick(500);
    expect(useDemo.getState().session).not.toBeNull(); expect(router.replace).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Log out'));
    const btn = screen.getByTestId('btn');
    await fireEvent.press(btn); await fireEvent.press(btn); // a second tap in the same burst is ignored
    await tick(500);
    expect(router.dismissAll).toHaveBeenCalled(); expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/onboarding/signup');
    expect(useDemo.getState().session).toBeNull(); expect(useDemo.getState().clientOnboarded).toBe(true);
  });
  test('engineer Dashboard: the avatar opens the account sheet; Log out → confirm → Sign in', async () => {
    useDemo.getState().signIn(OMAR, 'pulse2026');
    await render(<Dash />);
    await fireEvent.press(screen.getByLabelText('Account'));
    expect(screen.getByText('Omar Haddad')).toBeTruthy(); expect(screen.getByText(`Engineer · ${OMAR}`)).toBeTruthy();
    await fireEvent.press(screen.getByText('Log out'));
    expect(screen.getByText('Log out of Project Pulse?')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('btn'));
    await tick(500);
    expect(router.replace).toHaveBeenCalledWith('/onboarding/signup');
    expect(useDemo.getState().session).toBeNull();
  });
});

describe('fix round 1', () => {
  test('the hand-off after a sign in survives Sign in unmounting (hardware back in the beat)', async () => {
    useDemo.getState().setRole('client');
    await render(<SignIn />);
    await fireEvent.press(screen.getByText('Sign in'));
    await tick(700); // signed in, hand-off pending
    expect(useDemo.getState().session?.role).toBe('client');
    await screen.rerender(<></>); // Sign in unmounts (popped by back)
    await tick(400);
    expect(router.replace).toHaveBeenCalledWith('/onboarding/building');
  });
  test('a notice after log out shows no banner (it waits in the inbox)', () => {
    useDemo.getState().signIn(SARA, 'pulse2026');
    useDemo.getState().pushNotice({ kind: 'quotes', title: 'New quotes', text: 't', href: '/quotes', forRole: 'client' });
    expect(useDemo.getState().banner).not.toBeNull();
    useDemo.getState().signOut();
    useDemo.getState().pushNotice({ kind: 'quotes', title: 'Later quotes', text: 't', href: '/quotes', forRole: 'client' });
    expect(useDemo.getState().banner).toBeNull();
    expect(useDemo.getState().notifications[0].title).toBe('Later quotes');
    useDemo.getState().signIn(OMAR, 'pulse2026'); // the other portal: still no client banner
    useDemo.getState().pushNotice({ kind: 'quotes', title: 'Client only', text: 't', href: '/quotes', forRole: 'client' });
    expect(useDemo.getState().banner).toBeNull();
  });
  test.each([[null, '/onboarding/signup'], ['expert', '/pro']] as const)('client onboarding is sealed: session %s goes to %s', async (role, href) => {
    useDemo.setState({ expertVerified: true, session: role ? { role, email: OMAR } : null });
    await render(<Building />);
    expect(mockRedirect).toHaveBeenCalledWith(href); expect(screen.queryByText('Villa')).toBeNull();
    mockRedirect.mockClear();
    await render(<Creating />);
    expect(mockRedirect).toHaveBeenCalledWith(href);
  });
  test('client onboarding opens for the client session', async () => {
    useDemo.setState({ session: { role: 'client', email: SARA } });
    await render(<Building />);
    expect(screen.getByText('Villa')).toBeTruthy(); expect(mockRedirect).not.toHaveBeenCalled();
  });
  describe('release build (__DEV__ = false)', () => {
    const g = globalThis as any; let dev: boolean;
    beforeEach(() => { dev = g.__DEV__; g.__DEV__ = false; });
    afterEach(() => { g.__DEV__ = dev; });
    test('the gallery redirects to the splash and creates no session', async () => {
      await render(<Gallery />);
      expect(mockRedirect).toHaveBeenCalledWith('/'); expect(screen.queryByText('Screen gallery')).toBeNull();
      expect(useDemo.getState().session).toBeNull(); expect(useDemo.getState().devGallery).toBe(false);
    });
    test('the guards ignore a stale devGallery flag', async () => {
      useDemo.setState({ session: null, devGallery: true });
      await render(<PortalGuard role="expert"><></></PortalGuard>);
      expect(mockRedirect).toHaveBeenCalledWith('/onboarding/signup');
    });
  });
});
