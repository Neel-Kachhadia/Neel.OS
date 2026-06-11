# NEEL.OS — COMPLETE DEFINITIVE PROMPT v5.0
## Every decision from every conversation. The final word.

---

## THE CONCEPT — LOCKED FOREVER

NEEL.OS is a living developer runtime.
Visitors do not browse. They log into a system.
The portfolio is not about Neel. It IS Neel — running.

**The three proof moments replace all description:**
The site does not say "I build AI systems."
It shows three AI systems running. In front of you. Right now.
That is the argument. That is everything.

**The exit feeling:**
"I just accessed a system that was running before I arrived.
It will keep running after I leave.
And it was built by someone who is 19."

---

## WHAT HAS BEEN REMOVED — PERMANENT DECISIONS

These are gone. Do not bring them back. Do not reference them.

```
REMOVED:   Cannon-es physics (hero letters falling)
REMOVED:   HeroFluid / hero-fluid.frag (WebGL fluid on hero)
REMOVED:   Manifesto section (scroll-triggered lines)
REMOVED:   UNREASONABLE screen (full viewport lime word)
REMOVED:   Lenis smooth scroll (no scroll = no Lenis)
REMOVED:   ScrollTrigger (no scroll)
REMOVED:   The Tear mechanic (was tied to scroll)
REMOVED:   Live counter section (standalone)
REMOVED:   "press / to open terminal" hint
REMOVED:   Scroll-based navigation entirely
```

**Why UNREASONABLE was removed:**
The word described what the three projects demonstrate.
The projects demonstrate it better than any word can.
Showing is the argument. Telling weakened it.

**The lime rule — updated:**
#C8F027 appears EXACTLY ONCE in the entire site.
Transmission.tsx only: "Let's build something unreasonable."
The word "unreasonable" — lowercase, in that line, once.
That single word now carries everything.
Never use #C8F027 anywhere else. Ever.

---

## THE ARCHITECTURE — STATE MACHINE, NOT SCROLL

The entire site is a terminal state machine.
No scrolling. No sections stacked vertically.
One viewport. One state at a time.

```typescript
type TerminalState =
  | 'boot'
  | 'sound-gate'
  | 'terminal-root'
  | 'neurofin'
  | 'equity'
  | 'market'
  | 'identity'
  | 'logs'
  | 'stack'
  | 'capabilities'
  | 'transmission'
```

**State transitions use GSAP:**
- Exit: opacity 0, 200ms
- Color flash: destination accent, 50ms
- Enter: opacity 1, 200ms
- Total: ~500ms

**No Lenis. No ScrollTrigger. No scroll.**
Navigation = setState(). Not scrollTo().

---

## THE STACK — FINAL

```
Framework:      Next.js 14 (App Router)
Animations:     GSAP 3.x (transitions only — no ScrollTrigger)
WebGL:          Three.js r160 + custom GLSL shaders
                Lazy-initialized. Only when needed.
                Single context shared across all scenes.
Audio:          Tone.js (synthesis — no audio files ever)
                Opt-in only. Sound gate every session.
Cursor:         Canvas RAF loop — satellite orbit
Command system: Custom parser — lib/commands.ts
AI Chat:        Groq API — llama-3.3-70b-versatile
                Server-side ONLY. Rate limited 10/IP/hour.
                NEVER NEXT_PUBLIC_.
Data cache:     Vercel KV (NOT in-memory Map)
                Quote data: 15min TTL
                Historical charts: 5-30min TTL
Session:        localStorage
Fonts:          Editorial New (variable wght 200-800)
                  — project titles, transmission email ONLY
                JetBrains Mono — everything terminal
                Söhne — identity.md prose only
                All preloaded. Zero FOUT.
Deployment:     Vercel
Performance:    60fps locked. Non-negotiable.
                Lighthouse 95+.
                Initial JS ≤ 165kb.
```

---

## THE BOOT SEQUENCE — UNCHANGED, CORRECT

```
NEEL.OS v1.0.0  [kernel 6.1.0-neel · Mumbai]
──────────────────────────────────────────────────────────
[    {t+0.272}] Initializing cgroup subsys cpuset
[    {t+0.361}] NEEL.OS kernel loading
[    {t+0.459}] Loading identity module................. [OK]
[    {t+0.541}] Mounting project filesystem............. [OK]
[    {t+0.634}] Connecting to live data streams......... [OK]
[    {t+0.442}] Calibrating WebGL context............... [OK]
[    {t+0.521}] Starting audio daemon (muted)........... [OK]
[    {t+0.601}] Loading /neel/README.md.................. [OK]
[    {t+0.724}] Booting interface....................... [OK]
──────────────────────────────────────────────────────────
NEEL.OS login: root
Password: ████████

Welcome. Last login: never.
Session {n}.
──────────────────────────────────────────────────────────

This is NEEL.OS.
A living portfolio runtime by Neel Kachhadia.

Use the filesystem to inspect projects,
stack, logs, and transmission.

Type help anytime.
──────────────────────────────────────────────────────────

enable system audio?

[y]  [n]
```

