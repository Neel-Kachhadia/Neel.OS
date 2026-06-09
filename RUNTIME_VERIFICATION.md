# NEEL.OS — RUNTIME VERIFICATION PROMPT
## Browser-only checks requiring live deployment or dev server

All static checks have passed. This document covers the 4 remaining
runtime-only verification items plus a full browser walkthrough script.

Run against: `next dev` locally OR production Vercel deploy.
Use Chrome. DevTools open throughout.

---

## RUNTIME CHECK 01 — LIGHTHOUSE 95+

### Setup
Deploy to Vercel OR run:
```bash
next build && next start
```
Open Chrome to the deployed URL.
Open DevTools → Lighthouse tab.

### Run
- Device: Desktop
- Categories: Performance, Accessibility, Best Practices, SEO
- Click "Analyze page load"

### Expected scores
```
Performance:      95+
Accessibility:    90+
Best Practices:   95+
SEO:              90+
```

### If Performance < 95 — fix in this order:
1. Check "Eliminate render-blocking resources" — fonts must be preloaded
2. Check "Reduce unused JavaScript" — Three.js must be lazy-loaded
3. Check "Largest Contentful Paint" — should be the hero text, not WebGL
4. Check "Total Blocking Time" — boot sequence must not block main thread
5. Verify initial JS bundle still ≤ 161kb: `next build` output

### If Accessibility < 90:
1. All interactive elements must have accessible labels
2. Command input: aria-label="Command input"
3. Mode switcher buttons: aria-label="Switch to {mode} mode"
4. All links: meaningful text or aria-label
5. Color contrast: #4AFF91 on #0A0A0A passes (7.2:1). Verify.
6. Focus visible on all interactive elements — tab through entire site

---

## RUNTIME CHECK 02 — SHADER VISUAL BEHAVIOUR

Open the site in Chrome with DevTools Performance tab ready.

### 02.A — Hero fluid (60fps verification)
1. Navigate to hero section
2. Open DevTools → Performance → Start recording
3. Move mouse across hero for 5 seconds
4. Stop recording
5. Inspect frames

PASS: Frame rate stays above 55fps throughout mouse movement.
FAIL: Any sustained drop below 45fps → simplify fluid shader iteration count.

Specific things to verify visually:
- Fluid is moving BEFORE you touch the mouse (ambient u_time motion)
- Fast mouse movement creates larger displacement than slow movement
- After stopping mouse: fluid diffuses back over 2-3 seconds, not instantly
- Fluid is BEHIND the letter layer (letters visible above fluid)

### 02.B — Hero letters physics (Cannon-es)
1. Hard reload 3 times (Cmd+Shift+R)
2. On each reload: screenshot the moment letters settle

PASS: Letter positions and rotations differ between reloads.
FAIL: Identical positions on every reload → random seed not working.

Verify:
- Letters fall from ABOVE viewport (not from current position)
- They have slight random rotation variance (not all perfectly upright)
- Settling takes ~1.0-1.5 seconds (not instant snap to position)
- After settling: subtle breathing oscillation visible (barely perceptible)
- Move mouse fast over settled letters: they scatter then resettle

### 02.C — THE RESOLVE shader (NeuroFin)
1. Navigate to NeuroFin project section
2. Watch the full resolve cycle

Verify in sequence:
- [ ] Screen starts as high-frequency amber noise (granular, fast)
- [ ] Resolve front appears and descends TOP to BOTTOM
- [ ] Above front: smooth breathing amber field
- [ ] Below front: still noisy/granular
- [ ] Copper trace line (2px) visible at resolve front position
- [ ] Front exits bottom of screen
- [ ] Copper trace line lingers ~1 second AFTER front exits, then fades
- [ ] Text appears ONLY after copper trace line has exited
- [ ] Entire field is now smooth amber, breathing slowly
- [ ] After ~8 second pause: cycle resets and runs again (ambient loop)

CRITICAL FAIL CONDITION: Text appears while resolve front is still on screen.
If this happens: increase the delay gate in NeuroFin.tsx before text reveal.

Also verify: 60fps throughout. Record in Performance tab.
Target: no frames below 50fps during the 3-second resolve.

### 02.D — THE THESIS shader (Equity Research)
1. Navigate to Equity Research section
2. Watch the full resolution cycle

