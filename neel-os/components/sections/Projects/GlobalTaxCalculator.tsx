'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TAX_SYSTEMS, { TaxResult } from '@/lib/taxData';
import { playCommandEnter } from '@/lib/soundEngine';

const AMBER = '#B45309';
const GREEN = '#4AFF91';
const FG = '#F5F0E8';
const BG = '#0A0A0A';
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

const COUNTRY_KEYS = Object.keys(TAX_SYSTEMS);

function fmtNum(n: number, countryKey: string): string {
  const r = Math.round(n);
  if (countryKey === 'IN') return new Intl.NumberFormat('en-IN').format(r);
  return new Intl.NumberFormat('en').format(r);
}

function fmtC(n: number, countryKey: string): string {
  const c = TAX_SYSTEMS[countryKey];
  return `${c.currency}${fmtNum(n, countryKey)}`;
}

function rateColor(pct: number): string {
  if (pct < 20) return GREEN;
  if (pct <= 35) return FG;
  return AMBER;
}

interface SingleResult {
  countryKey: string;
  gross: number;
  primary: TaxResult;
  secondary?: TaxResult;
}

interface CompareResult {
  countryA: string; grossA: number; resultA: TaxResult;
  countryB: string; grossB: number; resultB: TaxResult;
  winnerKey: string;
}

// ── Country Dropdown ──────────────────────────────────────────────────────────

