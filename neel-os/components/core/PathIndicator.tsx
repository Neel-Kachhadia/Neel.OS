'use client';

interface PathIndicatorProps {
  path: string;
  onWhite?: boolean;
}

export default function PathIndicator({ path, onWhite = false }: PathIndicatorProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: 'calc(200px + 24px)',
        zIndex: 30,
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.05em',
        color: onWhite ? 'var(--text-secondary)' : 'var(--text-on-black)',
        opacity: onWhite ? 0.4 : 0.6,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      root@neel:{path} $
    </div>
  );
}
