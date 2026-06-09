'use client';

import { useEffect, useRef } from 'react';

interface ScanLineProps {
  booting?: boolean;
}

export default function ScanLine({ booting = false }: ScanLineProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const duration = 6000; // ms per full pass

    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) % duration;
      const pct = (elapsed / duration) * 100;
      line.style.top = `${pct}%`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={lineRef}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        height: '1px',
        background: booting
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.025)',
        pointerEvents: 'none',
        zIndex: 9998,
        transition: 'background 0.5s',
      }}
    />
  );
}
