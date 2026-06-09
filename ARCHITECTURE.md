# NEEL.OS — ARCHITECTURE
## Component tree, routing, data flow, and technical decisions

---

## DIRECTORY STRUCTURE

```
neel-os/
├── app/
│   ├── layout.tsx              # Root layout — Lenis, GSAP, fonts, grain
│   ├── page.tsx                # Main experience (Visitor mode)
│   ├── globals.css             # CSS custom properties, reset
│   ├── not-found.tsx           # Kernel Panic 404
│   └── api/
│       ├── query/
│       │   └── route.ts        # Groq API — server-side only
│       ├── whisper/
│       │   └── route.ts        # Vercel KV whispers
│       └── session/
│           └── route.ts        # Session tracking
│
├── components/
│   ├── core/
│   │   ├── Grain.tsx           # Canvas film grain overlay
│   │   ├── ScanLine.tsx        # CRT scan line
│   │   ├── Cursor.tsx          # Satellite orbit cursor
│   │   ├── SystemHealth.tsx    # Bottom-right monitor
│   │   ├── ModeSwitcher.tsx    # VISITOR/RECRUITER/DEBUG
│   │   ├── PathIndicator.tsx   # root@neel:/path $
│   │   └── FilesystemSidebar.tsx # /neel directory tree
│   │
│   ├── sections/
│   │   ├── Boot.tsx            # Boot sequence + sound gate
│   │   ├── Hero.tsx            # Physics letters + fluid
│   │   ├── Manifesto.tsx       # Scroll-triggered lines
│   │   ├── Unreasonable.tsx    # Lime word, full viewport
│   │   ├── Counter.tsx         # Live transaction counter
│   │   ├── Tear.tsx            # Velocity-threshold tear
│   │   ├── Projects/
│   │   │   ├── ProjectShell.tsx   # run command + execution output
│   │   │   ├── NeuroFin.tsx       # Amber resolve shader world
│   │   │   ├── Equity.tsx         # Cold blue thesis shader world
│   │   │   └── MarketTerminal.tsx # Phosphor terminal shader world
│   │   ├── Identity.tsx        # /identity.md reader
│   │   ├── Logs.tsx            # growth/failures/shipping logs
│   │   ├── Stack.tsx           # Package manager
│   │   ├── Capabilities.tsx    # Horizontal drag + SDF
│   │   ├── AskNeel.tsx         # Groq streaming chat
│   │   ├── Whispers.tsx        # Visitor comments
│   │   └── Transmission.tsx    # SSH contact
│   │
│   ├── modes/
│   │   ├── RecruiterPanel.tsx  # Fast recruiter view
│   │   └── DebugOverlay.tsx    # Debug mode overlay
│   │
│   ├── mobile/
│   │   ├── PocketShell.tsx     # Mobile root
│   │   ├── BottomBar.tsx       # Tab commands
│   │   └── MobileProject.tsx   # Mobile project view
│   │
│   └── webgl/
│       ├── WebGLContext.tsx     # Single renderer, shared
│       ├── HeroFluid.tsx       # Fluid shader scene
│       ├── LetterPhysics.tsx   # Cannon-es + Three.js letters
│       ├── TearShader.tsx      # Voronoi displacement
│       ├── ResolveShader.tsx   # NeuroFin amber world
│       ├── ThesisShader.tsx    # Equity cold blue world
│       ├── TerminalShader.tsx  # Market phosphor world
│       └── TransmissionRipple.tsx # Email displacement
│
├── shaders/
│   ├── hero-fluid.frag         # Ink in water simulation
│   ├── hero-fluid.vert         # Full-screen quad
│   ├── tear.frag               # Voronoi crack displacement
│   ├── tear.vert
│   ├── resolve.frag            # Noise → clarity top-down
│   ├── resolve.vert
│   ├── thesis.frag             # Waveform chaos → signal
│   ├── thesis.vert
│   ├── terminal.frag           # Three-layer phosphor depth
│   ├── terminal.vert
│   └── ripple.frag             # Contact email displacement
│
├── lib/
│   ├── lenis.ts                # Lenis singleton
│   ├── gsap.ts                 # GSAP registration + defaults
│   ├── audio.ts                # Tone.js + Howler setup
│   ├── session.ts              # localStorage session management
│   ├── decrypt.ts              # Decrypt animation utility
│   ├── commands.ts             # Shell command parser
│   ├── filesystem.ts           # Virtual filesystem structure
│   └── counter.ts              # Live counter logic
│
├── hooks/
│   ├── useWebGL.ts             # WebGL context access
│   ├── useScrollVelocity.ts    # Lenis velocity tracking
│   ├── useMotionProfile.ts     # Reduced motion detection
│   ├── useSession.ts           # Session state
│   └── useMode.ts              # Visitor/Recruiter/Debug state
│
└── public/
    └── fonts/
        ├── EditorialNew-Variable.woff2
        ├── JetBrainsMono-Regular.woff2
        ├── JetBrainsMono-Bold.woff2
        └── Sohne-Regular.woff2
```

