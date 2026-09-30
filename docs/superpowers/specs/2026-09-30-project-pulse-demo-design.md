# Project Pulse — Demo App Design

**Status:** All 4 screen batches approved 2026-09-30. Awaiting written-spec review, then the implementation plan.
**Deliverable:** A demo Android APK (Expo / React Native) that Invenex sends to Project Pulse.

## 0. Fidelity contract: build exactly the approved screens

The client approved specific screens. **The app must reproduce them exactly.** The approved mockups are the source of truth, and wherever this document's prose and a mockup differ, **the mockup wins**.

- **References:**
  - `design/approved/*.png` holds one 2× image per approved screen (39 screens plus the 3D set).
  - `design/mockups/*.html` holds the live mockups, with exact CSS values (colours, gradients, sizes, radii, shadows, easing) in `common.html`, `motion.html` and each page's `<style>`.
  - `design/3d/models.js` holds the exact 3D models.
- **Proportional scaling.**
  - The mockup screen content area is **254 px wide**. Every measurement (font size, padding, margin, radius, icon size, image size, gap) is implemented as `mockupPx × k`, where `k = windowWidth / 254`.
  - This is done through a single `s()` helper in `src/theme`, so every screen looks identical to its reference on any phone width.
- **Vertical space.**
  - The mockup's fake status bar and island map to the device's real status bar and safe area.
  - Extra height on taller phones goes only where the mockup already had flexible space (`margin-top:auto`, before pinned buttons and docks). Pinned elements stay pinned.
- **Content is identical:** copy (every word), names, numbers, order of elements, icons, photos and the 3D models.
  - The Unsplash photos used in the mockups are bundled as local assets (Unsplash licence).
  - Hanken Grotesk is bundled with the same weights.
- **Motion** follows each screen's ✦ caption in the mockups and the motion language in section 3.
- **Acceptance.** Every screen is checked **side by side** against its reference image, using the same seed data. Layout, spacing, copy, colours and imagery must match. The only allowed differences are:
  - the real Android status bar;
  - native font anti-aliasing;
  - the frame at which a live animation was captured.
- **No additions and no omissions** without the client's approval.

| # | Screen | Reference image |
|---|---|---|
| 01 | Splash | `design/approved/01-splash.png` |
| 02 | Welcome + role | `design/approved/02-welcome-role.png` |
| 03 | Sign up | `design/approved/03-sign-up.png` |
| 04 | What are you building? (3D) | `design/approved/04-building-type.png` |
| 04b | Building chosen | `design/approved/04b-building-chosen.png` |
| 05 | Stage (3D + picker) | `design/approved/05-stage.png` |
| 06 | Building your project… | `design/approved/06-building-your-project.png` |
| 08 | Home | `design/approved/08-home.png` |
| 09 | Pulse opening | `design/approved/09-pulse-opening.png` |
| 09a | Pulse · Ask | `design/approved/09a-ask.png` |
| 09b | Pulse · Thinking | `design/approved/09b-thinking.png` |
| 09c | Pulse · Answer | `design/approved/09c-answer.png` |
| 09d | Pulse · Flagged to a human | `design/approved/09d-flagged.png` |
| 10 | Request a quote | `design/approved/10-request-quote.png` |
| 10b | Request sent | `design/approved/10b-sent.png` |
| 11 | Experts | `design/approved/11-experts.png` |
| 12 | Expert profile → book | `design/approved/12-expert-profile.png` |
| 13 | Quotes · best match | `design/approved/13-quotes.png` |
| 14a | Pick a time | `design/approved/14a-pick-time.png` |
| 14b | Payment sheet | `design/approved/14b-payment.png` |
| 14c | Booked | `design/approved/14c-booked.png` |
| 15 | Job tracking | `design/approved/15-job-tracking.png` |
| 15b | Report ready | `design/approved/15b-report.png` |
| 16 | Review | `design/approved/16-review.png` |
| 17 | Project · Milestones | `design/approved/17-project-milestones.png` |
| 17b | Project · Budget | `design/approved/17b-budget.png` |
| 17c | Project · Site | `design/approved/17c-site.png` |
| 18 | Inbox | `design/approved/18-inbox.png` |
| 18b | Chat | `design/approved/18b-chat.png` |
| 19 | Updates | `design/approved/19-updates.png` |
| 20 | Profile | `design/approved/20-profile.png` |
| E1 | Expert · What do you do? | `design/approved/E1-role.png` |
| E2 | Expert · Your profile | `design/approved/E2-profile-setup.png` |
| E3 | Expert · Verified | `design/approved/E3-verified.png` |
| E4 | Expert · Dashboard | `design/approved/E4-dashboard.png` |
| E5 | Expert · Send quote | `design/approved/E5-send-quote.png` |
| E6 | Expert · Availability | `design/approved/E6-availability.png` |
| E7 | Expert · Deliverables | `design/approved/E7-deliverables.png` |
| E8 | Expert · Earnings | `design/approved/E8-earnings.png` |
| — | 3D building set (Villa, Shop, Tower, Factory, Renovation) | `design/approved/3d-building-set.png` |

