# NEEL.OS — INTERACTIONS
## Every animation, shader, physics system, and mechanic

---

## 01. HERO FLUID — GLSL FRAGMENT SHADER

```glsl
/* Full-screen quad beneath letter layer */
/* Single Three.js context */

uniforms:
  u_time:       float   /* elapsed seconds */
  u_mouse:      vec2    /* normalized mouse position 0-1 */
  u_resolution: vec2    /* viewport dimensions */
  u_velocity:   float   /* mouse movement speed */

/* Fluid simulation: */
/* Ink dropped in warm water. Mouse pushes it. */
/* It resists slightly then follows. Slow. */
/* The fluid is alive before the user does anything. */

/* Color: off-white (#F5F0E8) as base */
/* Ink: warm dark, rgba(10,10,10,0.15) */
/* Velocity affects displacement radius and intensity */
/* When mouse stops: slow diffusion back to rest state */

/* Performance: target 60fps on mid-range GPU */
/* If dropping below 55fps: reduce iteration count */
/* Fallback: CSS radial-gradient animation */
```

---

## 02. HERO LETTER PHYSICS — CANNON-ES

```javascript
/* Three.js mesh + Cannon-es rigid body per letter */
/* Letters of "NEEL" and "KACHHADIA" individually */

Setup:
  - Each letter: BoxBody with mass proportional to visual size
  - Initial position: above viewport (y: +500) with small random x,z offset
  - Initial rotation: random slight variance per letter
  - Gravity: Vec3(0, -9.82, 0) — standard gravity
  - Damping: linear 0.4, angular 0.6
  - Bounce: restitution 0.2 — they settle, don't bounce aggressively

Floor:
  - Invisible Plane body at y: 0
  - Letters stack on top of each other naturally

Mouse interaction:
  - Raycast from camera through mouse position
  - Apply radial force field to all bodies within 150px
  - Force magnitude: proportional to mouse velocity
  - Fast mouse = scatter. Slow mouse = drift. Still = settle.

On settle (all bodies velocity < 0.1):
  - Apply subtle continuous oscillation: sin(time * 0.5) * 0.02
  - Letters breathe very slightly. They are alive.

No two loads identical:
  - Seed random offsets from Date.now()
  - Different drop timing per letter (50ms stagger max)
```

---

## 03. THE TEAR — VELOCITY-THRESHOLD GLSL

```glsl
/* Triggered when scroll velocity exceeds threshold */
/* NOT a scroll position trigger */

Threshold: scroll delta > 40px/frame (measured in Lenis callback)

Pre-tear behavior:
  0-30px/frame: fluid is normal
  30-40px/frame: fluid visibly thickens — viscosity uniform increases
  >40px/frame: tear initiates

Tear shader:
  uniforms:
    u_progress:  float  /* 0→1 over 1.0s, driven by GSAP */
    u_origin:    vec2   /* (0.60, 0.45) — asymmetric, intentional */
    u_seed:      float  /* slight variance per session */

  Pass 1 (0-0.4s): Voronoi crack propagates from u_origin
    - Crack lines spread outward
    - Fragments begin to separate
    - Displacement increases along crack edges

  Pass 2 (0.4-1.0s): Surface falls away
    - Fragment pieces drop with pseudo-gravity
    - Underneath: NeuroFin amber world already running
    - Alpha of tear surface decreases as amber world alpha increases

Sound (if enabled):
  40Hz sine wave. Fast attack (50ms). Slow decay (1150ms).
  Peak amplitude at u_progress = 0.5.
  Felt in the chest. Not heard in the ears.

Resistance mechanic:
  0.2s before threshold: fluid moves faster, tighter
  Anticipation beat. Makes the tear feel inevitable.
  The fluid knows what's coming.
```

---

## 04. PROJECT SHADER — THE RESOLVE (NeuroFin)

```glsl
uniforms:
  u_time:    float   /* elapsed */
  u_front:   float   /* 0→1 resolve front position, GSAP-driven */
  u_mouse:   vec2    /* normalized */

/* Screen fills with high-frequency amber noise */
/* Resolve front descends top-to-bottom */
/* Above front: smooth breathing amber — resolved */
/* Below front: still noise — processing */

noise() function: value noise, 6 octaves, 0.8 persistence
Noise frequency above: 0.02 (smooth)
Noise frequency below: 2.4 (granular)
Resolve front: smoothstep with 0.02 width (sharp but not hard)

Copper trace line:
  2px line at u_front position
  Color: #924000 copper
  Lingers 1.0s after front passes bottom
  Fades with easeOut over 1.0s
  This is the agent pipeline seam.

Colors:
  Resolved field: #B45309 amber, breathing via sin(u_time * 0.4)
  Noise field: #924000 copper-dark with high frequency noise
  Background: #0A0A0A

Text arrival:
  Triggered ONLY when u_front = 1.0 (fully resolved)
  GSAP fade-in, 0.6s, ease: power2.out
  Text was always true. System needed to process first.

Duration: 3.0 seconds for full resolve
Loop: after 8s pause, resets and resolves again (ambient loop)
```