**Boot rules:**
- Timestamps: real performance.now() values. Always.
- [OK] tags: #4AFF91. Never white.
- Background: #0A0A0A throughout. No color change.
- Sound gate: SAME black screen as boot. No transition.
- soundEnabled: NEVER persisted. Reset every session.
- Sound gate: appears EVERY session. Not just first visit.
- Selection dot: #4AFF91 appears on chosen option.
- 300ms pause after selection. Then HARD CUT to terminal root.
- Hard cut = instantaneous. No CSS transition. No fade. A cut.
- [start fresh]: replays full boot from line 1.
- Return visit: "Session restored from cache" + session count.
  Still shows sound gate. Still shows [yes]/[start fresh].

**Boot sounds (if enabled):**
- Each [OK] line: rising pitch sequence
  Line 1: 880Hz, 30ms
  Line 2: 930Hz, 30ms
  Line 3: 980Hz, 30ms
  Line 4: 1047Hz, 30ms
  Line 5+: 1047Hz (holds)
- "System ready" / terminal appears: clean chord
  Three notes: C4 + E4 + G4, 100ms, -16dB

---

## THE TERMINAL ROOT — THE HERO

After boot + sound gate: full terminal viewport.
Background: #0A0A0A.
Font: JetBrains Mono throughout. No exceptions.

**Layout:**

```
[sidebar 200px] [content area — paddingLeft: calc(200px + 24px)]

Content:
  NEEL.OS v1.0.0  ·  kernel 6.1.0-neel  ·  Mumbai
  ──────────────────────────────────────────────────────
  
  [LEFT COLUMN 480px]      [│ divider]  [RIGHT COLUMN flex]
  
  NEEL KACHHADIA (16px)               AVAILABLE COMMANDS
  ──────────────────────              ──────────────────────
  B.Tech · DJSCE · 2024-28
                                      PROJECTS
  Building systems.                   run neurofin
  Shipping fast.                      run equity
  Mumbai.                             run market

  SYSTEMS                             EXPLORE
  ● neurofin    [LIVE]                cat identity.md
  ● equity      [LIVE]                /logs
  ◌ market      [70%]                 /stack
                                      /capabilities
  ACHIEVEMENTS
  ◆ Amazon AI Challenge               CONTACT
    top 300 · 115 countries           ssh transmission
  ◆ Mumbai Hacks 2024                 cat resume.pdf
    3K teams                          open github
                                      open linkedin
  ONLINE ●  uptime: {HH:MM:SS}
                                      sudo hire-neel

  ──────────────────────────────────────────────────────
  root@neel:~$ _
```

**Sizing:**
- Everything: JetBrains Mono 13px
- Name: 16px, full opacity
- Section labels (SYSTEMS, ACHIEVEMENTS, PROJECTS etc): 11px, 0.45 opacity
- Command names: 13px, full opacity, cursor pointer
- Command hover: color → #4AFF91
- Divider │: rgba(245,240,232,0.15)
- Header dividers ──: rgba(245,240,232,0.15)
- Uptime: #4AFF91, counts from 00:00:00 since page load

**Commands are clickable.**
Click = same as typing the command.

**Input line (fixed bottom):**
- 1px border-top: rgba(245,240,232,0.12)
- padding: 12px 48px
- fontSize: 14px
- "root@neel:~$" prompt + input element
- Input: transparent, no border, caretColor #F5F0E8
- cursor: none on html/body (custom cursor handles it)

**"press / to open terminal" — REMOVED.**
The terminal IS the hero. This hint must not exist anywhere.

---

## COMMAND EXECUTION — THE TRANSITION MECHANIC

When any command executes (typed OR clicked):

**STEP 1:** Command appears in output area
```
root@neel:~$ run neurofin
```

**STEP 2:** Destination boot lines (80ms stagger, rising pitch)
```
run neurofin:
[BOOT] Loading NeuroFin runtime.......... [OK]  ← 880Hz
[BOOT] Mounting LangGraph pipeline....... [OK]  ← 930Hz
[BOOT] Connecting live data streams...... [OK]  ← 980Hz
[BOOT] Opening case study................ [OK]  ← 1047Hz
Launching neurofin...                           ← chord

run equity:
[BOOT] Loading Equity Research runtime... [OK]
[BOOT] Mounting LangGraph chain.......... [OK]
[BOOT] Connecting market data streams.... [OK]
[BOOT] Opening case study................ [OK]
Launching equity-research...

run market:
[BOOT] Loading Market Terminal runtime... [OK]
[BOOT] Starting Redis pipeline........... [OK]
[BOOT] Mounting DuckDB schema............ [OK]
[BOOT] Opening case study................ [OK]
Launching market-terminal...

cat identity.md:
[READ] Loading identity module........... [OK]
Opening /neel/identity.md...

/logs:
[MOUNT] Loading logs filesystem.......... [OK]
Opening /neel/logs...

/stack:
[MOUNT] Loading stack module............. [OK]
Opening /neel/stack...

/capabilities:
[MOUNT] Loading capabilities............. [OK]
Opening /neel/capabilities...

ssh transmission:
[SSH]  Generating public channel......... [OK]
[SSH]  Establishing connection........... [OK]
Opening transmission channel...

cat resume.pdf:
[FILE] Locating resume.pdf............... [OK]
Downloading...
(triggers actual file download)

open github / open linkedin:
[NET]  Resolving {domain}................ [OK]
Opening external connection...
(new tab)

sudo hire-neel:
[sudo] password for visitor: ████████
Verifying credentials...
...
Access granted.
Initiating transmission channel...
ssh neel@transmission connected.
(→ transmission state after 800ms)
```

