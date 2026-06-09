'use client';

import { useState } from 'react';

export type Mode = 'visitor' | 'recruiter' | 'debug';

export function useMode(initial: Mode = 'visitor') {
  const [mode, setMode] = useState<Mode>(initial);
  return { mode, setMode };
}
