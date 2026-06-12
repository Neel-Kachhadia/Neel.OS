'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { updateSession } from '@/lib/session';
import { Mode } from '@/hooks/useMode';
import { playCommandEnter } from '@/lib/soundEngine';
import { useUptime } from '@/hooks/useUptime';

interface HeroProps {
  sessionCount: number;
  soundEnabled: boolean;
  onNavigate: (path: string) => void;
  onModeChange: (m: Mode) => void;
  onStateChange?: (state: string) => void;
}

interface OutputLine { text: string }
interface OutputEntry { prompt?: string; lines: OutputLine[] }

const MONO = 'var(--font-mono)';
const FG = (a: number) => `rgba(245,240,232,${a})`;
const GREEN = '#4AFF91';

const SEQUENCES: Record<string, string[]> = {
  'run neurofin': [
    '[BOOT] Loading NeuroFin runtime.......... [OK]',
    '[BOOT] Mounting LangGraph pipeline....... [OK]',
    '[BOOT] Connecting live data streams...... [OK]',
    '[BOOT] Opening case study................ [OK]',
    'Launching neurofin...',
  ],
  'run equity': [
    '[BOOT] Loading Equity Research runtime... [OK]',
    '[BOOT] Mounting LangGraph chain.......... [OK]',
    '[BOOT] Connecting market data streams.... [OK]',
    '[BOOT] Opening case study................ [OK]',
    'Launching equity-research...',
  ],
  'run market': [
    '[BOOT] Loading Market Terminal runtime... [OK]',
    '[BOOT] Starting Redis pipeline........... [OK]',
    '[BOOT] Mounting DuckDB schema............ [OK]',
    '[BOOT] Opening case study................ [OK]',
    'Launching market-terminal...',
  ],
  'cat identity.md': [
    '[READ] Loading identity module........... [OK]',
    'Opening /neel/identity.md...',
  ],
  '/logs': [
    '[MOUNT] Loading logs filesystem.......... [OK]',
    'Opening /neel/logs...',
  ],
  '/stack': [
    '[MOUNT] Loading stack module............. [OK]',
    'Opening /neel/stack...',
  ],
  'ssh transmission': [
    '[SSH]  Generating public channel......... [OK]',
    '[SSH]  Establishing connection........... [OK]',
    'Opening transmission channel...',
  ],
  'cat resume.pdf': [
    '[FILE] Locating resume.pdf............... [OK]',
    'Downloading...',
    'Download initiated.',
  ],
  'open github': [
    '[NET]  Resolving github.com.............. [OK]',
    'Opening external connection...',
  ],
  'open linkedin': [
    '[NET]  Resolving linkedin.com............ [OK]',
    'Opening external connection...',
  ],
  'sudo hire-neel': [
    '[sudo] password for visitor: ████████',
    'Verifying credentials...',
    '...',
    'Access granted.',
    'Initiating transmission channel...',
    'ssh neel@transmission connected.',
  ],
};

const PATH_TARGET: Record<string, string> = {
  'run neurofin':     '/neel/projects/neurofin',
  'run equity':       '/neel/projects/equity-research',
  'run market':       '/neel/projects/market-terminal',
  'cat identity.md':  '/neel/identity',
  '/logs':            '/neel/logs',
  '/stack':           '/neel/stack',
  'ssh transmission': '/neel/transmission',
  'sudo hire-neel':   '/neel/transmission',
};

const OPEN_TARGET: Record<string, string> = {
  'open github':   'https://github.com/Neel-Kachhadia',
  'open linkedin': 'https://linkedin.com/in/neelkachhadia',
};

const SECTION_ACCENT: Record<string, string> = {
  neurofin: '#B45309',
  equity:   '#94A3B8',
  market:   '#FFB800',
};

