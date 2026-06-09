'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Session, initSession, updateSession } from '@/lib/session';
import { Mode } from '@/hooks/useMode';

import LenisProvider from '@/components/core/LenisProvider';
import Grain from '@/components/core/Grain';
import ScanLine from '@/components/core/ScanLine';
import SystemHealth from '@/components/core/SystemHealth';
import ModeSwitcher from '@/components/core/ModeSwitcher';
import PathIndicator from '@/components/core/PathIndicator';
import FilesystemSidebar from '@/components/core/FilesystemSidebar';
import CommandTerminal from '@/components/core/CommandTerminal';
import Boot from '@/components/sections/Boot';
import Hero from '@/components/sections/Hero';
import Manifesto from '@/components/sections/Manifesto';
import Unreasonable from '@/components/sections/Unreasonable';
import Counter from '@/components/sections/Counter';
import Tear from '@/components/sections/Tear';
import Identity from '@/components/sections/Identity';
import Logs from '@/components/sections/Logs';
import Stack from '@/components/sections/Stack';
import AskNeel from '@/components/sections/AskNeel';
import Whispers from '@/components/sections/Whispers';
import NeuroFin from '@/components/sections/Projects/NeuroFin';
import Equity from '@/components/sections/Projects/Equity';
import MarketTerminal from '@/components/sections/Projects/MarketTerminal';

const Cursor = dynamic(() => import('@/components/core/Cursor'), { ssr: false });

type AppState = 'booting' | 'hero';

export default function Home() {
  // Lazy initializer: runs synchronously on the client so Boot renders on the
  // very first frame (no useEffect delay = no blank black screen).
  // Returns null on the server (SSR pre-render); client always has a Session.
  const [session] = useState<Session | null>(() => {
    if (typeof window === 'undefined') return null;
    return initSession();
  });

  const [appState, setAppState] = useState<AppState>('booting');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => session?.soundEnabled ?? false
  );
  const [mode, setMode] = useState<Mode>(
    () => (session?.mode as Mode) ?? 'visitor'
  );
  const [currentPath, setCurrentPath] = useState<string>(
    () => session?.lastPath ?? '/neel'
  );
  const [isBooting, setIsBooting] = useState(true);

  const handleBootComplete = (sound: boolean) => {
    setSoundEnabled(sound);
    updateSession({ soundEnabled: sound });
    setIsBooting(false);
    setAppState('hero');
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    updateSession({ mode: m });
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    updateSession({ lastPath: path });
  };

  // null only during SSR — client always exits here with a valid session
  if (!session) return null;

  return (
    <LenisProvider>
      <Grain />
      <ScanLine booting={isBooting} />
      <Cursor />

      {appState === 'hero' && <Tear soundEnabled={soundEnabled} />}

      {appState === 'hero' && (
        <>
          <FilesystemSidebar currentPath={currentPath} onNavigate={handleNavigate} />
          <ModeSwitcher mode={mode} onChange={handleModeChange} />
          <PathIndicator path={currentPath} />
          <SystemHealth
            sessionCount={session.count}
            soundEnabled={soundEnabled}
            motionProfile={session.motionProfile}
          />
          <CommandTerminal
            onNavigate={handleNavigate}
            onModeChange={handleModeChange}
            currentPath={currentPath}
          />
        </>
      )}

      {appState === 'booting' && (
        <Boot session={session} onComplete={handleBootComplete} />
      )}

      {appState === 'hero' && (
        <main>
          <Hero sessionCount={session.count} />
          <Manifesto />
          <Unreasonable />
          <Counter />
          <section id="projects">
            <NeuroFin />
            <Equity />
            <MarketTerminal />
          </section>
          <Identity />
          <Logs />
          <section id="logs-whispers" style={{ background: 'var(--black)', padding: '0 calc(200px + var(--section-pad-x)) var(--section-pad-y)', paddingRight: 'var(--section-pad-x)' }}>
            <Whispers />
          </section>
          <Stack />
          <AskNeel />
        </main>
      )}
    </LenisProvider>
  );
}
