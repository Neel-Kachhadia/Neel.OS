'use client';

import { useState, useEffect } from 'react';

const SIGNALS = [
  { num: '[1]', text: 'Q3 earnings beat by 4.2%',       rel: 0.94 },
  { num: '[2]', text: 'Jio subscriber growth +8M',       rel: 0.91 },
  { num: '[3]', text: 'Retail segment margin expansion', rel: 0.87 },
  { num: '[4]', text: 'Analyst consensus: BUY 18/22',    rel: 0.83 },
];

const NODES = [
  { id: '01', type: 'fundamentals  ', verdict: 'STRONG',   green: true  },
  { id: '02', type: 'momentum      ', verdict: 'POSITIVE', green: true  },
  { id: '03', type: 'risk factors  ', verdict: 'LOW',      green: true  },
  { id: '04', type: 'market context', verdict: 'NEUTRAL',  green: false },
];

const CONN = ['──┐', '──┤', '──┤', '──┘'];

export default function ThesisConstruction({ isActive }: { isActive: boolean }) {
  const [sigVis,  setSigVis]  = useState<boolean[]>(() => Array(4).fill(false));
  const [sigRel,  setSigRel]  = useState<number[]>( () => Array(4).fill(0));
  const [nodeVis, setNodeVis] = useState<boolean[]>(() => Array(4).fill(false));
  const [arrow,   setArrow]   = useState(false);
  const [thesis,  setThesis]  = useState(false);
  const [conf,    setConf]    = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timers:    ReturnType<typeof setTimeout>[]  = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    let alive = true;

    setSigVis(Array(4).fill(false));
    setSigRel(Array(4).fill(0));
    setNodeVis(Array(4).fill(false));
    setArrow(false);
    setThesis(false);
    setConf(0);

    function cycle() {
      SIGNALS.forEach((sig, i) => {
        const ts = setTimeout(() => {
          if (!alive) return;
          setSigVis(p => { const n = [...p]; n[i] = true; return n; });
          let rv = 0;
          const step = sig.rel / 14;
          const iv = setInterval(() => {
            if (!alive) { clearInterval(iv); return; }
            rv += step;
            if (rv >= sig.rel) {
              setSigRel(p => { const n = [...p]; n[i] = sig.rel; return n; });
              clearInterval(iv);
            } else {
              setSigRel(p => { const n = [...p]; n[i] = parseFloat(rv.toFixed(2)); return n; });
            }
          }, 30);
          intervals.push(iv);
        }, i * 300);
        timers.push(ts);
      });

      NODES.forEach((_, i) => {
        const tn = setTimeout(() => {
          if (!alive) return;
          setNodeVis(p => { const n = [...p]; n[i] = true; return n; });
        }, 1600 + i * 400);
        timers.push(tn);
      });

      const ta = setTimeout(() => { if (!alive) return; setArrow(true); }, 3200);
      timers.push(ta);

      const tt = setTimeout(() => {
        if (!alive) return;
        setThesis(true);
        let cv = 0;
        const confIv = setInterval(() => {
          if (!alive) { clearInterval(confIv); return; }
          cv += 0.81 / 40;
          if (cv >= 0.81) {
            setConf(0.81);
            clearInterval(confIv);
            const tr = setTimeout(() => {
              if (!alive) return;
              setSigVis(Array(4).fill(false));
              setSigRel(Array(4).fill(0));
              setNodeVis(Array(4).fill(false));
              setArrow(false);
              setThesis(false);
              setConf(0);
              const tn2 = setTimeout(cycle, 150);
              timers.push(tn2);
            }, 5000);
            timers.push(tr);
          } else {
            setConf(parseFloat(cv.toFixed(2)));
          }
        }, 30);
        intervals.push(confIv);
      }, 3700);
      timers.push(tt);
    }

    cycle();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [isActive]);

  const steel  = 'var(--steel)';
  const online = 'var(--online)';
  const off    = 'var(--text-on-black)';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--black)',
      display: 'flex', alignItems: 'flex-start',
      padding: '24px 48px',
      fontFamily: 'var(--font-mono)', fontSize: '11px', color: off, lineHeight: 1.5,
      overflowY: 'hidden',
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>

        <div style={{ color: steel, fontSize: '10px', letterSpacing: '0.12em', marginBottom: '6px' }}>
          EQUITY RESEARCH  ·  THESIS CONSTRUCTION
        </div>
        <div style={{ height: '1px', background: 'rgba(148,163,184,0.2)', marginBottom: '14px' }} />

        <div style={{ marginBottom: '14px' }}>
          <div style={{ color: steel, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '4px', opacity: 0.65 }}>QUERY</div>
          <div style={{ opacity: 0.55, fontSize: '10px' }}>&ldquo;Should I hold Reliance Industries this quarter?&rdquo;</div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ color: steel, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px', opacity: 0.65 }}>SIGNALS RETRIEVED</div>
          {SIGNALS.map((sig, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '4px', fontSize: '10px',
              opacity: sigVis[i] ? 1 : 0,
              transition: sigVis[i] ? 'opacity 0.2s ease' : 'none',
            }}>
              <span style={{ opacity: 0.4, minWidth: '20px' }}>{sig.num}</span>
              <span style={{ flex: 1, opacity: 0.75 }}>{sig.text}</span>
              <span style={{ color: steel, minWidth: '76px', textAlign: 'right', opacity: 0.6 }}>
                relevance {sigVis[i] ? sigRel[i].toFixed(2) : '0.00'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ color: steel, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px', opacity: 0.65 }}>REASONING CHAIN</div>
          {NODES.map((node, i) => (
            <div key={i} style={{
              display: 'flex', gap: '4px', marginBottom: '2px', fontSize: '10px',
              opacity: nodeVis[i] ? 1 : 0,
              transition: nodeVis[i] ? 'opacity 0.3s ease' : 'none',
            }}>
              <span style={{ opacity: 0.35, minWidth: '44px' }}>Node {node.id}</span>
              <span style={{ opacity: 0.6, minWidth: '104px' }}>{node.type}</span>
              <span style={{ color: node.green ? online : steel, minWidth: '64px' }}>{node.verdict}</span>
              <span style={{ color: steel, opacity: arrow ? 0.5 : 0, transition: 'opacity 0.3s ease' }}>
                {CONN[i]}
                {i === 2 && (
                  <span style={{ color: steel }}>──▶ <span style={{ color: off, opacity: 0.85 }}>THESIS</span></span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div style={{ opacity: thesis ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div style={{ color: steel, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px', opacity: 0.65 }}>THESIS</div>
          <div style={{ fontSize: '11px', lineHeight: 1.6, marginBottom: '4px' }}>HOLD with accumulate bias.</div>
          <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '6px' }}>Strong fundamentals offset macro headwinds.</div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '10px', opacity: 0.75 }}>
            <span>Target: ₹1,580 (+12% from current)</span>
            <span style={{ color: steel }}>Confidence: {conf.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