const HELP_LINES = [
  'AVAILABLE COMMANDS',
  '──────────────────────────────────────────────────────────',
  '',
  'PROJECTS',
  '  run neurofin',
  '  run equity',
  '  run market',
  '',
  'EXPLORE',
  '  cat identity.md',
  '  /logs',
  '  /stack',
  '',
  'CONTACT',
  '  ssh transmission',
  '  cat resume.pdf',
  '  open github',
  '  open linkedin',
  '',
  '  sudo hire-neel',
  '',
  '──────────────────────────────────────────────────────────',
];

function TermLine({ text }: { text: string }) {
  if (text === '[returned]') {
    return <span style={{ color: GREEN }}>{text}</span>;
  }
  const okIdx = text.indexOf('[OK]');
  if (okIdx !== -1) {
    return (
      <span>
        <span style={{ color: FG(0.6) }}>{text.slice(0, okIdx)}</span>
        <span style={{ color: GREEN }}>[OK]</span>
        {text.slice(okIdx + 4)}
      </span>
    );
  }
  if (/^\[(BOOT|READ|MOUNT|SSH|FILE|NET|sudo|EXIT|INIT|WARN)\]/.test(text)) {
    return <span style={{ color: FG(0.6) }}>{text}</span>;
  }
  return <span style={{ color: FG(0.8) }}>{text}</span>;
}

const PATH_TO_STATE: Record<string, string> = {
  '/neel/projects/neurofin':     'neurofin',
  '/neel/projects/equity-research': 'equity',
  '/neel/projects/market':       'market',
  '/neel/projects/market-terminal': 'market',
  '/neel/identity':              'identity',
  '/neel/logs':                  'logs',
  '/neel/stack':                 'stack',
  '/neel/transmission':          'transmission',
};