**STEP 3:** GSAP transition
- Current content: opacity 0, 200ms
- Color flash (50ms):
  neurofin: rgba(180,83,9,0.12)
  equity:   rgba(30,58,95,0.12)
  market:   rgba(255,184,0,0.08)
  others:   rgba(245,240,232,0.04)
- New state: opacity 1, 200ms

**STEP 4:** Destination state renders full viewport

---

## THE THREE WOW MOMENTS — THE CORE OF THE SITE

These replace UNREASONABLE as the proof.
The interactive demos ARE the argument.
They run first. Description is secondary.

---

### WOW 01 — NEUROFIN WORLD (state: 'neurofin')

**The wow:** You watch 12 specialist agents process
real income data in real time. Then you enter YOUR
income and see YOUR tax calculation. The system
just calculated your taxes using AI agents. Live.

**Background:** #0A0A0A
**Accent:** #B45309 amber
**Path:** root@neel:/projects/neurofin $
**Sound on enter:** Low amber drone, 55Hz, -24dB, fades in

**Layout:**

```
NEUROFIN  ·  AI FINANCIAL ASSISTANT  ·  LIVE ●
─────────────────────────────────────────────────────────

[trace]  [calculate]  [ask]  [readme]  [git log]

Active tab content below
─────────────────────────────────────────────────────────

[CONTENT AREA — full height below tabs]

← exit                        root@neel:/projects/neurofin $
```

**On entry: 'trace' tab is active by default.**
AgentTrace fires automatically with demo income ₹12,00,000.
The visitor sees agents processing BEFORE anything else.
No title. No description. The system working first.

**'trace' tab — AgentTrace:**
- Auto-runs on entry with ₹12,00,000 demo
- Shows 5 agents routing, bars filling, output appearing
- Below output: "Try your own income →" leading to calculate tab
- Loop: resets and replays every 9s while active

**'calculate' tab — GlobalTaxCalculator:**
- AgentTrace fires when CALCULATE is clicked
- AgentTrace completes → output renders
- 15 countries, IP geolocation default
- Compare mode: two countries side by side
- Disclaimer at bottom

**'ask' tab — Ask Neel:**
- Groq streaming, seeded with NeuroFin architecture
- Context injection: if user calculated tax, context includes result
- "NEEL.OS · QUERY INTERFACE · ONLINE" header

**'readme' tab:**
- Project description prose
- Stack tags
- GitHub link

**'git log' tab:**
- All 7 commits from CONTENT.md
- Exact messages, exact order

**Back navigation:**
- "← exit" top-left, #B45309 at 0.7 opacity
- Commands: back, exit, cd .., cd ~
- All return to terminal-root
- Sound on exit: drone fades out 200ms

---

### WOW 02 — EQUITY WORLD (state: 'equity')

**The wow:** Real market data for RELIANCE or NVIDIA
loads in front of you. Then an AI generates an
investment thesis — streamed live — based on the
actual data on screen. Real data in. AI reasoning out.
That is what the Equity Research Platform does.

**Background:** #0A0A0A
**Accent:** #94A3B8 steel
**Path:** root@neel:/projects/equity-research $
**Sound on enter:** Sharp ping, 2000Hz, 200ms triangle wave

**Layout:**

```
EQUITY RESEARCH  ·  INVESTMENT PLATFORM  ·  LIVE ●
─────────────────────────────────────────────────────────

[thesis]  [analyse]  [chart]  [ask]  [readme]  [git log]

Active tab content below
─────────────────────────────────────────────────────────

← exit                   root@neel:/projects/equity-research $
```

**On entry: 'thesis' tab active.**
ThesisConstruction fires automatically for RELIANCE.
Shows RAG signals → reasoning nodes → thesis streaming.
The visitor sees AI reasoning before anything else.

**'thesis' tab — ThesisConstruction:**
- Auto-runs on entry for RELIANCE
- 4 RAG signals appear with relevance scores
- 4 reasoning nodes light up sequentially
- Box-drawing connectors draw
- Thesis streams from Groq
- Loop: resets and replays every 13s

**'analyse' tab — CompanyAnalysis:**
- 12 companies: 6 India, 6 Global
- ThesisConstruction fires on selection
- Real price from Yahoo Finance (/api/market-data)
- Vercel KV cache, 15min TTL
- Full fundamentals card (seeded static data)
- LangGraph thesis streams from Groq seeded with company data
- Stale/error states handled gracefully