---

## 05. PROJECT SHADER — THE THESIS (Equity Research)

```glsl
uniforms:
  u_time:    float
  u_front:   float   /* 0→1 left-to-right, GSAP-driven */
  u_snaps:   float[8] /* per-waveform snap progress */
  u_mouse:   vec2

/* 6 overlapping waveforms, each different frequency/amplitude */
/* Fighting each other in cold blue */

waveform_i = A_i * sin(freq_i * x + phase_i * u_time)

Pre-resolve: all 6 waveforms visible, chaotic, overlapping
Cold white resolution front: moves left-to-right
As front passes each waveform: individual snap to consensus line
Snaps are NOT simultaneous — staggered by 0-0.4s random offset
Last (thickest) waveform snaps last

Consensus line: y = 0 (center). Clean. Single. Certain.

Colors:
  Waveforms: #1E3A5F cold blue at varying opacities (0.3-0.8)
  Resolved: #94A3B8 steel — clean single line
  Front: rgba(240,245,255,0.6) cold white

Sound per snap (if enabled):
  Faint click: 2kHz, 20ms, each intermediate waveform
  Final snap: clear tone, 1.5kHz, 100ms
  Rhythm feels like a reasoning chain reaching conclusion.

Duration: 4.0 seconds
```

---

## 06. PROJECT SHADER — THE TERMINAL (Market Terminal)

```glsl
uniforms:
  u_time:    float
  u_layers:  float[3]   /* speed multipliers per layer */
  u_alert:   float      /* 0 or 1, fires every ~5s */

/* Three data layers at different depths */
/* The terminal NEVER STOPS */

Layer 0 (DuckDB — historical):
  Very slow scroll: u_time * 0.03
  Dense horizontal lines, near-static
  Opacity: 0.4
  Color: #003D2E dark terminal

Layer 1 (Options chain — medium):
  Medium scroll: u_time * 0.15
  Pulse pattern: sin(x * 20.0 + u_time * 2.0)
  Opacity: 0.65
  Color: #0AD09A phosphor dimmed

Layer 2 (Redis ticks — surface):
  Fast scroll: u_time * 0.8
  High frequency horizontal dashes
  Opacity: 0.9
  Color: #0AD09A phosphor bright

Alert (fires on fract(u_time * 0.2) < 0.02):
  Horizontal line brightens at y = 0.382 (38.2% — Fibonacci)
  Duration: 0.1s. Color: full phosphor #0AD09A.
  This is the alert engine firing its evaluation loop.

Build manifest (corner overlay — HTML, not GLSL):
  ████████████████████░░░░░  70%
  RUST CORE ··············· ✓
  FASTAPI LAYER ··········· ✓
  REDIS PIPELINE ·········· ✓
  DUCKDB SCHEMA ··········· ✓
  OPTIONS ENGINE ·········· ◌
  IV SURFACE ·············· ◌
  TAURI SHELL ············· ◌

Incomplete items do NOT disappear. A real system in progress.
```

---

## 07. DECRYPT MECHANIC

```javascript
/* Apply to: all project titles, manifesto lines, */
/* UNREASONABLE, capabilities words, email */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!?';

function decrypt(element, targetText, onComplete) {
  const duration = 800; // ms total
  const pass1End = 200; // ms — random cycling
  const pass2Duration = 600; // ms — left-to-right lock

  // Pass 1: all chars cycle randomly at 40fps
  let pass1Timer = setInterval(() => {
    element.textContent = targetText
      .split('')
      .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
      .join('');
  }, 25);

  setTimeout(() => {
    clearInterval(pass1Timer);
    
    // Pass 2: lock chars left to right
    const stagger = pass2Duration / targetText.length;
    targetText.split('').forEach((char, i) => {
      setTimeout(() => {
        // All chars before i are locked. Rest still cycling.
        const locked = targetText.slice(0, i + 1);
        const cycling = targetText.slice(i + 1)
          .split('')
          .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
          .join('');
        element.textContent = locked + cycling;
        
        // Sound: click per lock
        if (soundEnabled) playClick(i === targetText.length - 1 ? 'clack' : 'click');
        
        if (i === targetText.length - 1 && onComplete) onComplete();
      }, i * stagger);
    });
  }, pass1End);
}
```

---

## 08. COMMAND SYSTEM

