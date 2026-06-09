'use client';

import { useState, useEffect } from 'react';

export type MotionProfile = 'full' | 'reduced' | 'static';

export function useMotionProfile(): MotionProfile {
  const [profile, setProfile] = useState<MotionProfile>('full');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setProfile('reduced');

    const handler = (e: MediaQueryListEvent) => {
      setProfile(e.matches ? 'reduced' : 'full');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return profile;
}
