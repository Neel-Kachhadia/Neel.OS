'use client';

import { useEffect, useRef, useState } from 'react';
import BottomBar from './BottomBar';
import MobileProject from './MobileProject';
import { Session } from '@/lib/session';
import { Mode } from '@/hooks/useMode';
import RecruiterPanel from '@/components/modes/RecruiterPanel';

type Section = 'projects' | 'stack' | 'logs' | 'contact' | 'whoami';

const EMAIL = 'neel1234kachhadia@gmail.com';

const STACK_ITEMS = [
  { name: 'Python',       desc: 'AI pipelines, FastAPI backends, data processing' },
  { name: 'React / Next', desc: 'Frontends that behave like systems' },
  { name: 'LangGraph',    desc: 'Multi-agent coordination, NeuroFin + Equity' },
  { name: 'Three.js',     desc: 'WebGL shaders, single shared renderer context' },
  { name: 'Rust',         desc: 'Market terminal core — performance-critical path' },
  { name: 'AWS',          desc: 'Lambda, EC2, S3 — all projects deployed here' },
  { name: 'Redis',        desc: 'Live tick ingestion, caching layer' },
  { name: 'DuckDB',       desc: 'Historical market data, columnar analytics' },
];

const GROWTH_LOG = `[2024.08] B.Tech — Electronics & Telecom, DJSCE Mumbai
[2024.09] First deployed system: NeuroFin prototype
[2024.11] Mumbai Hacks 2024 — 48h, 3,000+ participants
[2024.12] NeuroFin v1 live
[2025.02] Amazon AI Challenge — Top 300, 115 countries
[2025.04] Equity Research Platform deployed
[2025.06] Odoo Hackathon — ERP suite end-to-end
[2025.09] Market Terminal — architecture phase
[2026.01] NEEL.OS — portfolio became the proof`;

const FAILURES_LOG = `[FAIL] NeuroFin v1 — too many features at once
[FIX]  Isolated agent pipeline into discrete modules
[LEARNED] Performance is a feature, not an afterthought

[FAIL] First portfolio — overdesigned, zero substance
[FIX]  Rebuilt around filesystem concept
[LEARNED] Visual effects without clear UX is noise

[FAIL] Early LLM outputs — high hallucination rate
[FIX]  Fine-tuned, added RAG grounding
[LEARNED] Demonstration beats description. Every time.

[FAIL] Tried to explain intelligence in portfolio
[FIX]  Built the portfolio as a running system
[LEARNED] If you have to explain it, you haven't built it yet`;

type LogTab = 'growth' | 'failures' | 'shipping';