---

## WEBGL ARCHITECTURE — CRITICAL

```typescript
// Single renderer shared across ALL scenes
// Lusion sync method — prevents rAF/scroll desync

// lib/webgl-context.ts
class WebGLContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  
  // All shader uniforms registered here
  uniforms: {
    heroFluid: HeroFluidUniforms;
    tear: TearUniforms;
    resolve: ResolveUniforms;
    thesis: ThesisUniforms;
    terminal: TerminalUniforms;
    ripple: RippleUniforms;
  };
  
  // Single rAF loop
  tick(time: number) {
    // Update all active uniforms
    // Render active scene only
    // Feed Lenis scroll value to GSAP
    // GSAP drives shader uniforms
  }
}

// Lenis → GSAP → uniforms pipeline:
lenis.on('scroll', ({ velocity, progress }) => {
  gsap.to(webgl.uniforms.tear, { 
    velocity,
    duration: 0.016  // one frame
  });
});
```

---

## ROUTING — VIRTUAL FILESYSTEM

```typescript
// No Next.js routing for internal navigation
// Virtual filesystem drives scroll position

// lib/filesystem.ts
const FILESYSTEM = {
  '/neel':                        { scrollTo: '#hero',         label: '~' },
  '/neel/identity':               { scrollTo: '#identity',     label: 'identity.md' },
  '/neel/projects':               { scrollTo: '#projects',     label: '/projects' },
  '/neel/projects/neurofin':      { scrollTo: '#neurofin',     label: 'neurofin' },
  '/neel/projects/equity':        { scrollTo: '#equity',       label: 'equity-research' },
  '/neel/projects/market':        { scrollTo: '#market',       label: 'market-terminal' },
  '/neel/stack':                  { scrollTo: '#stack',        label: '/stack' },
  '/neel/logs':                   { scrollTo: '#logs',         label: '/logs' },
  '/neel/capabilities':           { scrollTo: '#capabilities', label: '/capabilities' },
  '/neel/transmission':           { scrollTo: '#transmission', label: 'transmission' },
};

function navigate(path: string) {
  const target = FILESYSTEM[path];
  if (!target) { showError(path); return; }
  
  // Update path indicator
  setCurrentPath(path);
  
  // Update localStorage
  localStorage.setItem('neel_os_last_path', path);
  
  // Scroll via Lenis
  lenis.scrollTo(target.scrollTo, { duration: 1.2, ease: 'power2.inOut' });
  
  // Update system health route
  updateSystemHealth({ route: path });
}
```

---

## SESSION SYSTEM

```typescript
// lib/session.ts

interface Session {
  count: number;           // how many times visited
  lastPath: string;        // where they left off
  soundEnabled: boolean;   // their audio choice
  motionProfile: 'full' | 'reduced' | 'static';
  mode: 'visitor' | 'recruiter' | 'debug';
  commandHistory: string[]; // last 50 commands
  firstVisit: number;      // timestamp
  lastVisit: number;       // timestamp
}

const SESSION_KEY = 'neel_os_session';

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function initSession(): Session {
  const existing = getSession();
  
  if (existing) {
    // Return visit
    const updated = {
      ...existing,
      count: existing.count + 1,
      lastVisit: Date.now(),
    };
    saveSession(updated);
    return updated;
  }
  
  // First visit
  const fresh: Session = {
    count: 1,
    lastPath: '/neel',
    soundEnabled: false,  // always start muted
    motionProfile: 'full',
    mode: 'visitor',
    commandHistory: [],
    firstVisit: Date.now(),
    lastVisit: Date.now(),
  };
  saveSession(fresh);
  return fresh;
}

// Boot behavior based on session:
// session.count === 1: full boot sequence
// session.count > 1: skip to hero, show resume prompt
```

