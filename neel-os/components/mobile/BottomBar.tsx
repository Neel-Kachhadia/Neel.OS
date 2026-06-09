'use client';

type Section = 'projects' | 'stack' | 'logs' | 'contact' | 'whoami';

interface BottomBarProps {
  active: Section;
  onChange: (s: Section) => void;
}

const PRIMARY: { id: Section; label: string }[] = [
  { id: 'projects', label: 'PROJECTS' },
  { id: 'stack',    label: 'STACK' },
  { id: 'logs',     label: 'LOGS' },
  { id: 'contact',  label: 'CONTACT' },
];

export default function BottomBar({ active, onChange }: BottomBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--black)',
        borderTop: '1px solid rgba(245,240,232,0.1)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {PRIMARY.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            padding: '14px 0',
            opacity: active === id ? 1 : 0.4,
            color: active === id ? 'var(--online)' : 'var(--text-on-black)',
            borderBottom: active === id ? '2px solid var(--online)' : '2px solid transparent',
            cursor: 'default',
            transition: 'opacity 0.15s',
            minHeight: '44px',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
