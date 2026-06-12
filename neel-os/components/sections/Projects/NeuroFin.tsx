'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import GlobalTaxCalculator from './GlobalTaxCalculator';

const AgentTrace = dynamic(() => import('./AgentTrace'), { ssr: false, loading: () => null });

const BG = '#0A0A0A';
const FG = '#F5F0E8';
const AMBER = '#B45309';
const GREEN = '#4AFF91';
const MONO = 'var(--font-mono)';

type TabId = 'trace' | 'calculate' | 'ask' | 'readme' | 'git';

const COMMANDS: { id: TabId; label: string }[] = [
  { id: 'trace', label: 'trace' },
  { id: 'calculate', label: 'calculate' },
  { id: 'ask', label: 'ask' },
  { id: 'readme', label: 'readme' },
  { id: 'git', label: 'git log' },
];

const GIT_LOG = [
  ['e9b3f07', 'reduced hallucination rate — LLM fine-tuning'],
  ['6f2a910', 'stabilized stdout calculator mount'],
  ['d44e221', 'deployed to AWS Lambda + S3 persistence'],
  ['c8f1a33', 'added Isolation Forest anomaly detection'],
  ['b12d445', 'integrated LangGraph multi-agent routing'],
  ['a9f2b11', 'built adaptive feedback loop'],
  ['8c3d290', 'RAG pipeline for financial context retrieval'],
  ['7a1f445', 'initial FastAPI microservice scaffold'],
];

interface NeuroFinProps {
  soundEnabled?: boolean;
}

export default function NeuroFin({ soundEnabled = false }: NeuroFinProps) {
  const [active, setActive] = useState<TabId>('trace');
  const [traceRun, setTraceRun] = useState(0);

  return (
    <section
      id="neurofin"
      data-cursor-accent={AMBER}
      style={{
        background: BG,
        minHeight: '100vh',
        color: FG,
        fontFamily: MONO,
        padding: '80px 48px 40px calc(200px + 48px)',
      }}
    >
      <Header />

      <div style={{ marginTop: '32px' }}>
        <Prompt command="ls" />
        <pre style={{ ...preStyle, marginTop: '12px', paddingLeft: '48px' }}>
{`trace        — live agent pipeline trace
calculate    — global tax analysis module
ask          — query interface
readme       — project documentation
git log      — commit history`}
        </pre>
      </div>

      <CommandRow active={active} onSelect={setActive} />

      {active === 'trace' && (
        <TerminalBlock>
          <Prompt command="run trace --demo" />
          <Line text="[Running with demo input: ₹12,00,000]" style={{ marginTop: '16px', opacity: 0.65 }} />
          <div style={{ height: '360px', marginTop: '16px', marginLeft: '-48px' }}>
            <AgentTrace isActive={active === 'trace'} runKey={traceRun} />
          </div>
          <Line text="Trace complete. 5 agents processed." style={{ marginTop: '16px' }} />
          <MinorSeparator />
          <Line text="> Try your own: run calculate" accent />
        </TerminalBlock>
      )}

      {active === 'calculate' && (
        <TerminalBlock>
          <Prompt command="run calculate" />
          <div style={{ marginTop: '16px', maxWidth: '760px' }}>
            <GlobalTaxCalculator
              soundEnabled={soundEnabled}
              onRunTrace={() => setTraceRun(v => v + 1)}
            />
          </div>
          {traceRun > 0 && (
            <div style={{ height: '320px', marginTop: '24px', marginLeft: '-48px' }}>
              <AgentTrace isActive={active === 'calculate'} runKey={traceRun} />
            </div>
          )}
        </TerminalBlock>
      )}

      {active === 'ask' && (
        <TerminalBlock>
          <Prompt command="query --system" />
          <div style={{ marginTop: '16px', fontSize: '13px', letterSpacing: '0.08em' }}>
            NEEL.OS  ·  QUERY INTERFACE  ·  <span style={{ color: GREEN }}>ONLINE ●</span>
          </div>
          <MinorSeparator compact />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', maxWidth: '720px' }}>
            <span style={{ color: AMBER }}>{'>'}</span>
            <input
              aria-label="NeuroFin query input"
              placeholder="_"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: FG,
                fontFamily: MONO,
                fontSize: '13px',
                caretColor: AMBER,
              }}
            />
          </div>
        </TerminalBlock>
      )}

      {active === 'readme' && (
        <TerminalBlock>
          <Prompt command="cat readme.md" />
          <pre style={{ ...preStyle, marginTop: '16px', maxWidth: '760px' }}>
{`Production personal-finance AI assistant. 12 specialist agents
coordinate via LangGraph across budgeting, tax, risk,
goals, and recommendations. Isolation Forest flags
anomalous spend and investment behavior before the
recommendation layer composes a response.

Adaptive feedback loop. SNS alerts on threshold breach.
Sub-200ms target latency under concurrent load. Designed
as an agent pipeline, not a single chatbot wrapper.

Stack: React · Python · LangGraph · AWS Lambda
       S3 · Docker · Groq

Status: DEPLOYED ●
Repo:   github.com/Neel-Kachhadia/NeuroFin`}
          </pre>
        </TerminalBlock>
      )}

      {active === 'git' && (
        <TerminalBlock>
          <Prompt command="git log --oneline" />
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {GIT_LOG.map(([hash, msg]) => (
              <div key={hash} style={{ fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color: `rgba(245,240,232,0.4)`, marginRight: '14px' }}>{hash} </span>
                <span style={{ color: FG }}>{msg}</span>
              </div>
            ))}
          </div>
        </TerminalBlock>
      )}

      <BottomPrompt />
    </section>
  );
}

