'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { getLenis } from '@/lib/lenis';
import { gsap } from '@/lib/gsap';
import { playTearBoom } from '@/lib/audio';
import { useMotionProfile } from '@/hooks/useMotionProfile';

const TearShader = dynamic(() => import('@/components/webgl/TearShader'), { ssr: false });

const THRESHOLD = 40; // px/frame

interface TearProps {
  soundEnabled?: boolean;
}

export default function Tear({ soundEnabled = false }: TearProps) {
  const motionProfile = useMotionProfile();
  const [tearProgress, setTearProgress] = useState(0);
  const tearing = useRef(false);
  const hasTorn = useRef(false); // once torn, never re-triggers
  const progressRef = useRef(0);

  useEffect(() => {
    if (motionProfile === 'static') return;

    let prevScroll = 0;
    let prevDelta = 0;

    const onScroll = ({ scroll }: { scroll: number }) => {
      const delta = Math.abs(scroll - prevScroll);
      prevScroll = scroll;

      // Pre-tear anticipation (30–40px range)
      // Actual tear > 40px

      if (!tearing.current && !hasTorn.current && delta > THRESHOLD) {
        tearing.current = true;
        hasTorn.current = true; // permanent — never re-triggers
        progressRef.current = 0;

        gsap.to(progressRef, {
          current: 1,
          duration: 1.0,
          ease: 'power2.inOut',
          onUpdate: () => setTearProgress(progressRef.current),
          onComplete: () => {
            // Hold briefly then fade out
            setTimeout(() => {
              gsap.to(progressRef, {
                current: 0,
                duration: 0.3,
                ease: 'power1.in',
                onUpdate: () => setTearProgress(progressRef.current),
                onComplete: () => { tearing.current = false; },
              });
            }, 400);
          },
        });

        // Sound: 40Hz felt-bass
        if (soundEnabled) {
          playTearBoom();
        }
      }

      prevDelta = delta;
    };

    const lenis = getLenis();
    if (lenis) {
      lenis.on('scroll', onScroll);
      return () => lenis.off('scroll', onScroll);
    }
  }, [motionProfile, soundEnabled]);

  if (motionProfile === 'static' || tearProgress <= 0.001) return null;

  return <TearShader progress={tearProgress} />;
}
