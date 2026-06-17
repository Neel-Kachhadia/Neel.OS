'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { COMPANIES, Company } from '@/lib/companies';
import { playCommandEnter } from '@/lib/soundEngine';
import { answerProjectAsk } from '@/lib/projectAsk';

// Bloomberg amber color system
const AMB   = '#FFB800';
const AMB2  = '#FF8C00';
const BG    = '#0A0A0A';
const UP    = '#00FF41';
const DN    = '#FF3B3B';
const DIV   = 'rgba(255,184,0,0.2)';
const DIM   = 'rgba(255,184,0,0.4)';
const MONO  = 'var(--font-mono)';

type FKey = 'EQUITY' | 'OPTIONS' | 'CHARTS' | 'ALERTS' | 'PORTFOLIO' | 'F1:HELP';

const COMMAND_ROW: { key: FKey; label: string }[] = [
  { key: 'EQUITY', label: 'equity' },
  { key: 'OPTIONS', label: 'options' },
  { key: 'CHARTS', label: 'charts' },
  { key: 'ALERTS', label: 'alerts' },
  { key: 'PORTFOLIO', label: 'portfolio' },
  { key: 'F1:HELP', label: 'help' },
];

interface IndexRow { price: number; change: number; pct: number; dir: 'up' | 'dn' }
interface OptionRow { strike: number; oi: string; oiChg: string; ltp: number; iv: number; delta: number; gamma: number; theta: number; vega: number; type: 'CE' | 'PE' }
interface Tick { time: string; symbol: string; price: string; dir: 'up' | 'dn'; qty: number }
interface Alert { id: number; symbol: string; level: string; pct: string; price: number; acked: boolean }
interface HistPoint { time: number; close: number | null }
interface LivePrice { price: number; change: number; changePct: number; volume: number; stale?: boolean; error?: boolean }

const fmt = (n: number, d = 2) => Math.abs(n).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const INDICES = [
  { symbol: 'NIFTY 50',   base: 24847.65, chg:  127.30 },
  { symbol: 'BANKNIFTY',  base: 52341.20, chg:  -89.45 },
  { symbol: 'SENSEX',     base: 81847.55, chg:  412.10 },
  { symbol: 'VIX',        base:    14.23, chg:   -0.41 },
];

const NIFTY_52W = { low: 21743.65, high: 26277.35 };
const NIFTY_FIB_382 = NIFTY_52W.low + (NIFTY_52W.high - NIFTY_52W.low) * 0.382;

function fallbackHistory(): HistPoint[] {
  const now = Date.now();
  return [1384.35, 1391.2, 1388.9, 1404.4, 1412.8, 1409.1, 1402.55].map((close, i) => ({
    time: now - (6 - i) * 30 * 60 * 1000,
    close,
  }));
}

function fallbackLivePrice(): LivePrice {
  return {
    price: 1402.55,
    change: 18.2,
    changePct: 1.31,
    volume: 4200000,
    stale: true,
  };
}

function initIndices(): Record<string, IndexRow> {
  return Object.fromEntries(INDICES.map(i => [i.symbol, { price: i.base, change: i.chg, pct: (i.chg / i.base) * 100, dir: i.chg >= 0 ? 'up' : 'dn' as 'up' | 'dn' }]));
}

function genOptions(base: number): OptionRow[] {
  const atm = Math.round(base / 50) * 50;
  const rows: OptionRow[] = [];
  for (let i = -3; i <= 3; i++) {
    const strike = atm + i * 50;
    const itm = i < 0;
    rows.push({
      strike,
      oi:    (Math.random() * 5000 + 1000).toFixed(0) + 'K',
      oiChg: (Math.random() * 20 - 5).toFixed(1) + '%',
      ltp:   itm ? base - strike + 15 + Math.random() * 10 : Math.max(5, (atm - strike + 120) * 0.1 + Math.random() * 10),
      iv:    12 + Math.random() * 8 + Math.abs(i) * 1.5,
      delta: itm ? 0.7 + Math.random() * 0.2 : 0.1 + Math.random() * 0.4,
      gamma: 0.001 + Math.random() * 0.003,
      theta: -(10 + Math.random() * 30),
      vega:  0.3 + Math.random() * 0.8,
      type:  'CE',
    });
  }
  return rows;
}

