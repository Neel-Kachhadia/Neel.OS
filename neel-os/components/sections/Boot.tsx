'use client';

import { useEffect, useRef, useState } from 'react';
import { Session } from '@/lib/session';
import { playBootChime, resumeSystemAudio } from '@/lib/audio';

interface BootProps {
  session: Session;
  onComplete: (soundEnabled: boolean, resumePrevious?: boolean) => void;
}

const BOOT_LINES = [
  { key: 'init',    text: 'NEEL.OS v1.0.0  [kernel 6.1.0-neel · Mumbai]' },
  { key: 'sep1',   text: '──────────────────────────────────────────────────────────' },
  { key: 'l0',     text: '[    {t+0.000}] Initializing cgroup subsys cpuset' },
  { key: 'l1',     text: '[    {t+0.000}] NEEL.OS kernel loading' },
  { key: 'l2',     text: '[    {t+0.148}] Loading identity module................. [OK]' },
  { key: 'l3',     text: '[    {t+0.231}] Mounting project filesystem............. [OK]' },
  { key: 'l4',     text: '[    {t+0.387}] Connecting to live data streams......... [OK]' },
  { key: 'l5',     text: '[    {t+0.442}] Calibrating WebGL context............... [OK]' },
  { key: 'l6',     text: '[    {t+0.521}] Starting audio daemon (muted)........... [OK]' },
  { key: 'l7',     text: '[    {t+0.601}] Loading /neel/README.md.................. [OK]' },
  { key: 'l8',     text: '[    {t+0.724}] Booting interface....................... [OK]' },
  { key: 'sep2',   text: '──────────────────────────────────────────────────────────' },
  { key: 'login',  text: 'NEEL.OS login: root' },
  { key: 'pass',   text: 'Password: ████████' },
  { key: 'blank',  text: '' },
  { key: 'welcome',text: 'Welcome. Last login: never.' },
  { key: 'session',text: 'Session 01.' },
  { key: 'sep3',   text: '──────────────────────────────────────────────────────────' },
  { key: 'readme', text: '' },
  { key: 'rm1',    text: 'This is NEEL.OS.' },
  { key: 'rm2',    text: 'A living portfolio runtime by Neel Kachhadia.' },
  { key: 'rm3',    text: '' },
  { key: 'rm4',    text: 'Use the filesystem to inspect projects,' },
  { key: 'rm5',    text: 'stack, logs, and transmission.' },
  { key: 'rm6',    text: '' },
  { key: 'rm7',    text: "Type help anytime." },
];

