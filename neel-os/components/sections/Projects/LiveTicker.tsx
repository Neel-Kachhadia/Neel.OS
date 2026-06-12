'use client';

import { memo, useEffect, useRef, useState } from 'react';

interface Row { price: number; change: number; pct: number; dir: 'up' | 'dn'; }
interface Tick { time: string; symbol: string; price: string; dir: 'up' | 'dn'; qty: string; }
interface Greeks { oi: number; iv: number; delta: number; gamma: number; theta: number; vega: number; }

const INSTRUMENTS = [
  { symbol: 'NIFTY 50',  ticker: 'NIFTY',    basePrice: 24847.65, baseChange:  127.30, isIndex: true  },
  { symbol: 'BANKNIFTY', ticker: 'BNKN',     basePrice: 52341.20, baseChange:  -89.45, isIndex: true  },
  { symbol: 'RELIANCE',  ticker: 'RELIANCE', basePrice:  1402.55, baseChange:   18.20, isIndex: false },
  { symbol: 'TCS',       ticker: 'TCS',      basePrice:  3891.00, baseChange:  -24.10, isIndex: false },
  { symbol: 'HDFC BANK', ticker: 'HDFC',     basePrice:  1671.30, baseChange:   12.85, isIndex: false },
];

function fmt(n: number, dec = 2): string {
  const fixed = Math.abs(n).toFixed(dec);
  const [int, d] = fixed.split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + d;
}

const initRows = (): Record<string, Row> =>
  Object.fromEntries(INSTRUMENTS.map(inst => [
    inst.symbol,
    {
      price:  inst.basePrice,
      change: inst.baseChange,
      pct:    (inst.baseChange / inst.basePrice) * 100,
      dir:    (inst.baseChange >= 0 ? 'up' : 'dn') as 'up' | 'dn',
    },
  ]));