**'chart' tab — PriceChart:**
- Same 12 companies
- Recharts line + candlestick
- Timeframes: 1D, 5D, 1MO, 3MO
- Yahoo Finance historical data
- OHLCV below chart
- Up: #4AFF91, Down: #B45309 amber (NOT red)
- Current price dashed reference line

**'ask' tab:** Context-aware — includes selected company data
**'readme' + 'git log':** Standard

**Sound on exit:** Reverse ping, 100ms

---

### WOW 03 — MARKET WORLD (state: 'market')

**The wow:** A Bloomberg Terminal. Real amber on black.
Dense data. Live ticking prices. Options chain.
Fibonacci alerts. Something that costs $24,000/year
being built by a 19-year-old in Mumbai.
The [70%] status makes it more powerful — the ambition
is ongoing. This is not finished. It is running.

**Background:** #0A0A0A
**Accent:** #FFB800 Bloomberg amber (NOT #0AD09A green)
**Path:** root@neel:/projects/market-terminal $
**Sound on enter:** Bandpass white noise burst, 100ms
  Then: subtle ambient ticker hum, -36dB, continuous

**THE BLOOMBERG TERMINAL LAYOUT:**

```
┌─ NEEL TERMINAL  v0.7β ──────────────────────────────────────────────┐
│ [EQUITY] [OPTIONS] [CHARTS] [ALERTS] [PORTFOLIO]      [F1:HELP]     │
├─────────────────────────────────────────────────────────────────────┤
│ NIFTY 50   {price}  {▲/▼}{chg}  {pct}%  │ SENSEX  {price}  {chg}  │
│ BANKNIFTY  {price}  {▲/▼}{chg}  {pct}%  │ VIX     {price}  {chg}  │
├─────────────────────────────────────────────────────────────────────┤
│ [COMPANY SELECTOR: RELIANCE▼]  [1D] [5D] [1MO] [3MO]  [LINE][CAN] │
│ {NAME}  ·  {EXCHANGE}  ·  {price}  {▲/▼}{chg}  {pct}%             │
├─────────────────────────────────────────────────────────────────────┤
│                        PRICE CHART                                  │
│  {high} ┤                                    ╭─╮                   │
│         ┤                        ╭──╮        │ │╭╮                 │
│  {curr} ┤────────────────────────╯  ╰────────╯ ╰╯ ←── current      │
│         ┤╮                                                          │
│  {low}  ┤╰─╮                                                        │
│          └─────────────────────────────────────────────────────     │
│           09:15  10:00  11:00  12:00  13:00  14:00  15:00  15:30   │
├─────────────────────────────────────────────────────────────────────┤
│  O: {open}   H: {high}   L: {low}   C: {close}   VOL: {volume}     │
├─────────────────────────────────────────────────────────────────────┤
│ OPTIONS CHAIN ── {SYMBOL} {STRIKE} ── {EXPIRY}                      │
│ STRIKE   OI        OI CHG   LTP    IV%   DELTA  GAMMA  THETA  VEGA │
│ {strike} {oi}      {pct}%  {ltp}  {iv}%  {d}   {g}    {t}    {v}  │
│ {strike} {oi}      {pct}%  {ltp}  {iv}%  {d}   {g}    {t}    {v}  │
│ {strike} {oi}      {pct}%  {ltp}  {iv}%  {d}   {g}    {t}    {v}  │
├─────────────────────────────────────────────────────────────────────┤
│ TICK  {time}  {symbol}  {price}  ▲  QTY:{qty}  VAL:{value}         │
│       {time}  {symbol}  {price}  ▼  QTY:{qty}  VAL:{value}         │
│       {time}  {symbol}  {price}  ▲  QTY:{qty}  VAL:{value}         │
├─────────────────────────────────────────────────────────────────────┤
│ ▶ ALERT: {symbol} crossing 38.2% Fibonacci  ──  [ACKNOWLEDGE]      │
└─────────────────────────────────────────────────────────────────────┘

BUILD STATUS ────────────────────────────────────────────────────────
████████████████████░░░░░  70%
RUST CORE ··············· ✓    OPTIONS ENGINE ·········· ◌
FASTAPI LAYER ··········· ✓    IV SURFACE ·············· ◌
REDIS PIPELINE ·········· ✓    TAURI SHELL ············· ◌
DUCKDB SCHEMA ··········· ✓

root@neel:/projects/market-terminal $
```

**Color system — Bloomberg amber throughout:**
- Background: #0A0A0A
- Primary text: #FFB800 (Bloomberg amber)
- Secondary text: #FF8C00 (darker amber)
- Header bars: #1A1400 (very dark amber tint)
- Up ticks: #00FF41 (terminal green)
- Down ticks: #FF3B3B (red — NOT amber)
- Dividers: rgba(255,184,0,0.2)
- Active tab: #FFB800 bg, #0A0A0A text
- Inactive tab: #FFB800 at 0.4 opacity
- Alert: full #FFB800, pulses

**Function key bar:**
- [EQUITY] [OPTIONS] [CHARTS] [ALERTS] [PORTFOLIO] [F1:HELP]
- Clicking switches the main content area
- EQUITY: company selector + chart (default)
- OPTIONS: options chain expanded
- CHARTS: full-height price chart
- ALERTS: Fibonacci alerts history
- PORTFOLIO: ask neel in terminal style
- F1:HELP: shows available commands

