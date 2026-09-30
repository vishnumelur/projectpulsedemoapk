# Project Pulse demo app: QA test plan (client Task 7)

**What this is:** a step-by-step, tester-style walk through both portals, written against the **target** behaviour in the
spec (`docs/superpowers/specs/2026-09-30-project-pulse-demo-design.md`, including Batch 5, Task 1 "Pulse greets you" and
Task 2 "sealed demo login"), the plan (`docs/superpowers/plans/2026-09-30-project-pulse-demo-app.md`) and the client task
list (`.superpowers/sdd/2026-09-30-project-pulse-demo-app/user-tasks.md`).

Every step names the screen and, where there is one, its gallery id (`mobile/src/nav/gallery.ts`, which matches the
approved images in `design/approved/`). Each step is automated in `mobile/.maestro/`. The screenshot names in the flows
start with the step id (for example `B05-answer.png`).

**Result labels used in `docs/qa/results.md`:**
- **PASS**: the step behaves as described.
- **FAIL**: the step is broken in the current build and nothing unmerged is expected to fix it.
- **BLOCKED**: the step depends on client work that has not merged yet (Tasks 1–6 and 8 in the task list). It is re-run
  once that work lands.

## 0. Test setup

| Item | Value |
|---|---|
| Device | Android emulator `qa` (Pixel 7, 1080×2400, API 35 google_apis x86_64, 4 GB, 4 cores), serial `emulator-5556` |
| App | Expo Go (SDK 57) running the `feat/demo-app` build from Metro on port 8190 (worktree `/tmp/claude-1000/qa-wt`) |
| Demo accounts | Client `sara@projectpulse.ae`, engineer `omar@projectpulse.ae`, password `pulse2026` |
| Fresh state | Before every flow, `run.sh` force-stops Expo Go and deletes only this project's AsyncStorage. This is the same as a first install of the demo. |
| Expo Go chrome | Turn off the floating **Tools button** in the Expo dev menu once. It sits over the top-right corner, which is where "Sign in" and the Home avatar are. Expo Go remembers the setting. |

A human tester can follow the same steps by hand. Tap only and never type, except for the two Pulse questions, the chat
message and the Sign in fields.

---

## A. First launch: Splash → Pulse greets you → pick role → Sign in

Flows: `00-launch.yaml`, `01-cold-start.yaml`, `02-signin.yaml`.

| # | Screen (gallery id) | Step | Expected |
|---|---|---|---|
| A0 | Splash (`01-splash`) | Fresh install. Open the app the way the icon does, with no deep-link path (`exp://<ip>:8190`). | Splash appears: the logo pieces lock together and "Project Pulse" shows. It then fades into A3 on its own. It never opens on a later screen such as Create account or Sign in. |
| A1 | Splash (`01-splash`) | Fresh install, opened on `/`. | Same as A0. |
| A2 | Pulse greets you (`02-welcome-role`, A3) | Wait about 3 s. | The screen shows: the logo and "Project Pulse" top left, "Sign in" top right, and a large, perfectly round orb with slow orbit rings. "Hi, I'm Pulse." types in letter by letter, then "Your construction expert for Abu Dhabi. Are you planning a project, or are you an engineer?". Two reply bubbles follow: blue "I'm planning a project →" and glass "I'm an engineer". The trust line reads "1,200+ verified engineers · Abu Dhabi". There is no red screen. |
| A3 | Pulse greets you | Look for the old A2 content. | There is no "Get started", no photo welcome and no "What brings you to Pulse?" photo cards. |
| A4 | Pulse greets you → Sign in | Tap **Sign in** (top right). | The Sign in screen opens. |
| A5 | Sign in (`03-sign-up`, Task 2) | Back on A3, tap **I'm planning a project**. | The reply flies up into the conversation, then Sign in opens. Content is top-aligned: "Welcome back", "Sign in to Project Pulse", email and password fields, a Pulse Blue **Sign in** button and an inert "Forgot password?". A **Demo accounts** card lists *Client · Sara Al Mansoori · sara@projectpulse.ae* and *Engineer · Omar Haddad · omar@projectpulse.ae*, with password `pulse2026` shown. Sara is pre-selected. |
| A6 | Sign in | Enter a wrong password and tap **Sign in**. | Calm error text and a field shake (no bounce). You stay on Sign in. |
| A7 | Sign in | Tap "Forgot password?". | Nothing happens (inert). |
| A8 | Sign in → Home | Tap the Sara demo row, then **Sign in**. | The fields fill. The client portal opens (Home, or first-run onboarding if the build does that), never the engineer portal. |
| A9 | Home | Press hardware back. | The app does not return to Sign in, A3 or onboarding, because the history was replaced. It stays in the portal or leaves the app. |
| A10 | A3 → Sign in (engineer) | Fresh install. On A3 tap **I'm an engineer**. | Sign in opens with Omar pre-selected. Signing in opens only the engineer portal. |