function LiveTicker(): JSX.Element {
  const rowsRef = useRef<Record<string, Row>>(initRows());
  const [rows,       setRows]       = useState<Record<string, Row>>(initRows);
  const [ticks,      setTicks]      = useState<Tick[]>([]);
  const [greeks,     setGreeks]     = useState<Greeks>({
    oi: 2847400, iv: 14.2, delta: 0.31, gamma: 0.0018, theta: -42.3, vega: 0.89,
  });
  const [flashSym,   setFlashSym]   = useState<string | null>(null);
  const [alertFlash, setAlertFlash] = useState(false);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let tickCount = 0;

    const iv = setInterval(() => {
      tickCount++;

      const inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
      const cur  = rowsRef.current[inst.symbol];
      const newPrice = cur.price * (1 + (Math.random() - 0.5) * 0.004);
      const change   = newPrice - inst.basePrice;
      const pct      = (change / inst.basePrice) * 100;
      const dir: 'up' | 'dn' = newPrice >= cur.price ? 'up' : 'dn';

      rowsRef.current = { ...rowsRef.current, [inst.symbol]: { price: newPrice, change, pct, dir } };
      setRows({ ...rowsRef.current });

      if (flashTimer.current) clearTimeout(flashTimer.current);
      setFlashSym(inst.symbol);
      flashTimer.current = setTimeout(() => setFlashSym(null), 800);

      const newTick: Tick = {
        time:   new Date().toISOString().slice(11, 23),
        symbol: inst.ticker,
        price:  fmt(newPrice),
        dir,
        qty:    inst.isIndex ? '--' : String(Math.floor(Math.random() * 400 + 50)),
      };
      setTicks(prev => [newTick, ...prev].slice(0, 6));

      if (tickCount % 3 === 0) {
        setGreeks(g => ({
          oi:    Math.round(g.oi + (Math.random() - 0.5) * 20000),
          iv:    Math.max(10, g.iv + (Math.random() - 0.5) * 0.3),
          delta: Math.max(0.1, Math.min(0.9, g.delta + (Math.random() - 0.5) * 0.01)),
          gamma: Math.max(0.0005, g.gamma + (Math.random() - 0.5) * 0.0002),
          theta: g.theta + (Math.random() - 0.5) * 1,
          vega:  Math.max(0.1, g.vega + (Math.random() - 0.5) * 0.03),
        }));
      }

      if (tickCount % 10 === 0) {
        if (alertTimer.current) clearTimeout(alertTimer.current);
        setAlertFlash(true);
        alertTimer.current = setTimeout(() => setAlertFlash(false), 200);
      }
    }, 1200);

    return () => {
      clearInterval(iv);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (alertTimer.current) clearTimeout(alertTimer.current);
    };
  }, []);

  const ph    = 'var(--phosphor)';
  const phDim = 'rgba(10,208,154,0.7)';
  const tbg   = 'var(--terminal-bg)';
  const upC   = 'var(--online)';
  const dnC   = 'var(--amber)';
  const off   = 'var(--text-on-black)';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--black)',
      padding: '18px 32px',
      fontFamily: 'var(--font-mono)', fontSize: '11px', color: ph,
      overflowY: 'hidden',
    }}>

      <div style={{ fontSize: '10px', letterSpacing: '0.12em', opacity: 0.5, marginBottom: '4px' }}>
        INDIAN MARKET TERMINAL  ·  NSE LIVE
      </div>
      <div style={{ height: '1px', background: tbg, marginBottom: '10px' }} />

      {/* Price table */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '128px 96px 96px 60px',
          fontSize: '9px', opacity: 0.35, marginBottom: '4px', letterSpacing: '0.05em',
        }}>
          <span>INDEX/STOCK</span><span>PRICE</span><span>CHANGE</span><span>%</span>
        </div>
        {INSTRUMENTS.map(inst => {
          const row  = rows[inst.symbol];
          const isF  = flashSym === inst.symbol;
          const col  = isF ? (row.dir === 'up' ? upC : dnC) : phDim;
          const sign = row.change >= 0 ? '+' : '-';
          return (
            <div key={inst.symbol} style={{
              display: 'grid', gridTemplateColumns: '128px 96px 96px 60px',
              lineHeight: 1.75, color: col, transition: 'color 0.15s ease',
            }}>
              <span>{inst.symbol}</span>
              <span>{fmt(row.price)}</span>
              <span>{row.dir === 'up' ? '▲' : '▼'} {sign}{fmt(Math.abs(row.change))}</span>
              <span>{row.pct >= 0 ? '+' : ''}{row.pct.toFixed(2)}%</span>
            </div>
          );
        })}
      </div>

      <div style={{ height: '1px', background: tbg, marginBottom: '10px' }} />

      {/* Options chain */}
      <div style={{ marginBottom: '10px', fontSize: '9px' }}>
        <div style={{ opacity: 0.4, marginBottom: '5px', letterSpacing: '0.08em' }}>
          OPTIONS CHAIN  ·  NIFTY  ·  25000CE  ·  27-JUN
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 0', opacity: 0.55 }}>
          <span>OI: {greeks.oi.toLocaleString()}</span>
          <span>IV: {greeks.iv.toFixed(1)}%</span>
          <span>Δ {greeks.delta.toFixed(2)}</span>
          <span>Γ {greeks.gamma.toFixed(4)}</span>
          <span>Θ {greeks.theta.toFixed(1)}</span>
          <span>ν {greeks.vega.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ height: '1px', background: tbg, marginBottom: '10px' }} />

      {/* Tick stream */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '9px', opacity: 0.35, letterSpacing: '0.08em', marginBottom: '4px' }}>TICK STREAM</div>
        {ticks.length === 0 ? (
          <div style={{ opacity: 0.25, fontSize: '10px' }}>awaiting ticks...</div>
        ) : (
          ticks.map((tick, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px', fontSize: '10px',
              opacity: Math.max(0.15, 1 - i * 0.16),
              lineHeight: 1.65,
            }}>
              <span style={{ opacity: 0.4 }}>{tick.time}</span>
              <span style={{ minWidth: '60px' }}>{tick.symbol}</span>
              <span style={{ minWidth: '72px' }}>{tick.price}</span>
              <span style={{ color: tick.dir === 'up' ? upC : dnC }}>{tick.dir === 'up' ? '▲' : '▼'}</span>
              <span style={{ opacity: 0.45 }}>qty: {tick.qty}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ height: '1px', background: tbg, marginBottom: '8px' }} />

      {/* Alert */}
      <div style={{
        fontSize: '10px',
        color: alertFlash ? off : ph,
        opacity: alertFlash ? 1 : 0.45,
        transition: 'color 0.15s, opacity 0.15s',
      }}>
        ALERT ENGINE  ·  38.2% FIBONACCI LEVEL
        <span style={{ marginLeft: '8px', opacity: 0.7 }}>[NIFTY approaching support at 24,712]</span>
      </div>

    </div>
  );
}

export default memo(LiveTicker);
