'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function Unreasonable() {
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    gsap.set(el, { scale: 0.94, opacity: 0 });
    gsap.to(el, {
      scale: 1.0,
      opacity: 1,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      },
    });
  }, []);

  return (
    <section
      id="unreasonable"
      style={{
        minHeight: '100vh',
        background: 'var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        ref={wordRef}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 7vw, 96px)',
          fontWeight: 800,
          color: 'var(--lime)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          userSelect: 'none',
          // font-variation-settings for variable font
          fontVariationSettings: "'wght' 800",
        }}
      >
        UNREASONABLE
      </div>
    </section>
  );
}