---

## API ROUTES

### Groq Query — /api/query
```typescript
// app/api/query/route.ts
import Groq from 'groq-sdk';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// GROQ_API_KEY — server-side env only. Never NEXT_PUBLIC_.

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response('Rate limit exceeded', { status: 429 });
  
  const { query } = await req.json();
  
  // Stream response
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT }, // from CONTENT.md
      { role: 'user', content: query }
    ],
    stream: true,
    max_tokens: 400,
    temperature: 0.3,  // lower = more precise = better for tech answers
  });
  
  return new Response(stream.toReadableStream());
}
```

### Whispers — /api/whisper
```typescript
// POST: add whisper (rate limited: 1 per IP per 24h)
// GET: fetch all whispers (max 30)

// Stored in Vercel KV
// Key: 'whispers' — array of { text, city, timestamp }
// On POST: prepend new, trim to 30, save
// City: resolved from IP geolocation (approximate only)
```

---

## ENVIRONMENT VARIABLES

```bash
# .env.local — NEVER commit to git

# Groq API — server-side ONLY
GROQ_API_KEY=gsk_...

# Vercel KV — for whispers
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# NEVER add NEXT_PUBLIC_ prefix to any secret
# NEXT_PUBLIC_ variables are exposed to the client bundle
```

---

## PERFORMANCE ARCHITECTURE

```typescript
// Critical path: < 250kb JS
// Strategy: aggressive code splitting

// Phase 1 (critical — loads first):
// - Boot sequence (no WebGL)
// - Sound gate
// - Session check
// - Font loading
// Total target: ~80kb

// Phase 2 (hero — lazy loaded after boot):
// - Three.js + hero shader
// - Cannon-es + letter physics
// - GSAP + ScrollTrigger
// Total target: ~120kb

// Phase 3 (project worlds — lazy loaded on approach):
// - Project shaders (each lazy loaded when section nears viewport)
// - IntersectionObserver triggers preload 500px before entry
// Total per shader: ~15kb (GLSL is small)

// Phase 4 (features — lazy loaded on demand):
// - Tone.js audio (only if sound enabled)
// - Groq chat interface (only if /query section reached)
// Total: ~60kb

// WebGL context: single renderer
// Never create multiple WebGL contexts

// Fonts: preloaded in <head>
// <link rel="preload" as="font" href="/fonts/EditorialNew-Variable.woff2" crossorigin>
// <link rel="preload" as="font" href="/fonts/JetBrainsMono-Regular.woff2" crossorigin>
// <link rel="preload" as="font" href="/fonts/Sohne-Regular.woff2" crossorigin>

// Images: none. Shaders and CSS only.
// Zero image requests.
```

---

## MOBILE ARCHITECTURE

```typescript
// Completely separate component tree
// Detected at: typeof window !== 'undefined' && window.innerWidth < 768
// Or: CSS media query in root layout

// Mobile renders: <PocketShell />
// Desktop renders: <DesktopExperience />

// PocketShell features:
// - No Three.js (zero WebGL)
// - No Cannon-es physics
// - No scan line
// - CSS gradient project world backgrounds
// - Bottom navigation bar (tap-friendly 44px targets)
// - Swipe gestures between sections
// - Command input accessible but not primary
// - Recruiter mode one tap from anywhere
// - All content accessible — no feature hiding, only motion reduction

// Performance targets for mobile:
// First Contentful Paint: < 0.8s
// Time to Interactive: < 1.5s
// Lighthouse performance (mobile): 90+
```

---

## DEBUG MODE ARCHITECTURE

