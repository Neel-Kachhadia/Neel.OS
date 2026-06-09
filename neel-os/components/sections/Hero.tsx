'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMotionProfile } from '@/hooks/useMotionProfile';

const HeroFluid = dynamic(() => import('@/components/webgl/HeroFluid'), { ssr: false });
const LetterPhysics = dynamic(() => import('@/components/webgl/LetterPhysics'), { ssr: false });

interface HeroProps {
  sessionCount: number;
  scrollVelocity?: number;
}

export default function Hero({ sessionCount, scrollVelocity = 0 }: HeroProps) {
  const motionProfile = useMotionProfile();
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const lastMouseRef = useRef({ x: 0, y: 0, t: 0 });
  const velRef = useRef(0);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      const dt = now - lastMouseRef.current.t;
      if (dt > 0) {
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        velRef.current = velRef.current * 0.7 + speed * 30 * 0.3;
        setMouseVelocity(velRef.current);
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY, t: now };
    };

    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  const usePhysics = motionProfile === 'full';
  const useShader = motionProfile !== 'static';

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        background: 'var(--offwhite)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Fluid background */}
      {useShader && <HeroFluid velocity={mouseVelocity} />}
      {!useShader && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--offwhite)',
          }}
        />
      )}

      {/* Physics letters OR static fallback */}
      {usePhysics ? (
        <LetterPhysics mouseVelocity={mouseVelocity} />
      ) : (
        <StaticName sessionCount={sessionCount} />
      )}

      {/* ONLINE indicator */}
      <div
        style={{
          position: 'absolute',
          top: '32px',
          right: 'clamp(24px, 5vw, 80px)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 2,
        }}
      >
        ONLINE
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--online)',
            animation: 'onlineBlink 1.2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(80px, 12vh, 160px)',
          left: 'calc(200px + clamp(24px, 5vw, 80px))',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(14px, 2vw, 20px)',
          color: 'var(--text-secondary)',
          fontWeight: 300,
          letterSpacing: '0.02em',
          zIndex: 2,
        }}
      >
        Building systems. Shipping fast. Mumbai.
      </div>

      {sessionCount > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: 'calc(200px + clamp(24px, 5vw, 80px))',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
            zIndex: 2,
          }}
        >
          session {String(sessionCount).padStart(2, '0')}
        </div>
      )}

      <style>{`
        @keyframes onlineBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>
    </section>
  );
}

function StaticName({ sessionCount }: { sessionCount: number }) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        paddingLeft: 'calc(200px + clamp(24px, 5vw, 80px))',
        paddingRight: 'clamp(24px, 5vw, 80px)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 12vw, 160px)',
          lineHeight: 0.9,
          color: 'var(--text-primary)',
          fontWeight: 300,
          animation: 'breathe 4s ease-in-out infinite',
          letterSpacing: '-0.02em',
        }}
      >
        <div>NEEL</div>
        <div>KACHHADIA</div>
      </div>
      <style>{`
        @keyframes breathe {
          0%, 100% { font-variation-settings: 'wght' 300; }
          50%       { font-variation-settings: 'wght' 800; }
        }
      `}</style>
    </div>
  );
}
