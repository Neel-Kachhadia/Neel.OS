# NEEL.OS — MASTER BUILD PROMPT
## Complete 4-Phase Construction Brief

---

## WHAT YOU ARE BUILDING

NEEL.OS is a living developer runtime portfolio for Neel Kachhadia.
It is built with Next.js 14, Three.js, GSAP, Lenis, Tone.js, and Groq API.

Visitors do not browse. They log into a system.
They execute projects, inspect modules, read logs, open a transmission channel.

The portfolio is not about Neel. It IS Neel — running.

Read all four reference files before writing a single line of code:
- DESIGN_SYSTEM.md — every color, font, token, and visual rule
- INTERACTIONS.md — every animation, shader, and mechanic
- CONTENT.md — every word, line, and copy block
- ARCHITECTURE.md — filesystem, routing, components, and data

---

## THE STACK — NON-NEGOTIABLE

```
Framework:       Next.js 14 (App Router)
Smooth scroll:   Lenis 1.x
Scroll anim:     GSAP 3.x + ScrollTrigger
Physics:         Cannon-es (hero letter rigid bodies)
WebGL:           Three.js r160 + custom GLSL shaders
                 SINGLE WebGL context — Lusion sync method
                 rAF loop shared across all scenes
Audio:           Tone.js (synthesis) + Howler.js (samples)
                 Opt-in only. Never autoplay.
Cursor:          Canvas RAF loop — satellite orbit mechanic
Command system:  Custom parser — full path resolution
AI Chat:         Groq API — llama-3.3-70b-versatile
                 Server-side API route ONLY
                 Rate limited: 10 req/IP/hour
                 NEVER NEXT_PUBLIC_ for API key
Whispers:        Vercel KV — server-side persistence
Session:         localStorage — boot state, path, session count
Fonts:           Editorial New (variable, wght 200-800)
                 JetBrains Mono (all mono/terminal text)
                 Söhne (body copy only)
                 ALL preloaded in _document. Zero FOUT.
Deployment:      Vercel
Performance:     Lighthouse 95+ mandatory
                 60fps locked — non-negotiable
                 Initial JS < 250kb critical path
                 WebGL lazy-loaded
                 prefers-reduced-motion respected always
```

---

## PHASE 01 — FOUNDATION
### Shell, scroll, fonts, cursor, grain, system health, boot sequence, sound gate

**Deliverables:**
1. Next.js 14 project scaffold with App Router
2. Lenis smooth scroll — globally initialized
3. GSAP + ScrollTrigger — registered globally
4. All three fonts preloaded — zero FOUT
5. Film grain overlay — canvas-based, always present
6. Custom cursor — satellite orbit mechanic (see INTERACTIONS.md)
7. CRT scan line — always present, full viewport (see INTERACTIONS.md)
8. System health monitor — bottom-right, always visible (see INTERACTIONS.md)
9. Mode switcher — VISITOR / RECRUITER / DEBUG (see INTERACTIONS.md)
10. Boot sequence — real timestamps, README, sound gate (see CONTENT.md)
11. localStorage session system — first visit vs return

**Phase 01 Rules:**
- No placeholder content. Real copy from CONTENT.md only.
- Grain opacity: 0.025. Not 0.03. Not 0.04.
- Scan line: 1px, rgba(255,255,255,0.025), top-to-bottom, never stops.
- Boot timestamps must use real performance.now() values.
- Sound gate is the LAST screen before hero. Black throughout boot + gate.
- Hard cut to off-white hero. Not a fade. A cut.
- Return visit: skip boot entirely. Go straight to hero. Show session count.

---

## PHASE 02 — HERO + MANIFESTO + COUNTER + THE TEAR
### WebGL fluid, letter physics, manifesto, UNREASONABLE, live counter, the tear

**Deliverables:**
1. Hero section — Three.js physics letters + GLSL fluid
2. Manifesto section — scroll-triggered line reveals
3. UNREASONABLE screen — lime, alone, scale arrival
4. Live counter — irregular increment, last transaction timestamp
5. The Tear — velocity-threshold GLSL displacement
6. Filesystem navigation sidebar — always visible in shell

