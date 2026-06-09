'use client';

import { useState, useEffect } from 'react';

export type MotionProfile = 'full' | 'reduced' | 'static';

const STORAGE_KEY = 'neel_os_motion_profile';
const EVENT_NAME  = 'neel_motion_change';

export function setMotionOverride(p: MotionProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, p);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: p }));
}

function getInitialProfile(): MotionProfile {
  if (typeof window === 'undefined') return 'full';
  const stored = localStorage.getItem(STORAGE_KEY) as MotionProfile | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
}

export function useMotionProfile(): MotionProfile {
  // Start with 'full' — identical on server and client, avoids hydration mismatch.
  // Real value is read in useEffect after mount.
  const [profile, setProfile] = useState<MotionProfile>('full');

  useEffect(() => {
    // Read stored preference after mount
    const stored = localStorage.getItem(STORAGE_KEY) as MotionProfile | null;
    if (stored) {
      setProfile(stored);
    } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProfile('reduced');
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const mqHandler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setProfile(e.matches ? 'reduced' : 'full');
      }
    };

    const customHandler = (e: Event) => {
      setProfile((e as CustomEvent<MotionProfile>).detail);
    };

    mq.addEventListener('change', mqHandler);
    window.addEventListener(EVENT_NAME, customHandler);

    return () => {
      mq.removeEventListener('change', mqHandler);
      window.removeEventListener(EVENT_NAME, customHandler);
    };
  }, []);

  return profile;
}