**Data sources:**
- Index strip (NIFTY/SENSEX/VIX): LiveTicker component
- Price chart: Yahoo Finance via /api/market-data
- Options chain: simulated realistic data (seeded, updates every 3s)
- Tick stream: real timestamps, simulated price movements
- Fibonacci: calculated from 52W high/low

**Company selector:**
- Dropdown: all 12 companies (India + Global)
- Selecting loads chart + updates options chain
- Sound: brief tick on selection

**Alert system:**
- Fires when price approaches 38.2% Fibonacci level
- Sound (if enabled): sharp amber ping
- [ACKNOWLEDGE] button dismisses
- Dismissed alerts logged in ALERTS tab

**Tabs in this mode:**
'chart' → default Bloomberg view (above)
'ask'   → Ask Neel in terminal style (amber theme)
         Context: includes current price/chart data
'readme' → project description + build status
'git log' → 5 commits

**Sound on exit:** Brief noise burst reverse, 50ms

---

## THE SUPPORTING STATES

These are secondary — evidence, not wow.
Each is a clean terminal view of content.

### IDENTITY VIEW (state: 'identity')
Background: #F5F0E8 (the one off-white state in the machine)
Text: #0A0A0A
Path: root@neel:/neel $
Sound: soft warm chord, three notes, 300ms

Shows cat /neel/identity.md output.
Renders as terminal markdown.
Back: exit/back returns to terminal-root.

### LOGS VIEW (state: 'logs')
Background: #0A0A0A
Path: root@neel:/neel/logs $
Sound: brief static/paper sound, 80ms

Three sub-tabs: [growth.log] [failures.log] [shipping.log]
Default: growth.log
All content from CONTENT.md — exact text.
failures.log color coding:
  FAIL: #B45309 amber
  FIX: #4AFF91
  LEARNED: #F5F0E8 at 0.5 opacity
Whispers: floating at bottom, // format, 0.35 opacity
[+ leave a note] input, 40 char max

### STACK VIEW (state: 'stack')
Background: #0A0A0A
Path: root@neel:/neel/stack $

packages.json display.
cannon-es REMOVED from this list.
npm inspect {package} works inline.
active packages: three, gsap, tone (not cannon-es).

### CAPABILITIES VIEW (state: 'capabilities')
Background: #F5F0E8
Path: root@neel:/neel/capabilities $

Horizontal drag rail (existing component).
All 18 words, correct data-depth values.
SYSTEMS word: opacity 0.05, reveals on cursor proximity < 80px.
Drag: momentum and inertia on release.
Back: exit.

### TRANSMISSION VIEW (state: 'transmission')
Background: #0A0A0A
Path: root@neel:/neel/transmission $
Sound on enter: single sustained tone, 1047Hz, 1.5s

SSH intro block:
  root@neel:~$ ssh neel@transmission
  generating public channel...
  ──────────────────────────────
  email      neel1234kachhadia@gmail.com
  github     github.com/Neel-Kachhadia
  linkedin   linkedin.com/in/neelkachhadia
  resume     [download]
  status     available
  ──────────────────────────────

Enormous email: Editorial New weight 300, clamp(32px,6vw,80px)
Hover: WebGL ripple displacement from cursor
Click: copies email + 12 particles #C8F027 + chime 1047Hz

Tagline: "Let's build something unreasonable."
"unreasonable" in #C8F027 — ONLY use of lime on entire site.

System health: "transmission listening" / "contact open"

---

## RECRUITER MODE — DOSSIER, NOT LIST

When [RECRUITER] clicked, full-screen overlay replaces everything.
Not a list of facts. A case for hiring.

