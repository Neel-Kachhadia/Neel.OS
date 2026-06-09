'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import DecryptText from '@/components/core/DecryptText';
import ProjectShell from './ProjectShell';

const ThesisShader = dynamic(() => import('@/components/webgl/ThesisShader'), { ssr: false });

const RUN_LINES = [
  'root@neel:/projects$ run equity-research --case-study',
  '',
  '[INIT] Mounting live market data streams...... [OK]',
  '[INIT] Loading LangGraph reasoning chain...... [OK]',
  '[INIT] Starting RAG pipeline.................. [OK]',
  '[INIT] Calibrating LLM parameters............. [OK]',
  '[INIT] Connecting REST data APIs.............. [OK]',
  '[INIT] Compiling React dashboard.............. [OK]',
  '',
  'Opening case study...',
];

const GIT_LOG = [
  'commit f3c8a21  deployed on AWS EC2 with load balancing',
  'commit e1b9d33  Recharts dashboard with real-time data',
  'commit d07f2a4  fine-tuned LLM — reduced stock analysis drift',
  'commit c44b891  RAG pipeline for contextual market retrieval',
  'commit b2f3c11  multi-step LangGraph reasoning workflows',
  'commit a8e1d55  live market data ingestion from REST APIs',
  'commit 9d2b440  FastAPI microservice architecture',
];

export default function Equity() {
  const [shellDone, setShellDone] = useState(false);

  return (
    <section
      id="equity"
      style={{
        background: 'var(--cold-blue)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: '50vh', position: 'relative' }}>
        <ThesisShader autoPlay />
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
            color: 'var(--steel)',
            fontWeight: 700,
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          <DecryptText text="EQUITY RESEARCH" />
        </div>

        <ProjectShell lines={RUN_LINES} onComplete={() => setShellDone(true)} />

        {shellDone && (
          <div style={{ marginTop: '40px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: 1.7,
                color: 'var(--steel)',
                maxWidth: '640px',
                marginBottom: '32px',
                opacity: 0.85,
              }}
            >
              Investment research platform. LangGraph multi-step reasoning for thesis generation.
              RAG pipelines for contextual market data. Fine-tuned LLM for reduced hallucination.
              Live data ingestion. Recharts dashboards with real-time visualization.
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--steel)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '40px',
                opacity: 0.6,
              }}
            >
              {['React', 'FastAPI', 'LangGraph', 'AWS EC2', 'S3', 'Tailwind', 'Recharts'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)', opacity: 0.4, marginBottom: '8px' }}>
              git log --project equity-research
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7, color: 'var(--steel)', opacity: 0.7 }}>
              {GIT_LOG.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
