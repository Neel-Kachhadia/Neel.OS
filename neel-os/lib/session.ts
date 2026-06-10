export interface Session {
  count: number;
  lastPath: string;
  soundEnabled: boolean;
  motionProfile: 'full' | 'reduced' | 'static';
  mode: 'visitor' | 'recruiter' | 'debug';
  commandHistory: string[];
  firstVisit: number;
  lastVisit: number;
}

const SESSION_KEY = 'neel_os_session';

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* ignore */ }
}

export function initSession(): Session {
  const existing = getSession();

  if (existing) {
    const updated: Session = {
      ...existing,
      count: existing.count + 1,
      lastVisit: Date.now(),
      soundEnabled: false, // never persisted — reset every session
    };
    saveSession(updated);
    return updated;
  }

  const fresh: Session = {
    count: 1,
    lastPath: '/neel',
    soundEnabled: false,
    motionProfile: 'full',
    mode: 'visitor',
    commandHistory: [],
    firstVisit: Date.now(),
    lastVisit: Date.now(),
  };
  saveSession(fresh);
  return fresh;
}

export function updateSession(patch: Partial<Session>): void {
  const existing = getSession();
  if (!existing) return;
  saveSession({ ...existing, ...patch });
}