```
┌─ CANDIDATE DOSSIER ───────────────────────────────────────────────┐
│                                                     CONFIDENTIAL   │
│  NEEL KACHHADIA                                                    │
│  Systems Engineer · AI Infrastructure · Mumbai                    │
│                                                                    │
│  ● AVAILABLE    B.Tech Y1 · DJSCE Mumbai · 2024-28               │
├────────────────────────────────────────────────────────────────────┤
│  WHAT HE BUILDS                                                    │
│  Production AI systems. Not prototypes. Not demos.                │
│  Three deployed systems running right now. One building.          │
├────────────────────────────────────────────────────────────────────┤
│  THE SYSTEMS                                                       │
│  ─────────────────────────────────────────────────               │
│  NeuroFin         AI financial assistant             [LIVE ●]     │
│                   12-agent LangGraph pipeline                      │
│                   Sub-200ms latency · AWS Lambda · 3K+ users      │
│                                                                    │
│  Equity Research  Investment thesis platform         [LIVE ●]     │
│                   RAG + LangGraph · Live NSE/BSE data             │
│                   Hallucination rate reduced 40% via fine-tuning  │
│                                                                    │
│  Market Terminal  Bloomberg-grade NSE terminal       [70% ◌]     │
│                   Rust core · Redis · DuckDB · Options Greeks     │
│                   4 languages simultaneously                       │
│                                                                    │
│  NEEL.OS          This system is also deployed       [LIVE ●]    │
│                   Next.js · Three.js · GSAP · Groq API            │
├────────────────────────────────────────────────────────────────────┤
│  THE PROOF                                                         │
│  Amazon 10K AI     Top 300 · 115 countries · 10K+ submissions    │
│  Mumbai Hacks 2024 Shipped in 48h · 3K participants               │
│  Odoo Hackathon    ERP feature suite delivered end-to-end         │
├────────────────────────────────────────────────────────────────────┤
│  STACK DEPTH                                                       │
│  AI/ML    LangGraph · RAG pipelines · LLM fine-tuning             │
│           Isolation Forest · OpenAI API · Groq                    │
│  Backend  FastAPI · Python · Rust · Redis · DuckDB                │
│           PostgreSQL · Docker · AWS Lambda/EC2/S3/SNS             │
│  Frontend React · Next.js · TypeScript · Three.js · GSAP          │
│           Recharts · Tailwind · Framer Motion                     │
│  Cloud    AWS · Vercel · Firebase · GCP                           │
├────────────────────────────────────────────────────────────────────┤
│  CONTACT                                                           │
│  neel1234kachhadia@gmail.com                                      │
│  github.com/Neel-Kachhadia · linkedin.com/in/neelkachhadia        │
│                                                                    │
│  [DOWNLOAD RESUME]  [GITHUB]  [LINKEDIN]  [EMAIL NOW]            │
│  [ENTER SYSTEM →]                                                 │
│                                                                    │
│  ────────────────────────────────────────────────────────         │
│  "Most people his age are learning. He is shipping."              │
└────────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Background: #0A0A0A
- Font: JetBrains Mono throughout
- Name: 18px, #F5F0E8 full
- Section headers: 11px, 0.45 opacity
- [LIVE ●]: #4AFF91
- [70% ◌]: #F5F0E8 at 0.6
- Metric details: 12px, #F5F0E8 at 0.7
- Buttons: border 1px #F5F0E8 at 0.4, hover: full opacity
- [EMAIL NOW]: border #4AFF91, color #4AFF91
- Last line: 14px, #F5F0E8 at 0.6, italic

**[DOWNLOAD RESUME]:** triggers actual download
(link.download = 'Neel_Kachhadia_Resume.pdf')

**[ENTER SYSTEM →]:** returns to terminal-root

**Mobile:** same layout, scrollable, all buttons 44px

---

## THE SOUND ENGINE — lib/soundEngine.ts

All sounds: Tone.js synthesis. No audio files ever.
Every sound call: wrapped in `if (soundEnabled) ...`

```typescript
// Boot [OK] ticks — rising pitch
bootOk(index: 0-4):
  pitches = [880, 930, 980, 1047, 1047]
  Tone.Synth sine, attack 0.001, decay 0.03
  volume -18dB

// Terminal ready (after boot)
terminalReady():
  Tone.PolySynth, ['C4','E4','G4'], 100ms
  volume -16dB

// Sound gate confirm
soundGateConfirm():
  440Hz then 880Hz, 80ms each, 120ms apart
  volume -16dB

// Command enter
commandEnter():
  200Hz sine, 50ms
  volume -20dB

// Destination arrive
neurofin():    55Hz sine, 1.5s, attack 0.3s, volume -24dB
equity():      2000Hz triangle, 200ms, volume -18dB
market():      white noise → bandpass 800Hz, 100ms, volume -28dB
identity():    C4+E4+G4 chord, 300ms, volume -18dB
logs():        white noise burst, 80ms, filtered high, volume -32dB
transmission():1047Hz sine, 1.5s, sustain 0.3, volume -18dB

// Back to root
back():        523Hz sine, 80ms, volume -20dB

// Copy/confirm (transmission)
confirm():     1047Hz sine, 200ms, volume -14dB

// Unlock (sudo hire-neel)
unlock():      C4+E4+G4+B4 chord (major 7th), 300ms, volume -14dB

// Bloomberg alert
bloombergAlert(): sharp 2000Hz ping, 150ms, volume -20dB