Verify in sequence:
- [ ] Multiple overlapping waveforms visible — cold blue, chaotic
- [ ] Resolution front appears, moves LEFT to RIGHT
- [ ] Waveforms snap at DIFFERENT times as front passes
- [ ] NOT all simultaneously — staggered snaps visible
- [ ] Last waveform (thickest line) snaps LAST
- [ ] Final state: single clean signal in steel #94A3B8
- [ ] If sound enabled: distinct click per snap, cleaner tone on final snap

FAIL CONDITION: All waveforms snap at the same moment.
Fix: increase stagger variance in ThesisShader uniforms.

Also verify: 60fps. Especially during simultaneous snap moments.

### 02.E — THE TERMINAL shader (Market Terminal)
1. Navigate to Market Terminal section
2. Watch for at least 15 seconds

Verify:
- [ ] Three distinct speed layers visible simultaneously
- [ ] Bottom layer: very slow, dense horizontal lines
- [ ] Middle layer: medium speed pulse pattern
- [ ] Top layer: fast horizontal dashes (Redis ticks)
- [ ] Alert fires: a single horizontal line brightens at ~38% from top
- [ ] Alert fires at least TWICE in 15 seconds
- [ ] Alert position: approximately 38.2% from top (Fibonacci level)
- [ ] Alert duration: ~0.1 seconds (brief flash)
- [ ] Build manifest visible in corner with correct items and ◌ for incomplete
- [ ] Scroll away to another section. Scroll back.
  Terminal should be at a DIFFERENT state than when you left.
  It runs continuously even off-screen.

FAIL CONDITION: Alert fires at 50% (center) — that's the wrong position.
FAIL CONDITION: Terminal resets to initial state when returning to section.

### 02.F — All shaders: single WebGL context
Open DevTools → Console. Run:
```javascript
document.querySelectorAll('canvas').length
```

EXPECTED: 2 or 3
- 1 canvas for main WebGL scene (Three.js)
- 1 canvas for grain overlay
- 1 canvas for cursor (if canvas-based)

FAIL: 4+ canvases → multiple WebGL contexts created.
Fix: ensure WebGLContext singleton is shared across all shader components.

---

## RUNTIME CHECK 03 — TEAR VELOCITY TRIGGER

This requires actual scroll testing. Cannot be verified statically.

### 03.A — Slow scroll (should NOT tear)
1. Navigate to hero section
2. Using trackpad: scroll very slowly downward
3. Move no faster than one deliberate notch at a time

PASS: Fluid thickens slightly as you scroll. No tear occurs.
FAIL: Tear triggers on slow scroll → threshold too low. Increase to 50px/frame.

### 03.B — Medium scroll (thickening but no tear)
1. Scroll at moderate pace (normal reading speed)
2. Fluid should feel "heavier" — viscosity uniform increases

PASS: Visible difference in fluid behavior at medium scroll vs slow scroll.
This is subtle. Look for the fluid moving with more resistance.