**Phase 02 Rules:**
- Hero fluid: real GLSL fragment shader. Not CSS. Not canvas 2D.
- Letters: Cannon-es rigid bodies. Fall from above. Settle with damping.
  No two loads identical. Mouse applies radial force field.
- Manifesto: opacity 0→1 only. No translation. No scale. They ARRIVE.
- UNREASONABLE: scale 0.94→1.00 arrival. No other animation.
  Lime #C8F027. Editorial New weight 800. Full viewport. Nothing else.
- Counter: increments irregularly 1-3 every 4-8 seconds.
  Seeded from base value. Shows "last transaction X:XX ago" updating live.
- The Tear: triggered by scroll VELOCITY exceeding threshold.
  Not scroll position. Slow scroll: fluid thickens. Fast scroll: tears.
  GLSL Voronoi crack from point (60% right, 45% down) — asymmetric.
  0.4s propagation, 0.6s reveal = 1.0s total.
  Sound (if enabled): 40Hz sine, 1.2s, fast attack, slow decay.

---

## PHASE 03 — PROJECT WORLDS + SHELL + LOGS + STACK + ASK NEEL
### Three shader worlds, command system, filesystem, logs, package manager, query interface

**Deliverables:**
1. Three project worlds — each a complete GLSL shader environment
2. Project execution animation — `run [project]` terminal output
3. Git log per project — commit history display
4. Command system — full parser with all commands
5. Filesystem navigation — /neel directory tree, clickable
6. /identity.md — about section as markdown file
7. /logs — growth.log, failures.log, shipping.log
8. /stack — package manager with npm inspect
9. Ask Neel — Groq streaming chat interface
10. Whisper system — visitor comments, server-side

**Phase 03 Rules:**
- All three shaders: pure GLSL fragment shaders on full-screen quads.
  Single Three.js context. One draw call each. 60fps always.
- THE RESOLVE (NeuroFin): amber noise field → clarity, top-down, 3s.
  Copper trace line lingers 1s after resolve front passes.
  Text arrives ONLY after field fully resolves. Never before.
- THE THESIS (Equity): cold blue waveform chaos → single signal, L→R, 4s.
  Individual waveforms snap at different moments — not simultaneous.
  Last waveform (thickest) snaps last. Sound tick per snap if enabled.
- THE TERMINAL (Market): phosphor green 3-layer depth field. NEVER STOPS.
  DuckDB layer: nearly still. Options chain: medium pulses. Redis: fast.
  Alert fires every ~5s: horizontal brightening at 38.2% position.
  Build manifest in corner showing completed/incomplete items.
- Decrypt mechanic on ALL project titles and headers:
  Pass 1: random chars cycling fast (200ms)
  Pass 2: chars lock left-to-right (600ms)
  Sound: mechanical clicks ending in definitive clack.
- Command parser must handle: help, whoami, ls, cd, run, cat, git log,
  npm inspect, open, debug on/off, recruiter mode, clear, sudo hire-neel
- sudo hire-neel: 3-second fake auth sequence then scroll to transmission
- failures.log is NOT optional. It is the most important file.
- Groq API: server-side route only. Stream tokens. First token < 200ms.
  System prompt includes full resume, all project architectures, all
  tech decisions. It answers as the system, not as a chatbot.

---

## PHASE 04 — CAPABILITIES + TRANSMISSION + MOBILE + POLISH
### Horizontal drag, SDF skills, contact, mobile shell, performance, final polish

**Deliverables:**
1. Capabilities — horizontal drag rail, SDF morphing, parallax layers
2. Transmission — SSH contact, enormous email, WebGL ripple
3. Mobile — NEEL.OS Pocket Shell (NOT a shrunk desktop)
4. 404 — Kernel Panic page
5. Performance pass — Lighthouse 95+, bundle analysis
6. Reduced motion mode — [full] [reduced] [static]
7. Debug mode — component boundaries, FPS, tech decisions visible
8. Evidence mode — every skill linked to project usage
9. Recruiter mode — fast, direct, zero friction
10. Final polish — micro-interactions, grain, all sound design

