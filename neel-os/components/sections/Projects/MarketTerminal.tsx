'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DecryptText from '@/components/core/DecryptText';
import ProjectShell from './ProjectShell';
const PriceChart = dynamic(() => import('./PriceChart'), { ssr: false, loading: () => null });

const LiveTicker = dynamic(() => import('./LiveTicker'), { ssr: false, loading: () => null });

const RUN_LINES = [
  'root@neel:/projects$ run market-terminal --case-study',
  '',
  '[INIT] Loading Rust core...................... [OK]',
  '[INIT] Starting FastAPI layer................. [OK]',
  '[INIT] Connecting Redis pipeline.............. [OK]',
  '[INIT] Mounting DuckDB schema................. [OK]',
  '[WARN] Options engine......................... [BUILDING]',
  '[WARN] IV surface module...................... [BUILDING]',
  '[WARN] Tauri shell............................ [BUILDING]',
  '',
  'System partially operational. Case study loading...',
];

const GIT_LOG = [
  'commit d3f9a22  Redis tick ingestion pipeline active',
  'commit c1b8e44  DuckDB schema for historical data',
  'commit b44a991  FastAPI layer connecting Rust core',
  'commit a9f3b11  Rust core — initial architecture',
  'commit 8c2d330  system design and schema definition',
];

const BUILD_MANIFEST = [
  { label: 'RUST CORE',      done: true  },
  { label: 'FASTAPI LAYER',  done: true  },
  { label: 'REDIS PIPELINE', done: true  },
  { label: 'DUCKDB SCHEMA',  done: true  },
  { label: 'OPTIONS ENGINE', done: false },
  { label: 'IV SURFACE',     done: false },
  { label: 'TAURI SHELL',    done: false },
];

interface MarketTerminalProps {
  soundEnabled?: boolean;
}

export default function MarketTerminal({ soundEnabled = false }: MarketTerminalProps) {
  const [shellDone, setShellDone] = useState(false);

  return (
    <section
      id="market"
      data-cursor-accent="#003D2E"
      style={{
        background: 'var(--terminal-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ height: '50vh', position: 'relative' }}>
        <LiveTicker />

        {/* Build manifest overlay */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            lineHeight: 1.8,
            color: 'var(--phosphor)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ opacity: 0.6, marginBottom: '4px' }}>████████████████████░░░░░  70%</div>
          {BUILD_MANIFEST.map((item) => (
            <div key={item.label} style={{ opacity: item.done ? 0.7 : 0.4 }}>
              {item.label.padEnd(20, ' ·')} {item.done ? '✓' : '◌'}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
          paddingRight: 'var(--section-pad-x)',
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 64px)',
            color: 'var(--phosphor)',
            fontWeight: 700,
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          <DecryptText text="MARKET TERMINAL" soundEnabled={soundEnabled} />
        </div>

        <ProjectShell lines={RUN_LINES} onComplete={() => setShellDone(true)} />

        {shellDone && (
          <div style={{ marginTop: '40px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: 1.7,
                color: 'var(--phosphor)',
                maxWidth: '640px',
                marginBottom: '32px',
                opacity: 0.75,
              }}
            >
              Professional-grade NSE research terminal. Live tick ingestion via Redis.
              Historical data via DuckDB. Options Greeks and IV surface calculation in progress.
              4 languages running simultaneously: Rust, Python, SQL, JavaScript.
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--phosphor)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '40px',
                opacity: 0.5,
              }}
            >
              {['Rust', 'FastAPI', 'Redis', 'DuckDB', 'Python', 'Tauri (planned)'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--phosphor)', opacity: 0.6, letterSpacing: '0.12em', marginBottom: '0' }}>
              TRY IT  ·  PRICE CHART
            </div>
            <PriceChart />

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--phosphor)', opacity: 0.3, marginBottom: '8px', marginTop: '48px' }}>
              git log --project market-terminal
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, color: 'var(--phosphor)', opacity: 0.6 }}>
              {GIT_LOG.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