export default function Hero({ soundEnabled, onNavigate, onModeChange, onStateChange }: HeroProps) {
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('neel_os_session');
      const s = raw ? JSON.parse(raw) : null;
      return Array.isArray(s?.commandHistory) ? s.commandHistory : [];
    } catch { return []; }
  });
  const [histIdx, setHistIdx] = useState(-1);
  const [backVisible, setBackVisible] = useState(false);
  const [backColor, setBackColor] = useState(FG(0.5));
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const uptime = useUptime();
  const inputRef = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const busyRef = useRef(false);
  const lastCmdRef = useRef('');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    busyRef.current = false;
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter(timer => timer !== id);
      callback();
    }, delay);
    timersRef.current.push(id);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Show/hide back nav based on hero visibility
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setBackVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // Track active section for back button color
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const projectSections = [
      { id: 'neurofin', color: SECTION_ACCENT.neurofin },
      { id: 'equity',   color: SECTION_ACCENT.equity },
      { id: 'market',   color: SECTION_ACCENT.market },
    ];
    projectSections.forEach(({ id, color }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setBackColor(color); setActiveSection(id); } },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const execute = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    if (soundEnabled) playCommandEnter();

    if (normalized === 'clear') {
      setOutputs([]);
      return;
    }

    if (busyRef.current) return;
    lastCmdRef.current = trimmed;

    setOutputs(prev => [...prev, { prompt: `root@neel:~$ ${trimmed}`, lines: [] }]);
    setCmdHistory(prev => {
      const next = [trimmed, ...prev].slice(0, 50);
      updateSession({ commandHistory: next });
      return next;
    });
    setHistIdx(-1);

    if (normalized === 'debug on')        { onModeChange('debug');     appendToLast([{ text: 'Debug mode enabled.' }]);     return; }
    if (normalized === 'debug off')       { onModeChange('visitor');   appendToLast([{ text: 'Debug mode disabled.' }]);    return; }
    if (normalized === 'recruiter mode')  { onModeChange('recruiter'); appendToLast([{ text: 'Switching to recruiter view...' }]); return; }

    if (normalized === 'help') {
      appendToLast(HELP_LINES.map(t => ({ text: t })));
      return;
    }

    const seqLines   = SEQUENCES[normalized];
    const pathTarget = PATH_TARGET[normalized];
    const openTarget = OPEN_TARGET[normalized];

    if (seqLines) {
      busyRef.current = true;
      seqLines.forEach((line, i) => {
        schedule(() => {
          setOutputs(prev => {
            const arr = [...prev];
            const last = { ...arr[arr.length - 1], lines: [...arr[arr.length - 1].lines, { text: line }] };
            return [...arr.slice(0, -1), last];
          });
          if (i === seqLines.length - 1) {
            busyRef.current = false;
            const navDelay = normalized === 'sudo hire-neel' ? 800 : 600;
            schedule(() => {
              if (pathTarget) {
                onNavigate(pathTarget);
                const state = PATH_TO_STATE[pathTarget];
                if (state && onStateChange) onStateChange(state);
              } else if (normalized === 'cat resume.pdf') {
                const link = document.createElement('a');
                link.href = '/resume.pdf';
                link.download = 'Neel_Kachhadia_Resume.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else if (openTarget) {
                window.open(openTarget, '_blank', 'noopener');
              }
            }, navDelay);
          }
        }, (i + 1) * 80);
      });
    } else {
      appendToLast([
        { text: `command not found: ${trimmed}` },
        { text: "type 'help' to see available commands." },
      ]);
    }

    function appendToLast(lines: OutputLine[]) {
      setOutputs(prev => {
        const arr = [...prev];
        const last = { ...arr[arr.length - 1], lines };
        return [...arr.slice(0, -1), last];
      });
    }
  }, [onNavigate, onModeChange, onStateChange, schedule, soundEnabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : cmdHistory[next]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const all = [...Object.keys(SEQUENCES), 'help', 'clear'];
      const match = all.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  const handleBackNav = useCallback(() => {
    const sn = activeSection || 'section';
    const dots = '.'.repeat(Math.max(1, 45 - sn.length));
    setOutputs(prev => [
      ...prev,
      { lines: [
        { text: `[EXIT] Unmounting ${sn}${dots} [OK]` },
        { text: '[EXIT] Returning to shell............... [OK]' },
      ] },
    ]);
    schedule(() => {
      if (lastCmdRef.current) {
        setOutputs(prev => [
          ...prev,
          { prompt: `root@neel:~$ ${lastCmdRef.current}`, lines: [{ text: '[returned]' }] },
        ]);
      }
      inputRef.current?.focus();
    }, 900);
  }, [activeSection, schedule]);

  const pad = isMobile ? '24px' : '48px';
  const leftPad = isMobile ? pad : 'calc(200px + 24px)';

  return (
    <>
      {backVisible && (
        <button
          onClick={handleBackNav}
          aria-label="Return to shell"
          data-cursor-hover
          style={{
            position: 'fixed',
            top: '24px',
            left: '48px',
            zIndex: 100,
            fontFamily: MONO,
            fontSize: '12px',
            color: backColor,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            background: 'none',
            border: 'none',
            padding: 0,
            transition: 'color 0.3s',
          }}
        >
          ← root@neel:~$
        </button>
      )}

      <section
        id="hero"
        ref={heroRef}
        style={{
          height: '100vh',
          minHeight: '100vh',
          background: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: MONO,
          fontSize: isMobile ? '12px' : '13px',
          color: FG(0.85),
          position: 'relative',
        }}
      >
        {/* Scrollable area: separators + identity card + terminal output */}
        <div
          style={{
            flex: '0 1 auto',
            maxHeight: 'calc(100vh - 58px)',
            minHeight: 0,
            overflowY: 'auto',
            padding: `${pad} ${pad} 0`,
            paddingLeft: leftPad,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {!isMobile && (
            <div style={{ color: FG(0.45), fontSize: '12px', marginBottom: '8px', letterSpacing: '0.03em' }}>
              NEEL.OS v1.0.0  ·  kernel 6.1.0-neel  ·  Mumbai
            </div>
          )}
          <Separator />
          {isMobile
            ? <MobileIdentityCard uptime={uptime} onCommand={execute} />
            : <DesktopIdentityCard uptime={uptime} />
          }

          <Separator style={{ margin: '16px 0' }} />

          {/* Terminal output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '16px' }}>
            {outputs.map((entry, i) => (
              <div key={i} style={{ lineHeight: '1.7' }}>
                {entry.prompt && (
                  <div style={{ color: FG(0.85) }}>{entry.prompt}</div>
                )}
                {entry.lines.map((line, j) => (
                  <div key={j} style={{ paddingLeft: entry.prompt ? '2px' : 0 }}>
                    <TermLine text={line.text} />
                  </div>
                ))}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>
        </div>

        {/* Input bar — fixed to bottom of hero section */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: `12px ${pad}`,
            paddingLeft: leftPad,
            borderTop: '1px solid rgba(245,240,232,0.1)',
            background: '#0A0A0A',
            fontFamily: MONO,
            fontSize: '14px',
            color: FG(0.85),
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <span style={{ whiteSpace: 'nowrap', opacity: 0.6 }}>root@neel:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: FG(0.85),
              fontFamily: MONO,
              fontSize: '14px',
              caretColor: GREEN,
            }}
          />
        </div>
      </section>
    </>
  );
}

function Separator({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      color: FG(0.2),
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      marginBottom: '16px',
      ...style,
    }}>
      {'─'.repeat(200)}
    </div>
  );
}