export default function Boot({ session, onComplete }: BootProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [showGate, setShowGate] = useState(false);
  const startRef = useRef(performance.now());
  const isReturnVisit = session.count > 1;

  const formatLine = (text: string): string => {
    const t = ((performance.now() - startRef.current) / 1000).toFixed(3);
    return text.replace(/\{t\+[\d.]+\}/g, `t+${t}`);
  };

  const renderLine = (line: string) => {
    const okIndex = line.indexOf('[OK]');
    if (okIndex === -1) return line || ' ';

    return (
      <>
        {line.slice(0, okIndex)}
        <span style={{ color: 'var(--online)' }}>[OK]</span>
        {line.slice(okIndex + 4)}
      </>
    );
  };

  useEffect(() => {
    let i = 0;
    const source = isReturnVisit ? getReturnLines(session) : BOOT_LINES;
    const interval = setInterval(() => {
      if (i < source.length) {
        const text = source[i].text;
        setLines(prev => [...prev, formatLine(text)]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowGate(true), isReturnVisit ? 450 : 800);
      }
    }, 90);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--black)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 'clamp(24px, 5vw, 80px)',
        paddingLeft: 'calc(clamp(24px, 5vw, 80px) + 200px)',
      }}
    >
      <pre
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--text-on-black)',
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{renderLine(line)}</div>
        ))}
        {!showGate && (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '14px',
              background: 'var(--text-on-black)',
              verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }}
          />
        )}
      </pre>

      {showGate && !isReturnVisit && (
        <SoundGate onChoice={(enabled) => onComplete(enabled, true)} />
      )}

      {showGate && isReturnVisit && (
        <ReturnGate
          soundEnabled={session.soundEnabled}
          onChoice={(resumePrevious) => onComplete(session.soundEnabled, resumePrevious)}
        />
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function getReturnLines(session: Session) {
  return [
    { key: 'init',    text: 'NEEL.OS v1.0.0  [kernel 6.1.0-neel · Mumbai]' },
    { key: 'sep1',   text: '──────────────────────────────────────────────────────────' },
    { key: 'cache',  text: 'Session restored from cache.' },
    { key: 'sep2',   text: '──────────────────────────────────────────────────────────' },
    { key: 'blank1', text: '' },
    { key: 'welcome',text: 'Welcome back, visitor.' },
    { key: 'last',   text: `Last session: ${session.lastPath || '/neel'}` },
    { key: 'count',  text: `Session ${String(session.count).padStart(2, '0')}.` },
    { key: 'blank2', text: '' },
    { key: 'prompt', text: `Resume previous session?` },
    { key: 'sep3',   text: '──────────────────────────────────────────────────────────' },
  ];
}

function SoundGate({ onChoice }: { onChoice: (enabled: boolean) => void }) {
  const [chosen, setChosen] = useState<'y' | 'n' | null>(null);

  const handleChoice = async (v: 'y' | 'n') => {
    if (chosen !== null) return;
    setChosen(v);
    if (v === 'y') {
      const ready = await resumeSystemAudio();
      if (ready) playBootChime();
    }
    setTimeout(() => onChoice(v === 'y'), 300);
  };

  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--text-on-black)',
        marginTop: '32px',
      }}
    >
      <div style={{ marginBottom: '16px' }}>enable system audio?</div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => handleChoice('y')}
          data-cursor-hover
          style={{
            ...gateButtonStyle,
            color: chosen === 'y' ? 'var(--online)' : 'var(--text-on-black)',
          }}
        >
          [y{chosen === 'y' ? ' ●' : ''}]
        </button>
        <button
          onClick={() => handleChoice('n')}
          data-cursor-hover
          style={{
            ...gateButtonStyle,
            color: chosen === 'n' ? 'var(--online)' : 'var(--text-on-black)',
          }}
        >
          [n{chosen === 'n' ? ' ●' : ''}]
        </button>
      </div>
    </div>
  );
}

function ReturnGate({
  soundEnabled,
  onChoice,
}: {
  soundEnabled: boolean;
  onChoice: (resumePrevious: boolean) => void;
}) {
  const [chosen, setChosen] = useState<'yes' | 'fresh' | null>(null);

  const handleChoice = async (resumePrevious: boolean) => {
    if (chosen !== null) return;
    setChosen(resumePrevious ? 'yes' : 'fresh');
    if (soundEnabled) {
      const ready = await resumeSystemAudio();
      if (ready) playBootChime();
    }
    setTimeout(() => onChoice(resumePrevious), 260);
  };

  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        color: 'var(--text-on-black)',
        marginTop: '20px',
        display: 'flex',
        gap: '16px',
      }}
    >
      <button
        onClick={() => handleChoice(true)}
        data-cursor-hover
        style={{
          ...gateButtonStyle,
          color: chosen === 'yes' ? 'var(--online)' : 'var(--text-on-black)',
        }}
      >
        [yes{chosen === 'yes' ? ' ●' : ''}]
      </button>
      <button
        onClick={() => handleChoice(false)}
        data-cursor-hover
        style={{
          ...gateButtonStyle,
          color: chosen === 'fresh' ? 'var(--online)' : 'var(--text-on-black)',
        }}
      >
        [start fresh{chosen === 'fresh' ? ' ●' : ''}]
      </button>
    </div>
  );
}

const gateButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  padding: 0,
  opacity: 0.9,
  transition: 'color 0.15s',
};