## B. Client portal (Sara): every client screen, by tapping only

Flow: `10-client-journey.yaml`. It starts from A8, or from the old "Create account" path while Task 2 is unmerged.

| # | Screen (gallery id) | Step | Expected |
|---|---|---|---|
| B1 | Home (`08-home`) | Arrive at Home. | The greeting reads "Good evening" with a shimmering "Sara". The glass card shows the 3D villa breaking out of its top and "Villa · Al Reem Island". The stage track (B1 style) shows a "Tender" pill with a mini orb and "Stage 3 of 6", with six segments: done segments Pulse Blue and the current one part-filled cyan with a light sweep. Its labels are Planning · Next: Contractor · Handover. The Next step row reads "Choose a contractor" with **Start**, and the text never runs under Start. The Ask Pulse bar has a rotating border and a mic. **NEEDS YOU** lists Quotes ready (2) and Site visit. Nothing is hidden under the tab bar. |
| B2 | Pulse opening (`09-pulse-opening`) | Tap the **Ask Pulse** bar. | A white screen with the orb and "What would you like help with, Sara?". Three suggestions: Review my 3 contractor bids, Book a site visit, Check my budget. Below them: "or just ask. Type, or hold the mic to speak". |
| B3 | Pulse · Ask (`09a-ask`) | Tap "or just ask…". | The header reads "Pulse" with a "Tender stage" pill. Centre: "What would you like to know?" and "Answers from Project Pulse experts". The input "Ask about your project" has a send button. |
| B4 | Pulse · Thinking (`09b-thinking`) | Type "Do I need a soil test?" and send. | The question shows in grey with shimmering key words, then "Finding your answer…" and a guides counter (about 2 s). The orb keeps its slow movement. |
| B5 | Pulse · Answer (`09c-answer`) | Wait. | The user bubble appears, then the answer streams in word by word ("Yes. A soil test is needed…"), followed by the source tag "◆ Project Pulse Villa Guide". The card reads "YOU'LL NEED · Geotechnical engineer", shows 3 avatars and "14 verified · from AED 1,800", and has **Request a quote**. There are no follow-up chips. |
| B6 | Request a quote (`10-request-quote`) | Tap **Request a quote**. | "WRITTEN BY PULSE" shows the summary, pre-filled and editable. Location is Al Reem Island. When offers ASAP / Within 2 weeks / Flexible: tap **Within 2 weeks** and it highlights. Sending to shows 5 experts. **Send request** is pinned. |
| B7 | Sent (`10b-sent`) | Tap **Send request**. | Avatars orbit the orb and tick in. The screen reads "Sent to 5 experts" and "Quotes usually arrive within 24 hours", with the line Sent → Quotes → You choose and a **Done** button. |
| B8 | Home | Tap **Done**. | Back on Home, with no red screen. After about 8 s an in-app banner says new quotes arrived. |
| B9 | Pulse · Flagged (`09d-flagged`) | Ask Pulse → "or just ask" → type "Can I remove this wall?" → send. | There is no answer card. The question shows in grey quotes, and the orb holds a real engineer's photo. The screen reads "An engineer will answer this one" and "Rashid from Project Pulse", with the email pill "Reply by email · within 24h". **Got it** is the primary action and "Book a structural engineer instead" the secondary. |
| B10 | Home | Tap **Got it**. | Home appears. |
| B11 | Experts (`11-experts`) | Tap the **Experts** tab. Tap **Architects**, then **For you**. | The title has a search icon and "Matched by Pulse to your Tender" with a mini orb. The category chips slide their highlight. A two-column photo grid shows match % badges, and the top match has the iridescent border. The filter changes the grid. |
| B12 | Expert profile (`12-expert-profile`) | Tap **Omar**. | The tile expands into the profile: full-bleed portrait, name and credential, "Verified by Project Pulse", then **CHOOSE A SERVICE** radio cards and RECENT WORK. **Book · AED 2,200** is pinned. |
| B13 | Expert profile | Tap **Site visit only**. | The radio moves and the Book price rolls to AED 1,800. |
| B14 | Pick a time (`14a-pick-time`) | Tap **Book · AED 1,800**. | A day strip shows with Mon dimmed and every other day tappable, then "Omar's free times on Thursday". The 13:00 slot is dimmed. Tap **15:00** and it is selected. |
| B15 | Payment (`14b-payment`) | Tap **Continue · AED …**. | A bottom sheet over a blurred page shows "Pay securely", "Held until job sign-off", Visa •••• 4242, a total including 5% VAT, **Pay AED …** and Google Pay. |
| B16 | Booked (`14c-booked`) | Tap **Pay**. | "You're booked" with a gradient ring and tick, then **Track this job** and "Add to calendar". |
| B17 | Job tracking (`15-job-tracking`) | Tap **Track this job**. | Title and project show, then the expert card with a pulsing "On site now" dot and a message button. The 4-step timeline has a gradient fill. "Latest" shows site photos. |
| B18 | Report ready (`15b-report`) | From Home, tap **Site visit** → **View report**. | "Report ready" and "Omar delivered your bid review". The PDF card reads "Bid review report · 14 pages · 2.4 MB" with **Open**. A **PULSE SUMMARY** has 3 bullets. **Approve & release payment** is pinned, with "Ask for changes" as secondary. |
| B19 | Review (`16-review`) | Tap **Approve & release payment**. Tap the 4th, then the 5th star. Toggle **Professional**. Tap **Submit review**. | "How was Omar's bid review?" shows with five gradient stars and the "Excellent" label. Selected chips have a gradient fill. The button becomes "Thanks, Sara", then Home opens. |
| B20 | Quotes (`13-quotes`) | On Home tap **Quotes ready**. | One "Your best match" card with a photo, large price and the Pulse reason. The quiet line reads "2 more · from AED 2,450 · Compare". **Accept & book** is pinned. |
| B21 | Quotes · Compare | Tap **Compare**, then close it. | "Side by side" opens and closes. |
| B22 | Pick a time | Tap **Accept & book**. | Pick a time opens for that expert. Go back twice to Home. |
| B23 | Project · Milestones (`17-project-milestones`) | Tap the **Project** tab. | The live 3D model at its stage is the header. The tab row reads Milestones · Budget · Site · Docs · Decisions, with every tab reachable. The date-block list is marked Done / Next / Planned. |
| B24 | Project · Budget (`17b-budget`) | Tap **Budget**. | The ring reads "68% committed" with AED 1.63M "of 2.4M", then the category bars. Tapping a bar opens its detail and **Done** closes it. |
| B25 | Project · Site (`17c-site`) | Tap **Site**, then tap a photo, then **Close**. | A dated photo diary (hero plus grid). The photo opens full screen and closes. |
| B26 | Project · Docs | Tap **Docs**. | A list of PDF documents. |
| B27 | Project · Decisions | Tap **Decisions**. | The whole "Decisions" tab is visible (not "De…") and scrolled into view. Titles are not cut: "Upgrade to solar-ready roof" and "Shortlist 3 contractors". |
| B28 | Project tabs | On Milestones, swipe left. Then swipe right. | Swiping left moves to Budget and swiping right comes back. The active tab follows. |
| B29 | Inbox (`18-inbox`) | Tap the **Inbox** tab. | The segmented control reads Messages / Updates · n. Conversations with experts and the "Project Pulse team" show unread badges and typing state. |
| B30 | Chat (`18b-chat`) | Tap **Omar Haddad**. Type "See you on Thursday" and send. | The header shows a live status. In and out bubbles, an inline photo and a pinned input all show. The message appears as an outgoing bubble, and the keyboard does not cover the input. |
| B31 | Updates (`19-updates`) | Go back and tap **Updates**. | Items are grouped into Today and Earlier (New quotes, Question answered, Payment held). |
| B32 | Profile (`20-profile`) | On Home tap the avatar. | Avatar, name and email, then My projects, Payments, Notifications and Language. There is **no** "Switch to Expert app" card (Task 2). |
| B33 | Profile → Log out | Tap **Log out**, then confirm in the sheet. | Sign in opens. Back does not return into the portal. |

