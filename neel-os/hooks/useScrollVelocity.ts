'use client';

import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/lenis';

export function useScrollVelocity(): number {
  const [velocity, setVelocity] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let raf: number;
    let last = 0;
    let lastScroll = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;

      const lenis = getLenis();
      if (!lenis) return;

      const current = lenis.scroll;
      const delta = Math.abs(current - lastScroll);
      lastScroll = current;

      // px per frame
      setVelocity(prev => prev * 0.85 + delta * 0.15);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return velocity;
}
