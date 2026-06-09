# NEEL.OS — FINAL QA MASTER PROMPT
## Complete behavioural verification and expected experience spec

You are doing a full QA pass on NEEL.OS.
Build is confirmed: ✓ compiled, 0 type errors, 161kb first load JS.

Your job is to verify that every interaction, transition, state, and visual
behaves EXACTLY as specified. This document defines the ground truth.
If something does not match, fix it. Do not accept approximations.

Read this entire document before touching a single file.

---

## HOW TO READ THIS DOCUMENT

Each section is structured as:

  TRIGGER → EXPECTED BEHAVIOUR → PASS CONDITION

If the actual behaviour matches the expected behaviour exactly: PASS.
If it deviates in any way: FAIL — fix before moving on.

Work through every section in order. Do not skip.
Do not mark a section PASS until you have manually verified it.

---

## SECTION 00 — FIRST VISIT BOOT FLOW

### 00.A — localStorage state on first visit
TRIGGER: User visits site for the first time (no localStorage key 'neel_os_session').
EXPECTED:
  - Session object created with count: 1
  - soundEnabled: false
  - motionProfile: 'full' (unless prefers-reduced-motion is set)
  - mode: 'visitor'
  - lastPath: '/neel'
  - commandHistory: []
PASS CONDITION: localStorage['neel_os_session'] exists and matches above after boot completes.

### 00.B — Boot sequence timing
TRIGGER: First visit — boot sequence renders.
EXPECTED:
  - Background: #0A0A0A throughout entire boot
  - Font: JetBrains Mono throughout
  - Timestamps in left column are REAL performance.now() values
    (not hardcoded, not approximate — actual measured values)
  - Each boot line appears sequentially, not all at once
  - Line stagger: ~80-120ms between each line
  - Text color: #F5F0E8 on #0A0A0A
  - [OK] tags appear in #4AFF91
  - No other colors present during boot
PASS CONDITION:
  Open devtools. Check performance.now() at page load.
  Verify timestamps in boot sequence are within 200ms of actual measured values.

### 00.C — Sound gate placement
TRIGGER: Boot sequence reaches final line "Booting interface.... [OK]"
EXPECTED:
  - After 800ms pause, still on #0A0A0A
  - Sound gate appears IN PLACE — same black screen, same font
  - NO color change. NO transition. Continuous black.
  - Text:
      enable system audio?

      [y]  [n]
  - Centered. JetBrains Mono. Small (13px).
  - Nothing else on screen.
FAIL CONDITION:
  ANY color change between boot end and sound gate.
  Sound gate on a different background.
  Sound gate appearing before boot completes.

### 00.D — Sound gate interaction
TRIGGER: User clicks [y] or [n]
EXPECTED [y]:
  - Selected option gets #4AFF91 dot: [y ●]
  - Tone.context.resume() called (requires this user gesture)
  - soundEnabled set to true in session
  - 300ms pause
  - HARD CUT to hero — instantaneous, not a fade
EXPECTED [n]:
  - Selected option gets #4AFF91 dot: [n ●]
  - soundEnabled remains false
  - 300ms pause
  - HARD CUT to hero — instantaneous, not a fade
PASS CONDITION:
  The transition to hero is a cut. document.body style changes from
  background #0A0A0A to #F5F0E8 in a single frame. No opacity animation.
  No CSS transition. A cut.

---

## SECTION 01 — RETURN VISIT FLOW

### 01.A — Return visit detection
TRIGGER: User visits with existing localStorage session (count ≥ 1)
EXPECTED:
  - Boot sequence does NOT run
  - Sound gate does NOT run
  - Hero loads directly
  - Small text appears bottom-left of hero, JetBrains Mono XS, opacity 0.4:
      "Session {n}."
  - If lastPath is not '/neel': show resume prompt:
      "Welcome back. Resume /neel/projects/neurofin? [yes] [start fresh]"
PASS CONDITION:
  Set localStorage manually with count: 2. Reload.
  Boot should not appear. Hero should be first thing visible.
  Session count should display correctly.

### 01.B — Resume session
TRIGGER: User clicks [yes] on resume prompt
EXPECTED:
  - Lenis.scrollTo(lastPath target) called
  - Path indicator updates to lastPath
  - System health route updates
TRIGGER: User clicks [start fresh]
EXPECTED:
  - lastPath resets to '/neel'
  - No scroll. User stays at hero.

---

## SECTION 02 — HERO

### 02.A — Background and typography
TRIGGER: Hero section visible
EXPECTED:
  - Background: #F5F0E8 warm off-white
  - "NEEL" on first line, "KACHHADIA" on second line
  - Font: Editorial New, variable weight
  - Weight animation: sine wave 300↔800, 4s period, ALWAYS RUNNING
    — not triggered by scroll, not triggered by hover, constant
  - Three words below name: "Building systems. Shipping fast. Mumbai."
  - Font for three words: Söhne, small, no animation
