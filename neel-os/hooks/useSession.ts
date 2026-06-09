'use client';

import { useState, useEffect } from 'react';
import { Session, initSession, updateSession } from '@/lib/session';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const s = initSession();
    setSession(s);
  }, []);

  const patch = (partial: Partial<Session>) => {
    updateSession(partial);
    setSession(prev => prev ? { ...prev, ...partial } : prev);
  };

  return { session, patch };
}