// Typing (optional, separate toggle)
keyClick():    random between [1100-1400]Hz, 15ms, volume -28dB
```

---

## PERMANENT CHROME — ALWAYS VISIBLE

### Film Grain
- Canvas-based (NOT PNG)
- New noise pattern every 150ms via rAF
- opacity: 0.025 default, 0.015 reduced, 0 static
- z-index: 9999, pointer-events: none, fixed inset 0
- NOT on mobile

### CRT Scan Line
- 1px height, full width
- rgba(255,255,255,0.025)
- Continuous top→bottom, 6s cycle, via rAF
- z-index: 9998
- NOT in reduced/static motion
- NOT on mobile

### Custom Cursor
- cursor: none on html, body (with !important)
- Canvas RAF loop
- Default: 8px dot + 24px orbit ring, 0.8rpm
- On interactive hover: ring 40px, 2rpm
- On project hover: ring fills accent color
  neurofin: #B45309, equity: #94A3B8, market: #FFB800
- On email: "COPY" label in ring
- On click: dot → 4px, snap back
- Void: 1.0→1.08 scale pulse, 2s sine

### System Health (bottom-right, always)
```
SYSTEM HEALTH
render     stable
fps        {real rAF delta}
heap       {performance.memory or '--'}
audio      {muted|enabled}
motion     {full|reduced|static}
session    {n}
```
State-aware bottom two lines:
  neurofin:     "project-runtime  active" / "langgraph  running"
  equity:       "project-runtime  active" / "thesis  running"
  market:       "project-runtime  active" / "terminal  live"
  transmission: "transmission  listening" / "contact  open"

### Mode Switcher (top-right, always)
```
MODE: [VISITOR] [RECRUITER] [DEBUG]
```
Active: underlined. Inactive: 0.5 opacity.

### Path Indicator (bottom-left, always)
```
root@neel:{current/path} $
```
Updates on every state change.

### Filesystem Sidebar (left, always on desktop)
Width: 200px, fixed
/neel directory tree
Active state: opacity 1.0 + #4AFF91 dot
Inactive: opacity 0.4
Clicking navigates (setState)
Content starts after sidebar: paddingLeft calc(200px + 24px)

---

## DEBUG MODE

Right panel overlay. Shows all real-time values.
Updated TECH_DECISIONS (cannon-es removed):

```
Three.js (single context)
  One WebGL renderer shared across all scenes.
  Multiple contexts cause GPU resource exhaustion.

Groq (llama-3.3-70b)
  Server-side streaming. Sub-second first token.
  Speed = system responding, not model thinking.

GSAP (transitions)
  State transitions via GSAP opacity timelines.
  No scroll. No ScrollTrigger. Pure state machine.

GLSL fragment shaders
  Pure shader project visuals — no 3D models.
  One draw call per scene. Deterministic 60fps.

Tone.js synthesis
  All sounds generated programmatically.
  No audio files. Every listen slightly different.
```

Bundle budget (updated):
```
Boot (critical):    target 80kb
  boot seq, fonts, session
Terminal root (lazy): target 120kb
  Three.js, GSAP
Project worlds (lazy per world):
  neurofin: ~30kb (AgentTrace, TaxCalc, AskNeel)
  equity:   ~30kb (ThesisConst, CompanyAnalysis, Chart)
  market:   ~25kb (Bloomberg terminal, LiveTicker)
Supporting states: ~20kb total
```

---

## MOBILE — NEEL.OS POCKET SHELL

Completely separate component tree at < 768px.
NOT a responsive version of desktop.

Zero WebGL. Zero Three.js. Zero rAF physics.
CSS gradient project world fallbacks:
  neurofin: linear-gradient(180deg, #0A0A0A 0%, #B45309 100%)
  equity:   linear-gradient(180deg, #0A0A0A 0%, #1E3A5F 100%)
  market:   linear-gradient(180deg, #0A0A0A 0%, #1A1400 100%)

Bottom bar:
  [PROJECTS] [STACK] [LOGS] [CONTACT]
  + mode row above: [VISITOR] [RECRUITER]
  Min height: 44px all targets

Project worlds on mobile:
  Tab strip at top (scrollable)
  Content below
  Back: always visible top-left

---

## 404 — KERNEL PANIC

```
──────────────────────────────────────────────────────────
KERNEL PANIC — NEEL.OS v1.0.0
──────────────────────────────────────────────────────────

route not found: {path}

available mounts:
  /identity
  /projects
  /projects/neurofin
  /projects/equity-research
  /projects/market-terminal
  /stack
  /logs
  /transmission

[ reboot to /neel ]
──────────────────────────────────────────────────────────
```

---

## SECURITY — NON-NEGOTIABLE

```
GROQ_API_KEY:         server-side only, never NEXT_PUBLIC_
KV_REST_API_URL:      server-side only
KV_REST_API_TOKEN:    server-side only
FMP_API_KEY:          server-side only (if used)

grep -r "gsk_" .next/static/ → 0 results (always)
grep -r "NEXT_PUBLIC_GROQ" . → 0 results (always)

/api/query:       rate limit 10/IP/hour, returns 429
/api/market-data: rate limit 30/IP/minute
/api/whisper:     rate limit 1/IP/24h
/api/geo:         rate limit 10/IP/hour
```

---

## PERFORMANCE CONTRACT

```
60fps:              always. non-negotiable.
Initial JS:         ≤ 165kb
Lighthouse perf:    95+
Lighthouse access:  90+

GPU compositable only for animations:
  transform, opacity — yes
  width, height, top, left — never

WebGL:              lazy-init, not on page load
                    only when project world enters viewport
Grain canvas:       50% resolution, CSS scale(2) — saves GPU
rAF loops:          stop when component unmounts
setIntervals:       clearInterval on unmount always

prefers-reduced-motion:
  full:    everything runs
  reduced: no physics, no continuous anim, grain 0.015
  static:  CSS fallbacks only, no WebGL, grain off
           ALL CONTENT still visible in static mode