```javascript
/* Full shell parser with path resolution */
/* Input: always accessible via '/' or CMD+K */

const COMMANDS = {
  'help':           () => renderHelp(),
  'whoami':         () => renderFile('/neel/identity.md'),
  'ls':             (args) => renderLS(args[0] || '/neel'),
  'ls /projects':   () => renderLS('/neel/projects'),
  'cd [path]':      (args) => navigate(args[0]),
  'run [project]':  (args) => executeProject(args[0]),
  'cat [file]':     (args) => renderFile(args[0]),
  'git log [proj]': (args) => renderGitLog(args[0]),
  'npm inspect [pkg]': (args) => renderPackage(args[0]),
  'open github':    () => window.open('https://github.com/Neel-Kachhadia', '_blank'),
  'open linkedin':  () => window.open('https://linkedin.com/in/neelkachhadia', '_blank'),
  'cat resume.pdf': () => downloadResume(),
  'ssh transmission': () => navigate('/transmission'),
  'debug on':       () => setMode('debug'),
  'debug off':      () => setMode('visitor'),
  'recruiter mode': () => setMode('recruiter'),
  'clear':          () => clearTerminal(),
  'sudo hire-neel': () => sudoHireNeel(),
};

/* sudo hire-neel sequence: */
function sudoHireNeel() {
  const lines = [
    '[sudo] password for visitor: ████████',
    'Checking permissions...',
    '...',
    'Permission granted.',
    'Initiating transmission channel...',
    'ssh neel@transmission connected.',
  ];
  renderLines(lines, 300); // 300ms between lines
  setTimeout(() => navigate('/transmission'), lines.length * 300 + 500);
}

/* Tab completion: */
/* Tab on partial command shows completions */
/* Tab on partial path resolves filesystem */

/* Command history: */
/* Arrow up/down navigates history */
/* Stored in localStorage, max 50 entries */

/* Error handling: */
/* Unknown command: "command not found: [input]" */
/* "type 'help' to see available commands" */
```

---

## 09. WHISPER SYSTEM

```javascript
/* Stored in Vercel KV */
/* Max 30 whispers total — new ones push old ones out */
/* Max 40 characters per whisper */
/* One whisper per IP (24h cooldown) */

/* Display: */
/* Shown in /logs section or capabilities section */
/* Floating comments at low opacity */
/* Drift slowly — GSAP random x,y motion, very subtle */
/* Format: */
/* // [whisper text]    [city · time ago] */

/* API route: POST /api/whisper */
/* Rate limited: 1 per IP per 24h */
/* Profanity filtered server-side */
/* No auth required */

/* Visual: */
/* JetBrains Mono XS */
/* opacity: 0.35 */
/* color: on black backgrounds — --text-on-black */
/* color: on off-white — --text-secondary */
```

---

## 10. CAPABILITIES — HORIZONTAL DRAG + SDF

```javascript
/* Physical momentum drag — NOT CSS scroll-snap */
/* Miranda mechanic: grab, drag, release with overshoot/settle */

State:
  isDragging: boolean
  startX: number
  currentX: number
  velocity: number   /* tracked over last 3 frames */
  
On mousedown/touchstart: isDragging = true, capture startX
On mousemove/touchmove: translate container by delta, track velocity
On mouseup/touchend: 
  Apply momentum: continue at velocity * 0.92 each frame
  Settle: when velocity < 0.5, stop

Bounds: soft bounce at edges (rubber-band effect)

/* SDF morphing — adjacent skills bleed at edges */
/* When two words are within 40px of each other: */
/* Their letterforms merge at the boundary */
/* CSS filter: blur(1px) on overlap zone */
/* Or: canvas-based SDF rendering for true bleed */

/* Parallax layers: */
/* Each word has data-depth: 0.2 to 1.8 */
/* Mouse parallax: word moves at depth * mouseOffset */
/* Creates sense of 3D space without WebGL */

/* SYSTEMS word: */
/* color: #F5F0E8 on #F5F0E8 background */
/* opacity: 0.05 — nearly invisible */
/* On cursor proximity (< 80px): opacity transitions to 0.9 */
/* Transition: 0.3s ease */
/* NOT on hover. On proximity. Use mouse position math. */
```

---

## 11. TRANSMISSION RIPPLE

```glsl
/* WebGL displacement on email text — Three.js plane */

uniforms:
  u_mouse:    vec2    /* cursor position relative to email element */
  u_time:     float
  u_hover:    float   /* 0→1 when cursor over email */

/* Ripple: displacement map from cursor position */
/* distance = length(uv - u_mouse_normalized) */
/* displacement = sin(distance * 20.0 - u_time * 3.0) * u_hover * 0.015 */
/* Sensuous. Not violent. Like heat on asphalt. */

On click:
  12 particles burst from click position
  Color: #C8F027 lime
  Initial velocity: random outward directions
  Gravity: slight downward pull
  Fade: opacity 1→0 over 0.6s
  Size: 3px circles
  Sound: 1047Hz sine, 200ms decay, -12dB
```