```typescript
// components/modes/DebugOverlay.tsx
// Renders when mode === 'debug'

interface DebugData {
  // Real-time
  fps: number;
  heap: string;
  webglActive: boolean;
  
  // Route
  currentRoute: string;
  scrollProgress: number;
  
  // Motion
  motionProfile: string;
  prefersReducedMotion: boolean;
  
  // Performance budget
  jsBundle: string;
  webglTextures: number;
  activeShaders: number;
  
  // Accessibility
  focusVisible: boolean;
  colorContrast: 'pass' | 'warn' | 'fail';
  
  // Tech decisions (static, read from config)
  techDecisions: Array<{
    technology: string;
    decision: string;
    reason: string;
  }>;
}

// Tech decisions shown in debug mode:
const TECH_DECISIONS = [
  {
    technology: 'Three.js (single context)',
    decision: 'One WebGL renderer for all scenes',
    reason: 'Multiple contexts cause GPU resource exhaustion. Lusion sync method prevents rAF/scroll desync.',
  },
  {
    technology: 'Cannon-es (physics)',
    decision: 'Rigid body simulation for hero letters',
    reason: 'CSS transitions are deterministic. Physics makes every load unique. The randomness IS the design.',
  },
  {
    technology: 'Groq (llama-3.3-70b)',
    decision: 'Server-side streaming chat',
    reason: 'Sub-second first token. Speed = system responding, not model thinking. Rate limited to prevent abuse.',
  },
  {
    technology: 'Lenis + GSAP sync',
    decision: 'Lenis scroll → GSAP → shader uniforms',
    reason: 'Native scroll runs off main thread. rAF runs on main thread. Without sync, WebGL and scroll desync on fast scrolls.',
  },
  {
    technology: 'GLSL fragment shaders',
    decision: 'Pure shader project visuals — no 3D models',
    reason: 'One draw call per scene. Deterministic 60fps. The behavior of each system IS the shader — not a metaphor for it.',
  },
];
```

---

## SOUND ARCHITECTURE

```typescript
// lib/audio.ts
// Tone.js for synthesis. Howler.js for any samples.
// All audio opt-in. Never autoplay.

// Sound map:
const SOUNDS = {
  bootChime: {
    type: 'synth',
    frequency: 880,
    duration: 0.06,
    envelope: { attack: 0.005, decay: 0.055, sustain: 0, release: 0 },
  },
  decryptClick: {
    type: 'synth', 
    frequency: 1200,
    duration: 0.02,
    envelope: { attack: 0.001, decay: 0.019, sustain: 0, release: 0 },
  },
  decryptClack: {
    type: 'synth',
    frequency: 800,
    duration: 0.08,
    envelope: { attack: 0.002, decay: 0.078, sustain: 0, release: 0 },
  },
  tearBoom: {
    type: 'synth',
    frequency: 40,
    duration: 1.2,
    envelope: { attack: 0.05, decay: 1.15, sustain: 0, release: 0 },
    volume: -6,  // felt, not heard
  },
  contactChime: {
    type: 'synth',
    frequency: 1047,
    duration: 0.2,
    envelope: { attack: 0.01, decay: 0.19, sustain: 0, release: 0 },
    volume: -12,
  },
  
  // Ambient drones (Tone.js oscillators, continuous)
  neurofinDrone: {
    type: 'oscillator',
    frequency: 55,
    type: 'sine',
    volume: -24,
    modulation: { rate: 0.1, depth: 3 },  // slow wobble
  },
  equityPing: {
    type: 'interval',
    frequency: 2000,
    interval: () => 2000 + Math.random() * 3000,  // irregular
    volume: -30,
  },
  terminalNoise: {
    type: 'noise',
    noiseType: 'white',
    filter: { type: 'bandpass', frequency: 800, Q: 2 },
    volume: -36,
  },
};

// Audio lifecycle:
// 1. Gate: user chooses [y] or [n]
// 2. If [y]: Tone.context.resume() (requires user gesture)
// 3. Sections fade drones in/out via IntersectionObserver
// 4. Discrete sounds fire on interactions
// 5. Sound toggle always available in system health
```

---

## WHISPER DISPLAY

```typescript
// components/sections/Whispers.tsx
// Shown in /logs section or capabilities section
// Floating comments, drifting slowly

interface Whisper {
  text: string;
  city: string;
  timestamp: number;
}

// Display: JetBrains Mono XS
// Format: // {text}    [{city} · {timeAgo}]
// Opacity: 0.35
// Position: absolute, random within container
// Motion: GSAP random drift
//   x: ±20px over 8-15s (random duration)
//   y: ±10px over 6-12s (random duration)
//   Both loop with yoyo: true, ease: 'sine.inOut'
// On hover: opacity to 0.8, drift pauses

// Add whisper UI:
// Below the log entries, small:
// [+ leave a note]
// On click: input appears, 40 char max, submit
// After submit: "noted." appears, input disappears
// Rate limit feedback: "one whisper per day"
```