PASS CONDITION:
  Open devtools. Inspect hero name element.
  Verify font-variation-settings animating continuously.
  Verify weight oscillates between 300 and 800 over ~4 seconds.
  Verify it does NOT stop when user scrolls away and returns.

### 02.B — ONLINE indicator
TRIGGER: Hero visible
EXPECTED:
  - Top-right position, fixed
  - Text: "ONLINE ●"
  - Font: JetBrains Mono 11px
  - Color: #4AFF91
  - Blink interval: 1.2 seconds (dot blinks, text stays)
  - ONLY visible on hero section (or always visible — spec either way, but consistent)
PASS CONDITION: Blink interval is 1.2s. Not 1.0s. Not 0.8s. 1.2s.

### 02.C — WebGL fluid
TRIGGER: Hero loads
EXPECTED:
  - GLSL fragment shader running on Three.js full-screen quad
  - Fluid is alive BEFORE user moves mouse (ambient motion via u_time)
  - Mouse movement pushes fluid — fast movement = stronger push
  - Mouse stop = fluid diffuses slowly back to rest
  - Color: warm dark ink on #F5F0E8 background
  - Fluid layer is BENEATH letter layer (z-order correct)
  - 60fps — check in devtools Performance tab
PASS CONDITION:
  Move mouse rapidly across hero. Fluid responds with proportional force.
  Stop mouse. Fluid diffuses over 2-3 seconds. Not instant. Gradual.

### 02.D — Letter physics
TRIGGER: Hero first loads (first visit, full motion mode)
EXPECTED:
  - Each letter of "NEEL" and "KACHHADIA" is a separate rigid body
  - Letters fall from above viewport with gravity
  - Slight random rotation and x-offset per letter (no two loads identical)
  - Letters stack/settle on invisible floor
  - Settle with damping — they do not bounce wildly
  - After settle: subtle continuous breathing oscillation
  - Mouse applies radial force — fast mouse = letters scatter
PASS CONDITION:
  Hard reload 3 times. Letter initial positions should differ each time.
  Move mouse fast over settled letters. They should scatter then resettle.

### 02.E — Path indicator
TRIGGER: Hero visible
EXPECTED:
  - Bottom-left, fixed
  - Text: "root@neel:~$"
  - Font: JetBrains Mono XS (11px)
  - Opacity: 0.4 on off-white sections, 0.6 on dark sections
PASS CONDITION: Visible. Correct path. Updates when navigating.

### 02.F — System health monitor
TRIGGER: Always (all sections)
EXPECTED:
  - Bottom-right, fixed
  - Font: JetBrains Mono 9px
  - Content:
      SYSTEM HEALTH
      render     stable
      fps        {real value}
      audio      {muted|enabled}
      motion     {full|reduced|static}
      session    {n}
  - fps value: real rAF delta calculation, updates every second
  - audio: reflects Tone.context.state accurately
  - motion: reflects current motionProfile state
PASS CONDITION:
  Enable audio via sound gate. Verify "audio" line changes to "enabled".
  Switch motion to "reduced". Verify "motion" line changes.
  fps should show approximately 60 on a capable device.

---

## SECTION 03 — MANIFESTO

### 03.A — Line arrival
TRIGGER: User scrolls into manifesto section
EXPECTED:
  - Lines arrive via opacity 0→1 ONLY
  - NO translateY. NO scale. NO slide. ONLY opacity.
  - Each line pair is its own scroll beat with pause between
  - Sequence:
      Beat 1: "I don't prototype." + "I deploy."
      pause
      Beat 2: "I don't describe intelligence." + "I build it."
      pause
      Beat 3: "Most people my age are learning." + "I am shipping."
  - After Beat 3: manifesto section ends. No more lines.
PASS CONDITION:
  Scroll slowly through manifesto. Verify no translateY at all.
  Open devtools. Inspect elements during animation.
  transform should be none or matrix(1,0,0,1,0,0). Never translateY.

### 03.B — UNREASONABLE screen
TRIGGER: User scrolls past manifesto final line
EXPECTED:
  - Entirely separate full-viewport screen
  - Background: #F5F0E8 (same as manifesto — continuous)
  - Content: ONLY the word "UNREASONABLE"
  - Nothing else. No subtext. No punctuation. No label.
  - Font: Editorial New, weight 800
  - Color: #C8F027 lime
  - Size: fills viewport width with 80px margin each side
  - Arrival: scales from 0.94 to 1.00 (NOT fade, NOT slide — scale only)
  - Scale transition: ease-out, 0.6s
PASS CONDITION:
  This is the FIRST use of #C8F027 in the entire site.
  Verify by searching codebase: grep -r "C8F027" — should appear in
  exactly 2 places: Unreasonable.tsx and Transmission.tsx.
  If it appears anywhere else: FAIL.

---

## SECTION 04 — LIVE COUNTER

