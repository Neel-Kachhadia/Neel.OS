'use client';

import { useEffect, useRef, useState } from 'react';
import { getCount, formatCount, formatTimeAgo } from '@/lib/counter';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [lastTxMs, setLastTxMs] = useState(0);
  const [timeAgo, setTimeAgo] = useState('0:00');
  const prevCountRef = useRef(0);
  const lastTxTimestampRef = useRef(Date.now());

  useEffect(() => {
    setCount(getCount());
    prevCountRef.current = getCount();

    const interval = setInterval(() => {
      const c = getCount();
      if (c > prevCountRef.current) {
        lastTxTimestampRef.current = Date.now();
        prevCountRef.current = c;
      }
      setCount(c);
      setTimeAgo(formatTimeAgo(Date.now() - lastTxTimestampRef.current));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="counter"
      style={{
        background: 'var(--offwhite)',
        padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
        paddingRight: 'var(--section-pad-x)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}
      >
        /neel/projects/neurofin · runtime statistics
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
        }}
      >
        transactions processed
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          opacity: 0.4,
        }}
      >
        ──────────────────────────────────────────────
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(40px, 6vw, 80px)',
          color: 'var(--text-primary)',
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          marginBottom: '16px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCount(count)}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div>
          <span style={{ opacity: 0.5, minWidth: '160px', display: 'inline-block' }}>
            last transaction
          </span>
          <span>{timeAgo} ago</span>
        </div>
        <div>
          <span style={{ opacity: 0.5, minWidth: '160px', display: 'inline-block' }}>
            uptime
          </span>
          <Uptime />
        </div>
      </div>
    </section>
  );
}

function Uptime() {
  const [str, setStr] = useState('0d 0h 0m');
  const start = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - start.current) / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      const d = Math.floor(h / 24);
      setStr(`${d}d ${h % 24}h ${m % 60}m`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return <span>{str}</span>;
}
