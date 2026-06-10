'use client';

import { useState, useRef, useEffect } from 'react';

const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' };
const AMBER = '#B45309';
const GREEN = '#4AFF91';
const FG = '#F5F0E8';
const BG = '#0A0A0A';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
}

interface TaxResult {
  grossIncome: number;
  stdDeduction: number;
  taxableIncome: number;
  slabs: { label: string; amount: number; rate: string }[];
  incomeTax: number;
  cess: number;
  netTax: number;
  monthlyTDS: number;
  oldTax: number;
  newTax: number;
  saving: number;
  newBetter: boolean;
}

function calcNewRegime(income: number): number {
  const taxable = Math.max(0, income - 75000);
  if (taxable <= 700000) return 0; // 87A rebate
  let tax = 0;
  const slabs = [
    [400000, 0],
    [400000, 0.05],
    [400000, 0.10],
    [400000, 0.15],
    [400000, 0.20],
    [400000, 0.25],
    [Infinity, 0.30],
  ] as [number, number][];
  let remaining = taxable;
  for (const [size, rate] of slabs) {
    if (remaining <= 0) break;
    const chunk = Math.min(remaining, size);
    tax += chunk * rate;
    remaining -= chunk;
  }
  return tax;
}

function calcOldRegime(income: number): number {
  const taxable = Math.max(0, income - 50000 - 150000);
  if (taxable <= 250000) return 0;
  if (taxable <= 500000) {
    const tax = (taxable - 250000) * 0.05;
    return tax <= 12500 ? 0 : tax; // 87A old regime
  }
  let tax = 12500;
  if (taxable > 500000) tax += Math.min(taxable - 500000, 500000) * 0.20;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;
  return tax;
}

function computeSlabs(taxableIncome: number): { label: string; amount: number; rate: string }[] {
  const slabDefs = [
    { label: '₹0 – ₹4,00,000', start: 0, end: 400000, rate: '0%', pct: 0 },
    { label: '₹4,00,001 – ₹8,00,000', start: 400000, end: 800000, rate: '5%', pct: 0.05 },
    { label: '₹8,00,001 – ₹12,00,000', start: 800000, end: 1200000, rate: '10%', pct: 0.10 },
    { label: '₹12,00,001 – ₹16,00,000', start: 1200000, end: 1600000, rate: '15%', pct: 0.15 },
    { label: '₹16,00,001 – ₹20,00,000', start: 1600000, end: 2000000, rate: '20%', pct: 0.20 },
    { label: '₹20,00,001 – ₹24,00,000', start: 2000000, end: 2400000, rate: '25%', pct: 0.25 },
    { label: 'Above ₹24,00,000', start: 2400000, end: Infinity, rate: '30%', pct: 0.30 },
  ];
  return slabDefs.map(s => {
    const chunk = Math.max(0, Math.min(taxableIncome, s.end) - s.start);
    return { label: s.label, amount: chunk * s.pct, rate: s.rate };
  });
}

function calculate(grossIncome: number): TaxResult {
  const stdDeduction = 75000;
  const taxableIncome = Math.max(0, grossIncome - stdDeduction);
  const slabs = computeSlabs(taxableIncome);
  const incomeTax = taxableIncome <= 700000 ? 0 : slabs.reduce((s, sl) => s + sl.amount, 0);
  const cess = incomeTax * 0.04;
  const netTax = incomeTax + cess;
  const monthlyTDS = netTax / 12;
  const oldTax = calcOldRegime(grossIncome);
  const oldCess = oldTax * 0.04;
  const oldNet = oldTax + oldCess;
  const newNet = netTax;
  const saving = Math.abs(oldNet - newNet);
  const newBetter = newNet <= oldNet;
  return {
    grossIncome, stdDeduction, taxableIncome, slabs,
    incomeTax, cess, netTax, monthlyTDS,
    oldTax: oldNet, newTax: newNet, saving, newBetter,
  };
}

const ANALYZE_LINES = [
  'INIT income processing module...',
  'LOADING tax slab configuration FY 2024-25...',
  'APPLYING standard deduction ₹75,000...',
  'CALCULATING new regime liability...',
  'ESTIMATING old regime comparison...',
  'CHECKING rebate u/s 87A eligibility...',
  'COMPUTING cess @ 4%...',
  'GENERATING analysis report...',
];

