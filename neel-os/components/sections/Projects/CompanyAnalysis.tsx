'use client';

import { useState, useEffect, useRef } from 'react';
import { COMPANIES, Company } from '@/lib/companies';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const STEEL = '#94A3B8';
const FG = '#F5F0E8';
const BG = '#0A0A0A';
const GREEN = '#4AFF91';
const RED = '#B45309';
const ACCENT = '#1E3A5F';

interface LivePrice {
  price: number;
  change: number;
  changePct: number;
  volume: number;
  stale?: boolean;
  error?: boolean;
}

const ANALYZE_LINES = [
  'MOUNTING market data pipeline...',
  'FETCHING live price feed...',
  'LOADING fundamental data...',
  'CALIBRATING analyst consensus...',
  'RUNNING LangGraph reasoning chain...',
  'CONSTRUCTING investment thesis...',
];

const consensusColor: Record<string, string> = {
  'STRONG BUY': GREEN,
  'BUY': 'rgba(74,255,145,0.7)',
  'HOLD': 'rgba(245,240,232,0.6)',
  'SELL': RED,
};

export default function CompanyAnalysis() {
  const india = COMPANIES.filter(c => c.region === 'india');
  const global = COMPANIES.filter(c => c.region === 'global');

  const [selected, setSelected] = useState<Company | null>(null);
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [analyzeLines, setAnalyzeLines] = useState<string[]>([]);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const [thesis, setThesis] = useState('');
  const [thesisStreaming, setThesisStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleSelect(company: Company) {
    abortRef.current?.abort();
    setSelected(company);
    setPhase('analyzing');
    setAnalyzeLines([]);
    setLivePrice(null);
    setThesis('');

    let i = 0;
    await new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (i < ANALYZE_LINES.length) {
          setAnalyzeLines(prev => [...prev, ANALYZE_LINES[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(resolve, 300);
        }
      }, 220);
    });

    // Fetch live price
    let priceContext: LivePrice | null = null;
    try {
      const res = await fetch(`/api/market-data?symbol=${company.id}`);
      const data = await res.json();
      if (!data.error) {
        priceContext = data;
        setLivePrice(data);
      } else {
        priceContext = { price: 0, change: 0, changePct: 0, volume: 0, error: true };
        setLivePrice(priceContext);
      }
    } catch {
      priceContext = { price: 0, change: 0, changePct: 0, volume: 0, error: true };
      setLivePrice(priceContext);
    }

    setPhase('done');

    // Stream thesis
    setThesisStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const query = `Generate a 3-sentence investment thesis for ${company.name}. Current data: P/E ${company.pe}x, consensus ${company.consensus}, ${company.analystBuy}/${company.analystTotal} analysts bullish. ${company.description} Be specific, analytical, and direct. No disclaimers.`;
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: {
            source: 'equity-analysis',
            company,
            livePrice: priceContext,
          },
        }),
        signal: ctrl.signal,
      });
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setThesis(prev => prev + decoder.decode(value));
        }
      }
    } catch {
      // stream aborted or failed
    }
    setThesisStreaming(false);
  }

  const divider = (
    <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.15, margin: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {'─'.repeat(80)}
    </div>
  );

  return (
    <div style={{ background: BG, border: `1px solid rgba(148,163,184,0.2)`, padding: '24px 28px', maxWidth: '720px', marginTop: '48px' }}>
      <div style={{ ...mono, fontSize: '11px', color: STEEL, letterSpacing: '0.12em', marginBottom: '16px' }}>
        EQUITY RESEARCH  ·  ANALYSIS MODULE
      </div>
      {divider}

      {/* Company selector */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '10px', letterSpacing: '0.1em' }}>INDIA</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {india.map(c => (
              <CompanyBtn key={c.id} company={c} active={selected?.id === c.id} onClick={() => handleSelect(c)} />
            ))}
          </div>
        </div>
        <div style={{ width: '1px', background: 'rgba(148,163,184,0.15)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '10px', letterSpacing: '0.1em' }}>GLOBAL</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {global.map(c => (
              <CompanyBtn key={c.id} company={c} active={selected?.id === c.id} onClick={() => handleSelect(c)} />
            ))}
          </div>
        </div>
      </div>

      {phase === 'analyzing' && (
        <div style={{ marginTop: '16px' }}>
          {analyzeLines.map((line, i) => (
            <div key={i} style={{ ...mono, fontSize: '11px', color: GREEN, lineHeight: 1.8, opacity: 0.8 }}>
              {'>'} {line}
            </div>
          ))}
          <span style={{ ...mono, fontSize: '11px', color: GREEN, opacity: 0.5 }}>▌</span>
        </div>
      )}

      {phase === 'done' && selected && (
        <div style={{ marginTop: '8px' }}>
          {divider}
          <div style={{ ...mono, fontSize: '13px', color: FG, marginBottom: '12px', fontWeight: 600 }}>
            {selected.name}
            <span style={{ opacity: 0.4, fontWeight: 400, marginLeft: '12px' }}>
              {selected.exchange}: {selected.id}
            </span>
          </div>

          {/* Price data */}
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '8px', letterSpacing: '0.1em' }}>PRICE DATA</div>
          {livePrice?.error ? (
            <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.4, marginBottom: '12px' }}>
              (live price unavailable — showing fundamentals)
            </div>
          ) : livePrice ? (
            <div style={{ marginBottom: '12px' }}>
              <PriceRow label="Current" value={
                <span>
                  {selected.currency}{livePrice.price.toFixed(2)}
                  <span style={{ marginLeft: '10px', color: livePrice.change >= 0 ? GREEN : RED }}>
                    {livePrice.change >= 0 ? '▲' : '▼'} {Math.abs(livePrice.change).toFixed(2)} ({Math.abs(livePrice.changePct).toFixed(2)}%)
                  </span>
                  {livePrice.stale && <span style={{ opacity: 0.4, marginLeft: '8px' }}>(delayed)</span>}
                </span>
              } />
              <PriceRow label="52W High" value={`${selected.currency}${selected.high52w.toFixed(2)}`} />
              <PriceRow label="52W Low" value={`${selected.currency}${selected.low52w.toFixed(2)}`} />
              <PriceRow label="Market Cap" value={selected.marketCap} />
            </div>
          ) : null}

          {/* Fundamentals */}
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '8px', letterSpacing: '0.1em' }}>FUNDAMENTALS</div>
          <div style={{ marginBottom: '12px' }}>
            <PriceRow label="P/E Ratio" value={`${selected.pe}x`} />
            <PriceRow label="EPS" value={`${selected.currency}${selected.eps}`} />
            <PriceRow label="Revenue" value={selected.revenue} />
            <PriceRow label="Net Profit" value={selected.netProfit} />
          </div>

          {/* Analyst consensus */}
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '8px', letterSpacing: '0.1em' }}>ANALYST CONSENSUS</div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ ...mono, fontSize: '11px', color: GREEN, marginRight: '10px' }}>{selected.analystBuy} BUY</span>
            <span style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5, marginRight: '10px' }}>{selected.analystHold} HOLD</span>
            <span style={{ ...mono, fontSize: '11px', color: RED, marginRight: '10px' }}>{selected.analystSell} SELL</span>
            <span style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.3 }}>(of {selected.analystTotal} analysts)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.4 }}>BUY</span>
            <div style={{ flex: 1, height: '4px', background: 'rgba(245,240,232,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: GREEN,
                width: `${(selected.analystBuy / selected.analystTotal) * 100}%`,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.4 }}>SELL</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ ...mono, fontSize: '12px', color: consensusColor[selected.consensus] ?? FG, fontWeight: 600 }}>
              {selected.consensus}
            </span>
          </div>

          {/* Description */}
          <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.6, lineHeight: 1.7, marginBottom: '12px', maxWidth: '560px' }}>
            {selected.description}
          </div>

          {divider}

          {/* Thesis */}
          <div style={{ ...mono, fontSize: '10px', color: ACCENT === '#1E3A5F' ? STEEL : ACCENT, opacity: 0.8, marginBottom: '8px', letterSpacing: '0.1em' }}>
            LANGGRAPH THESIS  ·  {thesisStreaming ? 'GENERATING...' : thesis ? 'COMPLETE' : 'PENDING'}
          </div>
          {thesis ? (
            <div style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.8, lineHeight: 1.8, maxWidth: '580px' }}>
              {thesis}
              {thesisStreaming && <span style={{ opacity: 0.5 }}>▌</span>}
            </div>
          ) : thesisStreaming ? (
            <span style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.4 }}>▌</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CompanyBtn({ company, active, onClick }: { company: Company; active: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      data-cursor-hover
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        padding: '4px 10px',
        cursor: 'pointer',
        border: active
          ? `1px solid ${ACCENT}`
          : hover
          ? `1px solid ${STEEL}`
          : `1px solid rgba(148,163,184,0.3)`,
        background: active ? ACCENT : 'transparent',
        color: active || hover ? FG : STEEL,
        transition: 'all 0.12s',
        letterSpacing: '0.06em',
      }}
    >
      {company.id}
    </button>
  );
}

function PriceRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: FG, opacity: 0.45 }}>{label}:</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: FG, opacity: 0.85, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}
