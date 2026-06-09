'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { getLenis } from '@/lib/lenis';
import { gsap } from '@/lib/gsap';
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

      if (!tearing.current && delta > THRESHOLD) {
        tearing.current = true;
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

  if (motionProfile === 'static') return null;

  return <TearShader progress={tearProgress} />;
}

async function playTearBoom() {
  try {
    const Tone = await import('tone');
    await Tone.start();
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 1.15, sustain: 0, release: 0 },
    }).toDestination();
    synth.volume.value = -6;
    synth.triggerAttackRelease(40, '1.2');
    setTimeout(() => synth.dispose(), 2000);
  } catch { /* audio not available */ }
}