function DesktopIdentityCard({ uptime }: { uptime: string }) {
  return (
    <div style={{ display: 'flex' }}>
      {/* Left column */}
      <div style={{ flex: '0 0 55%', paddingRight: '12px', lineHeight: '1.7' }}>
        <div style={{ color: FG(1), fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600 }}>
          NEEL KACHHADIA
        </div>
        <div style={{ color: FG(0.2), overflow: 'hidden', whiteSpace: 'nowrap' }}>{'─'.repeat(100)}</div>
        <div>B.Tech · DJSCE Mumbai · 2024-28</div>
        <div style={{ height: '1.7em' }} />
        <div>Building systems.</div>
        <div>Shipping fast.</div>
        <div>Mumbai.</div>
        <div style={{ height: '1.7em' }} />
        <div style={{ color: FG(0.45), letterSpacing: '0.08em' }}>SYSTEMS</div>
        <div>
          <span style={{ color: GREEN }}>● </span>
          <span>{'neurofin          '}</span>
          <span style={{ color: GREEN }}>[LIVE]</span>
        </div>
        <div>
          <span style={{ color: GREEN }}>● </span>
          <span>{'equity-research   '}</span>
          <span style={{ color: GREEN }}>[LIVE]</span>
        </div>
        <div>
          <span style={{ color: FG(0.4) }}>◌ </span>
          <span>{'market-terminal   '}</span>
          <span style={{ color: FG(0.6) }}>[70%]</span>
        </div>
        <div style={{ height: '1.7em' }} />
        <div style={{ color: FG(0.45), letterSpacing: '0.08em' }}>ACHIEVEMENTS</div>
        <div>
          <span style={{ color: FG(0.7) }}>◆ </span>
          <span>Amazon AI Challenge</span>
        </div>
        <div style={{ paddingLeft: '18px' }}>top 300 · 115 countries</div>
        <div>
          <span style={{ color: FG(0.7) }}>◆ </span>
          <span>Mumbai Hacks 2024</span>
        </div>
        <div style={{ paddingLeft: '18px' }}>shipped AI product · 3K teams</div>
        <div style={{ height: '1.7em' }} />
        <div>
          <span style={{ color: GREEN }}>ONLINE ●</span>
          <span style={{ color: FG(0.45) }}>   uptime: </span>
          <span style={{ color: GREEN }}>{uptime}</span>
        </div>
      </div>

      {/* Column separator */}
      <div style={{
        width: '20px',
        alignSelf: 'stretch',
        margin: '0 4px',
        borderLeft: `1px solid ${FG(0.15)}`,
      }}>
      </div>

      {/* Right column */}
      <div style={{ flex: '0 0 calc(45% - 20px)', paddingLeft: '12px', lineHeight: '1.7' }}>
        <div style={{ color: FG(1), fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600 }}>
          AVAILABLE COMMANDS
        </div>
        <div style={{ color: FG(0.2), overflow: 'hidden', whiteSpace: 'nowrap' }}>{'─'.repeat(100)}</div>
        <div style={{ height: '1.7em' }} />
        <div style={{ color: FG(0.45), letterSpacing: '0.08em' }}>PROJECTS</div>
        <div>run neurofin</div>
        <div>run equity</div>
        <div>run market</div>
        <div style={{ height: '1.7em' }} />
        <div style={{ color: FG(0.45), letterSpacing: '0.08em' }}>EXPLORE</div>
        <div>cat identity.md</div>
        <div>/logs</div>
        <div>/stack</div>
        <div style={{ height: '1.7em' }} />
        <div style={{ color: FG(0.45), letterSpacing: '0.08em' }}>CONTACT</div>
        <div>ssh transmission</div>
        <div>cat resume.pdf</div>
        <div>open github</div>
        <div>open linkedin</div>
        <div style={{ height: '1.7em' }} />
        <div>sudo hire-neel</div>
      </div>
    </div>
  );
}

