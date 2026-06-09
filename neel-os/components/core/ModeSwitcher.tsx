'use client';

import { Mode } from '@/hooks/useMode';

interface ModeSwitcherProps {
  mode: Mode;
  onChange: (m: Mode) => void;
}

const MODES: Mode[] = ['visitor', 'recruiter', 'debug'];

export default function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 30,
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        color: 'var(--text-on-black)',
      }}
    >
      <span style={{ opacity: 0.4 }}>MODE:</span>
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          data-cursor-hover
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            letterSpacing: 'inherit',
            color: 'inherit',
            padding: 0,
            opacity: mode === m ? 1 : 0.5,
            textDecoration: mode === m ? 'underline' : 'none',
            textUnderlineOffset: '3px',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.opacity = mode === m ? '1' : '0.5';
          }}
        >
          [{m.toUpperCase()}]
        </button>
      ))}
    </div>
  );
}
