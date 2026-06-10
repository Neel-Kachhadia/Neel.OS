'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Bar,
} from 'recharts';
import { COMPANIES, Company } from '@/lib/companies';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const STEEL = '#94A3B8';
const FG = '#F5F0E8';
const BG = '#0A0A0A';
const GREEN = '#4AFF91';
const RED = '#B45309';
const ACCENT = '#1E3A5F';

type Range = '1d' | '5d' | '1mo' | '3mo';
type ChartType = 'line' | 'candle';

interface HistPoint {
  time: number;
  close: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
}

interface LivePrice {
  price: number;
  change: number;
  changePct: number;
  volume: number;
  stale?: boolean;
  error?: boolean;
}

function formatTime(ts: number, range: Range): string {
  const d = new Date(ts);
  if (range === '1d') return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (range === '5d') return d.toLocaleDateString('en-IN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function fmt2(n: number) { return n.toFixed(2); }

interface CustomCandleProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: HistPoint;
  yScale?: (v: number) => number;
}

function CandleBar(props: CustomCandleProps) {
  const { x = 0, width = 0, payload, yScale } = props;
  if (!payload || !yScale) return null;
  const { open, close, high, low } = payload;
  if (open == null || close == null || high == null || low == null) return null;

  const isUp = close >= open;
  const color = isUp ? GREEN : RED;
  const bodyTop = yScale(Math.max(open, close));
  const bodyBot = yScale(Math.min(open, close));
  const bodyH = Math.max(1, bodyBot - bodyTop);
  const wickX = (x ?? 0) + (width ?? 0) / 2;

  return (
    <g>
      <line x1={wickX} x2={wickX} y1={yScale(high)} y2={yScale(low)} stroke={color} strokeWidth={1} opacity={0.7} />
      <rect x={x + 1} y={bodyTop} width={Math.max(1, width - 2)} height={bodyH} fill={color} opacity={0.85} />
    </g>
  );
}

const CustomTooltip = ({ active, payload, range }: { active?: boolean; payload?: { payload: HistPoint }[]; range: Range }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#0A0A0A', border: '1px solid rgba(245,240,232,0.2)', padding: '8px 12px' }}>
      <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.5, marginBottom: '4px' }}>
        {formatTime(d.time, range)}
      </div>
      {d.close != null && <div style={{ ...mono, fontSize: '11px', color: FG }}>Close: {fmt2(d.close)}</div>}
      {d.open != null && <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.6 }}>O: {fmt2(d.open)}</div>}
      {d.high != null && <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.6 }}>H: {fmt2(d.high)}</div>}
      {d.low != null && <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.6 }}>L: {fmt2(d.low)}</div>}
      {d.volume != null && <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.4 }}>Vol: {new Intl.NumberFormat('en-IN').format(d.volume)}</div>}
    </div>
  );
};

