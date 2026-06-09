'use client';

import { useEffect } from 'react';
import { initLenis, destroyLenis, getLenis } from '@/lib/lenis';
import { registerGSAP, gsap, ScrollTrigger } from '@/lib/gsap';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGSAP();
    const lenis = initLenis();
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    // Sync Lenis → GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(raf);
      destroyLenis();
    };
  }, []);

  return <>{children}</>;
}
