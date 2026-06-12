'use client';

import { useMemo, useState } from 'react';
import {
  LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COMPANIES, Company } from '@/lib/companies';

const BG = '#0A0A0A';
const FG = '#F5F0E8';
const STEEL = '#94A3B8';
const GREEN = '#4AFF91';
const MONO = 'var(--font-mono)';

type TabId = 'thesis' | 'analyse' | 'chart' | 'ask' | 'readme' | 'git';

const COMMANDS: { id: TabId; label: string }[] = [
  { id: 'thesis', label: 'thesis' },
  { id: 'analyse', label: 'analyse' },
  { id: 'chart', label: 'chart' },
  { id: 'ask', label: 'ask' },
  { id: 'readme', label: 'readme' },
  { id: 'git', label: 'git log' },
];

const GIT_LOG = [
  ['f3c8a21', 'deployed on AWS EC2 with load balancing'],
  ['e1b9d33', 'Recharts dashboard with real-time data'],
  ['d07f2a4', 'fine-tuned LLM — reduced stock analysis drift'],
  ['c44b891', 'RAG pipeline for contextual market retrieval'],
  ['b2f3c11', 'multi-step LangGraph reasoning workflows'],
  ['a8e1d55', 'live market data ingestion from REST APIs'],
  ['9d2b440', 'FastAPI microservice architecture'],
];

const CHART_POINTS = [
  { time: '09:15', close: 1384.35 },
  { time: '10:00', close: 1391.2 },
  { time: '11:00', close: 1388.9 },
  { time: '12:00', close: 1404.4 },
  { time: '13:00', close: 1412.8 },
  { time: '14:00', close: 1409.1 },
  { time: '15:30', close: 1402.55 },
];

interface EquityProps {
  soundEnabled?: boolean;
}