## C. Engineer portal (Omar)

Flow: `20-expert-journey.yaml`.

| # | Screen (gallery id) | Step | Expected |
|---|---|---|---|
| C1 | Sign in | Fresh install. A3 → **I'm an engineer** → Omar demo row → **Sign in**. | The engineer portal opens. The client portal is never shown. |
| C2 | What do you do? (`E1-role`) | First run only, if the build keeps E1–E3 after sign-in (the spec places E1 after "I'm an expert" → sign-up). Tap **Engineer**. | The word fills with the gradient and the screen auto-advances. |
| C3 | Your profile (`E2-profile-setup`) | Tap **Continue** → **Save** in each sheet until 5/5. | The ring reads "2/5 done · about 3 minutes" and fills as rows tick. Each row opens a small sheet. At 5/5 the subtitle reads "All set" and the button reads **Submit for review**. |
| C4 | Under review → Verified (`E3-verified`) | Tap **Submit for review**. | "Under review by Project Pulse", then the shield springs in with "You're verified", Abu Dhabi & Dubai and **Go to dashboard**. |
| C5 | Dashboard (`E4-dashboard`) | Tap **Go to dashboard** (or arrive from sign-in). | "Good morning, Omar" and the gradient earnings card (This month, trend, sparkline). **NEW REQUESTS · n** cards have a gradient **Quote** pill, with Today's jobs below. The page scrolls clear of the tab bar (Home · Requests · Jobs · Earnings · Inbox). |
| C6 | Send quote (`E5-send-quote`) | Tap **Quote** on the first request. | The request summary is "Written by Pulse". YOUR PRICE has a stepper and the Pulse typical-range hint. REPORT IN has 3 / 5 / 7 days chips. **Send quote** is pinned. |
| C7 | Send quote | Tap + twice and − once. | The price changes by one step net. |
| C8 | Send quote | Tap **7 days**, **3 days**, then **5 days**. | The selected chip moves each time. |
| C9 | Dashboard | Tap **Send quote**. | The dashboard shows again. The quote reaches the client's Quotes (cross-role link). |
| C10 | Requests | Tap the **Requests** tab. | A list of requests. |
| C11 | Availability (`E6-availability`) | Tap the **Jobs** tab. | "Availability" with a master toggle and "Clients can book your open slots". The day strip matches the client's. Slots are booked (navy, "Sara · Bid review visit"), open (gradient) or off. |
| C12 | Availability | Tap an "Off · tap to open" slot. | It turns open. |
| C13 | Availability | Toggle **Pause all bookings** off, then on again. | The slots dim, then return. |
| C14 | Availability (Task 8) | Tap Fri **10**, then Thu **9**. | Every day is tappable with smooth snapping, and each day shows its own slots. |
| C15 | Job & deliverables (`E7-deliverables`) | Tap the booked slot "Sara · Bid review visit". | A status tag, "Bid review", the client and due date. **DELIVERABLES** shows "Bid review report.pdf" with a gradient progress bar, a dashed "+ Add file or photos" zone and a photo row. |
| C16 | Job & deliverables | Tap **Add file or photos**. | A photo is added (the upload). |
| C17 | Job & deliverables | Tap **Mark as complete**, then reopen the booked slot. | A success haptic plays and the app returns to Availability (by design). Reopened, the job's button reads **Delivered**. The client gets "Report ready" (15b). |
| C18 | Earnings (`E8-earnings`) | Tap the **Earnings** tab. Tap **Week**, **Year**, then **Month**. Scroll down. | The big total and bars change per segment. The weekly bars share one baseline, with the current week in gradient. The page scrolls fully clear of the tab bar (Task 5). |
| C19 | Earnings → Withdraw | Tap **Withdraw**, then **Withdraw AED …** in the sheet. | The confirmation sheet reads "Withdraw to bank · Emirates NBD •••• 2210 · arrives in 1–2 working days". Confirming closes it, and the payout list gains a row. |
| C20 | Inbox | Tap the **Inbox** tab. | Messages / Updates for Omar. |
| C21 | Log out | Tap **Log out** (engineer profile or menu), then confirm. | Sign in opens (Task 2). |