## 1. Intent

Project Pulse is a construction project-management consultancy based in Abu Dhabi. The app is a two-sided marketplace:
- **Clients** (villa and shop owners, developers, factory owners) book vetted engineers for one-time tasks.
- **Engineers** take on paid part-time work.

The Pulse AI guide answers questions from Project Pulse's verified knowledge base.

The **demo** must show the client's #1 requested flow: pick a stage → ask Pulse → get an answer and a recommended engineer type → request a quote. It must also let reviewers tap through every other screen on both the Client and Engineer sides.

**Success:**
- A reviewer installs the APK and moves through every screen without dead ends.
- The app feels premium: Apple-grade polish, minimal taps, no tiring forms, smooth motion.

## 2. Scope decisions (agreed)

| Topic | Decision |
|---|---|
| Stack | Expo (latest SDK) + Expo Router, Reanimated 4, Gesture Handler, Skia (orb), react-three-fiber + expo-gl (3D), expo-blur, expo-haptics, Zustand with on-device persistence |
| Data | Mock data only, on the device. Works fully offline. No backend. |
| AI guide | **Scripted but smart.** A local knowledge base of about 15–20 Q&As, matched by keyword and stage. Answers stream in with a typing effect and cite a source. Every answer recommends an engineer type and links to Request a quote. Structural, legal and safety questions get a fixed "flagged to our team" reply. No API key in the APK. |
| Roles | One app. The role is chosen on Welcome. The Engineer side is fully built. |
| Out of scope | Web admin panel, Odoo integration, real payments, real push notifications (simulated in-app) |
| APK build | EAS Build (cloud) → `.apk`. Needs an Expo login. |

## 3. Visual language (agreed)

- **Theme: "Luminous Light."**
  - Background `#F7F8FC`, with a soft animated aurora of cyan `#31D1FF`, Pulse Blue `#0000FE` and a violet tint drifting at the top.
  - Frosted-glass cards.
- **Brand colours:** Deep Navy `#16205A` for type, Pulse Blue `#0000FE` as the single primary colour, Cyan `#31D1FF` for accents, Light Grey `#EAEAEA`, White.
- **One primary button style everywhere:** solid Pulse Blue with a soft blue glow. Secondary actions are glass or text. Never mix navy and blue buttons.
- **Type:** Hanken Grotesk. Large, tight-tracked headings (-0.035em). Small uppercase eyebrows such as "1 OF 2".
- **The orb:** see motion language v2 below (a fluid iridescent blob). It lives in the **Ask Pulse bar** on Home and expands into the Pulse screens as a shared element. The tab bar holds only plain line-icon items.
- **AI screens are plain white**, with no coloured screen borders or edge glow.
- **No emoji or icon-in-a-box UI.** Use custom line art or real 3D instead.
- **Motion:** spring and soft easing (`cubic-bezier(.22,1,.36,1)`) everywhere, with haptic ticks on selections and snaps, at 60fps on the UI thread.