---

## 12. LIVE COUNTER

```javascript
/* Seeded from realistic base value */
/* Increments irregularly — real systems are not metronomic */

const BASE = 3847392; // seed value
const sessionStart = Date.now();

function getCount() {
  const elapsed = (Date.now() - sessionStart) / 1000; // seconds
  // Average: ~0.4 transactions/second with high variance
  const avgRate = 0.4;
  const noise = Math.sin(elapsed * 0.7) * 0.3 + Math.sin(elapsed * 1.3) * 0.2;
  return Math.floor(BASE + elapsed * avgRate * (1 + noise));
}

/* Last transaction time: */
/* Tracks last time counter incremented */
/* Shows "X:XX ago" counting up until next increment */
/* Resets to 0:00 when new increment fires */

/* Display format: */
/* 3,847,394        — large mono number */
/* last transaction  0:00:03 ago  — small mono below */
```

---

## 13. PROCESS MONITOR (SYSTEM HEALTH)

```javascript
/* Real values only. No faking. */

const monitor = {
  fps: () => {
    // rAF delta: track last 60 frames, average
    return Math.round(1000 / avgFrameDelta);
  },
  heap: () => {
    // performance.memory API (Chrome only, not Safari)
    if (performance.memory) {
      return Math.round(performance.memory.usedJSHeapSize / 1048576) + 'mb';
    }
    return '--';  // honest: not available
  },
  route: () => currentPath,           // actual filesystem path
  webgl: () => webglContext ? 'active' : 'inactive',
  motion: () => motionProfile,        // full / reduced / static
  audio: () => Tone.context.state === 'running' ? 'enabled' : 'muted',
  uptime: () => {
    const s = Math.floor((Date.now() - pageLoadTime) / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${String(h).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  },
  session: () => sessionCount,
};

/* Section-aware status lines: */
/* These replace lower 2 lines of health display */
/* Based on current scroll section */
const sectionStatus = {
  '/projects/neurofin':        ['project-runtime  active', 'case-study       mounted'],
  '/projects/equity':          ['project-runtime  active', 'thesis-shader    running'],
  '/projects/market-terminal': ['project-runtime  active', 'terminal         live'],
  '/transmission':             ['transmission     listening', 'contact          open'],
  '/logs':                     ['logs             readable', 'failures         honest'],
};
```

---

## 14. MOBILE — POCKET SHELL

```
/* Completely separate component tree for < 768px */
/* NOT responsive desktop. Different experience. */

Layout:
  Top bar:      NEEL.OS    ONLINE ●    (fixed)
  Path display: root@neel:~$           (below top bar)
  Content area: scrollable             (main)
  Bottom bar:   command row            (fixed)

Bottom command bar (tap, not type):
  [PROJECTS]  [STACK]  [LOGS]  [CONTACT]
  Secondary: [whoami]  [help]  [github]

No physics (Cannon-es disabled)
No continuous GLSL shaders (CSS gradient fallbacks)
No scan line (performance)
Reduced grain opacity: 0.015

WebGL: disabled entirely on < 768px
Use CSS custom properties for project world colors
Example NeuroFin fallback:
  background: linear-gradient(180deg, #0A0A0A 0%, #B45309 100%)

Decrypt mechanic: preserved (CSS + JS, no WebGL dependency)
Command input: available but keyboard shows only on explicit tap
Swipe left/right: navigates between filesystem sections

Recruiter mode: ONE TAP from any screen
Resume: always accessible from bottom bar
Contact: always one tap away
```

---

## 15. REDUCED MOTION

```javascript
/* Respect prefers-reduced-motion: reduce */
/* Also: user-toggleable [full] [reduced] [static] */

const MOTION_PROFILES = {
  full: {
    physics: true,
    shaders: true,
    scanLine: true,
    grain: true,
    decrypt: true,
    parallax: true,
    breathe: true,
  },
  reduced: {
    physics: false,    // letters appear without falling
    shaders: true,     // shaders still run (lower iteration)
    scanLine: false,
    grain: true,       // opacity: 0.015
    decrypt: true,     // but faster: 400ms total
    parallax: false,
    breathe: false,    // font weight stays at 500
  },
  static: {
    physics: false,
    shaders: false,    // CSS gradient fallbacks
    scanLine: false,
    grain: false,
    decrypt: false,    // text appears directly
    parallax: false,
    breathe: false,
  },
};

/* All content remains in all modes. */
/* Navigation remains. Commands remain. */
/* Nothing is hidden. Only motion is reduced. */
```
