'use client';

import { useState } from 'react';

type LogFile = 'growth' | 'failures' | 'shipping';

const GROWTH_LOG = `[2024.08] Started B.Tech — Electronics & Telecom, DJSCE Mumbai
[2024.09] Began building. First deployed system: NeuroFin prototype.
[2024.11] Mumbai Hacks 2024 — shipped full-stack AI product
           3,000+ participants. 300+ teams. Shipped in 48 hours.
[2024.12] NeuroFin v1 live — budgeting, investments, tax, goals
[2025.02] Amazon 10,000 AI Ideas Challenge
           Top 300 semi-finalist from 115 countries, 10,000+ submissions
           Built and deployed prototype on AWS Free Tier for judging
[2025.04] Equity Research Platform deployed
           Live market data. LangGraph reasoning. RAG pipelines.
[2025.06] Odoo Hackathon — ERP feature suite, end-to-end
[2025.09] Indian Market Terminal — architecture phase
           Rust + Python + Redis + DuckDB + Options Greeks
[2026.01] NEEL.OS — portfolio became the proof`;

const FAILURES_LOG = `[FAIL] NeuroFin v1 — too many features at once
[FAIL] Poor latency under concurrent load
[FIX]  Isolated agent pipeline into discrete modules
[FIX]  Added Redis caching layer
[LEARNED] Performance is a feature, not an afterthought

[FAIL] First portfolio — overdesigned, zero substance
[FAIL] Scattered effects with no organizing principle
[FIX]  Rebuilt around filesystem concept
[FIX]  Every element serves the concept or is cut
[LEARNED] Visual effects without clear UX is noise

[FAIL] Early LLM outputs — high hallucination rate
[FAIL] Stock analysis outputs were unreliable
[FIX]  Fine-tuned behavior, added RAG grounding
[FIX]  Isolation Forest for anomaly validation
[LEARNED] Demonstration beats description. Every time.

[FAIL] Tried to explain intelligence in portfolio
[FAIL] Descriptions of systems are not systems
[FIX]  Built the portfolio as a running system
[LEARNED] If you have to explain it, you haven't built it yet`;

const SHIPPING_LOG = `[2024] NeuroFin — conversational AI for personal finance
       React · Python · LangGraph · AWS Lambda · S3
       Sub-200ms latency under concurrent load

[2025] Equity Research Platform
       React · FastAPI · LangGraph · AWS EC2/S3
       Live market data · RAG pipelines · Recharts dashboard

[2025] Mentora — AI mentor-mentee matching platform
       Next.js 14 · TypeScript · Prisma · PostgreSQL · OpenAI
       Real-time bidirectional chat · LLM-powered matching

[2026] NEEL.OS — living portfolio runtime
       Next.js 14 · Three.js · GSAP · Tone.js · Groq API
       You are inside this one right now`;

const LOGS: Record<LogFile, string> = {
  growth: GROWTH_LOG,
  failures: FAILURES_LOG,
  shipping: SHIPPING_LOG,
};

function lineColor(line: string): string {
  if (line.startsWith('[FAIL]')) return '#B45309';
  if (line.startsWith('[FIX]'))  return '#4AFF91';
  if (line.startsWith('[LEARNED]')) return 'rgba(245,240,232,0.6)';
  return 'rgba(245,240,232,0.35)';
}

function FailuresLog({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        maxWidth: '760px',
        margin: 0,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ color: lineColor(line) }}>
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}

export default function Logs() {
  const [active, setActive] = useState<LogFile>('failures');

  return (
    <section
      id="logs"
      style={{
        background: 'var(--black)',
        padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
        paddingRight: 'var(--section-pad-x)',
        minHeight: '80vh',
      }}
    >
      {/* File tabs */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '32px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.1em',
        }}
      >
        {(['growth', 'failures', 'shipping'] as LogFile[]).map((log) => (
          <button
            key={log}
            onClick={() => setActive(log)}
            data-cursor-hover
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-on-black)',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              letterSpacing: 'inherit',
              cursor: 'pointer',
              opacity: active === log ? 1 : 0.4,
              textDecoration: active === log ? 'underline' : 'none',
              textUnderlineOffset: '3px',
              padding: 0,
              transition: 'opacity 0.15s',
            }}
          >
            {log}.log
          </button>
        ))}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-mono-dark)',
          marginBottom: '24px',
        }}
      >
        cat /neel/logs/{active}.log
      </div>

      {active === 'failures' ? (
        <FailuresLog content={LOGS[active]} />
      ) : (
        <pre
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-mono-dark)',
            whiteSpace: 'pre-wrap',
            maxWidth: '760px',
            margin: 0,
          }}
        >
          {LOGS[active]}
        </pre>
      )}

      {active === 'failures' && (
        <div
          style={{
            marginTop: '32px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-mono-dark)',
            opacity: 0.5,
          }}
        >
          failures.log — the most important file in this system.
          every 19-year-old lists wins. nobody documents failures honestly.
        </div>
      )}
    </section>
  );
}