### Motion language v2 (from the client's reference video, adapted to the brand palette)
- **Fluid iridescent blob orb.** This supersedes the glossy sphere. It is a conic blue/cyan/violet gradient with morphing blob edges, blurred, with a white inner glow and an outer halo. It uses a Skia shader in the app. The mini version appears in the Ask bar, the stage track, and the "Matched by Pulse" lines.
- **Thinking.** While Pulse works, the orb keeps the **same slow, soft movement** as on the Ask screen (no fast swirl, no hard ring). A thin line drops down to a small counter ticking through the knowledge base (for example "1,240 guides"). A soft blurred ring is used only on the "Sent" confirmation.
- **Orb → answer card.** The orb rises and morphs into the result card, which has a soft iridescent glow at the top.
- **Shimmer text.** A gradient sweeps through key words: the name, the next step, the match badge, and the topic.
- **Iridescent animated border.** A rotating conic border with a soft glow marks the single most important element on a screen (the Ask bar, the top-match expert).
- **Not used:** the particle-dissolve effect from the reference. The client rejected it. Tapping an option just presses it and highlights it, and the orb moves into its thinking state.
- **Pulse opening screen (approved).** A white screen with the large blob, "What would you like help with, [name]?", three stage-tailored suggestion cards, and "or just ask. Type, or hold the mic to speak".
- **Orb scope rule.** The animated orb and blob appear **only on Pulse (AI) moments**: the Ask bar, Pulse screens, the Pulse summary and match hints. Everywhere else uses the **static brand gradient** (cyan → #0000FE → violet), for example gradient photo rings, gradient stars and gradient icon tiles.
- **Density rule.** Balanced: 20px side margins and an 8/12/16 rhythm. Nothing crammed, and no single oversized cards. Pinned bottom actions never overlap content.

## 4. Approved screens: Batch 1 (Start + client onboarding)

The flow takes 4 taps from launch to Home and has no text forms.

1. **Splash.** The logo's two pieces slide in and lock together, the aurora fades up, then the app fades into Welcome.
2. **Welcome + role (merged).**
   - A breathing orb with floating glass chips.
   - Headline: "Ask. Get matched. Build with confidence."
   - Two buttons: **I need an expert** (primary) and **I'm an expert** (glass). "Sign in" sits in the header.
3. **Sign up.**
   - Email and password only. The Android saved-account suggestion fills both in one tap, and the name is taken from the account.
   - The button morphs into a spinner, then a tick, then moves on.
4. **What are you building?**
   - Frameless, real-time **3D model** floating on the page, with a swipeable set: Villa, Shop, Tower, Factory, Renovation.
   - Each model assembles part by part with a springy rise, turns slowly, and can be dragged to spin with momentum.
   - Shows the name, a one-line subtitle and page dots. **Continue** moves on.
   - 4b (chosen): a tick pops, the model grows to hero size and the interior lights warm up. The model then carries over to screen 5 as a shared element.
5. **Where is your [building] today?**
   - The same model floats above an **iOS-style horizontal picker** of stage names: Planning, Design, Tender, Contractor, Construction, Handover.
   - The selected stage sits centred in large bold type, in a fixed-width slot, with a one-line description.
   - The model reflects the stage:
     - Planning: a survey plot with stakes.
     - Design, Tender and Contractor: a blueprint wireframe hologram.
     - Construction: level 1 built, with scaffolding and a tower crane.
     - Handover: complete, with the interior lights on.
   - **Continue** moves on.
6. **Building your project…** (about 2.5 seconds) — the orb moves while a checklist ticks in, then shrinks into the Ask Pulse bar on Home.

The old "Describe your need" form is removed. On first arrival at Home, Pulse asks what the client needs in conversation.

### 3D building set (approved)

These are procedural three.js models in `design/3d/models.js`, to be ported to react-three-fiber:
- They use physically based materials (concrete, travertine, refracting glass, timber, metal, water), sun and fill lights with soft shadows, ACES tone mapping and a contact shadow.
- **No trees or vegetation.** Lawns and hedges are fine.

| Model | Description |
|---|---|
| **Villa** | Cantilevered upper floor, travertine cladding, timber louvres, a furnished lit interior, a glass-balustrade terrace, a rooftop pergola, a pool with loungers and an umbrella, a driveway and boundary walls |
| **Shop** | Flagship store: a white monolithic frame with a deep cantilevered roof, double-height glazing, a mezzanine and lit shelving, a champagne fin screen, a blue light line and entrance, a forecourt, parking and cars |
| **Tower** | A twisting glass tower with white slab edges and metal fins, a navy crown and spire, a glass podium and a water feature |
| **Factory** | A ribbed-cladding logistics hall with a navy band and clerestory, a rooftop solar array, three loading docks, a two-storey glass office with a blue band, silos, a truck, staff cars and a fence |
| **Renovation** | Half original (sand render, arched windows, crenellated parapet) and half renewed (white concrete, full glazing, louvres), with plank scaffolding on the seam, a skip, pallets and a site fence |

Approved mockups: `design/mockups/batch1-welcome-signup.html` (screens 1–3) and `design/mockups/batch1-approved.html` (screens 4–5 and the 3D set).

## 5. Approved screens: Batch 2 (Client core)

Tab bar (client): Home · Project · Experts · Inbox, using line icons. Pulse is reached from the Ask bar.

8. **Home (Option A, "Project first").**
   - Greeting with a shimmering name.
   - A glass project card with the **3D villa breaking out of the top of the card**, and the project name.
   - A **stage track**: completed stops are blue dots, the current stage is a mini blob with a pulsing halo and a label, and future stops are hollow.
   - A tinted **Next step** row ("Choose a contractor", with **Start**).
   - The **Ask Pulse** bar with the blob, a rotating iridescent border and a mic.
   - A **Needs you** list: Quotes ready (count) and Site visit.
   - Suggestion chips live inside the Pulse screen, not on Home.
11. **Experts (Option B, photo grid).**
   - Title with a search icon, and "Matched by Pulse to your [stage]" with a mini blob.
   - Category chips with a sliding highlight.
   - A two-column grid of portrait tiles, each with a **Pulse match %** badge, name, verified tick, role, rating and price.
   - The top match gets the animated iridescent border and a shimmering badge.
   - Tapping a tile expands it into the profile (shared element).
12. **Expert profile → book directly.**
   - Full-bleed portrait fading into the page, name, one credential line and the verified mark.
   - **Choose a service** (radio cards with prices).
   - Pinned **Book · AED X** button. There's no quote round-trip for fixed-price services.
13. **Quotes.**
   - "Your best match": one recommendation card with a photo, large price and the Pulse reason ("12% below average price").
   - Pinned **Accept & book**.
   - The other quotes sit on one quiet line ("2 more · from AED 2,450 · Compare").
14. **Booking.**
   - **14a:** a day strip and time slots from the engineer's calendar, with unavailable options dimmed.
   - **14b:** a payment bottom sheet with the saved card, total including 5% VAT, Pay, and Google Pay. Funds are "held until job sign-off" (mock).
   - **14c:** "You're booked", with a gradient ring and tick, and **Track this job**.

Flows:
- Browse → Profile → Book → time → pay: 4 taps.
- Home "Quotes ready" → Accept → time → pay.

Approved mockups: `design/mockups/batch2-home-experts-approved.html` and `design/mockups/batch2-profile-quotes-booking.html`.

## 6. Batch 3a: Pulse AI guide (approved)

All Pulse screens use a **plain white** background with the **soft, slow-moving blurred orb** (the same orb and pace everywhere). There are no chat bubbles on the thinking screen, no coloured screen borders, and no heavy dark blocks.

- **9a. Ask.**
  - Header: back, "Pulse", and a quiet stage pill ("Design stage ▾"), pre-selected from the project.
  - Centre: the soft orb, "What would you like to know?" and "Answers from Project Pulse experts".
  - Bottom: the input with a send button.
- **9b. Thinking** (reference-video style).
  - The **same slow soft orb** as 9a, not a fast swirl or a ring.
  - The question in light grey, with the key words shimmering, and "Finding your answer…".
  - A thin line down to a small counter ticking through the guides (about 2 seconds).
  - The orb then rises and morphs into the answer card.
- **9c. Answer.**
  - The user bubble, a short plain-English answer streamed word by word, and a source tag ("◆ Project Pulse Villa Guide").
  - The recommendation card (iridescent border, glow top): "You'll need: Geotechnical engineer", 3 avatars, "14 verified · from AED 1,800", and **Request a quote**.
  - No follow-up chips.
- **10. Request a quote.**
  - The summary is "Written by Pulse" (editable).
  - Location comes from the project. When: ASAP / Within 2 weeks / Flexible. Sending to: 5 experts (avatars).
  - Pinned **Send request** button.
- **10b. Sent.**
  - The 5 expert avatars orbit the soft orb on a dashed ring, each ticking in turn.
  - "Sent to 5 experts", with "Quotes usually arrive within 24 hours".
  - A 3-step line (Sent → Quotes → You choose) and **Done**.
- **9d. Flagged to a human** (structural, legal and safety questions; enforced by app logic, not the model).
  - Light style: the question in grey quotes, and the soft calm orb holding a **real engineer's photo**.
  - "An engineer will answer this one", with one sentence naming the person ("Rashid from Project Pulse").
  - An email pill ("Reply by email · within 24h").
  - **Got it** as the primary action, with "Book a structural engineer instead" as secondary.
  - The question is emailed to the team with a reference.

Mockup: `design/mockups/batch3a-pulse-ai.html`.

## 7. Batch 3b: Job, Project record, Inbox, Profile (approved)

- **15. Job tracking.**
  - Title and project, then an expert card with a live "On site now" pulsing dot and a message button.
  - A 4-step vertical timeline (Booked & paid → Site visit → Report → Your sign-off), with a gradient fill.
  - A "Latest" update with site photos.
- **15b. Report ready.**
  - PDF file card (Open), plus a **Pulse summary** (3 bullets, mini blob).
  - Pinned **Approve & release payment**, with "Ask for changes" as secondary.
- **16. Review.**
  - A soft cyan-to-violet gradient wash at the top, fading to white. The expert photo sits in a static gradient ring. "How was Omar's bid review?"
  - Five gradient stars and a gradient "Excellent" label.
  - Selected "What stood out?" chips use a **gradient fill** with white text.
  - An optional note row, and a pinned **gradient Submit review** button (a gradient primary used only on this celebratory screen). No orb.
- **17. Project record.**
  - The live 3D model (at its stage) as the header, then tabs: Milestones · Budget · Site · Docs · Decisions.
  - **Milestones:** a date-block list marked Done / Next / Planned.
  - **Budget:** a conic ring ("68% committed", AED 1.63M of 2.4M) and category bars.
  - **Site:** a dated photo diary (hero photo plus grid).
  - Docs and Decisions use the same list pattern.
- **18. Inbox.**
  - Segmented control: Messages / Updates (count).
  - Conversations with experts and the "Project Pulse team" (human replies to flagged questions). Includes typing state and unread badges.
- **18b. Chat.** Header with a live status, in/out bubbles, inline photos, typing dots and a pinned input.
- **19. Updates (notifications).** Grouped into Today and Earlier (New quotes, Question answered, Payment held). The demo also shows in-app banners.
- **20. Profile.** Avatar, name and email; a settings list (My projects, Payments, Notifications, Language); and a **Switch to Expert app** card (gradient icon) for the demo role switch.

Mockup: `design/mockups/batch3b-job-project-inbox.html`.

## 8. Batch 4: Engineer side (approved)

Expert tab bar: **Home · Requests · Jobs · Earnings · Inbox**. The orb appears only on Pulse-assisted elements.

- **E1. What do you do?** A one-tap typographic list (Engineer / Architect / Interior designer / Contractor, each with a subtitle). The chosen word fills with the gradient and the screen auto-advances. It comes after "I'm an expert" → 2-field sign-up.
- **E2. Your profile.**
  - A gradient progress ring ("2/5 done · about 3 minutes") and a checklist: Licence (camera scan), Experience (slider), Services & prices (chips with suggested prices), Service areas (map/chips) and Portfolio (3+ photos).
  - Each row opens a small bottom sheet.
  - Pinned **Continue**, then **Submit for review**.
- **E3. Under review → Verified.**
  - A calm "Under review by Project Pulse" state first.
  - Then a celebration: a gradient shield badge that springs in, "You're verified", the service areas, and **Go to dashboard**. In the demo, approval is instant.
- **E4. Dashboard.**
  - Greeting and a gradient earnings card (this month, trend and sparkline).
  - **New requests** cards with a gradient **Quote** pill. Today's jobs below.
- **E5. Request → Send quote.**
  - A request summary "Written by Pulse".
  - Price stepper (− / + or type) with the Pulse typical range hint, and delivery chips (3 / 5 / 7 days).
  - Pinned **Send quote**.
- **E6. Availability.**
  - Master on/off toggle and the same day strip as the client.
  - Each slot is booked (navy, showing the client), open (gradient) or off (tap to open).
- **E7. Job & deliverables.**
  - Status tag, title, client and due date.
  - An uploaded file with a gradient progress bar, a dashed "Add file or photos" drop zone and a photo row.
  - Pinned **Mark as complete**, which triggers the client's 15b "Report ready".
- **E8. Earnings.**
  - Week / Month / Year segment, a big total, and weekly bars (current week in gradient).
  - "Ready to withdraw" with **Withdraw** (confirmation sheet), and a payout list.

Mockup: `design/mockups/batch4-engineer.html`.

## 9. Architecture

### 9.1 Project layout (Expo Router)
```
app/
  _layout.tsx               fonts, providers, theme, gesture root, splash control
  index.tsx                 route guard → onboarding or role home
  (onboarding)/             splash, welcome, sign-up, sign-in, building-type, stage, building
  (client)/(tabs)/          home, project, experts, inbox          ← tab bar
  (client)/                 pulse/[...], expert/[id], quotes/[requestId], book/[expertId] (time → pay → done),
                            job/[id], job/[id]/report, review/[jobId], profile
  (expert)/                 role, profile-setup, review-status, verified
  (expert)/(tabs)/          home, requests, jobs, earnings, inbox
  (expert)/                 request/[id], job/[id]
src/
  theme/                    tokens (colours, gradient stops, type scale, spacing 8/12/16/20, radii, easing)
  ui/                       Button, GlassCard, Chip, Segmented, TabBar, Avatar(ring), Stars, ProgressRing,
                            StageTrack, DayStrip, TimeSlots, BottomSheet, Shimmer, GradientText, IridescentBorder
  pulse/                    Orb (Skia), Pulse engine, knowledge base, safety classifier
  three/                    ModelView (r3f + expo-gl), models/{villa,shop,tower,factory,reno}.ts, stage variants
  data/                     seed data (users, experts, projects, requests, quotes, jobs, messages, notifications)
  store/                    Zustand stores, persisted with AsyncStorage
  motion/                   shared Reanimated presets (spring configs, stagger, count-up, shared transitions)
```
Each unit has one purpose. Screens compose `ui/` components and read from `store/`. `pulse/` and `three/` are self-contained and have no dependency on screens.

### 9.2 State & data (all on the device)
- **Stores:**
  - `session`: role, user, onboarding done.
  - `project`: type, stage, milestones, budget, site photos, docs, decisions.
  - `market`: experts, requests, quotes, bookings, jobs, reviews.
  - `inbox`: threads, messages, notifications.
  - `expert`: profile checklist, availability, earnings, payouts.
- **Seed data** is loaded on first run from `data/`. It includes the demo client Sara (villa, Al Reem, Tender), 6 experts (Omar, Lina, Rashid, Maya, Karim, plus 1 geotech), 2 pending quotes, one active job, messages and notifications.
- **Persistence:** everything is saved with AsyncStorage, so actions such as booking, quoting and reviewing stay after a restart. A hidden **"Reset demo"** option in Profile (long-press the version label) restores the seed data.
- **Simulated time:** actions that would normally take hours complete after a short delay, so the demo always flows. Examples: quotes arrive about 8 seconds after "Send request", approval is instant, and the report appears after "Mark as complete". Each one also posts an in-app notification banner.
- **Cross-role link:** the client's request appears in the expert's Requests, the expert's quote appears in the client's Quotes, and "Mark as complete" produces the client's "Report ready". This shows both halves of the marketplace working together, which is the client's stated demo goal.

### 9.3 Pulse engine (scripted, on-device)
- **Knowledge base:** `pulse/kb.ts` holds about 20 entries. Each entry is `{ id, stages[], projectTypes[], keywords[], answer, source, recommend: { expertType, count, fromPrice }, followUp? }`. The content is written in Project Pulse's voice and never invents fees or durations beyond what is in the entry.
- **Matching:** normalise the question, then score entries on keyword hits, a stage match bonus and a project-type bonus. The best entry above a threshold wins. Below the threshold there's a graceful fallback: "I don't have a verified answer for that yet. Here's the right expert to ask", followed by the expert types for the current stage.
- **Safety gate (runs before matching; code, not a prompt):** `pulse/safety.ts` checks a keyword and pattern list for structural (remove/cut wall, column, beam, load-bearing, crack…), legal (contract dispute, lawsuit, permit violation…) and safety (collapse, fire, electrical hazard, gas…) topics. A match always routes to **9d Flagged**, stores a flagged item (ref `PP-####`) and creates the "Question answered" follow-up notification later. This rule is enforced in the app, as the client required.
- **Presentation:** a thinking state of about 1.8 seconds (counter tick), then word-by-word streaming, then the source tag, then the recommendation card, which deep-links to 10 Request a quote with the summary pre-filled.

### 9.4 3D
- **Rendering:** `three/ModelView` renders the approved procedural models (ported from `design/3d/models.js`) with `@react-three/fiber/native` + `expo-gl`. It provides a turntable, drag-to-spin with momentum, the part-by-part "rise" animation, stage variants (survey, wireframe, construction and complete) and the interior light level.
- **Where it's used:** onboarding 4 and 5, Home (breaking out of the card), and the Project header.
- **Performance budget:** at most one live GL view per screen. Shadows and the wireframe are cached, and rendering pauses when the view is off-screen.
- **Fallback:** if GL is unavailable on a device, a pre-rendered PNG of the same model is shown.

### 9.5 Motion & effects
- **Reanimated 4:** springs, layout transitions and shared-element transitions (Home orb → Pulse, expert tile → profile). Count-up numbers and shimmer run as UI-thread worklets.
- **Skia:** the blob orb (animated shader), gradient text and borders, and conic progress rings.
- **Blur and haptics:** `expo-blur` for glass; `expo-haptics` for selection ticks, success and soft taps.
- **Accessibility:** "Reduce Motion" is respected. When it's on, looping animations stop and transitions become fades.

### 9.6 Error handling (demo scope)
- There is no network dependency, so no network errors.
- Forms are minimal and always pre-filled or tap-only. The primary button is disabled until a choice is made, where relevant.
- Unknown Pulse questions use the fallback above.
- An ErrorBoundary per route group shows a friendly "Something went wrong · Go home" screen instead of crashing.

## 10. Testing & verification
- **Unit tests (Jest):**
  - Pulse matcher: stage and keyword ranking, threshold and fallback.
  - Safety gate: all flagged categories, plus negatives such as "Can I paint a wall?".
  - Store reducers: booking, quote, job lifecycle and the cross-role link.
- **Component tests (React Native Testing Library):** key flows render and navigate. These are onboarding → Home, Ask → Answer → Request → Sent, Quotes → Book → Pay → Booked, and the expert Request → Send quote.
- **Fidelity check (acceptance gate):** for each of the 39 screens, take a device or emulator screenshot on the seed data state and compare it side by side with `design/approved/<screen>.png` (section 0). A screen is not done until it matches.
- **Manual device pass on a physical Android phone:** every screen in sections 4–8 is reachable, with no dead ends, a smooth 60fps feel and working haptics.

## 11. Delivery
- `app.json`:
  - Name "Project Pulse", package `com.projectpulse.demo`.
  - Icon and adaptive icon from the logo mark on Pulse Blue.
  - Splash in white with the mark.
- **EAS Build** with a `preview` profile (`android.buildType: "apk"`) → a shareable `.apk` download link. This needs the user's Expo account login (`eas login`).
- **Development:** use **Expo Go** on the phone for fast iteration. Expo Go bundles Reanimated, Gesture Handler, Skia, expo-gl, expo-blur and expo-haptics, and every library chosen here must be Expo-Go-compatible. This is verified against the installed SDK at the start of implementation. If any library turns out to need native code outside Expo Go, switch to an EAS development build for that step only.

## Batch 5 — First impression refinements (approved 2026-09-30, after device review)
Source: `design/mockups/batch5-first-impression.html` (+ `.png`).
- **Welcome = A2 "Cinematic photo"** (client switched from A1 to A2, "exact same feel with same image"; replaces approved 02 Welcome + 03 role): full-bleed villa photo fading into the light background with a slow Ken Burns push-in, logo + "Sign in" glass pill, frosted Pulse card (question "Can I add a floor to my villa?", round orb answer "Likely yes. A structural check comes first…", engineer row Omar H. · AED 2,200), "Your project, in expert hands.", sub-line, Pulse Blue "Get started", trust ticks (Verified experts · Secure pay · Abu Dhabi). Role screen "What brings you to Pulse?" with two large photo cards (Client · I'm building / Expert · I'm an engineer). ✦ captions as on the mockup.
- **Home stage track = B1 "Segmented bar + stage pill"** (replaces the dot stepper in the 08 villa card): "Tender" pill with a small round orb, "Stage 4 of 6" opposite, six even segments (done = Pulse Blue, current part-filled cyan with a periodic light sweep, future grey), labels Brief · Next: Build · Handover. ✦ caption as on the mockup.
- **Orb shape:** client requires the animated orb to be a perfect circle everywhere (supersedes the irregular blob silhouette); colours and slow motion unchanged.

- **Start flow = A3 "Pulse greets you" (client Task 1, supersedes A2):** Splash → A3 → Sign up. A3: logo + "Sign in" top right; large perfectly round iridescent orb with slow orbit rings and a travelling light point; Pulse message bubble "Hi, I'm Pulse." / "Your construction expert for Abu Dhabi. Are you planning a project, or are you an engineer?"; reply bubbles blue "I'm planning a project →" and glass "I'm an engineer"; trust line (1,200+ verified engineers · Abu Dhabi). ✦ Orb blooms from the splash logo then breathes with colours rotating inside a crisp circle; greeting types letter by letter; replies appear like iMessage suggestions (calm, per the motion rule — no pop); the tapped reply flies up into the conversation, then on to Sign up. The A2 photo welcome and photo-card role screen leave the flow.

- **Sealed demo login (client Task 2, supersedes 03 "Create your account" and the Profile "switch to Expert mode"):** a real Sign in screen, content top-aligned (title "Welcome back" / "Sign in to Project Pulse", email + password fields, Pulse Blue "Sign in", "Forgot password?" inert link), plus a "Demo accounts" card with two tappable rows that fill the fields: Client · Sara Al Mansoori · sara@projectpulse.ae and Engineer · Omar Haddad · omar@projectpulse.ae (password `pulse2026`, shown). Credentials decide the portal: the client account opens only the client app, the engineer account only the engineer portal; there is no in-app switch between portals. Wrong credentials: calm error text + field shake (no bounce). After sign-in the history is replaced — back never returns to login/onboarding. Both portals have a Log out action (client Profile; engineer profile/menu) with a confirm sheet → Sign in. The A3 reply choice pre-selects the matching demo account on Sign in.
- **Fresh demo every run (client request, 2026-10-01):** nothing is saved between launches — every cold start begins at "Hi, I'm Pulse" → Sign in → client: "What are you building?" → stage → building your project → Home (engineer: E1–E3 → Dashboard). Log out also restarts the first-run setup, so every sign-in shows the demo from the top. Within one run, the demo data (requests, quotes, bookings, chats) carries through as the story progresses.