## D. Cross-cutting

Flows: `30-cross-cutting.yaml`, `01-cold-start.yaml`, and `41`–`45-building-*.yaml` (one per building type).

| # | Area | Step | Expected |
|---|---|---|---|
| D1 | Back after sign-in | On Home press hardware back. | The app never returns into Sign in, A3, "Create your account" or onboarding. |
| D2 | Sealed portals | Look through the client portal (Profile included) for any route to the engineer side, and the reverse. | There is none. No "Switch to Expert app" card exists. The client account opens only the client app and the engineer account only the engineer portal. |
| D3 | Hardware back on tab roots | On the Inbox tab root press back, then back again on Home. | The first back goes to Home, or the app leaves. It never goes into Sign in or onboarding. |
| D4 | Relaunch while signed in | Kill and reopen the app, both with a path and as a cold start from the icon. | Splash leads straight to the signed-in portal (Home or Dashboard). A3 and Sign in are not shown. |
| D5 | Tab bar clearance | On every tab screen of both portals, scroll to the end. | The last row is fully visible above the floating tab bar. Nothing is hidden under it (Tasks 4 and 5). |
| D6 | No red screens | Throughout every flow. | No red error screen, no LogBox "Log n of n", and no "Something went wrong". Metro's log shows no `ERROR` lines. |
| D7 | Pulse safety gate | B9 | Structural, legal and safety questions always go to Flagged, never to an answer card. |
| D8 | 5 building types | For each of Villa, Shop, Tower, Factory and Renovation: pick it on 04 (page dot), then Continue → 04b → 05. Visit Tender, Design, Planning, Contractor, Construction, then Handover → 06 → Home → Project. | 04 shows the name and subtitle (Villa "Private residence", Shop "Retail & F&B", Tower "Residential or commercial", Factory "Industrial & warehouse", Renovation "Upgrade an existing property"). 04b reads "Lights on. Let's find your stage…". 05 asks "Where is your <type> today?", and the model is framed with nothing cropped (the tower is not cut on Stage). **The model changes with the stage** for every type: a survey plot at Planning, a wireframe at Design, Tender and Contractor, level 1 with scaffolding and a crane at Construction, and complete with lights at Handover (Task 3). 06 reads "✓ <Type> · Handover stage". Home shows "<Type> · Al Reem Island" and "Stage 6 of 6", with nothing clipped and the model framed (Task 4). The Project header shows the same model at its stage. |

The model-changes check in D8 is measured, not eyeballed. `docs/qa/tools/stage-diff.py` compares the model region of the
six stage screenshots per type. A type **fails** if any two adjacent stage groups render the same image.

---

## How to run

```bash
# once: emulator + Metro (see docs/qa/results.md "Environment" for the exact commands and PIDs)
cd /tmp/claude-1000/qa-wt/mobile
.maestro/run.sh                       # every flow, fresh state before each, output in docs/qa/runs/<timestamp>/
.maestro/run.sh .maestro/10-client-journey.yaml   # one flow
python3 ../docs/qa/tools/stage-diff.py ../docs/qa/runs/<timestamp>   # D8 model-changes check
```
