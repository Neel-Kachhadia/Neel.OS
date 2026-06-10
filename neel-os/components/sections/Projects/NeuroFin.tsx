'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import DecryptText from '@/components/core/DecryptText';
import ProjectShell from './ProjectShell';
const GlobalTaxCalculator = dynamic(() => import('./GlobalTaxCalculator'), { ssr: false, loading: () => null });

const AgentTrace = dynamic(() => import('./AgentTrace'), { ssr: false, loading: () => null });

const RUN_LINES = [
  'root@neel:/projects$ run neurofin --case-study',
  '',
  '[INIT] Loading problem statement.............. [OK]',
  '[INIT] Mounting market data pipeline.......... [OK]',
  '[INIT] Starting LangGraph agent system........ [OK]',
  '[INIT] Loading Isolation Forest module........ [OK]',
  '[INIT] Compiling React frontend............... [OK]',
  '[INIT] Verifying AWS Lambda deployment........ [OK]',
  '[INIT] Connecting SNS alert pipeline.......... [OK]',
  '',
  'Opening case study...',
];

const GIT_LOG = [
  'commit e9b3f07  reduced hallucination rate — LLM fine-tuning',
  'commit d44e221  deployed to AWS Lambda + S3 persistence',
  'commit c8f1a33  added Isolation Forest anomaly detection',
  'commit b12d445  integrated LangGraph multi-agent routing',
  'commit a9f2b11  built adaptive feedback loop',
  'commit 8c3d290  RAG pipeline for financial context retrieval',
  'commit 7a1f445  initial FastAPI microservice scaffold',
];

interface NeuroFinProps {
  soundEnabled?: boolean;
}

export default function NeuroFin({ soundEnabled = false }: NeuroFinProps) {
  const [shellDone,    setShellDone]    = useState(false);
  const [shaderActive, setShaderActive] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setShaderActive(entry.isIntersecting),
      { rootMargin: '700px 0px', threshold: 0.01 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="neurofin"
      ref={sectionRef}
      data-cursor-accent="#B45309"
      style={{
        background: 'var(--black)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: '50vh', position: 'relative' }}>
        <AgentTrace isActive={shaderActive} />
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
            color: 'var(--amber)',
            fontWeight: 700,
            marginBottom: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          <DecryptText text="NEUROFIN" soundEnabled={soundEnabled} />
        </div>

        <ProjectShell lines={RUN_LINES} onComplete={() => setShellDone(true)} />

        {shellDone && (
          <div style={{ marginTop: '40px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: 1.7,
                color: 'var(--text-mono-dark)',
                maxWidth: '640px',
                marginBottom: '32px',
              }}
            >
              AI financial assistant. 12 specialist agents coordinated via LangGraph.
              Isolation Forest anomaly detection for risk scoring 0–100.
              Adaptive feedback loop. SNS alerts on threshold breach.
              Sub-200ms latency under concurrent load.
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-mono-dark)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '40px',
                opacity: 0.7,
              }}
            >
              {['React', 'Python', 'LangGraph', 'AWS Lambda', 'S3', 'Docker', 'Groq'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', opacity: 0.6, letterSpacing: '0.12em', marginBottom: '0' }}>
              TRY IT  ·  TAX CALCULATOR
            </div>
            <GlobalTaxCalculator />

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-mono-dark)',
                opacity: 0.5,
                marginBottom: '8px',
                marginTop: '48px',
              }}
            >
              git log --project neurofin
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: 1.7,
                color: 'var(--text-mono-dark)',
              }}
            >
              {GIT_LOG.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
