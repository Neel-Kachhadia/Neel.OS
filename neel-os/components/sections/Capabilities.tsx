'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Word {
  text: string;
  scale: number;
  depth: number;
  hidden?: boolean;
}

const WORDS: Word[] = [
  { text: 'PYTHON',           scale: 1.4, depth: 1.2 },
  { text: 'REACT',            scale: 1.0, depth: 0.8 },
  { text: 'LANGGRAPH',        scale: 1.8, depth: 1.6 },
  { text: 'FASTAPI',          scale: 1.1, depth: 0.6 },
  { text: 'RUST',             scale: 1.6, depth: 1.4 },
  { text: 'TYPESCRIPT',       scale: 0.9, depth: 1.0 },
  { text: 'GSAP',             scale: 1.0, depth: 0.7 },
  { text: 'DUCKDB',           scale: 1.3, depth: 1.1 },
  { text: 'SYSTEMS',          scale: 2.2, depth: 1.8, hidden: true },
  { text: 'REDIS',            scale: 1.1, depth: 0.9 },
  { text: 'THREE.JS',         scale: 1.5, depth: 1.3 },
  { text: 'AMAZON BEDROCK',   scale: 1.0, depth: 0.6 },
  { text: 'GLSL',             scale: 1.7, depth: 1.5 },
  { text: 'LANGCHAIN',        scale: 0.9, depth: 0.7 },
  { text: 'CANNON-ES',        scale: 1.2, depth: 1.0 },
  { text: 'ISOLATION FOREST', scale: 1.4, depth: 1.2 },
  { text: 'NEXT.JS',          scale: 1.0, depth: 0.8 },
  { text: 'DOCKER',           scale: 1.1, depth: 0.9 },
];

const BASE_PX = 40;

export default function Capabilities() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const railRef    = useRef<HTMLDivElement>(null);
  const wordRefs   = useRef<Record<string, HTMLDivElement | null>>({});

  // Drag state — all in refs, no setState (no re-renders on drag)
  const isDragging       = useRef(false);
  const lastClientX      = useRef(0);
  const currentTranslate = useRef(0);
  const vel              = useRef(0);
  const momentumRaf      = useRef(0);

  // SYSTEMS proximity opacity
  const [systemsOpacity, setSystemsOpacity] = useState(0.05);

  // ── Drag ─────────────────────────────────────────────────────────
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const applyTranslate = useCallback((x: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const parent = rail.parentElement;
    if (!parent) return;
    const maxX = 0;
    const minX = -(rail.scrollWidth - parent.clientWidth);
    currentTranslate.current = clamp(x, minX, maxX);
    rail.style.transform = `translateX(${currentTranslate.current}px)`;
  }, []);

  const startMomentum = useCallback(() => {
    cancelAnimationFrame(momentumRaf.current);
    const tick = () => {
      vel.current *= 0.92;
      if (Math.abs(vel.current) < 0.4) return;
      // rubber-band at edges
      const rail = railRef.current;
      if (!rail) return;
      const parent = rail.parentElement;
      if (!parent) return;
      const minX = -(rail.scrollWidth - parent.clientWidth);
      const next = currentTranslate.current + vel.current;
      if (next > 0 || next < minX) vel.current *= -0.4;
      applyTranslate(currentTranslate.current + vel.current);
      momentumRaf.current = requestAnimationFrame(tick);
    };
    momentumRaf.current = requestAnimationFrame(tick);
  }, [applyTranslate]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastClientX.current = e.clientX;
      vel.current = 0;
      cancelAnimationFrame(momentumRaf.current);
      rail.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastClientX.current;
      vel.current = dx;
      lastClientX.current = e.clientX;
      applyTranslate(currentTranslate.current + dx);
    };

    const onUp = () => {
      isDragging.current = false;
      startMomentum();
    };

    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    rail.addEventListener('pointerup', onUp);
    rail.addEventListener('pointercancel', onUp);

    return () => {
      rail.removeEventListener('pointerdown', onDown);
      rail.removeEventListener('pointermove', onMove);
      rail.removeEventListener('pointerup', onUp);
      rail.removeEventListener('pointercancel', onUp);
      cancelAnimationFrame(momentumRaf.current);
    };
  }, [applyTranslate, startMomentum]);

  // ── Parallax + SYSTEMS proximity ─────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const rx = (e.clientX - cx) / rect.width;
      const ry = (e.clientY - cy) / rect.height;

      WORDS.forEach(({ text, depth }) => {
        const el = wordRefs.current[text];
        if (!el) return;
        // Parallax
        el.style.translate = `${-rx * depth * 22}px ${-ry * depth * 10}px`;
      });

      // SYSTEMS proximity
      const sysEl = wordRefs.current['SYSTEMS'];
      if (sysEl) {
        const sr   = sysEl.getBoundingClientRect();
        const scx  = sr.left + sr.width / 2;
        const scy  = sr.top  + sr.height / 2;
        const dist = Math.hypot(e.clientX - scx, e.clientY - scy);
        const t    = Math.max(0, 1 - dist / 80);
        setSystemsOpacity(0.05 + t * 0.85);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      id="capabilities"
      ref={sectionRef}
      style={{
        background: 'var(--offwhite)',
        overflow: 'hidden',
        paddingTop: 'var(--section-pad-y)',
        paddingBottom: 'var(--section-pad-y)',
        paddingLeft: 'calc(200px + var(--section-pad-x))',
        position: 'relative',
        userSelect: 'none',
        cursor: isDragging.current ? 'grabbing' : 'grab',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          marginBottom: '48px',
          paddingRight: 'var(--section-pad-x)',
        }}
      >
        /neel/capabilities — drag
      </div>

      {/* Drag rail */}
      <div
        ref={railRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '56px',
          paddingRight: '240px',
          width: 'max-content',
          willChange: 'transform',
          touchAction: 'none',
          height: '180px',
        }}
      >
        {WORDS.map(({ text, scale, hidden }) => (
          <div
            key={text}
            ref={el => { wordRefs.current[text] = el; }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: `${BASE_PX * scale}px`,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: hidden ? 'var(--offwhite)' : 'var(--text-primary)',
              opacity: hidden ? systemsOpacity : 0.88,
              transition: hidden ? 'opacity 0.3s ease' : undefined,
              willChange: 'translate',
            }}
          >
            {text}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '32px',
          paddingLeft: 'var(--section-pad-x)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--text-secondary)',
          opacity: 0.4,
          letterSpacing: '0.05em',
        }}
      >
        ← drag →
      </div>
    </section>
  );
}
