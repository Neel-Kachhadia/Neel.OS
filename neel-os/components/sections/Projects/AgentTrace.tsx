'use client';

import { memo, useEffect, useState } from 'react';

const AGENTS = [
  { label: 'budget-agent',   action: 'analyzing...'  },
  { label: 'forecast-agent', action: 'running...'    },
  { label: 'risk-agent',     action: 'scoring...'    },
  { label: 'tax-agent',      action: 'optimizing...' },
  { label: 'recommendation', action: 'composing...'  },
];

interface AgentTraceProps {
  isActive: boolean;
  runKey?: number;
}

function AgentTrace({ isActive, runKey = 0 }: AgentTraceProps): JSX.Element {
  const [fills,   setFills]   = useState<boolean[]>(() => Array(5).fill(false));
  const [dones,   setDones]   = useState<boolean[]>(() => Array(5).fill(false));
  const [showOut, setShowOut] = useState(false);
  const [risk,    setRisk]    = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let riskIv: ReturnType<typeof setInterval> | null = null;
    let alive = true;

    setFills(Array(5).fill(false));
    setDones(Array(5).fill(false));
    setShowOut(false);
    setRisk(0);

    function cycle() {
      AGENTS.forEach((_, i) => {
        const t1 = setTimeout(() => {
          if (!alive) return;
          setFills(p => { const n = [...p]; n[i] = true; return n; });

          const t2 = setTimeout(() => {
            if (!alive) return;
            setDones(p => { const n = [...p]; n[i] = true; return n; });

            if (i === AGENTS.length - 1) {
              const t3 = setTimeout(() => {
                if (!alive) return;
                setShowOut(true);
                let v = 0;
                riskIv = setInterval(() => {
                  if (!alive) { clearInterval(riskIv!); return; }
                  v += 34 / 20;
                  if (v >= 34) {
                    setRisk(34);
                    clearInterval(riskIv!);
                    riskIv = null;
                    const t4 = setTimeout(() => {
                      if (!alive) return;
                      setFills(Array(5).fill(false));
                      setDones(Array(5).fill(false));
                      setShowOut(false);
                      setRisk(0);
                      const t5 = setTimeout(cycle, 150);
                      timers.push(t5);
                    }, 4000);
                    timers.push(t4);
                  } else {
                    setRisk(Math.round(v));
                  }
                }, 30);
              }, 200);
              timers.push(t3);
            }
          }, 800);
          timers.push(t2);
        }, i * 200);
        timers.push(t1);
      });
    }

    cycle();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      if (riskIv) clearInterval(riskIv);
    };
  }, [isActive, runKey]);

  const amber    = 'var(--amber)';
  const amberDim = 'rgba(180,83,9,0.2)';
  const online   = 'var(--online)';
  const lime     = 'var(--online)';
  const off      = 'var(--text-on-black)';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--black)',
      display: 'flex', alignItems: 'center',
      padding: '24px 48px',
      fontFamily: 'var(--font-mono)', fontSize: '11px', color: off, lineHeight: 1.6,
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        <div style={{ color: amber, fontSize: '10px', letterSpacing: '0.12em', marginBottom: '6px' }}>
          NEUROFIN  ·  LIVE AGENT TRACE
        </div>
        <div style={{ height: '1px', background: amberDim, marginBottom: '16px' }} />

        <div style={{ marginBottom: '14px' }}>
          <div style={{ color: amber, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '4px', opacity: 0.7 }}>INPUT</div>
          <div style={{ opacity: 0.55, fontSize: '10px' }}>&ldquo;Analyze ₹12,00,000 annual income and optimize tax routing&rdquo;</div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ color: amber, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.7 }}>ROUTING</div>
          {AGENTS.map((agent, i) => (
            <div key={agent.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ minWidth: '116px', opacity: 0.6, fontSize: '10px' }}>{agent.label}</span>
              <div style={{ flex: 1, height: '3px', background: amberDim, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  background: amber,
                  width: fills[i] ? '100%' : '0%',
                  transition: fills[i] ? 'width 800ms ease-out' : 'none',
                }} />
              </div>
              <span style={{ fontSize: '9px', opacity: 0.4, minWidth: '80px' }}>
                {fills[i] ? agent.action : 'waiting...'}
              </span>
              <span style={{ color: online, fontSize: '10px', minWidth: '10px', opacity: dones[i] ? 1 : 0 }}>✓</span>
            </div>
          ))}
        </div>

        <div style={{ opacity: showOut ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div style={{ color: amber, fontSize: '9px', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.7 }}>OUTPUT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <OutRow label="Risk score"     value={`${risk}/100`}                 badge="[LOW]" badgeColor={online} />
            <OutRow label="Tax estimate"   value="₹60,000 projected liability"   valueColor={lime} />
            <OutRow label="Take-home"      value="₹95,000/month projected" />
            <OutRow label="Recommendation" value="New regime wins for base case" />
          </div>
        </div>

      </div>
    </div>
  );
}

function OutRow({ label, value, badge, badgeColor, valueColor }: {
  label: string; value: string; badge?: string; badgeColor?: string; valueColor?: string;
}): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
      <span style={{ opacity: 0.4, minWidth: '116px', fontSize: '10px' }}>{label}</span>
      <span style={{ color: valueColor }}>{value}</span>
      {badge && <span style={{ color: badgeColor, fontSize: '9px' }}>{badge}</span>}
    </div>
  );
}

export default memo(AgentTrace);