function Header() {
  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          letterSpacing: '0.08em',
          color: FG,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '24px',
          maxWidth: '960px',
        }}
      >
        <span>NEUROFIN  ·  AI FINANCIAL ASSISTANT</span>
        <span style={{ color: GREEN }}>LIVE ●</span>
      </div>
      <MajorSeparator />
    </div>
  );
}

function CommandRow({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '20px',
        marginBottom: '24px',
        fontSize: '12px',
      }}
    >
      {COMMANDS.map((cmd, i) => (
        <span key={cmd.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onSelect(cmd.id)}
            data-cursor-hover
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: active === cmd.id ? AMBER : FG,
              opacity: active === cmd.id ? 1 : 0.45,
              fontFamily: MONO,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {active === cmd.id ? `> ${cmd.label}` : cmd.label}
          </button>
          {i < COMMANDS.length - 1 && <span style={{ color: FG, opacity: 0.2 }}>·</span>}
        </span>
      ))}
    </div>
  );
}

function Prompt({ command }: { command: string }) {
  return (
    <div style={{ fontSize: '13px', color: FG, lineHeight: 1.6 }}>
      root@neel:/projects/neurofin $ {command}
    </div>
  );
}

function TerminalBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingLeft: '48px', marginTop: '32px', maxWidth: '1040px' }}>
      {children}
    </div>
  );
}

function Line({ text, accent, style }: { text: string; accent?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: '13px', lineHeight: 1.6, color: accent ? AMBER : FG, ...style }}>
      {text}
    </div>
  );
}

function MajorSeparator() {
  return (
    <div style={{ color: 'rgba(180,83,9,0.3)', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '8px' }}>
      {'━'.repeat(120)}
    </div>
  );
}

function MinorSeparator({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ color: 'rgba(180,83,9,0.15)', overflow: 'hidden', whiteSpace: 'nowrap', margin: compact ? '8px 0' : '16px 0' }}>
      {'─'.repeat(80)}
    </div>
  );
}

function BottomPrompt() {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openCommandTerminal}
      onKeyDown={handlePromptKey}
      data-cursor-hover
      style={{
        marginTop: '32px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(180,83,9,0.2)',
        fontSize: '13px',
        color: FG,
        cursor: 'text',
      }}
    >
      root@neel:/projects/neurofin $ <span style={{ color: AMBER }}>_</span>
    </div>
  );
}

function openCommandTerminal() {
  window.dispatchEvent(new Event('neel-open-command-terminal'));
}

function handlePromptKey(e: React.KeyboardEvent<HTMLDivElement>) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  openCommandTerminal();
}

const preStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: '13px',
  lineHeight: 1.6,
  color: FG,
  whiteSpace: 'pre-wrap',
  margin: 0,
};