interface PocketShellProps {
  session: Session;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function PocketShell({ session, mode, onModeChange }: PocketShellProps) {
  const [section, setSection] = useState<Section>('projects');
  const [logTab, setLogTab]   = useState<LogTab>('failures');
  const [copied, setCopied]   = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMobileMode = mode === 'recruiter' ? 'recruiter' : 'visitor';

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        copiedTimerRef.current = null;
        setCopied(false);
      }, 2000);
    } catch {/* ignore */}
  };

  if (mode === 'recruiter') {
    return (
      <RecruiterPanel
        onClose={() => onModeChange('visitor')}
        onTransmission={() => {
          onModeChange('visitor');
          setSection('contact');
        }}
      />
    );
  }

  return (
    <div
      style={{
        background: 'var(--black)',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-on-black)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--black)',
          borderBottom: '1px solid rgba(245,240,232,0.1)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12px', letterSpacing: '0.08em', fontWeight: 700 }}>NEEL.OS · NEEL KACHHADIA</span>
        <span style={{ fontSize: '10px', color: 'var(--online)', letterSpacing: '0.1em' }}>
          ONLINE ●
        </span>
      </div>

      {/* Path */}
      <div
        style={{
          position: 'fixed',
          top: '44px',
          left: 0,
          right: 0,
          zIndex: 99,
          background: 'var(--black)',
          padding: '6px 16px',
          fontSize: '9px',
          color: 'var(--text-mono-dark)',
          opacity: 0.5,
          borderBottom: '1px solid rgba(245,240,232,0.05)',
        }}
      >
        root@neel:/{section}$
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          paddingTop: '80px',
          paddingBottom: '124px',
          overflowY: 'auto',
        }}
      >
        {section === 'projects' && (
          <MobileProject />
        )}

        {section === 'stack' && (
          <div style={{ padding: '20px 16px' }}>
            <div style={{ fontSize: '11px', opacity: 0.4, marginBottom: '24px', letterSpacing: '0.1em' }}>
              /neel/stack — installed packages
            </div>
            {STACK_ITEMS.map(({ name, desc }) => (
              <div key={name} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{name}</div>
                <div style={{ fontSize: '11px', opacity: 0.5, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        )}

        {section === 'logs' && (
          <div style={{ padding: '20px 16px' }}>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '24px',
                fontSize: '11px',
                borderBottom: '1px solid rgba(245,240,232,0.1)',
                paddingBottom: '12px',
              }}
            >
              {(['growth', 'failures', 'shipping'] as LogTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setLogTab(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-on-black)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    opacity: logTab === t ? 1 : 0.4,
                    textDecoration: logTab === t ? 'underline' : 'none',
                    textUnderlineOffset: '3px',
                    padding: 0,
                    cursor: 'default',
                  }}
                >
                  {t}.log
                </button>
              ))}
            </div>
            <pre
              style={{
                fontSize: '11px',
                lineHeight: 1.7,
                opacity: logTab === 'failures' ? 1 : 0.7,
                whiteSpace: 'pre-wrap',
                color: 'var(--text-mono-dark)',
              }}
            >
              {logTab === 'growth' ? GROWTH_LOG : logTab === 'failures' ? FAILURES_LOG : ''}
            </pre>
            {logTab === 'failures' && (
              <div style={{ marginTop: '24px', fontSize: '9px', opacity: 0.3 }}>
                failures.log — the most important file in this system.
              </div>
            )}
          </div>
        )}

        {section === 'contact' && (
          <div style={{ padding: '20px 16px' }}>
            <div style={{ fontSize: '11px', opacity: 0.4, marginBottom: '32px' }}>
              root@neel:~$ ssh neel@transmission
            </div>
            <button
              onClick={copyEmail}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-on-black)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 5vw, 32px)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                padding: 0,
                cursor: 'default',
                lineHeight: 1.2,
                marginBottom: '12px',
                display: 'block',
                width: '100%',
                textAlign: 'left',
                wordBreak: 'break-all',
              }}
            >
              {EMAIL}
            </button>
            <div style={{ fontSize: '10px', opacity: copied ? 1 : 0.4, marginBottom: '32px', transition: 'opacity 0.2s' }}>
              {copied ? 'copied.' : 'tap to copy'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', opacity: 0.7 }}>
              Let&apos;s build something{' '}
              <span style={{ color: 'var(--lime)' }}>shipping</span>.
            </div>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://github.com/Neel-Kachhadia"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  opacity: 0.6,
                  color: 'var(--text-on-black)',
                  textDecoration: 'none',
                }}
              >
                → github.com/Neel-Kachhadia
              </a>
              <a
                href="https://linkedin.com/in/neelkachhadia"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  opacity: 0.6,
                  color: 'var(--text-on-black)',
                  textDecoration: 'none',
                }}
              >
                → linkedin.com/in/neelkachhadia
              </a>
            </div>
          </div>
        )}

        {section === 'whoami' && (
          <div style={{ padding: '20px 16px' }}>
            <div style={{ fontSize: '11px', opacity: 0.4, marginBottom: '24px' }}>cat /neel/identity.md</div>
            <pre
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                opacity: 0.85,
              }}
            >
{`Neel Kachhadia

Electronics & Telecommunication
DJSCE Mumbai · 2024–2028 · Honours in VLSI

I build interfaces that behave like systems.
Deployed, not prototyped. Running, not described.

I care about:
  → production-grade AI pipelines
  → frontend systems that think
  → performance as a design decision
  → shipping before most people have planned

Session ${session.count.toString().padStart(2, '0')} · Mumbai · Available · Shipping`}
            </pre>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: '45px',
          zIndex: 101,
          background: 'var(--black)',
          borderTop: '1px solid rgba(245,240,232,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        {(['visitor', 'recruiter'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              minHeight: '44px',
              background: 'none',
              border: 'none',
              borderBottom: activeMobileMode === m ? '2px solid var(--online)' : '2px solid transparent',
              color: activeMobileMode === m ? 'var(--online)' : 'var(--text-on-black)',
              opacity: activeMobileMode === m ? 1 : 0.45,
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.1em',
            }}
          >
            [{m.toUpperCase()}]
          </button>
        ))}
      </div>

      <BottomBar active={section} onChange={setSection} />
    </div>
  );
}