### 04.A — Display
TRIGGER: Counter section visible
EXPECTED:
  Content:
    /neel/projects/neurofin  ·  runtime statistics

    transactions processed
    ──────────────────────────────────────────────
    {number with comma formatting}

    last transaction  {m}:{ss} ago
    uptime            {n}d {n}h {n}m
  - Font: JetBrains Mono throughout
  - Number: large (not hero-large — intermediate size)

### 04.B — Counter behaviour
EXPECTED:
  - Increments by 1-3 every 4-8 seconds
  - Increment timing is IRREGULAR — not a fixed interval
  - "last transaction" resets to 0:00 on each increment
  - "last transaction" counts up between increments
  - Uptime counts continuously from page load
PASS CONDITION:
  Watch for 30 seconds. Verify at least 3-5 increments.
  Verify increments are NOT at regular intervals (not every 5s exactly).
  Verify "last transaction" resets on each increment.

---

## SECTION 05 — THE TEAR

### 05.A — Velocity threshold
TRIGGER: User scrolls at hero → manifesto boundary
EXPECTED:
  - Slow scroll (< 30px/frame): fluid remains normal
  - Medium scroll (30-40px/frame): fluid visibly thickens (viscosity increases)
  - Fast scroll (> 40px/frame): tear initiates
PASS CONDITION:
  Scroll slowly through hero. No tear.
  Scroll at medium speed. Fluid should feel "heavier."
  Flick scroll (fast). Tear should initiate.

