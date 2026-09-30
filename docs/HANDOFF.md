# Project Pulse demo — hand-off (end of day 2026-10-01)

Resume from here. Everything below is on branch `feat/demo-app` (pushed to github.com/vishnumelur/projectpulsedemoapk).

## What the app is
Expo SDK 57 demo APK for Project Pulse (Abu Dhabi construction consultancy marketplace) in `mobile/`.
- Spec (source of truth, incl. all later client decisions at the end): `docs/superpowers/specs/2026-09-30-project-pulse-demo-design.md`
- Original plan (22 tasks): `docs/superpowers/plans/2026-09-30-project-pulse-demo-app.md`
- Approved screen images: `design/approved/*.png`; mockups with motion captions: `design/mockups/*.html`
- Client issue list (Tasks 1–15, status per task): `.superpowers/sdd/2026-09-30-project-pulse-demo-app/user-tasks.md`
- Detailed ledger (rulings, reviews, deferred minors): `.superpowers/sdd/2026-09-30-project-pulse-demo-app/progress.md`
- QA test plan (Task 7): `docs/qa/test-plan.md`, Maestro flows `mobile/.maestro/`

## The demo flow (as the client asked)
Every launch and every log-out starts fresh — nothing is saved between runs.
- Splash → "Hi, I'm Pulse" (A3) → **I'm planning a project** → Sign in (Sara pre-filled) → What are you building? (1 OF 5, swipe) → Building chosen → Stage (N OF 6, swipe on names) → Building your project → Home (client app).
- **I'm an engineer** → Sign in (Omar pre-filled) → What do you do? → Your profile (2/5) → Verified → Dashboard.
- Demo accounts: `sara@projectpulse.ae` / `omar@projectpulse.ae`, password `pulse2026`. Portals are sealed (no switching); Log out in client Profile and on the engineer Dashboard avatar.

## Done (client tasks)
1 A3 start · 2 sealed login + log out · 3/11 3D parity for all 5 buildings (framing, bases, 6 stages, perf) · 4 Home polish · 5 tab-bar clearance + Earnings bars · 6 Project tabs · 8 calendars (DayStrip) · 9 calm motion (no bounce, guard test) · 10 app icon/name/splash · 13 fresh demo every run · 14 picker swipe (any speed) + counters · 15 engineer setup scroll/tap/fresh.
Also: full Android fidelity pass (all screens match on the emulator), flows walked with a clean log. Tests: 179 passing, `tsc` clean.

## Remaining (in order)
1. **Task 12 — my inline 3D + customer-flow check** (in progress): walk all 5 buildings through picker → chosen → stages → creating → Home → Project on the emulator; fix anything that looks bad. Checked so far: picker (all 5), tower chosen/stages 3–5, engineer setup. Known to review: villa plot runs off the sides on 04/04b (matches approved), tower small in the Project header.
2. **Task 7 — QA**: the tester agent wrote the plan + Maestro flows (copied into the repo); it had not reported results yet. Re-run the flows on the `qa` emulator against current `feat/demo-app`, fix every failure.
3. **Approved Profile reference** (`design/approved/20-profile.png`) still shows the old screen — client to confirm the new Profile (Log out row, sara@projectpulse.ae) before replacing it.
4. Polish queue (from the ledger): aurora tint vs refs, Avatar gradient ring size, T letter-spacing rounding, E6 booked rows on non-Thursday days not tappable, Skia deprecation warnings.
5. **Build the APK** locally (Android SDK is installed): `npx expo prebuild` + Gradle `assembleRelease` (or EAS if logged in); install on the emulator, verify icon/splash/name.
6. Full Maestro run on the installed APK (both portals, all 5 buildings), fix until clean.
7. Final whole-branch review (most capable model), fixes, then finish the branch (merge/PR) with the client's OK.

## How to run things tomorrow
- Metro for phones (Expo Go): `cd mobile && TMPDIR=/tmp/pp-metro-user npx expo start --lan --port 8083` → open `exp://192.168.100.83:8083` (same Wi-Fi).
- Android emulator: `export ANDROID_HOME=~/Android/Sdk JAVA_HOME=~/Android/jdk PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH`; `emulator -avd pp -gpu host -no-audio -no-boot-anim -no-snapshot-save -memory 4096 -cores 6 &` (second AVD `qa` for Maestro). If screenshots hang, restart the emulator (the GPU renderer freezes after many hours).
- Web fidelity: `BASE=http://localhost:<port> node tools/fidelity/capture.mjs <ids>` + `python3 tools/fidelity/compare.py`; Android: `tools/fidelity/android.py`; 3D contact sheet: `tools/fidelity/parity.mjs` + `parity_sheet.py`.
- Never `pkill -f` (kills the shell); stop servers by port (`fuser -k <port>/tcp`) or PID.
