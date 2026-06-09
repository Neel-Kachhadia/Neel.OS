'use client';

import { useEffect, useRef, useState } from 'react';
import { Session } from '@/lib/session';

interface BootProps {
  session: Session;
  onComplete: (soundEnabled: boolean) => void;
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

const RETURN_LINES = (lastPath: string, count: number) => [
  { key: 'init',    text: 'NEEL.OS v1.0.0  [kernel 6.1.0-neel · Mumbai]' },
  { key: 'sep1',   text: '──────────────────────────────────────────────────────────' },
  { key: 'cache',  text: 'Session restored from cache.' },
  { key: 'sep2',   text: '──────────────────────────────────────────────────────────' },
  { key: 'blank',  text: '' },
  { key: 'wb',     text: 'Welcome back, visitor.' },
  { key: 'lp',     text: `Last session: ${lastPath}` },
  { key: 'sc',     text: `Session ${String(count).padStart(2, '0')}.` },
];

export default function Boot({ session, onComplete }: BootProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [showSoundGate, setShowSoundGate] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const startRef = useRef(performance.now());
  const isReturn = session.count > 1;

  const formatLine = (text: string): string => {
    const t = ((performance.now() - startRef.current) / 1000).toFixed(3);
    return text.replace(/\{t\+[\d.]+\}/g, `t+${t}`);
  };

  useEffect(() => {
    const rawLines = isReturn
      ? RETURN_LINES(session.lastPath, session.count)
      : BOOT_LINES;

    let i = 0;
    const interval = setInterval(() => {
      if (i < rawLines.length) {
        setLines(prev => [...prev, formatLine(rawLines[i].text)]);
        i++;
      } else {
        clearInterval(interval);
        if (isReturn) {
          setShowResume(true);
        } else {
          setTimeout(() => setShowSoundGate(true), 400);
        }
      }
    }, 60);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResume = (fresh: boolean) => {
    onComplete(session.soundEnabled);
  };

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
          <div key={i}>{line || ' '}</div>
        ))}
        {!showSoundGate && !showResume && (
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

      {showSoundGate && (
        <SoundGate onChoice={(enabled) => onComplete(enabled)} />
      )}

      {showResume && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-on-black)',
            marginTop: '24px',
            display: 'flex',
            gap: '16px',
          }}
        >
          <span>Resume previous session?</span>
          <button
            onClick={() => handleResume(false)}
            data-cursor-hover
            style={gateButtonStyle}
          >
            [yes]
          </button>
          <button
            onClick={() => handleResume(true)}
            data-cursor-hover
            style={gateButtonStyle}
          >
            [start fresh]
          </button>
        </div>
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

function SoundGate({ onChoice }: { onChoice: (enabled: boolean) => void }) {
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
          onClick={() => onChoice(true)}
          data-cursor-hover
          style={gateButtonStyle}
        >
          [y]
        </button>
        <button
          onClick={() => onChoice(false)}
          data-cursor-hover
          style={gateButtonStyle}
        >
          [n]
        </button>
      </div>
    </div>
  );
}

const gateButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--text-on-black)',
  padding: 0,
  opacity: 0.8,
  transition: 'opacity 0.15s',
};