function MobileIdentityCard({ uptime, onCommand }: { uptime: string; onCommand: (cmd: string) => void }) {
  const CMDS = [
    'run neurofin', 'run equity', 'run market',
    'cat identity.md', '/logs', '/stack',
    'ssh transmission', 'cat resume.pdf', 'open github', 'open linkedin',
    'sudo hire-neel',
  ];
  return (
    <div style={{ lineHeight: '1.7' }}>
      <div style={{ color: FG(1), fontSize: '14px', fontWeight: 600 }}>NEEL KACHHADIA</div>
      <div style={{ color: FG(0.2), overflow: 'hidden', whiteSpace: 'nowrap' }}>{'─'.repeat(50)}</div>
      <div>B.Tech Electronics &amp; Telecom</div>
      <div>B.Tech · DJSCE Mumbai · 2024-28</div>
      <div>Honours in VLSI</div>
      <div style={{ height: '1em' }} />
      <div>Building systems. Shipping fast. Mumbai.</div>
      <div style={{ height: '1em' }} />
      <div style={{ color: FG(0.45) }}>SYSTEMS</div>
      <div><span style={{ color: GREEN }}>● </span>neurofin <span style={{ color: GREEN }}>[LIVE]</span></div>
      <div><span style={{ color: GREEN }}>● </span>equity-research <span style={{ color: GREEN }}>[LIVE]</span></div>
      <div><span style={{ color: FG(0.4) }}>◌ </span>market-terminal <span style={{ color: FG(0.6) }}>[70%]</span></div>
      <div style={{ height: '1em' }} />
      <div>
        <span style={{ color: GREEN }}>ONLINE ●</span>
        <span style={{ color: FG(0.45) }}> uptime: </span>
        <span style={{ color: GREEN }}>{uptime}</span>
      </div>
      <div style={{ height: '1em' }} />
      <div style={{ color: FG(0.2), overflow: 'hidden', whiteSpace: 'nowrap' }}>{'─'.repeat(50)}</div>
      <div style={{ color: FG(0.45), margin: '8px 0' }}>TAP TO RUN</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CMDS.map(cmd => (
          <button
            key={cmd}
            onClick={e => { e.stopPropagation(); onCommand(cmd); }}
            type="button"
            style={{
              background: 'none',
              border: '1px solid rgba(245,240,232,0.15)',
              color: FG(0.85),
              fontFamily: MONO,
              fontSize: '11px',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