**Phase 04 Rules:**
- Capabilities drag: physical momentum and inertia. Not CSS scroll-snap.
  Miranda mechanic: grab, drag, release with overshoot and settle.
  SDF morphing: adjacent skills bleed at edges when proximate.
  SYSTEMS word: near-invisible (#F5F0E8 on #F5F0E8), 0.05 opacity.
  Reveals on cursor proximity within 80px. Not on hover. On proximity.
- Transmission email: Editorial New weight 300. As wide as viewport allows.
  WebGL ripple: displacement map from cursor position. Sensuous, not violent.
  Click: copies email. 12 particles burst from click point, #C8F027,
  scatter and fade 0.6s. Sound: 1047Hz chime, 200ms decay.
  "unreasonable" in lime — second and FINAL use of lime on entire site.
- Mobile shell: completely different component tree.
  Bottom command bar. Tap commands. Swipe directories.
  No Cannon-es physics. No heavy GLSL. CSS gradient fallback.
  Recruiter mode one tap. Resume and contact always visible.
- 404: KERNEL PANIC. Available mounts listed. [reboot to /neel] button.
- Debug mode shows: FPS, heap, WebGL status, route, motion profile,
  component boundaries, performance budget, WHY decisions for each
  tech choice, accessibility audit status, shader source [view] links.
- Lighthouse 95+ is not a target. It is the floor.
- prefers-reduced-motion: when set, disable physics, disable shaders
  (CSS gradient fallback), disable scan line, disable continuous animations.
  All content remains. All navigation remains. Nothing is hidden.

---

## CRITICAL RULES — APPLY TO ALL PHASES

1. **Sound is always opt-in.** Never autoplay. Gate asks [y] [n].
   Both WITH and WITHOUT sound are complete experiences.
   Design both intentionally. Silence on the tear is more violent.

2. **The lime rule.** #C8F027 appears EXACTLY TWICE in the entire site.
   Once: UNREASONABLE (manifesto section)
   Twice: "unreasonable" (transmission section)
   Never anywhere else. If you are tempted to use it a third time, don't.

3. **The ONLINE indicator.** #4AFF91 blinks at 1.2s intervals.
   Top-right of hero. Nowhere else except system health.
   Never use #4AFF91 for anything decorative.

4. **Variable weight breathing.** Editorial New in hero breathes
   wght 300↔800 on a 4-second sine wave. ALWAYS. Never stops.
   Not triggered by scroll. Not triggered by hover. Constant.

5. **The single WebGL context.** One Three.js renderer.
   All scenes share it. Lusion sync method:
   Lenis scroll value fed into GSAP. GSAP drives uniforms.
   Never let native scroll and rAF desync.

6. **Server-side secrets.** Groq API key: server-side route only.
   Vercel KV credentials: server-side only.
   NEXT_PUBLIC_ for API keys = immediate fail. No exceptions.

7. **Filesystem is the navigation.** No nav bar. No hamburger.
   /neel directory tree is how visitors move.
   Path indicator bottom-left always shows current location.
   root@neel:/current/path $

8. **Real data only in monitors.** Process monitor shows:
   fps: real rAF delta. heap: performance.memory API (where available).
   uptime: Date.now() − page load time. Route: actual current path.
   No fake PIDs. No fake CPU percentages. Only honest values.

9. **failures.log is not optional.** It is the most important file.
   It shows maturity. Every other 19-year-old lists wins.
   Nobody documents failures honestly. This is the differentiator.

10. **60fps is the floor.** Not the target. If a shader drops below 55fps
    on a mid-range device, simplify the shader. Never sacrifice framerate
    for visual complexity. Performance IS the design.