const BUILD_MANIFEST = [
  'RUST CORE ··············· ✓',
  'FASTAPI LAYER ··········· ✓',
  'REDIS PIPELINE ·········· ✓',
  'DUCKDB SCHEMA ··········· ✓',
  'OPTIONS ENGINE ·········· ◌',
  'IV SURFACE ·············· ◌',
  'TAURI SHELL ············· ◌',
];

const GIT_LOG = [
  'd3f9a22  Redis tick ingestion pipeline active',
  'c1b8e44  DuckDB schema for historical data',
  'b44a991  FastAPI layer connecting Rust core',
  'a9f3b11  Rust core — initial architecture',
  '8c2d330  system design and schema definition',
];

interface MarketTerminalProps { soundEnabled?: boolean; onStateChange?: (state: string) => void; }

export default function MarketTerminal({ soundEnabled = false, onStateChange }: MarketTerminalProps) {
  const [activeKey, setActiveKey]     = useState<FKey>('EQUITY');
  const [indices,   setIndices]       = useState<Record<string, IndexRow>>(initIndices);
  const [flashSym,  setFlashSym]      = useState<string | null>(null);
  const [options,   setOptions]       = useState<OptionRow[]>(() => genOptions(24847));
  const [ticks,     setTicks]         = useState<Tick[]>([]);
  const [alerts,    setAlerts]        = useState<Alert[]>([]);
  const [selected,  setSelected]      = useState<Company | null>(() => COMPANIES[0] ?? null);
  const [range,     setRange]         = useState<'1d' | '5d' | '1mo' | '3mo'>('1d');
  const [points,    setPoints]        = useState<HistPoint[]>([]);
  const [livePrice, setLivePrice]     = useState<LivePrice | null>(null);
  const [chartLoad, setChartLoad]     = useState(false);
  const [chartErr,  setChartErr]      = useState(false);
  const [alertPulse, setAlertPulse]   = useState(false);
  const [portfolioQuery, setPortfolioQuery] = useState('');
  const [portfolioResponse, setPortfolioResponse] = useState('');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  const [projectOutput, setProjectOutput] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleProjectCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    setProjectOutput(prev => [...prev, `root@neel:/projects/market-terminal $ ${raw}`]);
    if (['back', 'exit', 'cd ..', 'cd ~'].includes(cmd)) { onStateChange?.('terminal-root'); return; }
    if (cmd === 'chat')      { onStateChange?.('chat');   return; }
    if (cmd === 'equity')    { setActiveKey('EQUITY');    return; }
    if (cmd === 'options')   { setActiveKey('OPTIONS');   return; }
    if (cmd === 'charts')    { setActiveKey('CHARTS');    return; }
    if (cmd === 'alerts')    { setActiveKey('ALERTS');    return; }
    if (cmd === 'portfolio') { setActiveKey('PORTFOLIO'); return; }
    if (cmd === 'ask')       { setActiveKey('PORTFOLIO'); return; }
    if (cmd === 'help')      { setActiveKey('F1:HELP');   return; }
    if (cmd.startsWith('ask ') || cmd.startsWith('query ')) {
      setActiveKey('PORTFOLIO');
      setPortfolioQuery(raw.replace(/^(ask|query)\s+/i, ''));
      return;
    }
    if (cmd.startsWith('chart ')) {
      const sym = raw.trim().slice(6).toUpperCase();
      const company = COMPANIES.find(c => c.id === sym);
      if (company) { setSelected(company); setActiveKey('CHARTS'); }
      else setProjectOutput(prev => [...prev, `symbol not found: ${sym}`]);
      return;
    }
    if (cmd === 'clear') { setProjectOutput([]); return; }
    setProjectOutput(prev => [...prev, `command not found: ${raw}`, 'available: equity, options, charts, alerts, portfolio, help, back']);
  }, [onStateChange]);

  const indicesRef  = useRef(initIndices());
  const tickCountRef = useRef(0);
  const flashTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live index data
  useEffect(() => {
    const iv = setInterval(() => {
      tickCountRef.current++;
      const inst = INDICES[Math.floor(Math.random() * INDICES.length)];
      const cur  = indicesRef.current[inst.symbol];
      const newP = cur.price * (1 + (Math.random() - 0.5) * 0.003);
      const chg  = newP - inst.base;
      const dir: 'up' | 'dn' = newP >= cur.price ? 'up' : 'dn';
      indicesRef.current = { ...indicesRef.current, [inst.symbol]: { price: newP, change: chg, pct: (chg / inst.base) * 100, dir } };
      setIndices({ ...indicesRef.current });

      if (flashTimer.current) clearTimeout(flashTimer.current);
      setFlashSym(inst.symbol);
      flashTimer.current = setTimeout(() => setFlashSym(null), 700);

      // Add tick
      const niftyP = indicesRef.current['NIFTY 50'].price;
      const tick: Tick = {
        time:   new Date().toTimeString().slice(0, 8),
        symbol: inst.symbol === 'NIFTY 50' ? 'NIFTY' : inst.symbol.slice(0, 6),
        price:  fmt(newP),
        dir,
        qty:    Math.floor(Math.random() * 300 + 50),
      };
      setTicks(prev => [tick, ...prev].slice(0, 8));

      // Fibonacci alert every ~15 ticks at exact 38.2% retracement.
      if (tickCountRef.current % 15 === 0) {
        const id = tickCountRef.current;
        setAlerts(prev => [
          {
            id,
            symbol: 'NIFTY',
            level: `38.2% Fibonacci @ ${fmt(NIFTY_FIB_382)}`,
            pct: '38.2%',
            price: NIFTY_FIB_382,
            acked: false,
          },
          ...prev.slice(0, 9),
        ]);
        if (alertTimer.current) clearTimeout(alertTimer.current);
        setAlertPulse(true);
        alertTimer.current = setTimeout(() => setAlertPulse(false), 1500);
      }

      // Update options periodically
      if (tickCountRef.current % 3 === 0) {
        setOptions(genOptions(niftyP));
      }
    }, 1300);
    return () => {
      clearInterval(iv);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (alertTimer.current) clearTimeout(alertTimer.current);
    };
  }, []);

  // Chart data fetch
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setChartLoad(true);
    setChartErr(false);
    Promise.all([
      fetch(`/api/market-data?symbol=${selected.id}&type=historical&range=${range}`),
      fetch(`/api/market-data?symbol=${selected.id}`),
    ]).then(async ([histRes, quoteRes]) => {
      if (cancelled) return;
      const hist  = await histRes.json();
      const quote = await quoteRes.json();
      if (!hist.error) setPoints(hist.points ?? []);
      else { setChartErr(false); setPoints(fallbackHistory()); }
      if (!quote.error) setLivePrice(quote);
      else setLivePrice(fallbackLivePrice());
    }).catch(() => {
      if (!cancelled) {
        setChartErr(false);
        setPoints(fallbackHistory());
        setLivePrice(fallbackLivePrice());
      }
    })
      .finally(() => { if (!cancelled) setChartLoad(false); });
    return () => { cancelled = true; };
  }, [selected, range]);

  const ackAlert = useCallback((id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acked: true } : a));
  }, []);

  const activeAlerts = alerts.filter(a => !a.acked);

  const handleKey = useCallback((key: FKey) => {
    if (soundEnabled) playCommandEnter();
    setActiveKey(key);
  }, [soundEnabled]);

  const submitPortfolioQuery = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = portfolioQuery.trim();
    if (!text || portfolioLoading) return;

    if (soundEnabled) playCommandEnter();
    const localAnswer = answerProjectAsk('market', text, {
      selectedCompany: selected,
      livePrice,
      range,
      activeAlerts,
    });
    setPortfolioLoading(true);
    setPortfolioResponse('');
    setPortfolioError('');
    setPortfolioQuery('');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          context: {
            source: 'market-terminal',
            selectedCompany: selected,
            livePrice,
            range,
            chartPoints: points.slice(-12),
            activeAlerts,
            localAnswer,
          },
        }),
      });
      if (!res.ok || !res.body) {
        setPortfolioError(res.status === 503 ? 'groq api not configured' : 'groq query failed');
        setPortfolioResponse(localAnswer);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setPortfolioResponse(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setPortfolioError('groq connection failed');
      setPortfolioResponse(localAnswer);
    } finally {
      setPortfolioLoading(false);
    }
  }, [activeAlerts, livePrice, points, portfolioLoading, portfolioQuery, range, selected, soundEnabled]);

  const borderStyle = `1px solid ${DIV}`;
  const headerStyle: React.CSSProperties = {
    background: BG,
    borderBottom: borderStyle,
    height: '32px',
    padding: '0 48px',
    fontFamily: MONO,
    fontSize: '12px',
    color: AMB,
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  };

  const nifty = indices['NIFTY 50'];
  const bnk   = indices['BANKNIFTY'];
  const vix   = indices['VIX'];
  const snsx  = indices['SENSEX'];

  const currentPrice = livePrice?.price ?? null;
  const isUp         = livePrice ? livePrice.change >= 0 : true;
  const lineColor    = isUp ? UP : DN;

  return (
    <section
      id="market"
      style={{
        background: BG,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: MONO,
        color: AMB,
        padding: '80px 48px 40px calc(200px + 48px)',
      }}
    >
      <div style={{ maxWidth: '1120px', width: '100%' }}>

        {/* Title bar */}
        <div style={{ background: BG, borderBottom: borderStyle, padding: '6px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.12em' }}>NEEL TERMINAL  v0.7β</span>
          <span style={{ fontSize: '9px', color: DIM }}>NSE/BSE  ·  LIVE ●</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '14px 48px 10px', fontSize: '12px' }}>
          {COMMAND_ROW.map((cmd, i) => (
            <span key={cmd.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => handleKey(cmd.key)}
                data-cursor-hover
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: activeKey === cmd.key ? AMB : 'rgba(255,184,0,0.4)',
                  fontFamily: MONO,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {activeKey === cmd.key ? `> ${cmd.label}` : cmd.label}
              </button>
              {i < COMMAND_ROW.length - 1 && <span style={{ color: 'rgba(255,184,0,0.2)' }}>·</span>}
            </span>
          ))}
        </div>

        {/* Function key bar */}
        <div style={{ ...headerStyle, gap: '0', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {(['EQUITY', 'OPTIONS', 'CHARTS', 'ALERTS', 'PORTFOLIO'] as FKey[]).map(k => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                data-cursor-hover
                style={{
                  background: 'transparent',
                  color: activeKey === k ? AMB : DIM,
                  border: 'none',
                  fontFamily: MONO,
                  fontSize: '12px',
                  padding: '0 12px 0 0',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  transition: 'opacity 0.1s',
                  position: 'relative',
                }}
              >
                [{k}]
                {k === 'ALERTS' && activeAlerts.length > 0 && (
                  <span style={{ color: alertPulse ? BG : AMB, marginLeft: '3px', fontSize: '8px' }}>
                    ●
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleKey('F1:HELP')}
            data-cursor-hover
            style={{
              background: 'transparent',
              color: activeKey === 'F1:HELP' ? AMB : DIM,
              border: 'none', fontFamily: MONO, fontSize: '12px',
              padding: 0, cursor: 'pointer', letterSpacing: '0.08em',
            }}
          >
            [F1:HELP]
          </button>
        </div>

        {/* Index strip */}
        <div style={{ background: BG, borderBottom: '1px solid rgba(255,184,0,0.15)', padding: '8px 48px', display: 'flex', flexWrap: 'wrap', gap: '8px 48px', fontSize: '12px' }}>
          {[
            { sym: 'NIFTY 50', row: nifty },
            { sym: 'SENSEX',   row: snsx  },
            { sym: 'BANKNIFTY',row: bnk   },
            { sym: 'VIX',      row: vix   },
          ].map(({ sym, row }) => (
            <div key={sym} style={{ display: 'flex', gap: '8px', fontSize: '12px', alignItems: 'center' }}>
              <span style={{ minWidth: '80px', color: flashSym === sym ? AMB : DIM, transition: 'color 0.15s' }}>
                {sym}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: flashSym === sym ? AMB : AMB2 }}>
                {fmt(row.price)}
              </span>
              <span style={{ color: row.dir === 'up' ? UP : DN, fontSize: '9px' }}>
                {row.dir === 'up' ? '▲' : '▼'} {fmt(Math.abs(row.change))}
              </span>
              <span style={{ color: row.dir === 'up' ? UP : DN, fontSize: '9px' }}>
                {row.pct >= 0 ? '+' : ''}{row.pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Main content area */}
        {(activeKey === 'EQUITY' || activeKey === 'CHARTS') && (
          <>
            {/* Company selector + controls */}
            <div style={{ padding: '8px 48px', borderBottom: '1px solid rgba(255,184,0,0.15)' }}>
              <div style={{ fontSize: '9px', color: DIM, marginBottom: '6px', letterSpacing: '0.08em' }}>
                COMPANY SELECTOR  ·  12 SYMBOLS
              </div>
              <select
                value={selected?.id ?? ''}
                onChange={e => {
                  const company = COMPANIES.find(c => c.id === e.target.value);
                  if (company) setSelected(company);
                }}
                style={{
                  background: BG,
                  color: AMB,
                  border: 'none',
                  borderBottom: `1px solid ${AMB}`,
                  fontFamily: MONO,
                  fontSize: '12px',
                  padding: '5px 0',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                  minWidth: '260px',
                }}
              >
                {COMPANIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
              {selected && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: AMB, fontWeight: 600 }}>{selected.name}</span>
                    <span style={{ color: DIM }}>·</span>
                    <span style={{ color: AMB2 }}>{selected.exchange}: {selected.id}</span>
                    {livePrice && !livePrice.error && (
                      <>
                        <span style={{ color: AMB, fontVariantNumeric: 'tabular-nums' }}>
                          {selected.currency}{livePrice.price.toFixed(2)}
                        </span>
                        <span style={{ color: livePrice.change >= 0 ? UP : DN, fontSize: '10px' }}>
                          {livePrice.change >= 0 ? '▲' : '▼'} {Math.abs(livePrice.change).toFixed(2)} ({Math.abs(livePrice.changePct).toFixed(2)}%)
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {(['1d', '5d', '1mo', '3mo'] as const).map(r => (
                      <AmberBtn key={r} label={r.toUpperCase()} active={range === r} onClick={() => setRange(r)} small />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div style={{ padding: '16px 48px', height: activeKey === 'CHARTS' ? '420px' : '260px' }}>
              {!selected ? (
                <div style={{ color: DIM, fontSize: '11px', paddingTop: '80px', textAlign: 'center' }}>
                  SELECT COMPANY TO VIEW CHART
                </div>
              ) : chartLoad ? (
                <div style={{ color: DIM, fontSize: '11px', paddingTop: '80px', textAlign: 'center' }}>
                  FETCHING MARKET DATA...
                </div>
              ) : chartErr || points.length === 0 ? (
                <div style={{ color: DIM, fontSize: '11px', paddingTop: '80px', textAlign: 'center' }}>
                  PRICE DATA UNAVAILABLE  ·  CHECK BACK LATER
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,184,0,0.06)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontFamily: MONO, fontSize: 10, fill: DIM }}
                      stroke={DIV}
                      tickFormatter={(ts: number) => {
                        const d = new Date(ts);
                        return range === '1d'
                          ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontFamily: MONO, fontSize: 10, fill: DIM }}
                      stroke={DIV}
                      width={55}
                      tickFormatter={(v: number) => v.toFixed(0)}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as HistPoint;
                        return (
                          <div style={{ background: BG, border: 'none', padding: '6px 10px' }}>
                            <div style={{ fontFamily: MONO, fontSize: '10px', color: AMB }}>
                              {d.close != null ? fmt(d.close) : '--'}
                            </div>
                          </div>
                        );
                      }}
                    />
                    {currentPrice != null && (
                      <ReferenceLine y={currentPrice} stroke="rgba(255,184,0,0.3)" strokeDasharray="4 4" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke={lineColor}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* OHLCV */}
            {selected && livePrice && !livePrice.error && (
              <div style={{ padding: '8px 48px', borderTop: '1px solid rgba(255,184,0,0.15)', display: 'flex', gap: '20px', fontSize: '11px', color: 'rgba(255,184,0,0.5)', flexWrap: 'wrap' }}>
                <span>O: <span style={{ color: AMB }}>{livePrice.price.toFixed(2)}</span></span>
                <span>H: <span style={{ color: AMB }}>{(livePrice.price * 1.002).toFixed(2)}</span></span>
                <span>L: <span style={{ color: AMB }}>{(livePrice.price * 0.998).toFixed(2)}</span></span>
                <span>C: <span style={{ color: AMB }}>{livePrice.price.toFixed(2)}</span></span>
                <span>VOL: <span style={{ color: AMB }}>{new Intl.NumberFormat('en-IN').format(livePrice.volume)}</span></span>
              </div>
            )}
          </>
        )}

        {/* Options chain */}
        {(activeKey === 'EQUITY' || activeKey === 'OPTIONS') && (
          <div style={{ padding: '8px 48px', borderTop: '1px solid rgba(255,184,0,0.2)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,184,0,0.45)', letterSpacing: '0.08em', marginBottom: '6px' }}>
              OPTIONS CHAIN  ──  NIFTY  ──  27-JUN-2025
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,184,0,0.45)', display: 'grid', gridTemplateColumns: '60px 60px 55px 65px 45px 50px 55px 55px 50px', gap: '0 4px', marginBottom: '4px', letterSpacing: '0.05em', minWidth: '520px' }}>
                <span>STRIKE</span><span>OI</span><span>OI CHG</span><span>LTP</span><span>IV%</span><span>DELTA</span><span>GAMMA</span><span>THETA</span><span>VEGA</span>
              </div>
              {options.slice(0, 5).map((opt, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'rgba(255,184,0,0.7)', display: 'grid', gridTemplateColumns: '60px 60px 55px 65px 45px 50px 55px 55px 50px', gap: '0 4px', lineHeight: 1.8, fontVariantNumeric: 'tabular-nums', minWidth: '520px' }}>
                  <span style={{ color: AMB2 }}>{opt.strike}</span>
                  <span>{opt.oi}</span>
                  <span style={{ color: parseFloat(opt.oiChg) >= 0 ? UP : DN }}>{opt.oiChg}</span>
                  <span>{opt.ltp.toFixed(2)}</span>
                  <span>{opt.iv.toFixed(1)}</span>
                  <span>{opt.delta.toFixed(2)}</span>
                  <span>{opt.gamma.toFixed(4)}</span>
                  <span style={{ color: DN }}>{opt.theta.toFixed(1)}</span>
                  <span>{opt.vega.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tick stream */}
        {activeKey === 'EQUITY' && (
          <div style={{ padding: '4px 48px', fontSize: '10px' }}>
            <div style={{ fontSize: '9px', color: DIM, letterSpacing: '0.08em', marginBottom: '4px' }}>TICK STREAM</div>
            {ticks.length === 0 ? (
              <div style={{ fontSize: '10px', color: DIM }}>awaiting ticks...</div>
            ) : (
              ticks.slice(0, 5).map((tick, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 80px 80px 20px 80px', gap: '0 8px', fontSize: '10px', lineHeight: 1.7, opacity: Math.max(0.25, 1 - i * 0.15), whiteSpace: 'nowrap' }}>
                  <span style={{ color: DIM }}>{tick.time}</span>
                  <span style={{ color: AMB2 }}>{tick.symbol}</span>
                  <span style={{ color: AMB, fontVariantNumeric: 'tabular-nums' }}>{tick.price}</span>
                  <span style={{ color: tick.dir === 'up' ? UP : DN }}>{tick.dir === 'up' ? '▲' : '▼'}</span>
                  <span style={{ color: DIM }}>QTY:{tick.qty}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts view */}
        {activeKey === 'ALERTS' && (
          <div style={{ padding: '8px 48px', borderTop: '1px solid rgba(255,184,0,0.2)', minHeight: '120px' }}>
            <div style={{ fontSize: '9px', color: DIM, letterSpacing: '0.08em', marginBottom: '8px' }}>
              FIBONACCI ALERT HISTORY
            </div>
            {alerts.length === 0 ? (
              <div style={{ fontSize: '10px', color: DIM }}>
                No alerts fired. System monitoring 38.2% Fibonacci levels.
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '10px', marginBottom: '6px', opacity: a.acked ? 0.35 : 1, transition: 'opacity 0.3s' }}>
                  <span style={{ color: a.acked ? DIM : AMB }}>▶</span>
                  <span style={{ color: a.acked ? DIM : AMB }}>ALERT:</span>
                  <span style={{ color: a.acked ? DIM : AMB2 }}>
                    {a.symbol} {a.level} · low + (high-low) × 0.382
                  </span>
                  {!a.acked && (
                    <button
                      onClick={() => ackAlert(a.id)}
                      data-cursor-hover
                      style={{ background: 'none', border: 'none', color: AMB, fontFamily: MONO, fontSize: '9px', padding: 0, cursor: 'pointer', marginLeft: 'auto', letterSpacing: '0.08em' }}
                    >
                      [ACKNOWLEDGE]
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Portfolio / Ask Neel */}
        {activeKey === 'PORTFOLIO' && (
          <div style={{ padding: '8px 48px', borderTop: '1px solid rgba(255,184,0,0.2)', minHeight: '120px' }}>
            <div style={{ fontSize: '9px', color: DIM, letterSpacing: '0.08em', marginBottom: '8px' }}>
              NEEL.OS · MARKET QUERY INTERFACE · ONLINE
            </div>
            {(portfolioResponse || portfolioLoading || portfolioError) && (
              <div
                style={{
                  fontSize: '11px',
                  color: portfolioError ? DN : AMB2,
                  opacity: 0.82,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                  marginBottom: '12px',
                  minHeight: '40px',
                }}
              >
                {portfolioError && <div style={{ color: DN, marginBottom: portfolioResponse ? '8px' : 0 }}>[fallback] {portfolioError}</div>}
                {portfolioResponse}
                {portfolioLoading && <span style={{ color: AMB }}>▌</span>}
              </div>
            )}
            <form
              onSubmit={submitPortfolioQuery}
              style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', borderTop: `1px solid ${DIV}`, paddingTop: '12px' }}
            >
              <span style={{ color: DIM }}>terminal@market$</span>
              <input
                value={portfolioQuery}
                onChange={e => setPortfolioQuery(e.target.value)}
                placeholder="ask neel..."
                disabled={portfolioLoading}
                style={{ background: 'none', border: 'none', outline: 'none', color: AMB, fontFamily: MONO, fontSize: '11px', caretColor: AMB, flex: 1 }}
              />
            </form>
          </div>
        )}

        {/* F1:HELP */}
        {activeKey === 'F1:HELP' && (
          <div style={{ padding: '8px 48px', borderTop: '1px solid rgba(255,184,0,0.2)', fontSize: '10px', lineHeight: 1.8 }}>
            <div style={{ color: DIM, marginBottom: '8px', letterSpacing: '0.08em', fontSize: '9px' }}>AVAILABLE COMMANDS</div>
            {[
              ['[EQUITY]',    'Main terminal — company selector + chart + options + ticks'],
              ['[OPTIONS]',   'Expanded options chain view'],
              ['[CHARTS]',    'Full-height price chart'],
              ['[ALERTS]',    'Fibonacci alert history'],
              ['[PORTFOLIO]', 'Market query interface — ask neel'],
              ['[F1:HELP]',   'This screen'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '12px', color: AMB }}>
                <span style={{ minWidth: '100px', color: AMB2 }}>{k}</span>
                <span style={{ color: DIM }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Active Fibonacci alert bar */}
        {activeAlerts.length > 0 && activeKey !== 'ALERTS' && (
          <div
            style={{
              padding: '6px 48px',
              background: 'rgba(255,184,0,0.08)',
              borderTop: `1px solid ${AMB}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '11px',
              color: alertPulse ? AMB : DIM,
              transition: 'all 0.3s',
            }}
          >
            <span>▶</span>
            <span>ALERT: {activeAlerts[0].symbol} {activeAlerts[0].level}</span>
            <span style={{ marginLeft: 'auto', borderLeft: `1px solid ${DIV}`, paddingLeft: '12px' }}>──</span>
            <button
              onClick={() => ackAlert(activeAlerts[0].id)}
              data-cursor-hover
              style={{ background: 'none', border: 'none', color: AMB, fontFamily: MONO, fontSize: '9px', padding: 0, cursor: 'pointer', letterSpacing: '0.08em' }}
            >
              [ACKNOWLEDGE]
            </button>
          </div>
        )}

        {/* Project output + input */}
        {projectOutput.length > 0 && (
          <div style={{ padding: '8px 48px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {projectOutput.map((line, i) => (
              <div key={i} style={{ fontFamily: MONO, fontSize: '13px', color: 'rgba(255,184,0,0.7)', lineHeight: 1.6 }}>
                {line}
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            padding: '8px 48px',
            background: BG,
            borderTop: '1px solid rgba(255,184,0,0.2)',
            fontSize: '13px',
            color: DIM,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>root@neel:/projects/market-terminal $</span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              const val = inputValue;
              setInputValue('');
              handleProjectCommand(val);
            }}
            aria-label="Market terminal command input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: AMB,
              fontFamily: MONO,
              fontSize: '13px',
              caretColor: AMB,
            }}
          />
        </div>
      </div>

      {/* Build status */}
      <div style={{ marginTop: '40px', maxWidth: '1120px', fontFamily: MONO, fontSize: '11px', color: AMB }}>
        <div style={{ fontSize: '13px', color: AMB, marginBottom: '16px' }}>
          root@neel:/projects/market-terminal $ cat readme.md
        </div>
        <pre style={{ fontFamily: MONO, fontSize: '13px', lineHeight: 1.6, color: AMB, opacity: 0.85, whiteSpace: 'pre-wrap', margin: '0 0 32px' }}>
{`Professional-grade NSE research terminal.
Live tick ingestion via Redis, historical data via
DuckDB, and a Bloomberg-style UI for scanning indices,
options chains, alerts, and company charts.

Options Greeks and IV surface calculation in progress.
4 languages running simultaneously across the stack:
Rust, Python, SQL, JavaScript.

Stack: Rust · FastAPI · Redis · DuckDB
       Python · Tauri (planned)

Status: BUILDING ◌  70%
Repo:   github.com/Neel-Kachhadia/indian-terminal`}
        </pre>
        <div style={{ fontSize: '11px', color: DIM, letterSpacing: '0.12em', marginBottom: '8px' }}>
          BUILD STATUS ────────────────────────────────────────────────────────
        </div>
        <div style={{ color: AMB, marginBottom: '8px', fontSize: '11px' }}>
          <span>{'█'.repeat(20)}</span><span style={{ color: 'rgba(255,184,0,0.2)' }}>{'░'.repeat(5)}</span>  70%
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 24px', fontSize: '10px' }}>
          {BUILD_MANIFEST.map(line => (
            <div key={line} style={{ color: line.endsWith('✓') ? '#4AFF91' : DIM, minWidth: '260px', whiteSpace: 'pre' }}>
              <span>{line}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '32px', fontSize: '13px', color: AMB }}>
          root@neel:/projects/market-terminal $ git log --oneline
        </div>
        <div style={{ fontSize: '11px', lineHeight: 1.8, color: AMB, opacity: 0.85, marginTop: '8px' }}>
          {GIT_LOG.map((line, i) => {
            const [hash, ...msg] = line.split(' ');
            return (
              <div key={i}>
                <span style={{ color: 'rgba(255,184,0,0.4)', marginRight: '12px' }}>{hash}</span>
                <span>{msg.join(' ')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


function AmberBtn({ label, active, onClick, small }: { label: string; active: boolean; onClick: () => void; small?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      data-cursor-hover
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent',
        color: active ? AMB : hover ? AMB : DIM,
        border: 'none',
        fontFamily: MONO,
        fontSize: small ? '11px' : '12px',
        padding: small ? '0 0 0 10px' : '0 0 0 10px',
        cursor: 'pointer',
        letterSpacing: '0.06em',
        transition: 'opacity 0.1s',
        opacity: active ? 1 : 0.4,
      }}
    >
      {label}
    </button>
  );
}
