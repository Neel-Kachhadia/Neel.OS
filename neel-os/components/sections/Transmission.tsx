'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { playContactChime } from '@/lib/soundEngine';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  id: number;
}

const EMAIL = 'neel1234kachhadia@gmail.com';

interface TransmissionProps {
  soundEnabled?: boolean;
}

export default function Transmission({ soundEnabled = false }: TransmissionProps) {
  const sectionRef    = useRef<HTMLDivElement>(null);
  const emailRef      = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const svgFilterRef  = useRef<SVGSVGElement>(null);
  const turbRef       = useRef<SVGFETurbulenceElement>(null);
  const dispMapRef    = useRef<SVGFEDisplacementMapElement>(null);
  const particlesRef  = useRef<Particle[]>([]);
  const rafRef        = useRef<number>(0);
  const idCounter     = useRef(0);

  const [copied, setCopied] = useState(false);
  const [hoverScale, setHoverScale] = useState(0);

  // Ripple animation
  const freqRef = useRef(0.0001);
  const targetFreq = useRef(0.0001);
  const animatingRipple = useRef(false);

  const animateRipple = useCallback(() => {
    const turb = turbRef.current;
    if (!turb) return;
    freqRef.current += (targetFreq.current - freqRef.current) * 0.08;
    turb.setAttribute('baseFrequency', `${freqRef.current} ${freqRef.current * 0.6}`);
    if (Math.abs(freqRef.current - targetFreq.current) > 0.0001) {
      requestAnimationFrame(animateRipple);
    } else {
      animatingRipple.current = false;
    }
  }, []);

  const setRippleFreq = useCallback((f: number) => {
    targetFreq.current = f;
    if (!animatingRipple.current) {
      animatingRipple.current = true;
      requestAnimationFrame(animateRipple);
    }
  }, [animateRipple]);

  // Particle loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (particlesRef.current.length === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.01);
      for (const p of particlesRef.current) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.98;
        p.alpha -= 0.022;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 39, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const spawnParticles = (x: number, y: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 4;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        id: idCounter.current++,
      });
    }
  };

  const copyEmail = useCallback(async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* ignore */}
    spawnParticles(e.clientX, e.clientY);
    if (soundEnabled) playContactChime();
  }, [soundEnabled]);

  return (
    <section
      id="transmission"
      ref={sectionRef}
      style={{
        background: 'var(--black)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop:    'var(--section-pad-y)',
        paddingBottom: 'var(--section-pad-y)',
        paddingLeft:   'calc(200px + var(--section-pad-x))',
        paddingRight:  'var(--section-pad-x)',
        position: 'relative',
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      {/* SVG filter for heat-ripple displacement */}
      <svg
        ref={svgFilterRef}
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="heat-ripple" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbRef}
              type="turbulence"
              baseFrequency="0.0001 0.0001"
              numOctaves="2"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              ref={dispMapRef}
              in="SourceGraphic"
              in2="noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* SSH intro */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-mono-dark)',
          lineHeight: 1.6,
          marginBottom: '48px',
        }}
      >
        <div style={{ marginBottom: '8px' }}>root@neel:~$ ssh neel@transmission</div>
        <div style={{ opacity: 0.5 }}>generating public channel...</div>
        <div
          style={{
            borderTop: '1px solid rgba(245,240,232,0.12)',
            borderBottom: '1px solid rgba(245,240,232,0.12)',
            padding: '16px 0',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <Row label="email"    value={EMAIL} />
          <Row label="github"   value="github.com/Neel-Kachhadia" href="https://github.com/Neel-Kachhadia" />
          <Row label="linkedin" value="linkedin.com/in/neelkachhadia" href="https://linkedin.com/in/neelkachhadia" />
          <Row label="resume"   value="[download]" href="/resume.pdf" />
          <Row label="status"   value="available" highlight />
        </div>
      </div>

      {/* Enormous email */}
      <div
        ref={emailRef}
        onClick={copyEmail}
        onMouseEnter={() => setRippleFreq(0.015)}
        onMouseLeave={() => { setRippleFreq(0.0001); setHoverScale(0); }}
        data-cursor-hover
        data-cursor-copy
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 6vw, 80px)',
          fontWeight: 300,
          color: 'var(--text-on-black)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          cursor: 'pointer',
          filter: hoverScale > 0 ? 'url(#heat-ripple)' : undefined,
          transition: 'filter 0.3s ease',
          marginBottom: '32px',
        }}
        onMouseMove={(e) => {
          const rect = emailRef.current?.getBoundingClientRect();
          if (!rect) return;
          const rx = (e.clientX - rect.left) / rect.width;
          const ry = (e.clientY - rect.top) / rect.height;
          setHoverScale(1);
          const turb = turbRef.current;
          if (turb) {
            turb.setAttribute('seed', String(Math.floor(rx * 99)));
          }
        }}
      >
        {EMAIL}
      </div>

      {/* Copy feedback */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-mono-dark)',
          opacity: copied ? 1 : 0.4,
          marginBottom: '48px',
          transition: 'opacity 0.2s',
        }}
      >
        {copied ? 'copied.' : 'click to copy'}
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-on-black)',
          opacity: 0.7,
        }}
      >
        Let&apos;s build something{' '}
        <span style={{ color: 'var(--lime)' }}>unreasonable</span>.
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string;
  href?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
      }}
    >
      <span style={{ color: 'var(--text-mono-dark)', opacity: 0.5, minWidth: '64px' }}>
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--text-mono-dark)',
            opacity: 0.8,
            textDecoration: 'none',
          }}
          data-cursor-hover
        >
          {value}
        </a>
      ) : (
        <span
          style={{
            color: highlight ? 'var(--online)' : 'var(--text-mono-dark)',
            opacity: highlight ? 1 : 0.8,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
