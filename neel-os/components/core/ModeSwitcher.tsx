'use client';

import { useEffect, useState } from 'react';
import { Mode } from '@/hooks/useMode';

interface ModeSwitcherProps {
  mode: Mode;
  onChange: (m: Mode) => void;
}

const MODES: Mode[] = ['visitor', 'recruiter', 'debug'];

export default function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '8px' : '24px',
        right: isMobile ? '12px' : '24px',
        zIndex: 30,
        fontFamily: 'var(--font-mono)',
        fontSize: isMobile ? '8px' : '11px',
        letterSpacing: isMobile ? '0.06em' : '0.1em',
        display: 'flex',
        gap: isMobile ? '6px' : '12px',
        alignItems: 'center',
        color: 'var(--text-on-black)',
      }}
    >
      <span style={{ opacity: 0.4 }}>MODE:</span>
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-label={`Switch to ${m} mode`}
          aria-pressed={mode === m}
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