export default function PriceChart() {
  const india = COMPANIES.filter(c => c.region === 'india');
  const global = COMPANIES.filter(c => c.region === 'global');

  const [selected, setSelected] = useState<Company | null>(null);
  const [range, setRange] = useState<Range>('1d');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [points, setPoints] = useState<HistPoint[]>([]);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    const fetchData = async () => {
      try {
        const [histRes, quoteRes] = await Promise.all([
          fetch(`/api/market-data?symbol=${selected.id}&type=historical&range=${range}`),
          fetch(`/api/market-data?symbol=${selected.id}`),
        ]);
        if (cancelled) return;

        const hist = await histRes.json();
        const quote = await quoteRes.json();

        if (hist.error) { setError(true); setPoints([]); }
        else setPoints(hist.points ?? []);

        if (!quote.error) setLivePrice(quote);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [selected, range]);

  const divider = (
    <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.15, margin: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {'─'.repeat(80)}
    </div>
  );

  const isUp = livePrice ? livePrice.change >= 0 : true;
  const lineColor = isUp ? GREEN : RED;

  const firstClose = points.find(p => p.close != null)?.close ?? null;
  const lastClose = [...points].reverse().find(p => p.close != null)?.close ?? null;
  const overallUp = firstClose != null && lastClose != null ? lastClose >= firstClose : true;
  const multiLineColor = overallUp ? GREEN : RED;

  const currentPrice = livePrice?.price ?? lastClose ?? null;

  const ohlcLast = [...points].reverse().find(p => p.close != null);

  return (
    <div style={{ background: BG, border: `1px solid rgba(148,163,184,0.2)`, padding: '24px 28px', maxWidth: '800px', marginTop: '48px' }}>
      <div style={{ ...mono, fontSize: '11px', color: STEEL, letterSpacing: '0.12em', marginBottom: '16px' }}>
        MARKET TERMINAL  ·  PRICE CHART
      </div>
      {divider}

      {/* Company selector */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '10px', letterSpacing: '0.1em' }}>INDIA</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {india.map(c => (
              <CompanyBtn key={c.id} company={c} active={selected?.id === c.id} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
        <div style={{ width: '1px', background: 'rgba(148,163,184,0.15)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...mono, fontSize: '10px', color: STEEL, opacity: 0.6, marginBottom: '10px', letterSpacing: '0.1em' }}>GLOBAL</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {global.map(c => (
              <CompanyBtn key={c.id} company={c} active={selected?.id === c.id} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ ...mono, fontSize: '13px', color: FG, fontWeight: 600 }}>
              {selected.name}
            </span>
            <span style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.4 }}>
              {selected.exchange}
            </span>
            {livePrice && !livePrice.error && (
              <>
                <span style={{ ...mono, fontSize: '13px', color: FG, fontVariantNumeric: 'tabular-nums' }}>
                  {selected.currency}{livePrice.price.toFixed(2)}
                </span>
                <span style={{ ...mono, fontSize: '12px', color: livePrice.change >= 0 ? GREEN : RED }}>
                  {livePrice.change >= 0 ? '▲' : '▼'} {Math.abs(livePrice.change).toFixed(2)} ({Math.abs(livePrice.changePct).toFixed(2)}%)
                </span>
              </>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['1d', '5d', '1mo', '3mo'] as Range[]).map(r => (
                <RangeBtn key={r} label={r.toUpperCase()} active={range === r} onClick={() => setRange(r)} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <RangeBtn label="LINE" active={chartType === 'line'} onClick={() => setChartType('line')} />
              <RangeBtn label="CANDLE" active={chartType === 'candle'} onClick={() => setChartType('candle')} />
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: '280px', marginBottom: '12px' }}>
            {loading ? (
              <div style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.4, paddingTop: '120px', textAlign: 'center' }}>
                FETCHING MARKET DATA<span style={{ animation: 'blink 1s step-end infinite' }}>...</span>
              </div>
            ) : error || points.length === 0 ? (
              <div style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.3, paddingTop: '120px', textAlign: 'center' }}>
                PRICE DATA UNAVAILABLE  ·  CHECK BACK LATER
              </div>
            ) : chartType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(245,240,232,0.06)" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={ts => formatTime(ts, range)}
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'rgba(245,240,232,0.4)' }}
                    stroke="rgba(245,240,232,0.1)"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'rgba(245,240,232,0.4)' }}
                    stroke="rgba(245,240,232,0.1)"
                    width={60}
                    tickFormatter={v => v.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip range={range} />} />
                  {currentPrice != null && (
                    <ReferenceLine y={currentPrice} stroke="rgba(245,240,232,0.3)" strokeDasharray="4 4" />
                  )}
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={range === '1d' ? lineColor : multiLineColor}
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(245,240,232,0.06)" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={ts => formatTime(ts, range)}
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'rgba(245,240,232,0.4)' }}
                    stroke="rgba(245,240,232,0.1)"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'rgba(245,240,232,0.4)' }}
                    stroke="rgba(245,240,232,0.1)"
                    width={60}
                    tickFormatter={v => v.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip range={range} />} />
                  {currentPrice != null && (
                    <ReferenceLine y={currentPrice} stroke="rgba(245,240,232,0.3)" strokeDasharray="4 4" />
                  )}
                  <Bar dataKey="close" shape={<CandleBar />} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* OHLCV summary */}
          {ohlcLast && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                ['O', ohlcLast.open],
                ['H', ohlcLast.high],
                ['L', ohlcLast.low],
                ['C', ohlcLast.close],
              ].map(([k, v]) => v != null && (
                <span key={String(k)} style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5 }}>
                  {k}: <span style={{ opacity: 0.9 }}>{fmt2(v as number)}</span>
                </span>
              ))}
              {livePrice && !livePrice.error && (
                <span style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5 }}>
                  Volume: <span style={{ opacity: 0.9 }}>{new Intl.NumberFormat('en-IN').format(livePrice.volume)}</span>
                </span>
              )}
              {livePrice && !livePrice.error && (
                <span style={{ ...mono, fontSize: '11px', color: livePrice.change >= 0 ? GREEN : RED, opacity: 0.8 }}>
                  Change: {livePrice.change >= 0 ? '+' : ''}{livePrice.change.toFixed(2)} ({livePrice.changePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </>
      )}

      {!selected && (
        <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.3, marginTop: '8px' }}>
          Select a company to view chart
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

function RangeBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
          ? `1px solid ${STEEL}`
          : hover
          ? `1px solid rgba(148,163,184,0.4)`
          : `1px solid rgba(148,163,184,0.2)`,
        background: active ? 'rgba(148,163,184,0.15)' : 'transparent',
        color: active ? FG : hover ? FG : STEEL,
        transition: 'all 0.12s',
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </button>
  );
}