```

---

## CONTENT REFERENCES

All copy: CONTENT.md (unchanged)
All colors: DESIGN_SYSTEM.md (unchanged, minus lime rule update)
All interactions: INTERACTIONS.md (updated — no Tear, no physics)
All architecture: ARCHITECTURE.md (updated — state machine, no Lenis)

**The lime rule — final:**
#C8F027 appears EXACTLY ONCE.
Transmission.tsx: "Let's build something unreasonable."
The word "unreasonable" only.
grep -r "C8F027" src/ → 1 result: globals.css variable definition
All other uses: var(--lime), only in Transmission.

**The Editorial New rule:**
Used ONLY for:
  - Transmission email (enormous, weight 300)
  - Project titles (decrypt animation targets)
  NOT in terminal hero. NOT in boot. NOT anywhere mono.

---

## THE COMPLETE FIX LIST FROM AUDIT

Apply every item. Nothing skipped.

**From audit report (17 fails):**

01.D  Sound gate visual: [y]  [n] on one line, two spaces between
01.I  Return visit text: "Session restored from cache" (no period)
02.B  cannon-es: remove from Stack.tsx, Logs.tsx, commands.ts,
      DebugOverlay.tsx TECH_DECISIONS and PERF_BUDGET
02.D  Identity card: "B.Tech · DJSCE Mumbai · 2024-28" single line
      Remove "Honours in VLSI" from terminal hero card
03.H  cat resume.pdf: triggers download (link.download), not new tab
      Recruiter [RESUME.PDF]: href download attribute
03.L  Back button on off-white sections: rgba(10,10,10,0.5) (dark)
05.J  AgentTrace: wired to CALCULATE button via prop callback
06.C  /api/market-data: Vercel KV cache (not in-memory Map)
08.C  Ask Neel: context injection per section
      neurofin: tax result, equity: company data, market: chart data
09.F  Stack.tsx: cannon-es removed from active packages
13.C  DebugOverlay: cannon-es removed from TECH_DECISIONS
      PERF_BUDGET: remove cannon-es reference
14.B  ScanLine: rAF implementation is acceptable (PASS — no change)
15.C  MobileProject.tsx: verify/add CSS gradient fallbacks
15.D  PocketShell: [VISITOR]/[RECRUITER] mode row above bottom bar
17.C  /public/resume.pdf: must exist (create placeholder if needed)
18.C  CompanyAnalysis.tsx:281: remove boxShadow inline style

**From screenshot (12 visual issues):**

FIX-S1  Content paddingLeft: calc(200px + 24px) — after sidebar
FIX-S2  Identity card single line (same as 02.D)
FIX-S3  Two-column: maxWidth 900px, centered, divider between cols
FIX-S4  Terminal header above card: "NEEL.OS v1.0.0 · kernel..."
FIX-S5  Remove "press / to open terminal" permanently
FIX-S6  Right column: 13px JetBrains Mono, section labels 11px
FIX-S7  Input line: 14px, clear 1px border-top, full visibility
FIX-S8  cursor: none on html, body with !important
FIX-S9  Session indicator: visible, positioned after sidebar
FIX-S10 FPS: lazy-init WebGL, grain at 50% resolution

---

## BUILD VERIFICATION

After all changes:

```bash
npm run build
# Expected: ✓ compiled, 0 type errors, ≤ 165kb

grep -r "cannon" src/ components/ lib/ app/
# Expected: 0 results (excluding package.json)

grep -r "C8F027" src/ components/ app/
# Expected: 1 result (globals.css variable definition only)

grep -r "box-shadow\|boxShadow" src/ components/ app/
# Expected: 0 results (excluding 'none' values)

grep -r "lenis\|Lenis" src/ components/
# Expected: 0 results (removed with scroll architecture)

grep -r "ScrollTrigger\|scrollTo" src/ components/
# Expected: 0 results

grep -r "UNREASONABLE\|Manifesto\|unreasonable" src/ components/ app/
# Expected: 1 result (Transmission.tsx tagline only)

ls public/resume.pdf
# Expected: file exists

grep -r "gsk_\|NEXT_PUBLIC_GROQ" .next/static/
# Expected: 0 results
```

**Browser verification (cannot be automated):**
- Boot: real timestamps, rising pitch on [OK] lines
- Sound gate: every session, same black screen as boot
- Terminal root: readable immediately, no overlap with sidebar
- run neurofin: AgentTrace fires on entry, agents animate
- Tax calculate: AgentTrace fires, output appears after
- run equity: ThesisConstruction fires on entry
- Company select: real data loads, thesis streams
- run market: Bloomberg terminal renders, prices tick
- Bloomberg: amber color, options chain, Fibonacci alert fires
- Recruiter mode: dossier format, download works, last line present
- Debug mode: cannon-es gone, Tone.js decision present
- Transmission: email copies, 1 lime use confirmed
- fps: 55-60 in debug overlay (physics removed, WebGL lazy)
- Session memory: return visit skips boot, goes to terminal
- Mobile: PocketShell renders, no WebGL, recruiter accessible
```