function CountryDropdown({
  value, onChange, geoCountry, isMobile,
}: {
  value: string;
  onChange: (k: string) => void;
  geoCountry: string;
  isMobile: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = TAX_SYSTEMS[value];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (isMobile) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...mono, fontSize: '12px', color: FG, background: BG,
          border: 'none', borderBottom: `1px solid rgba(180,83,9,0.4)`, padding: '6px 0',
          outline: 'none',
        }}
      >
        {COUNTRY_KEYS.map(k => (
          <option key={k} value={k}>{TAX_SYSTEMS[k].flag} {TAX_SYSTEMS[k].name}</option>
        ))}
      </select>
    );
  }

  const topKey = geoCountry !== value && TAX_SYSTEMS[geoCountry] ? geoCountry : null;
  const rest = COUNTRY_KEYS.filter(k => k !== topKey);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        data-cursor-hover
        style={{
          ...mono, fontSize: '12px', color: FG, background: BG,
          border: 'none', borderBottom: `1px solid rgba(180,83,9,0.4)`, padding: '6px 0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        {c.flag} {c.name} <span style={{ opacity: 0.5 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          background: '#111', border: `1px solid rgba(180,83,9,0.3)`,
          minWidth: '200px', maxHeight: '280px', overflowY: 'auto',
        }}>
          {topKey && (
            <>
              <div style={{ ...mono, fontSize: '9px', color: AMBER, opacity: 0.6, padding: '6px 12px 2px', letterSpacing: '0.1em' }}>
                YOUR REGION
              </div>
              <button
                onClick={() => { onChange(topKey); setOpen(false); }}
                data-cursor-hover
                style={itemStyle(topKey === value)}
              >
                {TAX_SYSTEMS[topKey].flag} {TAX_SYSTEMS[topKey].name}
              </button>
              <div style={{ height: '1px', background: 'rgba(245,240,232,0.1)', margin: '4px 0' }} />
              <div style={{ ...mono, fontSize: '9px', color: FG, opacity: 0.4, padding: '2px 12px 4px', letterSpacing: '0.1em' }}>
                ALL COUNTRIES
              </div>
            </>
          )}
          {rest.map(k => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpen(false); }}
              data-cursor-hover
              style={itemStyle(k === value)}
            >
              {TAX_SYSTEMS[k].flag} {TAX_SYSTEMS[k].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function itemStyle(active: boolean): React.CSSProperties {
  return {
    ...mono, display: 'block', width: '100%', textAlign: 'left',
    fontSize: '12px', color: active ? AMBER : FG, background: active ? 'rgba(180,83,9,0.12)' : 'transparent',
    border: 'none', padding: '6px 12px', cursor: 'pointer',
  };
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Div() {
  return (
    <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.15, margin: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {'─'.repeat(80)}
    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value, bold, color }: { label: string; value: React.ReactNode; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
      <span style={{ ...mono, fontSize: '11px', color: FG, opacity: bold ? 0.8 : 0.45, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{ ...mono, fontSize: '11px', color: color ?? FG, opacity: color ? 1 : bold ? 0.95 : 0.8, fontWeight: bold ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

// ── Single Output ─────────────────────────────────────────────────────────────

function SingleOutput({ result }: { result: SingleResult }) {
  const { countryKey, gross, primary, secondary } = result;
  const c = TAX_SYSTEMS[countryKey];
  const effectivePct = gross > 0 ? (primary.total / gross) * 100 : 0;
  const takeHome = (gross - primary.total) / 12;
  const isUAE = countryKey === 'AE';

  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ ...mono, fontSize: '12px', color: FG, marginBottom: '10px', opacity: 0.9 }}>
        {c.flag} {c.name.toUpperCase()}  ·  {c.taxYear}
      </div>
      <Div />

      {isUAE ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ ...mono, fontSize: '22px', color: GREEN, marginBottom: '8px' }}>0%</div>
          <div style={{ ...mono, fontSize: '13px', color: GREEN }}>ZERO personal income tax</div>
          <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5, marginTop: '8px' }}>VAT 5% on consumption only</div>
          <div style={{ ...mono, fontSize: '11px', color: GREEN, marginTop: '16px' }}>
            Monthly take-home: {fmtC(gross / 12, countryKey)}
          </div>
        </div>
      ) : (
        <>
          <Row label="GROSS INCOME" value={fmtC(gross, countryKey)} bold />
          {primary.deductions != null && primary.deductions > 0 && (
            <Row label="Deductions" value={`-${fmtC(primary.deductions, countryKey)}`} />
          )}
          {primary.taxableIncome != null && (
            <Row label="TAXABLE INCOME" value={fmtC(primary.taxableIncome, countryKey)} bold />
          )}

          {primary.breakdown.length > 0 && (
            <>
              <Div />
              <div style={{ ...mono, fontSize: '10px', color: AMBER, opacity: 0.8, marginBottom: '8px', letterSpacing: '0.1em' }}>
                TAX BREAKDOWN
              </div>
              {primary.breakdown.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
                  <span style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.45 }}>{b.range}:</span>
                  <span style={{ ...mono, fontSize: '11px', color: FG, opacity: b.amount > 0 ? 0.8 : 0.3, fontVariantNumeric: 'tabular-nums' }}>
                    {b.amount > 0 ? fmtC(b.amount, countryKey) : 'NIL'}
                    <span style={{ opacity: 0.5, marginLeft: '8px' }}>({b.rate})</span>
                  </span>
                </div>
              ))}
            </>
          )}

          <Div />
          <Row label="INCOME TAX" value={fmtC(primary.tax, countryKey)} bold />
          {primary.cess > 0 && (
            <Row label={primary.cessLabel ?? 'Additional charges'} value={fmtC(primary.cess, countryKey)} />
          )}
          <Div />
          <Row label="TOTAL TAX" value={fmtC(primary.total, countryKey)} bold color={rateColor(effectivePct)} />
          <Row label="EFFECTIVE RATE" value={`${effectivePct.toFixed(2)}%`} bold color={rateColor(effectivePct)} />
          <Row label="MONTHLY TDS" value={fmtC(primary.total / 12, countryKey)} />
          <Row label="MONTHLY TAKE-HOME" value={fmtC(takeHome, countryKey)} bold color={GREEN} />

          {primary.note && (
            <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.4, marginTop: '8px', lineHeight: 1.6 }}>
              {primary.note}
            </div>
          )}

          {/* India new vs old comparison */}
          {countryKey === 'IN' && secondary && (() => {
            const newBetter = primary.total <= secondary.total;
            const saving = Math.abs(primary.total - secondary.total);
            return (
              <>
                <Div />
                <Row label="Old Regime (estimated)" value={fmtC(secondary.total, 'IN')} />
                <Row label="New Regime" value={fmtC(primary.total, 'IN')} />
                <Row
                  label={newBetter ? 'YOU SAVE' : 'OLD REGIME BETTER'}
                  value={`${fmtC(saving, 'IN')} ${newBetter ? 'with new regime ✓' : '(for high deductions)'}`}
                  bold
                  color={newBetter ? GREEN : AMBER}
                />
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}

// ── Compare Output ────────────────────────────────────────────────────────────

function CompareOutput({ result, onSwap, onReset }: { result: CompareResult; onSwap: () => void; onReset: () => void }) {
  const { countryA, grossA, resultA, countryB, grossB, resultB, winnerKey } = result;
  const cA = TAX_SYSTEMS[countryA];
  const cB = TAX_SYSTEMS[countryB];
  const rateA = grossA > 0 ? (resultA.total / grossA) * 100 : 0;
  const rateB = grossB > 0 ? (resultB.total / grossB) * 100 : 0;
  const diff = Math.abs(rateA - rateB);
  const winnerC = TAX_SYSTEMS[winnerKey];
  const isUAEWin = winnerKey === 'AE';

  const comparisonGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 280px) 1px minmax(220px, 280px)',
    columnGap: '24px',
    alignItems: 'start',
    width: 'fit-content',
    maxWidth: '100%',
  };

  const comparisonColumnStyle = (isWinner: boolean): React.CSSProperties => ({
    minWidth: 0,
    padding: '0',
    opacity: isWinner ? 1 : 0.75,
  });

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={comparisonGridStyle}>
        <div style={comparisonColumnStyle(countryA === winnerKey)}>
          <div style={{ ...mono, fontSize: '13px', color: FG, marginBottom: '10px', fontWeight: 600 }}>
            {cA.flag} {cA.name.toUpperCase()}
          </div>
          <Div />
          <Row label="Gross" value={fmtC(grossA, countryA)} />
          <Row label="Tax" value={fmtC(resultA.total, countryA)} bold color={rateColor(rateA)} />
          <Row label="Rate" value={`${rateA.toFixed(2)}%`} color={rateColor(rateA)} />
          <Row label="Take-home/mo" value={fmtC((grossA - resultA.total) / 12, countryA)} bold color={GREEN} />
        </div>

        <div style={{ width: '1px', background: 'rgba(245,240,232,0.1)' }} />

        <div style={comparisonColumnStyle(countryB === winnerKey)}>
          <div style={{ ...mono, fontSize: '13px', color: FG, marginBottom: '10px', fontWeight: 600 }}>
            {cB.flag} {cB.name.toUpperCase()}
          </div>
          <Div />
          <Row label="Gross" value={fmtC(grossB, countryB)} />
          <Row label="Tax" value={fmtC(resultB.total, countryB)} bold color={rateColor(rateB)} />
          <Row label="Rate" value={`${rateB.toFixed(2)}%`} color={rateColor(rateB)} />
          <Row label="Take-home/mo" value={fmtC((grossB - resultB.total) / 12, countryB)} bold color={GREEN} />
        </div>
      </div>

      <div style={{ ...mono, fontSize: '10px', color: AMBER, opacity: 0.7, margin: '14px 0 6px', letterSpacing: '0.1em' }}>
        WINNER  {'─'.repeat(40)}
      </div>
      {isUAEWin ? (
        <div style={{ ...mono, fontSize: '12px', color: GREEN }}>
          🇦🇪 UAE wins — 0% personal income tax.
        </div>
      ) : (
        <div style={{ ...mono, fontSize: '12px', color: GREEN, lineHeight: 1.7 }}>
          {winnerC.flag} {winnerC.name} has {diff.toFixed(1)}% lower effective tax at this income.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <ActionBtn label="⇄ SWAP" onClick={onSwap} />
        <ActionBtn label="RESET" onClick={onReset} />
      </div>
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      data-cursor-hover
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...mono, fontSize: '11px', cursor: 'pointer',
        border: 'none',
        color: primary ? AMBER : hover ? FG : `rgba(245,240,232,0.6)`,
        background: 'transparent',
        padding: '6px 0', letterSpacing: '0.08em', transition: 'opacity 0.12s',
        opacity: hover ? 1 : 0.85,
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const ANALYZE_LINES_SINGLE = [
  'LOADING tax system configuration 2024...',
  'APPLYING deduction rules...',
  'COMPUTING progressive slab liability...',
  'APPLYING social contributions...',
  'COMPUTING effective tax rate...',
  'GENERATING analysis report...',
];

const ANALYZE_LINES_COMPARE = [
  'MOUNTING dual-country analysis engine...',
  'LOADING country A tax system...',
  'LOADING country B tax system...',
  'APPLYING currency conversion rates...',
  'COMPUTING parallel tax liabilities...',
  'DETERMINING winner by effective rate...',
  'GENERATING comparison report...',
];

export default function GlobalTaxCalculator({
  soundEnabled = false,
  onRunTrace,
}: {
  soundEnabled?: boolean;
  onRunTrace?: () => void;
}) {
  const [geoCountry, setGeoCountry]       = useState('IN');
  const [isMobile, setIsMobile]           = useState(false);
  const [mode, setMode]                   = useState<'single' | 'compare'>('single');

  // single mode
  const [countryKey, setCountryKey]       = useState('IN');
  const [income, setIncome]               = useState('');
  const [singleResult, setSingleResult]   = useState<SingleResult | null>(null);

  // compare mode
  const [cA, setCA]                       = useState('IN');
  const [cB, setCB]                       = useState('US');
  const [incomeA, setIncomeA]             = useState('');
  const [incomeB, setIncomeB]             = useState('');
  const [incomeBManual, setIncomeBManual] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);

  // animation
  const [phase, setPhase]                 = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [analyzeLines, setAnalyzeLines]   = useState<string[]>([]);
  const [askQuery, setAskQuery]           = useState('');
  const [askResponse, setAskResponse]     = useState('');
  const [askLoading, setAskLoading]       = useState(false);
  const [askError, setAskError]           = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnimationTimers = useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearAnimationTimers();
    };
  }, [clearAnimationTimers]);

  // geo detection
  useEffect(() => {
    fetch('/api/geo').then(r => r.json()).then((d: { country: string }) => {
      if (d.country && TAX_SYSTEMS[d.country]) {
        setGeoCountry(d.country);
        setCountryKey(d.country);
        setCA(d.country);
      }
    }).catch(() => {});
  }, []);

  // mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // focus input on idle
  useEffect(() => {
    if (phase === 'idle' && mode === 'single') inputRef.current?.focus();
  }, [phase, mode]);

  // auto-convert income B when A changes (if not manually set)
  const autoConvertedB = useMemo(() => {
    if (!incomeA) return '';
    const n = parseFloat(incomeA.replace(/,/g, ''));
    if (isNaN(n) || n <= 0) return '';
    const sysA = TAX_SYSTEMS[cA];
    const sysB = TAX_SYSTEMS[cB];
    return Math.round(n * sysA.usdRate / sysB.usdRate).toString();
  }, [incomeA, cA, cB]);

  // reset incomeB manual flag when A income or countries change
  useEffect(() => {
    setIncomeBManual(false);
  }, [incomeA, cA, cB]);

  const runAnimation = useCallback((lines: string[]): Promise<void> => {
    clearAnimationTimers();
    setAnalyzeLines([]);
    return new Promise(resolve => {
      let i = 0;
      animationIntervalRef.current = setInterval(() => {
        if (i < lines.length) {
          setAnalyzeLines(prev => [...prev, lines[i]]);
          i++;
        } else {
          clearAnimationTimers();
          animationTimeoutRef.current = setTimeout(resolve, 300);
        }
      }, 200);
    });
  }, [clearAnimationTimers]);

  const handleCalculate = async () => {
    const n = parseFloat(income.replace(/,/g, ''));
    if (isNaN(n) || n <= 0) return;
    if (soundEnabled) playCommandEnter();
    onRunTrace?.();
    setPhase('analyzing');
    await runAnimation(ANALYZE_LINES_SINGLE);
    if (!mountedRef.current) return;
    const sys = TAX_SYSTEMS[countryKey];
    const primary = sys.systems[0].calculate(n);
    const secondary = countryKey === 'IN' ? sys.systems[1]?.calculate(n) : undefined;
    setSingleResult({ countryKey, gross: n, primary, secondary });
    setPhase('done');
  };

  const handleCompare = async () => {
    const nA = parseFloat(incomeA.replace(/,/g, ''));
    const rawB = incomeBManual ? incomeB : autoConvertedB;
    const nB = parseFloat(rawB.replace(/,/g, ''));
    if (isNaN(nA) || nA <= 0 || isNaN(nB) || nB <= 0) return;
    if (soundEnabled) playCommandEnter();
    onRunTrace?.();
    setPhase('analyzing');
    await runAnimation(ANALYZE_LINES_COMPARE);
    if (!mountedRef.current) return;
    const sysA = TAX_SYSTEMS[cA];
    const sysB = TAX_SYSTEMS[cB];
    const resultA = sysA.systems[0].calculate(nA);
    const resultB = sysB.systems[0].calculate(nB);
    const rateA = nA > 0 ? resultA.total / nA : 1;
    const rateB = nB > 0 ? resultB.total / nB : 1;
    const winnerKey = cA === 'AE' ? 'AE' : cB === 'AE' ? 'AE' : rateA <= rateB ? cA : cB;
    setCompareResult({ countryA: cA, grossA: nA, resultA, countryB: cB, grossB: nB, resultB, winnerKey });
    setPhase('done');
  };

  const handleSwap = () => {
    setCA(cB); setCB(cA);
    setIncomeA(incomeBManual ? incomeB : autoConvertedB);
    setIncomeB(incomeA);
    setIncomeBManual(true);
    setCompareResult(null);
    setPhase('idle');
  };

  const handleReset = () => {
    setPhase('idle');
    setSingleResult(null);
    setCompareResult(null);
    setAskQuery('');
    setAskResponse('');
    setAskError('');
    setAskLoading(false);
    setIncome('');
    setIncomeA('');
    setIncomeB('');
    setIncomeBManual(false);
  };

  const handleModeSwitch = (m: 'single' | 'compare') => {
    setMode(m);
    setPhase('idle');
    setSingleResult(null);
    setCompareResult(null);
    setAskQuery('');
    setAskResponse('');
    setAskError('');
    setAskLoading(false);
  };

  const submitTaxQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = askQuery.trim();
    if (!text || askLoading) return;

    if (soundEnabled) playCommandEnter();
    setAskLoading(true);
    setAskResponse('');
    setAskError('');
    setAskQuery('');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          context: {
            source: 'neurofin-tax',
            mode,
            singleResult,
            compareResult,
          },
        }),
      });
      if (!res.ok || !res.body) {
        setAskError(res.status === 503 ? 'api not configured' : 'query failed');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAskResponse(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setAskError('connection failed');
    } finally {
      setAskLoading(false);
    }
  };

  const divider = (
    <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.15, margin: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {'─'.repeat(80)}
    </div>
  );

  const currentCountry = TAX_SYSTEMS[countryKey];

  return (
    <div style={{ background: BG, padding: 0, maxWidth: '720px', marginTop: 0 }}>
      <div style={{ ...mono, fontSize: '11px', color: AMBER, letterSpacing: '0.12em', marginBottom: '16px' }}>
        NEUROFIN  ·  TAX ANALYSIS MODULE
      </div>
      {divider}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {mode === 'single' && (
            <>
              <span style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.45, letterSpacing: '0.1em' }}>COUNTRY</span>
              <CountryDropdown value={countryKey} onChange={k => { setCountryKey(k); setPhase('idle'); setSingleResult(null); }} geoCountry={geoCountry} isMobile={isMobile} />
            </>
          )}
          {mode === 'compare' && (
            <span style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.6 }}>COMPARE MODE</span>
          )}
        </div>
        <ActionBtn
          label={mode === 'single' ? '⇄ COMPARE TWO COUNTRIES' : '← SINGLE COUNTRY'}
          onClick={() => handleModeSwitch(mode === 'single' ? 'compare' : 'single')}
        />
      </div>

      {/* ── SINGLE MODE ─────────────────────────────────────────── */}
      {mode === 'single' && phase === 'idle' && (
        <>
          <div style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.6, marginBottom: '8px' }}>
            {currentCountry.incomeLabel}:
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, borderBottom: `1px solid rgba(180,83,9,0.35)`, paddingBottom: '4px' }}>
              <span style={{ ...mono, fontSize: '13px', color: FG, opacity: 0.5, marginRight: '4px' }}>{'>'} {currentCountry.currency}</span>
              <input
                ref={inputRef}
                value={income}
                onChange={e => setIncome(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                placeholder="0"
                style={{
                  ...mono, fontSize: '14px', color: FG, background: 'transparent',
                  border: 'none', outline: 'none', width: '100%', padding: 0,
                }}
              />
            </div>
            <ActionBtn label="CALCULATE →" onClick={handleCalculate} primary />
          </div>
          <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.3, marginTop: '8px' }}>
            {currentCountry.note}
          </div>
        </>
      )}

      {/* ── COMPARE MODE INPUT ───────────────────────────────────── */}
      {mode === 'compare' && phase === 'idle' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 280px) 1px minmax(220px, 280px)',
          columnGap: '24px',
          alignItems: 'start',
          width: 'fit-content',
          maxWidth: '100%',
        }}>
          {/* Country A */}
          <div style={{ flex: 1, padding: 0 }}>
            <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.45, marginBottom: '8px', letterSpacing: '0.1em' }}>COUNTRY A</div>
            <CountryDropdown value={cA} onChange={k => { setCA(k); }} geoCountry={geoCountry} isMobile={isMobile} />
            <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5, marginTop: '12px', marginBottom: '6px' }}>
              Income ({TAX_SYSTEMS[cA].currency}):
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid rgba(180,83,9,0.35)`, paddingBottom: '4px' }}>
              <span style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.4, marginRight: '4px' }}>{'>'}</span>
              <input
                value={incomeA}
                onChange={e => setIncomeA(e.target.value)}
                placeholder="0"
                style={{ ...mono, fontSize: '13px', color: FG, background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ width: '1px', background: 'rgba(245,240,232,0.1)' }} />

          {/* Country B */}
          <div style={{ flex: 1, padding: 0 }}>
            <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.45, marginBottom: '8px', letterSpacing: '0.1em' }}>COUNTRY B</div>
            <CountryDropdown value={cB} onChange={k => { setCB(k); }} geoCountry={geoCountry} isMobile={isMobile} />
            <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5, marginTop: '12px', marginBottom: '6px' }}>
              Income ({TAX_SYSTEMS[cB].currency}):
              {!incomeBManual && autoConvertedB && (
                <span style={{ ...mono, fontSize: '9px', color: GREEN, marginLeft: '8px', opacity: 0.7 }}>(auto-converted)</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid rgba(180,83,9,0.35)`, paddingBottom: '4px' }}>
              <span style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.4, marginRight: '4px' }}>{'>'}</span>
              <input
                value={incomeBManual ? incomeB : autoConvertedB}
                onChange={e => { setIncomeB(e.target.value); setIncomeBManual(true); }}
                placeholder={autoConvertedB || '0'}
                style={{ ...mono, fontSize: '13px', color: FG, background: 'transparent', border: 'none', outline: 'none', width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {mode === 'compare' && phase === 'idle' && (
        <div style={{ marginTop: '14px' }}>
          <ActionBtn label="COMPARE →" onClick={handleCompare} primary />
        </div>
      )}

      {/* ── ANALYZING ───────────────────────────────────────────── */}
      {phase === 'analyzing' && (
        <div style={{ marginTop: '8px' }}>
          {analyzeLines.map((line, i) => (
            <div key={i} style={{ ...mono, fontSize: '12px', color: GREEN, lineHeight: 1.8, opacity: 0.8 }}>
              {'>'} {line}
            </div>
          ))}
          <span style={{ ...mono, fontSize: '12px', color: GREEN, opacity: 0.5 }}>▌</span>
        </div>
      )}

      {/* ── RESULTS ─────────────────────────────────────────────── */}
      {phase === 'done' && mode === 'single' && singleResult && (
        <>
          <SingleOutput result={singleResult} />
          {divider}
          <div style={{ display: 'flex', gap: '8px' }}>
            <ActionBtn label="RECALCULATE" onClick={handleReset} />
            <ActionBtn label="⇄ COMPARE WITH ANOTHER COUNTRY" onClick={() => handleModeSwitch('compare')} />
          </div>
        </>
      )}

      {phase === 'done' && mode === 'compare' && compareResult && (
        <>
          <CompareOutput result={compareResult} onSwap={handleSwap} onReset={handleReset} />
        </>
      )}

      {phase === 'done' && (singleResult || compareResult) && (
        <div style={{ marginTop: '18px', borderTop: `1px solid rgba(180,83,9,0.2)`, paddingTop: '14px' }}>
          {(askResponse || askLoading || askError) && (
            <div style={{ ...mono, fontSize: '11px', color: askError ? AMBER : FG, opacity: 0.75, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
              {askError || askResponse}
              {askLoading && <span style={{ color: AMBER }}>▌</span>}
            </div>
          )}
          <form onSubmit={submitTaxQuestion} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ ...mono, fontSize: '11px', color: AMBER, opacity: 0.6 }}>neurofin$</span>
            <input
              value={askQuery}
              onChange={e => setAskQuery(e.target.value)}
              disabled={askLoading}
              placeholder="ask about this tax result..."
              style={{ ...mono, flex: 1, fontSize: '11px', color: FG, background: 'transparent', border: 'none', outline: 'none', borderBottom: `1px solid rgba(180,83,9,0.35)`, paddingBottom: '4px' }}
            />
          </form>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ ...mono, fontSize: '9px', color: FG, opacity: 0.25, marginTop: '20px', lineHeight: 1.6 }}>
        For reference only. Consult a tax professional for actual filing. Rates verified for 2024/FY2024-25.
      </div>
    </div>
  );
}