### 05.B — Tear animation
EXPECTED:
  - GLSL Voronoi crack originates from approximately (60% from left, 45% from top)
    — NOT centered, intentionally asymmetric
  - Crack propagates: 0.4 seconds
  - Surface reveals: 0.6 seconds
  - Total: exactly 1.0 second
  - Beneath: NeuroFin amber world (#B45309) already running
  - Sound (if enabled): 40Hz sine, 1.2s, fast attack, slow decay
PASS CONDITION:
  Time the tear animation with devtools Performance recording.
  Should be 1.0s ± 0.05s.
  Crack origin should NOT be at 50%/50% — verify asymmetry visually.

### 05.C — Pre-tear anticipation
EXPECTED:
  0.2 seconds BEFORE threshold is reached:
  - Fluid moves faster and tighter
  - Visual "tension" before break
PASS CONDITION: Subtle but present. The fluid should "know" before it tears.

---

## SECTION 06 — PROJECT WORLDS

### 06.A — Project execution sequence
TRIGGER: User reaches project section OR types "run neurofin"
EXPECTED:
  Terminal output appears line by line:
    root@neel:/projects$ run neurofin --case-study
    [INIT] Loading problem statement.............. [OK]
    [INIT] Mounting market data pipeline.......... [OK]
    ... (all lines per CONTENT.md)
    Opening case study...
  - Each line: 150-200ms stagger
  - [OK] in #4AFF91
  - After final line: project shader world activates (0.8s fade-in)
PASS CONDITION: All lines from CONTENT.md present. Correct order. [OK] is green.

### 06.B — NeuroFin shader (THE RESOLVE)
EXPECTED:
  - Starts: high-frequency amber noise fills screen
  - Resolve front descends top-to-bottom over 3.0 seconds
  - Above front: smooth breathing amber (#B45309)
  - Below front: granular noise (#924000 copper-dark)
  - Copper trace line: 2px, lingers 1.0s after front exits bottom, then fades
  - Text: arrives ONLY after u_front = 1.0 (shader fully resolved)
  - Loops: after 8s pause, resets and resolves again
  - 60fps throughout
PASS CONDITION:
  Text must NOT appear until the resolve front has exited the bottom.
  If text appears during the resolve: FAIL.

### 06.C — Equity Research shader (THE THESIS)
EXPECTED:
  - Starts: multiple overlapping waveforms in cold blue (#1E3A5F)
  - Cold white front moves left-to-right over 4.0 seconds
  - Individual waveforms snap at DIFFERENT times (NOT simultaneous)
  - Last waveform (visually thickest) snaps LAST
  - Result: single clean signal in #94A3B8 steel
  - Sound (if enabled): faint click per waveform snap, clear tone on final
  - 60fps throughout
PASS CONDITION:
  Watch resolution carefully. At least 3 distinct snap moments visible.
  Not all waveforms resolving together.

### 06.D — Market Terminal shader (THE TERMINAL)
EXPECTED:
  - Three layers at different scroll speeds (never stops)
  - Layer 0 (DuckDB): near-static, dense horizontal lines, opacity 0.4
  - Layer 1 (Options): medium pulse speed, opacity 0.65
  - Layer 2 (Redis ticks): fast horizontal dashes, opacity 0.9
  - Alert: horizontal line brightens at y = 38.2% every ~5 seconds
  - Alert duration: 0.1 seconds
  - Build manifest visible in corner (see CONTENT.md for exact items)
  - Incomplete items (◌) present — not hidden
  - Terminal NEVER STOPS — even when off-screen, uniform time continues
PASS CONDITION:
  Watch for 10 seconds. Verify alert fires at least twice at 38.2% position.
  Verify terminal is still running when user scrolls back to it.

### 06.E — Decrypt mechanic on project titles
EXPECTED:
  - Project title starts as random ASCII chars cycling fast (200ms)
  - Then locks left-to-right over 600ms
  - Each char lock: soft mechanical click (if sound enabled)
  - Final char: definitive clack
  - Total: 800ms
PASS CONDITION:
  Trigger project section. Verify two-pass decrypt on title.
  Pass 1 visible (random chars). Pass 2 visible (left-to-right lock).
  No instant text appearance.

### 06.F — Git log per project
TRIGGER: User types "git log neurofin" OR git log button clicked
EXPECTED:
  All commits from CONTENT.md rendered in order.
  Format:
    commit {hash}  {message}
  Monospaced. Dark background. Scroll if many entries.
PASS CONDITION: All 7 NeuroFin commits present. Correct messages. Correct order.

---

## SECTION 07 — COMMAND SYSTEM

### 07.A — Command input availability
EXPECTED:
  - Focusable via '/' key OR CMD+K (Mac) / CTRL+K (Win)
  - Input appears with: "root@neel:~$ _" prompt
  - Cursor blinks in input
  - ESC closes input
  - Background: #0A0A0A panel, semi-transparent overlay
PASS CONDITION: Both '/' and CMD+K open command input from any section.

### 07.B — Core commands
Test each command. Expected outputs from CONTENT.md:

  help              → full command list renders (see CONTENT.md HELP OUTPUT)
  whoami            → identity.md renders
  ls                → /neel filesystem tree renders
  ls /projects      → projects list with status indicators
  cd projects       → navigates to projects section, path updates
  run neurofin      → execution sequence, then NeuroFin world
  run equity        → execution sequence, then Equity world
  run market        → execution sequence with WARN lines, then Terminal world
  cat identity.md   → identity.md content (see CONTENT.md)
  git log neurofin  → 7 commits render
  npm inspect three → package detail renders (see CONTENT.md)
  open github       → new tab: github.com/Neel-Kachhadia
  open linkedin     → new tab: linkedin.com/in/neelkachhadia
  debug on          → debug overlay appears
  debug off         → debug overlay disappears
  recruiter mode    → recruiter panel appears
  clear             → terminal output clears
  unknown command   → "command not found: [input]" + "type 'help'"

PASS CONDITION: All commands tested. All produce correct output.

### 07.C — sudo hire-neel
TRIGGER: User types "sudo hire-neel"
EXPECTED:
  Lines appear sequentially (300ms stagger):
    [sudo] password for visitor: ████████
    Checking permissions...
    ...
    Permission granted.
    Initiating transmission channel...
    ssh neel@transmission connected.
  After final line + 500ms: Lenis scrolls to transmission section.
PASS CONDITION:
  Full sequence renders. Scroll to transmission happens automatically.
  The password line shows ████████ (not real password, masked).

### 07.D — Command history
EXPECTED:
  - Arrow Up: recalls previous command
  - Arrow Down: moves forward in history
  - History persists in localStorage (max 50 entries)
  - Survives page reload
PASS CONDITION:
  Type 3 commands. Press Up. Should cycle through them in reverse order.
  Reload page. Open command input. Press Up. History should persist.

### 07.E — Filesystem sidebar
EXPECTED:
  - Always visible on desktop (position: fixed, left side)
  - Shows /neel directory tree with icons (see CONTENT.md FILESYSTEM TREE)
  - Active section has opacity 1.0 + #4AFF91 dot
  - Inactive sections: opacity 0.4
  - Click any item: navigates to that section
  - DEPLOYED items show [●] in green
  - BUILDING items show [◌] in dimmer color
PASS CONDITION:
  Scroll through all sections. Active item in sidebar tracks correctly.
  Click each sidebar item. All navigate correctly.

---

## SECTION 08 — IDENTITY, LOGS, STACK

### 08.A — /identity.md
TRIGGER: Navigate to identity section or type "whoami"
EXPECTED:
  Renders content EXACTLY as CONTENT.md /identity.md section.
  Format: markdown-rendered in terminal style.
  Heading (#) in slightly larger mono.
  Arrow items (→) preserved.
  No missing lines.
PASS CONDITION: Compare rendered output char-by-char with CONTENT.md.

### 08.B — /logs — growth.log
TRIGGER: Navigate to logs section, growth.log active
EXPECTED:
  All entries from CONTENT.md /logs/growth.log.
  Format: [DATE] entry text
  Monospaced. Correct year values.
PASS CONDITION: All 9 entries present. Dates correct.

### 08.C — /logs — failures.log
TRIGGER: failures.log tab active
EXPECTED:
  All entries from CONTENT.md /logs/failures.log.
  FAIL entries in slightly different color (warm red or amber).
  FIX entries in #4AFF91.
  LEARNED entries in default mono color.
  4 failure blocks total.
PASS CONDITION:
  All 4 FAIL/FIX/LEARNED blocks present.
  Color distinction between FAIL, FIX, LEARNED is visible.
  This file must NOT be empty, hidden, or placeholder.
  It is the most important file on the site.

### 08.D — /stack packages.json
TRIGGER: Navigate to stack section
EXPECTED:
  All packages from CONTENT.md /stack/packages.json rendered.
  "active" packages visually distinct from "installed" packages.
  "deployed" packages visually distinct.
  Click on package name → shows npm inspect output for that package.
PASS CONDITION:
  three, gsap, cannon-es, tone, lenis all show as "active".
  Click "three" → npm inspect output renders (see CONTENT.md).

---

## SECTION 09 — ASK NEEL

### 09.A — Interface
TRIGGER: Navigate to ask section
EXPECTED:
  Display:
    NEEL.OS  ·  QUERY INTERFACE  ·  ONLINE
    ────────────────────────────────────────
    > _
  Font: JetBrains Mono
  Background: dark (#0A0A0A or dark panel)
  3 suggested queries visible below input (random from CONTENT.md list)
PASS CONDITION: Interface matches spec. Suggested queries visible.

### 09.B — API call
TRIGGER: User submits a query
EXPECTED:
  - Request goes to /api/query (server-side route)
  - NEVER directly to Groq API from client
  - Response streams token by token
  - First token arrives in < 500ms (Groq is fast — target < 200ms)
  - Streaming visible: text builds character by character
  - No "Loading..." placeholder — tokens stream directly
PASS CONDITION:
  Open Network tab in devtools.
  Verify request goes to /api/query NOT to api.groq.com.
  Verify response is chunked/streamed (not single response).
  Verify GROQ_API_KEY is NOT in client bundle:
    grep -r "gsk_" .next/ — should return NOTHING.

### 09.C — Rate limiting
EXPECTED:
  After 10 requests from same IP in 1 hour:
  Response: 429 status
  UI shows: "rate limit reached — try again later"
PASS CONDITION: Can only be tested manually or with mock. Verify 429 handling in UI.

### 09.D — System prompt verification
TRIGGER: Ask "What stack does NeuroFin use?"
EXPECTED RESPONSE should mention:
  React, Python, LangGraph, AWS Lambda, S3, Docker
  Sub-200ms latency
  Isolation Forest anomaly detection
PASS CONDITION: Response is technically accurate per CONTENT.md ASK NEEL SYSTEM PROMPT.

---

## SECTION 10 — CAPABILITIES

### 10.A — Drag mechanic
TRIGGER: User grabs and drags capabilities section
EXPECTED:
  - Physical momentum: release → content continues moving then decelerates
  - NOT CSS scroll-snap — smooth deceleration
  - Overshoot at edges: rubber-band bounce then settle
  - Velocity tracked over last 3 frames for realistic inertia
PASS CONDITION:
  Grab and flick. Content should coast then stop.
  Not instant stop on release. Not snap.

### 10.B — Per-word parallax
EXPECTED:
  - Each word has data-depth attribute (0.2 to 1.8)
  - Mouse movement causes words to shift at different rates
  - High depth words move more. Low depth words move less.
  - Creates sense of 3D space.
PASS CONDITION:
  Move mouse slowly across capabilities section.
  Words should shift at visibly different rates.
  Not all moving together.

### 10.C — SYSTEMS word reveal
TRIGGER: Cursor moves within 80px of the word "SYSTEMS"
EXPECTED:
  - At rest: "SYSTEMS" is nearly invisible (opacity ~0.05)
  - As cursor approaches within 80px: opacity increases
  - At < 80px: opacity transitions to ~0.9 over 0.3s
  - On cursor exit: fades back to 0.05
  - Reveal is based on PROXIMITY (cursor distance math), NOT hover
PASS CONDITION:
  Move cursor near SYSTEMS without hovering over it exactly.
  Word should reveal as cursor approaches.
  Verify it's distance-based not hover-based (should reveal before cursor is ON the word).

### 10.D — SDF morphing (if implemented)
EXPECTED:
  Adjacent words bleed at edges when within 40px of each other.
  Letterforms merge at boundary.
PASS CONDITION: If implemented, verify bleeding effect. If deferred, note as TODO.

---

## SECTION 11 — TRANSMISSION

### 11.A — SSH intro block
TRIGGER: Transmission section enters viewport
EXPECTED:
  Decrypt animation then reveals:
    root@neel:~$ ssh neel@transmission

    generating public channel...
    ──────────────────────────────────────────
    email      neel1234kachhadia@gmail.com
    github     github.com/Neel-Kachhadia
    linkedin   linkedin.com/in/neelkachhadia
    resume     [download]
    status     available
    ──────────────────────────────────────────
  Font: JetBrains Mono
  Background: #0A0A0A

### 11.B — Email display
EXPECTED:
  - "neel1234kachhadia@gmail.com" in large Editorial New weight 300
  - Size: fills viewport width with margin (clamp(32px, 6vw, 80px))
  - Color: #F5F0E8 on #0A0A0A background
PASS CONDITION: Email is enormous. Weight 300 (light, not bold). Correct address.

### 11.C — Hover ripple
TRIGGER: Mouse hovers over email text
EXPECTED:
  - SVG or WebGL displacement ripple from cursor position
  - Email text warps/distorts
  - Effect: sensuous, like heat haze — NOT violent
  - Ripple follows cursor position within email bounds
PASS CONDITION:
  Hover and move mouse slowly across email.
  Distortion should follow cursor position, not be static.

### 11.D — Click to copy
TRIGGER: User clicks email
EXPECTED:
  - Email copied to clipboard (navigator.clipboard.writeText)
  - 12 canvas particles burst from click position
  - Particle color: #C8F027 lime
  - Particles: 3px circles, scatter outward, fade over 0.6s
  - Sound (if enabled): 1047Hz sine, 200ms decay, -12dB
  - Visual confirmation: small text "copied" appears briefly below email
PASS CONDITION:
  Click email. Open a text editor. Paste. Should paste "neel1234kachhadia@gmail.com".
  Verify 12 particles (count them). Verify #C8F027 color.

### 11.E — Lime rule — final use
EXPECTED:
  Text below email:
    "Let's build something unreasonable."
  The word "unreasonable" is #C8F027 lime.
  The rest of the text is #F5F0E8 or similar.
  THIS IS THE SECOND AND FINAL USE OF #C8F027 IN THE ENTIRE SITE.
PASS CONDITION:
  grep -r "C8F027" src/ — should return EXACTLY 2 results:
  1. Unreasonable.tsx (or similar)
  2. Transmission.tsx
  If 3 or more results: FAIL. Remove extra uses.

### 11.F — System health update on transmission
EXPECTED:
  When transmission section is active, system health shows:
    transmission     listening
    contact          open
  (replacing lower 2 lines of health display)
PASS CONDITION: Verify system health monitor updates when scrolling to transmission.

---

## SECTION 12 — THREE MODES

### 12.A — Mode switcher visibility
EXPECTED:
  - Always visible, top-right
  - Text: "MODE: [VISITOR] [RECRUITER] [DEBUG]"
  - Font: JetBrains Mono small (11px)
  - Active mode: underlined
  - Inactive: opacity 0.5
  - On hover: opacity 1.0
PASS CONDITION: Visible in all sections. Correct active state indicator.

### 12.B — Recruiter mode
TRIGGER: Click [RECRUITER] in mode switcher
EXPECTED:
  - RecruiterPanel.tsx renders as full-screen overlay
  - All WebGL, physics, animations: HIDDEN (not stopped — panel overlays them)
  - Panel shows exactly the recruiter content from CONTENT.md
  - No boot sequence (bypassed for recruiter mode)
  - Resume PDF link functional (downloads actual file)
  - GitHub link opens github.com/Neel-Kachhadia
  - LinkedIn link opens linkedin.com/in/neelkachhadia
  - [OPEN TRANSMISSION →] scrolls to transmission
  - Click [VISITOR] to exit recruiter mode — full site returns
PASS CONDITION:
  Switch to recruiter. All 3 deployed systems visible with status.
  Stack list accurate per CONTENT.md.
  All links functional.
  Exit returns to exact scroll position user was at.

### 12.C — Debug mode
TRIGGER: Click [DEBUG] in mode switcher OR type "debug on"
EXPECTED:
  - DebugOverlay panel appears on right side
  - Content (all real-time values):
      fps:        {real value, updates every second}
      heap:       {real value or "--" if unavailable}
      webgl:      {active|inactive}
      route:      {current path}
      motion:     {full|reduced|static}
      audio:      {muted|enabled}
      session:    {n}
  - ALL 5 tech decisions visible (see ARCHITECTURE.md TECH_DECISIONS array):
      Three.js single context
      Cannon-es physics
      Groq llama-3.3-70b
      Lenis + GSAP sync
      GLSL fragment shaders
  - Each decision shows: technology, decision, reason
  - Component boundaries: [show] button works (adds visible outlines to components)
  - Performance budget: [inspect] shows bundle sizes
  - Accessibility: [audit] shows contrast/focus status
PASS CONDITION:
  All 5 tech decisions present with accurate text from ARCHITECTURE.md.
  FPS updates every ~1 second.
  Heap shows real value on Chrome, "--" on Safari (honest).

---

## SECTION 13 — MOBILE (POCKET SHELL)

### 13.A — Detection
TRIGGER: Viewport < 768px (or actual mobile device)
EXPECTED:
  - PocketShell.tsx renders INSTEAD OF desktop experience
  - NO desktop components in mobile tree
  - NO Three.js. NO WebGL. NO Cannon-es.
  - NO scan line.
PASS CONDITION:
  Resize browser to 767px. Desktop experience should disappear.
  PocketShell should appear.
  Open devtools Performance. No Three.js in bundle execution.

### 13.B — Bottom bar
EXPECTED:
  - Fixed bottom bar, always visible
  - 4 primary buttons: [PROJECTS] [STACK] [LOGS] [CONTACT]
  - All tap targets: minimum 44px height
  - Font: JetBrains Mono
  - Active section: #4AFF91 indicator
PASS CONDITION: All buttons navigate to correct sections. 44px min height verified in devtools.

### 13.C — Project world fallbacks
EXPECTED:
  NeuroFin: CSS linear-gradient from #0A0A0A to #B45309
  Equity: CSS linear-gradient from #0A0A0A to #1E3A5F
  Terminal: CSS linear-gradient from #0A0A0A to #003D2E
  All project text content visible.
  Execution output (run neurofin) still works — terminal text only.
PASS CONDITION: All 3 project worlds render on mobile with CSS fallbacks. Content complete.

### 13.D — Recruiter mode on mobile
EXPECTED:
  - Accessible from bottom bar or mode switcher
  - Resume download functional
  - All links functional
  - ONE TAP from any state
PASS CONDITION: Tap recruiter. Panel appears. Tap back. Returns to previous section.

---

## SECTION 14 — PERMANENT CHROME ELEMENTS

### 14.A — Film grain
EXPECTED:
  - Canvas-based, NOT static PNG
  - Moving grain (new noise pattern ~every 150ms via rAF)
  - Opacity: 0.025 on all sections
  - z-index: 9999 (above everything except cursor)
  - pointer-events: none
  - Present in ALL sections
  - NOT present on mobile (performance)
PASS CONDITION:
  Look closely at any section for 2 seconds. Grain should be subtly moving.
  If it looks completely static: FAIL (likely PNG, not canvas).

### 14.B — CRT scan line
EXPECTED:
  - 1px horizontal line, full viewport width
  - Color: rgba(255,255,255,0.025)
  - Moves from top to bottom continuously, ~6s per cycle, repeats
  - During boot: rgba(255,255,255,0.08) — brighter
  - After hero: rgba(255,255,255,0.025) — subtle
  - pointer-events: none
  - z-index: 9998
  - DISABLED in reduced and static motion modes
  - NOT present on mobile
PASS CONDITION: Visible on close inspection. Continuous. Never stops on desktop.

### 14.C — Custom cursor
EXPECTED (desktop only):
  - Native cursor: none (CSS)
  - Custom cursor: canvas RAF loop
  - Default: 8px dot + 24px orbit ring rotating at 0.8rpm
  - On interactive element hover: ring expands to 40px, 2rpm
  - On project hover: ring fills with project accent color
  - On email hover: "COPY" label appears in ring
  - On click: dot contracts to 4px, snaps back
  - On void (no interaction): 1.0→1.08 scale pulse on 2s sine
PASS CONDITION:
  Native cursor invisible throughout.
  Canvas cursor visible and tracks mouse precisely.
  All hover states trigger correctly.

---

## SECTION 15 — 404 PAGE

### 15.A — Kernel panic
TRIGGER: Navigate to any non-existent route (e.g. /neel/unknown)
EXPECTED:
  Content matches CONTENT.md 404 section exactly:
    ──────────────────────────────────────────────────────────
    KERNEL PANIC — NEEL.OS v1.0.0
    ──────────────────────────────────────────────────────────

    route not found: /unknown

    available mounts:
      /identity
      /projects
      ...

    [ reboot to /neel ]
  Background: #0A0A0A
  Font: JetBrains Mono
  [ reboot to /neel ] button: navigates to home
PASS CONDITION: Navigate to /anything-fake. Kernel panic renders. Button works.

---

## SECTION 16 — REDUCED MOTION

### 16.A — System media query
TRIGGER: OS has prefers-reduced-motion: reduce set
EXPECTED:
  motionProfile automatically set to 'reduced'
  Physics (Cannon-es): disabled — letters appear in place
  Shaders: still run at reduced iteration count
  Scan line: disabled
  Grain: opacity reduced to 0.015
  Decrypt: runs but faster (400ms total)
  Breathe animation: font weight stays at 500 (no oscillation)
  All content: still visible
  All navigation: still works
PASS CONDITION:
  In Chrome: devtools → Rendering → Emulate CSS media feature →
  prefers-reduced-motion: reduce
  Verify physics disabled. Verify scan line hidden. Verify content intact.

### 16.B — Manual motion toggle
TRIGGER: User clicks [reduced] or [static] in motion toggle (fixed bottom-left)
EXPECTED [reduced]:
  Same as 16.A above
EXPECTED [static]:
  Physics: disabled
  Shaders: disabled (CSS gradient fallbacks)
  Scan line: disabled
  Grain: disabled
  Decrypt: disabled (text appears directly)
  Breathe: disabled
  ALL CONTENT: still visible
  ALL NAVIGATION: still works
PASS CONDITION:
  Click [static]. Verify all animations stop.
  Verify page is still fully readable and navigable.
  Verify NO content is hidden in static mode — only animations removed.

---

## SECTION 17 — PERFORMANCE VERIFICATION

### 17.A — Lighthouse
Run Lighthouse on production build (vercel deploy or `next build && next start`).
EXPECTED:
  Performance: 95+
  Accessibility: 90+
  Best Practices: 95+
  SEO: 90+
PASS CONDITION: All scores at or above these floors.

### 17.B — Bundle size
EXPECTED:
  First load JS: < 250kb (confirmed 161kb — maintain)
  Verify no regression after QA changes.
PASS CONDITION: `next build` output shows first load JS ≤ 161kb.

### 17.C — Frame rate
EXPECTED: 60fps in all sections on mid-range device.
  Test on a device with integrated graphics (not just high-end GPU).
PASS CONDITION:
  Chrome devtools → Performance → Record 5 seconds of scrolling.
  Frame rate should stay above 55fps. Drops to 30fps: FAIL.

### 17.D — WebGL context count
EXPECTED: Exactly ONE WebGL context created.
PASS CONDITION:
  Chrome devtools → console: `document.querySelectorAll('canvas').length`
  Should return 2-3 (main WebGL canvas + grain canvas + possibly cursor canvas).
  Main WebGL canvas: exactly 1. Never 2.

### 17.E — No API keys in client bundle
CRITICAL:
  grep -r "gsk_" .next/static/ → MUST return nothing
  grep -r "GROQ" .next/static/ → MUST return nothing
  grep -r "KV_REST" .next/static/ → MUST return nothing
PASS CONDITION: Zero secrets in client bundle. Non-negotiable.

---

## SECTION 18 — WHISPERS

### 18.A — Display
EXPECTED:
  - Whispers visible in logs or capabilities section
  - Format: // {text}    [{city} · {time}]
  - Font: JetBrains Mono XS, opacity 0.35
  - Gentle ambient drift motion (GSAP, very subtle)
PASS CONDITION: At least a seed whisper visible (add one via API during setup).

### 18.B — Adding a whisper
EXPECTED:
  - "+ leave a note" option visible in logs section
  - Click → input field appears, 40 char limit
  - Submit → "noted." confirmation appears
  - Whisper stored server-side via /api/whisper
  - Rate limit: 1 per IP per 24h
  - If rate limited: "one whisper per day" message
PASS CONDITION: Submit a test whisper. Reload. Whisper appears.

---

## FINAL CHECK — THE LIME RULE

This is the most important single check in this document.

#C8F027 must appear EXACTLY TWICE in the entire rendered site:
  1. The word "UNREASONABLE" (manifesto — own screen, full viewport)
  2. The word "unreasonable" (transmission — "Let's build something unreasonable.")

Run in browser console from any page:
  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.color === 'rgb(200, 240, 39)' ||
        style.backgroundColor === 'rgb(200, 240, 39)') {
      console.log(el, style.color, style.backgroundColor);
    }
  });

Expected: exactly 2 elements logged.
If more than 2: remove extra uses. No exceptions.
If 0 or 1: lime is missing from one of its two required locations.

---

## SIGN-OFF CHECKLIST

Do not deploy until all boxes are checked:

□ 00 — Boot flow: black throughout, correct timestamps, hard cut to hero
□ 01 — Return visit: no boot, session count displays, resume prompt works
□ 02 — Hero: physics letters, fluid alive, breathing type, ONLINE blinks at 1.2s
□ 03 — Manifesto: opacity-only arrivals, UNREASONABLE is lime and alone
□ 04 — Counter: irregular increments, last transaction timestamp live
□ 05 — Tear: velocity-triggered, asymmetric origin, 1.0s duration, boom sound
□ 06 — Projects: all 3 shaders run, text arrives after resolve, git logs present
□ 07 — Commands: all commands work, sudo hire-neel sequence complete
□ 08 — Identity/Logs/Stack: failures.log complete (4 blocks), npm inspect works
□ 09 — Ask Neel: server-side only, streaming, no key in bundle, rate limited
□ 10 — Capabilities: momentum drag, parallax layers, SYSTEMS proximity reveal
□ 11 — Transmission: SSH block, enormous email, ripple on hover, particles on click
□ 12 — Three modes: all switch correctly, debug shows all 5 tech decisions
□ 13 — Mobile: separate tree, no WebGL, CSS fallbacks, 44px targets, recruiter tap
□ 14 — Chrome: grain is canvas (not PNG), scan line present, cursor has orbit ring
□ 15 — 404: kernel panic renders, reboot button works
□ 16 — Reduced motion: OS setting respected, static mode hides all animation
□ 17 — Performance: Lighthouse 95+, 161kb bundle maintained, 60fps, no secrets
□ 18 — Whispers: display, add, rate limit all functional
□ LIME — exactly 2 instances of #C8F027 in entire rendered site

All boxes checked = ready to deploy.
Any box unchecked = do not deploy.
