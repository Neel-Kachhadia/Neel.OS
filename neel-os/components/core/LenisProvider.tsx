'use client';

import { useEffect } from 'react';
import { initLenis, destroyLenis, getLenis } from '@/lib/lenis';
import { registerGSAP, gsap, ScrollTrigger } from '@/lib/gsap';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGSAP();
    const lenis = initLenis();

    // Sync Lenis → GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      destroyLenis();
    };
  }, []);

  return <>{children}</>;
}
