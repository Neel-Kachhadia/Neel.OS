'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { ScrollTrigger } from '@/lib/gsap';

const BEATS = [
  ["I don't prototype.", "I deploy."],
  ["I don't describe intelligence.", "I build it."],
  ["Most people my age are learning.", "I am shipping."],
];

export default function Manifesto() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const lines = lineRefs.current.filter(Boolean);

    lines.forEach((line) => {
      if (!line) return;
      gsap.set(line, { opacity: 0 });
      gsap.to(line, {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 75%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (lines.includes(t.trigger as HTMLDivElement)) t.kill();
      });
    };
  }, []);

  let idx = 0;

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      style={{
        background: 'var(--offwhite)',
        padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
        paddingRight: 'var(--section-pad-x)',
      }}
    >
      {BEATS.map((beat, bi) => (
        <div
          key={bi}
          style={{
            marginBottom: 'clamp(80px, 15vh, 200px)',
          }}
        >
          {beat.map((line, li) => {
            const i = idx++;
            return (
              <div
                key={li}
                ref={el => { lineRefs.current[i] = el; }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(24px, 3.5vw, 40px)',
                  color: 'var(--text-primary)',
                  fontWeight: 300,
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.15em',
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
