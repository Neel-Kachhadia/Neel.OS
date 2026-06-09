# NEEL.OS — DESIGN SYSTEM
## Every color, font, token, spacing, and visual rule

---

## COLOR TOKENS

```css
/* BACKGROUNDS */
--black:        #0A0A0A;   /* boot, sound gate, transmission, 404 */
--offwhite:     #F5F0E8;   /* hero, manifesto, identity, stack */

/* ACCENT — USED PRECISELY */
--lime:         #C8F027;   /* UNREASONABLE + "unreasonable" in contact */
                            /* APPEARS EXACTLY TWICE. NOWHERE ELSE. */
--online:       #4AFF91;   /* ONLINE indicator + system health only */

/* PROJECT WORLDS */
--amber:        #B45309;   /* NeuroFin primary */
--copper:       #924000;   /* NeuroFin secondary */
--cold-blue:    #1E3A5F;   /* Equity Research primary */
--steel:        #94A3B8;   /* Equity Research secondary */
--phosphor:     #0AD09A;   /* Market Terminal primary (dimmed in shader) */
--terminal-bg:  #003D2E;   /* Market Terminal secondary */

/* TYPOGRAPHY COLORS */
--text-primary:   #0A0A0A;   /* on off-white backgrounds */
--text-secondary: rgba(10,10,10,0.5); /* on off-white, secondary info */
--text-mono:      #0A0A0A;   /* mono text on off-white */
--text-on-black:  #F5F0E8;   /* on black backgrounds */
--text-mono-dark: rgba(245,240,232,0.7); /* mono text on black, secondary */

/* GRAIN */
--grain-opacity: 0.025;    /* film grain overlay — always present */
```

---

## TYPOGRAPHY

### Fonts
```
Editorial New    — variable weight wght 200-800
                   Display text only
                   Hero name, manifesto, UNREASONABLE, project titles
                   Contact email

JetBrains Mono   — all terminal/mono text
                   Boot sequence, shell prompts, counters, system health
                   Command input, project execution output, all data

Söhne            — body copy ONLY
                   /identity.md prose, project descriptions, log entries
                   Nothing else
```

### Type Scale
```
Display XL:   clamp(80px, 12vw, 160px)   Editorial New   /* hero name */
Display L:    clamp(48px, 7vw, 96px)     Editorial New   /* UNREASONABLE */
Display M:    clamp(32px, 5vw, 64px)     Editorial New   /* project titles */
Display S:    clamp(24px, 3.5vw, 40px)   Editorial New   /* manifesto lines */
Contact:      clamp(32px, 6vw, 80px)     Editorial New   /* email address */

Mono L:       16px / 1.6                 JetBrains Mono  /* boot, shell */
Mono M:       13px / 1.5                 JetBrains Mono  /* counters, health */
Mono S:       11px / 1.4                 JetBrains Mono  /* labels, paths */
Mono XS:      9px / 1.3                  JetBrains Mono  /* process monitor */

Body:         18px / 1.7                 Söhne           /* prose only */
Body S:       15px / 1.6                 Söhne           /* secondary prose */
```

### Variable Weight — Hero Only
```css
/* Hero name breathes constantly — never stops */
animation: breathe 4s ease-in-out infinite;

@keyframes breathe {
  0%, 100% { font-variation-settings: 'wght' 300; }
  50%       { font-variation-settings: 'wght' 800; }
}
```

---

## SPACING SYSTEM

```css
--space-xs:   4px
--space-s:    8px
--space-m:    16px
--space-l:    32px
--space-xl:   64px
--space-2xl:  128px
--space-3xl:  256px

/* Section padding */
--section-pad-x: clamp(24px, 5vw, 80px);
--section-pad-y: clamp(80px, 12vh, 160px);
```

---

## GRAIN OVERLAY

```css
/* Canvas-based film grain — always present, all sections */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: var(--grain-opacity); /* 0.025 */
}

/* Canvas generates new noise pattern every 150ms via rAF */
/* NOT a static PNG. Moving grain. Subtle. */
```

---

## CRT SCAN LINE

```css
/* 1px horizontal line scanning top-to-bottom — always, never stops */
.scan-line {
  position: fixed;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.025);
  pointer-events: none;
  z-index: 9998;
  /* During boot: rgba(255,255,255,0.08) — system warming up */
  /* After hero loads: rgba(255,255,255,0.025) — running */
}

/* Animated via GSAP: 
   gsap.fromTo('.scan-line',
     { top: '0%' },
     { top: '100%', duration: 6, ease: 'none', repeat: -1 }
   )
*/
```

---

## CUSTOM CURSOR