### 03.C — Fast scroll (should tear)
1. Place cursor on trackpad
2. Flick quickly downward (like you're dismissing something)
3. Or: place cursor on scrollbar, click and drag rapidly

PASS: Tear initiates within 0.5 seconds of fast scroll.

Verify tear details:
- [ ] Crack origin: right of center, above center (NOT dead center — verify)
- [ ] Crack propagates outward from that point (not a straight horizontal line)
- [ ] Propagation takes ~0.4 seconds
- [ ] Surface falls away over ~0.6 seconds
- [ ] Total: ~1.0 second from tear start to NeuroFin world fully visible
- [ ] NeuroFin world is ALREADY running underneath (not loading after reveal)
- [ ] If sound enabled: low 40Hz weight drop felt during tear

FAIL CONDITION: Crack originates from dead center (50%, 50%).
Expected origin: approximately (60%, 45%) — asymmetric.

### 03.D — Tear cannot be triggered twice
EXPECTED: Once the tear has occurred and NeuroFin world is visible,
scrolling back up and fast-scrolling down again should NOT re-trigger the tear.
The tear is a one-time transition per session.

PASS: Second fast scroll does not repeat the tear animation.
FAIL: Tear triggers every time → add a `hasTorn` state flag.

### 03.E — Resistance/anticipation beat
In the 0.2 seconds BEFORE the fast-scroll threshold is reached:
The fluid should visibly accelerate and tighten — like it knows.

This is subtle and may be hard to see in isolation.
If time allows: record in Chrome Performance and look at the fluid
uniform values in the 200ms window before tear triggers.

---

## RUNTIME CHECK 04 — WHISPERS (requires Vercel KV)

### 04.A — Setup (if not already done)
```bash
# In Vercel dashboard: Storage → Create KV Database
# Copy env vars to .env.local:
# KV_URL=...
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...
# KV_REST_API_READ_ONLY_TOKEN=...
```

### 04.B — Seed a whisper
```bash
curl -X POST https://your-deploy.vercel.app/api/whisper \
  -H "Content-Type: application/json" \
  -d '{"text":"the tear got me"}'
```

PASS: 200 response. Whisper stored.
FAIL: 500 → check KV env vars are set in Vercel dashboard.

### 04.C — Verify whisper display
1. Hard reload the site
2. Navigate to /logs section
3. Verify whisper appears floating:
   // the tear got me    [India · just now]

Verify:
- [ ] Font: JetBrains Mono XS
- [ ] Opacity: ~0.35 (faint but readable)
- [ ] Gentle drift motion (very subtle)
- [ ] City approximated from IP (or "Unknown" — acceptable)

### 04.D — Add whisper via UI
1. Scroll to logs section
2. Find "+ leave a note" link
3. Click — input appears
4. Type "testing neel.os" (15 chars)
5. Submit

PASS: "noted." confirmation. Reload page. Whisper appears.

### 04.E — Rate limit
1. Submit a second whisper from same IP within 24h
PASS: Message "one whisper per day" appears. Second whisper not stored.

### 04.F — Character limit
1. Try to paste 41+ characters
PASS: Input limited to 40 chars. Extra chars not accepted.

---

## FULL BROWSER WALKTHROUGH SCRIPT

After all 4 runtime checks pass, do ONE complete walkthrough as a first-time visitor.
This is the experience test — not a unit test, a feeling test.

```
FIRST VISIT WALKTHROUGH — estimated time: 8-10 minutes

1. OPEN INCOGNITO TAB (clears localStorage)
   Navigate to the site.

2. BOOT SEQUENCE
   - Read every line. Are timestamps real? (They should differ from
     the hardcoded values in CONTENT.md by actual milliseconds.)
   - Does it feel like a machine starting? Or a website loading?
   - Target feeling: machine starting.

3. SOUND GATE
   - Choose WITH SOUND.
   - Is the gate on the SAME black screen as boot? No color change?
   - Does the selection feel acknowledged? (dot appears)
   - Is the cut to hero INSTANT? Not a fade?

4. HERO
   - Is the off-white warm? (#F5F0E8, not pure white)
   - Do the letters FALL? (first ~1.5s)
   - Does the fluid move on its own before you touch it?
   - Move mouse slowly. Fluid follows.
   - Move mouse fast. Fluid pushes harder.
   - Are the letters breathing after settling? (barely perceptible)
   - Is ONLINE blinking? Count blinks. Should be 1.2s interval.
   - Note the system health monitor. Does it show real FPS (~60)?

5. SCROLL SLOWLY through the manifesto.
   - Do lines arrive by opacity only? No movement?
   - Does "Most people my age are learning. I am shipping." land?
   - Does UNREASONABLE fill your screen?
   - Is it lime? (#C8F027 — yellow-green, not neon green)
   - Is it ALONE? Nothing else on screen?
   - Does it feel like a fact arriving, not an announcement?

6. LIVE COUNTER
   - Watch it for 20 seconds.
   - Does it increment? Irregularly?
   - Does "last transaction" reset on each increment?

7. SCROLL FAST — attempt the tear.
   - Flick scroll downward hard.
   - Does the fabric tear?
   - Does the boom sound hit? (low frequency — chest, not ears)
   - Is NeuroFin already running underneath?
   - Is the crack origin off-center? (should be ~60% right, 45% down)

8. WATCH THE RESOLVE SHADER
   - Noise → clarity, top to bottom
   - Copper trace line after the front
   - Text arrives AFTER the field resolves
   - Does it feel like watching a system think?

9. OPEN COMMAND INPUT (press /)
   - Type: help
   - Read the help output. Is it clean? Monospaced?
   - Type: git log neurofin
   - Are all 7 commits present?
   - Type: sudo hire-neel
   - Watch the sequence. Does it scroll to transmission?

10. NAVIGATE TO LOGS
    - Read failures.log.
    - Does it feel honest? (Not defensive, not self-aggrandizing)
    - Is FAIL in amber, FIX in green, LEARNED in dim?
    - Does this file make you trust the person more?

11. TRY ASK NEEL
    - Type: "How does NeuroFin handle anomaly detection?"
    - Does the response stream? (Builds character by character)
    - Is it technically accurate? (Isolation Forest, risk score 0-100, SNS)
    - Does it feel like the system knows what it built?

12. SCROLL TO CAPABILITIES
    - Grab and drag horizontally.
    - Does it have momentum? Does it coast after release?
    - Move mouse near the SYSTEMS word.
    - Does it reveal on proximity? (Not on hover — on approach)

13. REACH TRANSMISSION
    - Read the SSH block.
    - Is the email ENORMOUS?
    - Hover over it. Does it ripple/distort?
    - Click it. Does it copy? Do particles burst?
    - Are the particles lime? (#C8F027)
    - Read "Let's build something unreasonable."
    - Is "unreasonable" lime? Is it the SAME lime as UNREASONABLE?
    - Does the site feel like it's closed a loop?

14. SWITCH TO RECRUITER MODE
    - Click [RECRUITER] top-right
    - Does the panel appear immediately?
    - Can you scan the key information in < 10 seconds?
    - Is the resume download functional?
    - Click [VISITOR] — does the site return to your exact position?

15. SWITCH TO DEBUG MODE
    - Click [DEBUG]
    - Can you see FPS (should be ~60)?
    - Are all 5 tech decisions visible with reasons?
    - Is the "why Groq over Claude" decision there?
    - Click [show] on component boundaries — do outlines appear?

16. CLOSE INCOGNITO. OPEN FRESH INCOGNITO.
    Navigate to site.

    SECOND VISIT TEST:
    - Does boot skip entirely?
    - Does it go straight to hero?
    - Is "Session 2." visible bottom-left?
    - If you were at a non-root path: does the resume prompt appear?
```

---

## THE FEELING TEST — ONE FINAL QUESTION

After the full walkthrough, ask yourself ONE question:

> When I reached the contact email, did I feel urgency —
> not "I should reach out sometime" but "I should reach out now"?

If YES: the site is working.
If NO: identify which section lost the momentum and fix it.

The cumulative argument:
```
Boot with real timestamps     → this system is real
ONLINE blinking at hero       → it's running right now
Counter incrementing          → transactions are actually happening
The tear                      → intelligence has weight
Text after resolve            → the system thinks before speaking
failures.log                  → this person is honest about mistakes
Ask Neel answering correctly  → they understand what they built
UNREASONABLE alone            → the word names the whole argument
Session 2 remembers path      → the system was running while you were gone
```

By transmission: the visitor should feel they are contacting someone
operating in a different category. Not a talented student.
A builder who ships systems. At 19. In Mumbai. Unreasonably.

---

## DEPLOY CHECKLIST

All runtime checks complete:
□ Lighthouse 95+ confirmed on production
□ Shader visuals correct (resolve gates text, terminal never stops)
□ Tear triggers on velocity, not position; origin is asymmetric
□ Whispers store and display; rate limit works
□ Full walkthrough completed as first-time visitor
□ Feeling test: urgency at transmission

Environment variables set in Vercel dashboard:
□ GROQ_API_KEY
□ KV_URL
□ KV_REST_API_URL
□ KV_REST_API_TOKEN
□ KV_REST_API_READ_ONLY_TOKEN

Final bundle check:
□ First load JS ≤ 161kb (run `next build`, check output)
□ grep -r "gsk_" .next/static/ → 0 results
□ grep -r "C8F027" src/ → exactly 2 results

Submit to Awwwards:
□ Screenshot: UNREASONABLE screen (the one that circulates)
□ Video: the tear + boom (the jaw-drop moment)
□ Video: full walkthrough (sound on)
□ Category: Portfolio
□ Tags: WebGL, Three.js, GSAP, interactive, terminal, experimental
```