export default function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [analyzeLines, setAnalyzeLines] = useState<string[]>([]);
  const [result, setResult] = useState<TaxResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'idle') inputRef.current?.focus();
  }, [phase]);

  function handleCalculate() {
    const n = parseFloat(income.replace(/,/g, ''));
    if (isNaN(n) || n <= 0) return;
    setPhase('analyzing');
    setAnalyzeLines([]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < ANALYZE_LINES.length) {
        setAnalyzeLines(prev => [...prev, ANALYZE_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setResult(calculate(n));
          setPhase('done');
        }, 300);
      }
    }, 200);
  }

  const divider = (
    <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.2, margin: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {'─'.repeat(80)}
    </div>
  );

  return (
    <div style={{ background: BG, border: `1px solid rgba(180,83,9,0.25)`, padding: '24px 28px', maxWidth: '680px', marginTop: '48px' }}>
      <div style={{ ...mono, fontSize: '11px', color: AMBER, letterSpacing: '0.12em', marginBottom: '16px' }}>
        NEUROFIN  ·  TAX ANALYSIS MODULE
      </div>
      {divider}

      {phase === 'idle' && (
        <>
          <div style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5, marginBottom: '8px' }}>
            INCOME INPUT
          </div>
          <div style={{ ...mono, fontSize: '12px', color: FG, opacity: 0.6, marginBottom: '8px' }}>
            Annual gross income (₹):
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <span style={{ ...mono, fontSize: '13px', color: FG, opacity: 0.5, marginRight: '6px' }}>{'>'}</span>
              <input
                ref={inputRef}
                value={income}
                onChange={e => setIncome(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCalculate(); }}
                placeholder="e.g. 1200000"
                style={{
                  ...mono,
                  fontSize: '14px',
                  color: FG,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid rgba(245,240,232,0.3)`,
                  outline: 'none',
                  width: '100%',
                  padding: '4px 0',
                }}
              />
            </div>
            <button
              onClick={handleCalculate}
              data-cursor-hover
              style={{
                ...mono,
                fontSize: '11px',
                color: AMBER,
                background: 'transparent',
                border: `1px solid ${AMBER}`,
                padding: '6px 14px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.background = AMBER;
                (e.target as HTMLButtonElement).style.color = BG;
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.color = AMBER;
              }}
            >
              CALCULATE →
            </button>
          </div>
          <div style={{ ...mono, fontSize: '10px', color: FG, opacity: 0.3 }}>
            Standard deduction of ₹75,000 applied automatically.  New Tax Regime FY 2024-25.
          </div>
        </>
      )}

      {phase === 'analyzing' && (
        <div>
          {analyzeLines.map((line, i) => (
            <div key={i} style={{ ...mono, fontSize: '12px', color: GREEN, lineHeight: 1.8, opacity: 0.8 }}>
              {'>'} {line}
            </div>
          ))}
          <span style={{ ...mono, fontSize: '12px', color: GREEN, opacity: 0.5 }}>▌</span>
        </div>
      )}

      {phase === 'done' && result && (
        <>
          <Row label="GROSS INCOME" value={`₹${fmt(result.grossIncome)}`} bold />
          <Row label="Standard deduction" value={`₹${fmt(result.stdDeduction)}`} />
          <Row label="TAXABLE INCOME" value={`₹${fmt(result.taxableIncome)}`} bold />

          {divider}
          <div style={{ ...mono, fontSize: '10px', color: AMBER, opacity: 0.8, marginBottom: '8px', letterSpacing: '0.1em' }}>
            TAX SLAB BREAKDOWN
          </div>
          {result.slabs.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
              <span style={{ ...mono, fontSize: '11px', color: FG, opacity: 0.5 }}>{s.label}:</span>
              <span style={{ ...mono, fontSize: '11px', color: FG, opacity: s.amount > 0 ? 0.9 : 0.3, fontVariantNumeric: 'tabular-nums' }}>
                {s.amount > 0 ? `₹${fmt(s.amount)}` : 'NIL'}
                <span style={{ marginLeft: '8px', opacity: 0.5 }}>({s.rate})</span>
              </span>
            </div>
          ))}

          {divider}
          <Row label="INCOME TAX" value={`₹${fmt(result.incomeTax)}`} bold />
          <Row label="Health & Ed. Cess" value={`₹${fmt(result.cess)}  (4%)`} />
          <Row label="NET TAX PAYABLE" value={`₹${fmt(result.netTax)}`} bold highlight />
          <Row label="MONTHLY TDS" value={`₹${fmt(result.monthlyTDS)}`} />

          {divider}
          <Row label="OLD REGIME ESTIMATE" value={`₹${fmt(result.oldTax)}`} />
          <Row label="NEW REGIME" value={`₹${fmt(result.newTax)}`} />
          {result.newBetter ? (
            <Row
              label="YOU SAVE"
              value={`₹${fmt(result.saving)} with new regime ✓`}
              green
            />
          ) : (
            <Row
              label="OLD REGIME BETTER"
              value={`₹${fmt(result.saving)} (for high deductions)`}
            />
          )}

          {divider}
          <button
            onClick={() => { setPhase('idle'); setResult(null); setIncome(''); }}
            data-cursor-hover
            style={{
              ...mono,
              fontSize: '11px',
              color: FG,
              background: 'transparent',
              border: `1px solid rgba(245,240,232,0.2)`,
              padding: '6px 14px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              opacity: 0.6,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = '0.6'; }}
          >
            RECALCULATE
          </button>
          {result.taxableIncome <= 700000 && (
            <div style={{ ...mono, fontSize: '10px', color: GREEN, opacity: 0.7, marginTop: '10px' }}>
              Rebate u/s 87A applied — zero tax on taxable income ≤ ₹7,00,000
            </div>
          )}
          <div style={{ ...mono, fontSize: '9px', color: FG, opacity: 0.25, marginTop: '8px' }}>
            Old regime estimated with std deduction ₹50K + 80C ₹1.5L  ·  For comparison only
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, bold, highlight, green }: {
  label: string; value: string;
  bold?: boolean; highlight?: boolean; green?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '5px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: FG, opacity: bold ? 0.8 : 0.5, fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '11px', fontVariantNumeric: 'tabular-nums',
        color: green ? GREEN : highlight ? GREEN : FG,
        opacity: highlight ? 1 : bold ? 0.95 : 0.7,
        fontWeight: bold ? 600 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}