export default function Equity(_props: EquityProps) {
  const [active, setActive] = useState<TabId>('thesis');
  const [selected, setSelected] = useState<Company | null>(null);
  const reliance = COMPANIES.find(c => c.id === 'RELIANCE') ?? COMPANIES[0];

  return (
    <section
      id="equity"
      data-cursor-accent={STEEL}
      style={{
        background: BG,
        minHeight: '100vh',
        color: FG,
        fontFamily: MONO,
        padding: '80px 48px 40px calc(200px + 48px)',
      }}
    >
      <Header />
      <CommandRow active={active} onSelect={setActive} />

      {active === 'thesis' && (
        <TerminalBlock>
          <Prompt command="run thesis --auto" />
          <Line text="[Running thesis construction for RELIANCE.NS]" style={{ marginTop: '16px', opacity: 0.65 }} />

          <SectionLabel label="SIGNALS RETRIEVED" />
          <MinorSeparator />
          <pre style={preStyle}>
{`[1] Q3 earnings beat by 4.2%      relevance 0.94
[2] Jio subscriber growth +8M     relevance 0.91
[3] Retail segment margin exp.    relevance 0.87
[4] Analyst consensus BUY 18/22   relevance 0.83`}
          </pre>

          <SectionLabel label="REASONING CHAIN" />
          <MinorSeparator />
          <pre style={preStyle}>
{`Node 01  fundamentals   STRONG    ──┐
Node 02  momentum       POSITIVE  ──┤
Node 03  risk factors   LOW       ──┤──▶  THESIS
Node 04  market context NEUTRAL   ──┘`}
          </pre>

          <SectionLabel label="THESIS" />
          <MinorSeparator />
          <pre style={preStyle}>
{`HOLD with accumulate bias.
Strong fundamentals and Jio subscriber momentum
offset a neutral market context. Retail margin
expansion keeps the upside case intact.

confidence: 0.81`}
          </pre>
          <MinorSeparator />
          <Line text="> Run for different company: analyse {SYMBOL}" accent />
        </TerminalBlock>
      )}

      {active === 'analyse' && (
        <TerminalBlock>
          {!selected ? (
            <>
              <Prompt command="analyse" />
              <CompanySelector onSelect={setSelected} />
            </>
          ) : (
            <AnalysisOutput company={selected} />
          )}
        </TerminalBlock>
      )}

      {active === 'chart' && (
        <TerminalBlock>
          <Prompt command={`chart ${reliance.id}`} />
          <div style={{ marginTop: '16px', fontSize: '13px', letterSpacing: '0.05em' }}>
            RELIANCE  ·  NSE  ·  <span style={{ color: STEEL }}>[1D]</span> <span style={{ opacity: 0.45 }}>[5D] [1MO] [3MO]</span>
          </div>
          <div style={{ height: '320px', margin: '16px 0', maxWidth: '860px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_POINTS} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="time" tick={{ fontFamily: MONO, fontSize: 10, fill: 'rgba(148,163,184,0.4)' }} stroke="rgba(148,163,184,0.15)" />
                <YAxis tick={{ fontFamily: MONO, fontSize: 10, fill: 'rgba(148,163,184,0.4)' }} stroke="rgba(148,163,184,0.15)" width={60} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: BG, border: 'none', color: FG, fontFamily: MONO, fontSize: '11px' }} />
                <ReferenceLine y={1402.55} stroke="rgba(148,163,184,0.3)" strokeDasharray="4 4" />
                <RechartsLine type="monotone" dataKey="close" stroke={GREEN} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Line text="O: 1,384.35  H: 1,421.10  L: 1,380.00  C: 1,402.55" />
          <Line text="Volume: 4.2M   Change: +18.20 (+1.31%)" style={{ opacity: 0.7 }} />
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
            <span style={{ color: STEEL }}>{'>'}</span>
            <input
              aria-label="Equity query input"
              placeholder="_"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: FG,
                fontFamily: MONO,
                fontSize: '13px',
                caretColor: STEEL,
              }}
            />
          </div>
        </TerminalBlock>
      )}

      {active === 'readme' && (
        <TerminalBlock>
          <Prompt command="cat readme.md" />
          <pre style={{ ...preStyle, marginTop: '16px', maxWidth: '760px' }}>
{`Investment research platform for turning live market
signals into explainable thesis output. LangGraph chains
fundamentals, momentum, risk, and market context before
the final recommendation is written.

RAG pipelines ground the model with contextual market
data. Fine-tuned LLM behavior reduces hallucination in
stock analysis. Recharts surfaces price action and
company fundamentals for fast analyst review.

Stack: React · FastAPI · LangGraph · AWS EC2
       S3 · Tailwind · Recharts

Status: DEPLOYED ●
Repo:   github.com/Neel-Kachhadia/Equity-research-platform`}
          </pre>
        </TerminalBlock>
      )}

      {active === 'git' && (
        <TerminalBlock>
          <Prompt command="git log --oneline" />
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {GIT_LOG.map(([hash, msg]) => (
              <div key={hash} style={{ fontSize: '13px', lineHeight: 1.6 }}>
                <span style={{ color: `rgba(245,240,232,0.4)`, marginRight: '14px' }}>{hash}</span>
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
        <span>EQUITY RESEARCH  ·  INVESTMENT PLATFORM</span>
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
            aria-pressed={active === cmd.id}
            data-cursor-hover
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: active === cmd.id ? STEEL : FG,
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

function CompanySelector({ onSelect }: { onSelect: (company: Company) => void }) {
  const india = useMemo(() => COMPANIES.filter(c => c.region === 'india'), []);
  const global = useMemo(() => COMPANIES.filter(c => c.region === 'global'), []);

  return (
    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'minmax(180px, 260px) minmax(180px, 260px)', gap: '48px' }}>
      <CompanyColumn title="INDIA" companies={india} onSelect={onSelect} />
      <CompanyColumn title="GLOBAL" companies={global} onSelect={onSelect} />
      <div style={{ gridColumn: '1 / -1', fontSize: '13px', color: FG, opacity: 0.7, marginTop: '8px' }}>
        Click a name or type: analyse {'{SYMBOL}'}
      </div>
    </div>
  );
}

function CompanyColumn({ title, companies, onSelect }: { title: string; companies: Company[]; onSelect: (company: Company) => void }) {
  return (
    <div>
      <div style={{ fontSize: '13px', color: FG, marginBottom: '6px' }}>{title}</div>
      <MinorSeparator compact />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {companies.map(company => (
          <button
            key={company.id}
            onClick={() => onSelect(company)}
            data-cursor-hover
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: FG,
              fontFamily: MONO,
              fontSize: '13px',
              textAlign: 'left',
              opacity: 0.85,
              cursor: 'pointer',
            }}
          >
            {company.id}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnalysisOutput({ company }: { company: Company }) {
  const symbol = company.id === 'RELIANCE' ? 'RELIANCE.NS' : company.id;
  return (
    <>
      <Prompt command={`analyse ${company.id}`} />
      <Line text={`Fetching ${symbol} market data...`} style={{ marginTop: '16px', opacity: 0.65 }} />
      <div style={{ marginTop: '16px', fontSize: '13px', letterSpacing: '0.06em' }}>
        {company.name.toUpperCase()}  ·  {company.exchange}: {company.id}
      </div>
      <MinorSeparator />

      <SectionLabel label="PRICE DATA" />
      <DataRow label="Current" value={`${company.currency}1,402.55    ▲ +18.20 (+1.31%)`} valueColor={GREEN} />
      <DataRow label="52W High" value={`${company.currency}${company.high52w.toLocaleString('en-IN')}`} />
      <DataRow label="52W Low" value={`${company.currency}${company.low52w.toLocaleString('en-IN')}`} />
      <DataRow label="Market Cap" value={company.marketCap} />

      <SectionLabel label="FUNDAMENTALS" />
      <DataRow label="P/E Ratio" value={`${company.pe}x`} />
      <DataRow label="EPS" value={`${company.currency}${company.eps}`} />
      <DataRow label="Revenue" value={`${company.revenue}  (FY24)`} />
      <DataRow label="Net Profit" value={company.netProfit} />

      <SectionLabel label="ANALYST CONSENSUS" />
      <Line text={`BUY ${company.analystBuy}  ·  HOLD ${company.analystHold}  ·  SELL ${company.analystSell}  (of ${company.analystTotal})`} />
      <Line text={`Consensus: ${company.consensus} ●`} accent />
      <Line text="████████████████████░░░  81% bullish" style={{ marginTop: '6px' }} />

      <SectionLabel label="DESCRIPTION" />
      <Line text={company.description.replace(' Mukesh Ambani led.', '')} style={{ maxWidth: '640px', opacity: 0.8 }} />

      <MinorSeparator />
      <SectionLabel label="LANGGRAPH THESIS  ·  GENERATING..." />
      <Line text="Reliance remains constructive: telecom momentum and retail margin expansion support upside while O2C keeps cash-flow resilience intact. ▌" />
    </>
  );
}

function Prompt({ command }: { command: string }) {
  return (
    <div style={{ fontSize: '13px', color: FG, lineHeight: 1.6 }}>
      root@neel:/projects/equity-research $ {command}
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

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ marginTop: '16px', fontSize: '11px', letterSpacing: '0.1em', color: STEEL, opacity: 0.6 }}>
      {label}
    </div>
  );
}

function DataRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '13px', lineHeight: 1.6 }}>
      <span style={{ color: FG, opacity: 0.5 }}>{label}:</span>
      <span style={{ color: valueColor ?? FG, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function Line({ text, accent, style }: { text: string; accent?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: '13px', lineHeight: 1.6, color: accent ? STEEL : FG, ...style }}>
      {text}
    </div>
  );
}

function MajorSeparator() {
  return (
    <div style={{ color: 'rgba(148,163,184,0.3)', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '8px' }}>
      {'━'.repeat(120)}
    </div>
  );
}

function MinorSeparator({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ color: 'rgba(148,163,184,0.15)', overflow: 'hidden', whiteSpace: 'nowrap', margin: compact ? '0 0 8px' : '8px 0 12px' }}>
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
        borderTop: '1px solid rgba(148,163,184,0.2)',
        fontSize: '13px',
        color: FG,
        cursor: 'text',
      }}
    >
      root@neel:/projects/equity-research $ <span style={{ color: STEEL }}>_</span>
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
