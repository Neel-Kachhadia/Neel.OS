'use client';

import PathDisplay from '@/components/core/PathDisplay';

export default function NotFound() {
  return (
    <div
      style={{
        background: 'var(--black)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-on-black)',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div
          style={{
            borderTop: '1px solid rgba(245,240,232,0.2)',
            borderBottom: '1px solid rgba(245,240,232,0.2)',
            padding: '24px 0',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
            KERNEL PANIC — NEEL.OS v1.0.0
          </div>
          <div style={{ fontSize: '11px', opacity: 0.5 }}>
            ──────────────────────────────────────────────────────────
          </div>
        </div>

        <div style={{ marginBottom: '32px', fontSize: '12px' }}>
          <div style={{ marginBottom: '8px', opacity: 0.7 }}>
            route not found: <PathDisplay />
          </div>
          <div style={{ opacity: 0.4, marginBottom: '24px', fontSize: '10px' }}>
            ──────────────────────────────────────────────────────────
          </div>

          <div style={{ opacity: 0.5, marginBottom: '12px', fontSize: '10px' }}>available mounts:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.55, fontSize: '11px', marginLeft: '16px' }}>
            {[
              '/identity',
              '/projects',
              '/projects/neurofin',
              '/projects/equity-research',
              '/projects/market-terminal',
              '/stack',
              '/logs',
              '/transmission',
              'chat',
            ].map(mount => (
              <div key={mount}>{mount}</div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { window.location.href = '/'; }}
          style={{
            display: 'inline-block',
            border: '1px solid rgba(245,240,232,0.25)',
            background: 'transparent',
            color: 'var(--text-on-black)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            padding: '10px 20px',
            letterSpacing: '0.08em',
            opacity: 0.8,
            transition: 'opacity 0.15s',
            cursor: 'pointer',
          }}
        >
          [ reboot to /neel ]
        </button>
      </div>
    </div>
  );
}