```
/* Canvas RAF cursor — satellite orbit mechanic */

Default state:
  Inner dot:    8px circle, white, opacity 0.9
  Orbit ring:   24px circle stroke, white 0.3, rotating 0.8rpm
  
On hover (interactive elements):
  Inner dot:    expands to 12px
  Orbit ring:   expands to 40px, opacity 0.6
  Rotation:     accelerates to 2rpm
  Magnetic pull: begins 60px from element center
  
On hover (project worlds):
  Orbit ring fill: project accent color
  NeuroFin: --amber. Equity: --cold-blue. Terminal: --phosphor.
  
On hover (email/contact):
  Label appears inside orbit: "COPY" in 8px mono
  
On the deploy/slash mechanic:
  Cursor transforms to horizontal blade shape
  Width: 32px. Height: 2px.
  
On void (no interaction):
  Just orbits. Slow scale pulse 1.0→1.08 on 2s sine.
  The system is always running.
  
Click:
  Inner dot contracts to 4px instantly, snaps back.
  Physical feedback.
```

---

## SYSTEM HEALTH MONITOR

```
/* Bottom-right. Always visible. JetBrains Mono XS. */
/* --text-on-black at 0.5 opacity on black sections */
/* --text-secondary at 0.4 opacity on off-white sections */

SYSTEM HEALTH
render     stable
fps        60
audio      muted
motion     full
session    01

/* Values update in real time: */
/* fps: real rAF delta calculation */
/* audio: reflects actual Tone.js context state */
/* motion: reflects CSS media query + user preference */
/* session: from localStorage */

/* State changes per section: */
/* On project world:    project-runtime  active */
/*                      case-study       mounted */
/* On transmission:     transmission     listening */
/*                      contact          open */
```

---

## MODE SWITCHER

```
/* Top-right. Always visible. JetBrains Mono S. */

MODE: [VISITOR] [RECRUITER] [DEBUG]

/* Active mode: no bracket styling change — underline only */
/* Inactive: opacity 0.5 */
/* Hover: opacity 1.0 */
/* Transition: 0.15s ease */

/* VISITOR:   default — full experience */
/* RECRUITER: simplified panel, no WebGL, no physics */
/* DEBUG:     overlays component bounds, FPS, tech decisions */
```

---

## DECRYPT ANIMATION

```
/* Applies to: project titles, manifesto lines, UNREASONABLE, */
/* capabilities words, email in transmission */

Pass 1 (0-200ms):
  Random ASCII chars cycling at 40fps
  Character pool: [A-Z0-9@#$%^&*!?/\|<>{}[]]
  
Pass 2 (200-800ms):
  Characters lock left-to-right
  Each char locks individually with 50ms stagger
  Sound: soft mechanical click per character lock
  Final character: definitive CLACK sound

Total: 800ms

/* CSS custom property approach: */
/* data-decrypt="NEUROFIN" on element */
/* JS reads data attribute, runs decrypt sequence */
/* No library. Custom implementation. */
```

---

## PAGE TRANSITIONS

```
Between sections (scroll-driven, not routed):
  No color wipes between sections of same color family.
  
The ONE major transition: The Tear
  Velocity threshold: scroll delta > 40px/frame
  GLSL displacement: Voronoi crack from (60% x, 45% y)
  Duration: 1.0s total (0.4s crack + 0.6s reveal)
  
Section fades (for soft transitions):
  GSAP timeline. 0.8s. ease: "power2.inOut"
  
Route changes (if any):
  Background color panel wipe: 0.3s
  New section reveals beneath.
```

---

## LAYOUT RULES

```
/* No nav bar. No hamburger menu. */
/* Navigation = filesystem tree */

/* Filesystem sidebar */
Position: fixed left. Always visible in shell.
Width: 200px on desktop. Hidden (accessible via command) on mobile.
Font: JetBrains Mono XS.
Color: --text-on-black at 0.4 opacity.
Active path: opacity 1.0, --online color dot.

/* Path indicator */
Position: fixed bottom-left.
Font: JetBrains Mono XS.
Format: root@neel:/current/path $
Color: --text-on-black at 0.6 opacity on black
       --text-secondary at 0.4 opacity on off-white

/* Content areas */
Max-width: 1400px. Centered. 
Padding: var(--section-pad-x) horizontal.

/* Z-index stack */
WebGL canvas:        0
Content:             10
Filesystem sidebar:  20
Mode switcher:       30
System health:       30
Path indicator:      30
Scan line:           9998
Grain overlay:       9999
Cursor:              10000
```

---

## RESPONSIVE BREAKPOINTS

```css
/* Mobile: < 768px — NEEL.OS Pocket Shell */
/* Tablet: 768px–1024px — simplified desktop */  
/* Desktop: > 1024px — full experience */

/* Mobile is a DIFFERENT component tree */
/* Not media queries applied to desktop layout */
/* See ARCHITECTURE.md for component structure */
```

---

## VISUAL RULES — NON-NEGOTIABLE

1. Lime #C8F027 appears EXACTLY TWICE. UNREASONABLE + "unreasonable".
2. #4AFF91 appears ONLY as ONLINE indicator and system health values.
3. No border-radius on any element. Zero. The system has edges.
4. No box shadows. Depth comes from color and contrast only.
5. No gradients in UI chrome. Gradients only inside GLSL shaders.
6. No icons. No emojis. Text and geometry only.
7. No placeholder images. No stock photography. Shaders ARE the visuals.
8. Grain is always present. 0.025 opacity. Moving, not static.
9. Scan line is always present. Never on mobile (performance).
10. Every transition has a reason. If you cannot state the reason, cut it.
