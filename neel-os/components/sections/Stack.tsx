'use client';

import { useState } from 'react';

interface Package {
  name: string;
  version: string;
  status: 'installed' | 'active' | 'deployed';
}

const PACKAGES: Package[] = [
  { name: 'react',            version: '18.2.0',  status: 'installed' },
  { name: 'next',             version: '14.0.0',  status: 'installed' },
  { name: 'typescript',       version: '5.0.0',   status: 'installed' },
  { name: 'python',           version: '3.12.0',  status: 'installed' },
  { name: 'fastapi',          version: '0.110.0', status: 'installed' },
  { name: 'postgresql',       version: '15.0',    status: 'installed' },
  { name: 'prisma',           version: '5.0.0',   status: 'installed' },
  { name: 'langgraph',        version: '0.1.0',   status: 'installed' },
  { name: 'openai',           version: '1.0.0',   status: 'installed' },
  { name: 'pandas',           version: '2.0.0',   status: 'installed' },
  { name: 'numpy',            version: '1.26.0',  status: 'installed' },
  { name: 'docker',           version: '24.0.0',  status: 'installed' },
  { name: 'rust',             version: '1.76.0',  status: 'installed' },
  { name: 'redis',            version: '7.2.0',   status: 'installed' },
  { name: 'duckdb',           version: '0.10.0',  status: 'installed' },
  { name: 'three',            version: '0.160.0', status: 'active' },
  { name: 'gsap',             version: '3.12.0',  status: 'active' },
  { name: 'tone',             version: '14.7.0',  status: 'active' },
  { name: 'aws',              version: '',        status: 'deployed' },
  { name: 'vercel',           version: '',        status: 'deployed' },
  { name: 'firebase',         version: '',        status: 'installed' },
];

const NPM_INSPECT: Record<string, string[]> = {
  three: [
    'Used in: NEEL.OS hero shaders, project visuals, contact ripple',
    'Why: single WebGL context — all scenes share renderer.',
    '     Custom GLSL requires low-level access.',
    '     One draw call per scene. Deterministic 60fps.',
  ],
  langgraph: [
    'Used in: NeuroFin 12-specialist routing, Equity Research reasoning chain',
    'Why: graph-based coordination over linear chains.',
    '     Conditional routing between specialist agents.',
    '     Measurably reduced recommendation drift vs LangChain.',
  ],
  fastapi: [
    'Used in: NeuroFin backend, Equity Research data API layer',
    'Why: async by default. Type-safe with Pydantic.',
    '     Stateless processing for high-frequency financial data.',
    '     Sub-200ms response times under concurrent load.',
  ],
  rust: [
    'Used in: Indian Market Terminal core',
    'Why: zero-cost abstractions, deterministic latency.',
    '     Tick ingestion at market frequency requires ns-level control.',
    '     Safe concurrency model for multi-threaded data pipelines.',
  ],
};

export default function Stack() {
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const handleInspect = (pkg: string) => {
    setInspecting(pkg);
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const parts = input.trim().split(/\s+/);
    if (parts[0] === 'npm' && parts[1] === 'inspect' && parts[2]) {
      handleInspect(parts[2]);
    }
    setInput('');
  };

  return (
    <section
      id="stack"
      style={{
        background: 'var(--black)',
        padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
        paddingRight: 'var(--section-pad-x)',
        minHeight: '80vh',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-mono-dark)',
          marginBottom: '24px',
        }}
      >
        cat /neel/stack/packages.json
      </div>

      {/* Package list */}
      {!inspecting && (
        <>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-on-black)',
              opacity: 0.4,
              marginBottom: '8px',
            }}
          >
            INSTALLED PACKAGES
            <br />────────────────────────────────────────────────────────
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: 1.8,
            }}
          >
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                onClick={() => NPM_INSPECT[pkg.name] && handleInspect(pkg.name)}
                data-cursor-hover={NPM_INSPECT[pkg.name] ? true : undefined}
                style={{
                  display: 'flex',
                  gap: '8px',
                  color: pkg.status === 'active' ? 'var(--online)' : 'var(--text-mono-dark)',
                  cursor: NPM_INSPECT[pkg.name] ? 'pointer' : 'default',
                  opacity: pkg.status === 'deployed' ? 0.7 : 1,
                }}
              >
                <span style={{ minWidth: '160px' }}>{pkg.name}</span>
                <span style={{ minWidth: '80px', opacity: 0.6 }}>{pkg.version || '──'}</span>
                <span style={{ opacity: 0.8 }}>{pkg.status}</span>
                {NPM_INSPECT[pkg.name] && (
                  <span style={{ opacity: 0.4, fontSize: '9px' }}>[inspect]</span>
                )}
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-on-black)',
              opacity: 0.4,
              marginTop: '8px',
            }}
          >
            ────────────────────────────────────────────────────────
          </div>

          {/* Command input */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-mono-dark)',
            }}
          >
            <span>root@neel:/stack$</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleCommand}
              placeholder="npm inspect [package]"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-on-black)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                width: '300px',
                caretColor: 'var(--text-on-black)',
              }}
            />
          </div>
        </>
      )}

      {/* Inspect output */}
      {inspecting && (
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-on-black)',
              marginBottom: '16px',
            }}
          >
            $ npm inspect {inspecting}
            <br />
            {NPM_INSPECT[inspecting]
              ? NPM_INSPECT[inspecting].map(line => (
                  <div key={line} style={{ lineHeight: 1.7, color: 'var(--text-mono-dark)' }}>
                    {line}
                  </div>
                ))
              : <span style={{ opacity: 0.5 }}>package not found in stack</span>
            }
          </div>
          <button
            onClick={() => setInspecting(null)}
            data-cursor-hover
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-mono-dark)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              opacity: 0.5,
              padding: 0,
            }}
          >
            ← back
          </button>
        </div>
      )}
    </section>
  );
}
