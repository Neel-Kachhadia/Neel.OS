'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Session, initSession, updateSession } from '@/lib/session';
import { getLenis } from '@/lib/lenis';
import { Mode } from '@/hooks/useMode';
import { MotionProfile, useMotionProfile, setMotionOverride } from '@/hooks/useMotionProfile';

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
import Capabilities from '@/components/sections/Capabilities';
import Transmission from '@/components/sections/Transmission';
import NeuroFin from '@/components/sections/Projects/NeuroFin';
import Equity from '@/components/sections/Projects/Equity';
import MarketTerminal from '@/components/sections/Projects/MarketTerminal';
import RecruiterPanel from '@/components/modes/RecruiterPanel';
import DebugOverlay from '@/components/modes/DebugOverlay';

const Cursor      = dynamic(() => import('@/components/core/Cursor'),        { ssr: false });
const PocketShell = dynamic(() => import('@/components/mobile/PocketShell'), { ssr: false });

type AppState = 'booting' | 'hero';

export default function Home() {
  // All state starts at SSR-safe defaults (identical server + client first render).
  // Real values are set in useEffect after mount to avoid hydration mismatch #418/#423.
  const [mounted, setMounted]             = useState(false);
  const [session, setSession]             = useState<Session | null>(null);
  const [appState, setAppState]           = useState<AppState>('booting');
  const [soundEnabled, setSoundEnabled]   = useState(false);
  const [mode, setMode]                   = useState<Mode>('visitor');
  const [currentPath, setCurrentPath]     = useState('/neel');
  const [isBooting, setIsBooting]         = useState(true);
  const [isMobile, setIsMobile]           = useState(false);

  // Session init — runs once after mount, reads localStorage
  useEffect(() => {
    const s = initSession();
    setSession(s);
    setAppState('booting');
    setSoundEnabled(false); // soundEnabled never persisted — always starts false
    setMode((s.mode as Mode) ?? 'visitor');
    setCurrentPath(s.lastPath ?? '/neel');
    setIsBooting(true);
    setMounted(true);
  }, []);

  // motionProfile — driven by useMotionProfile hook (localStorage + OS media query + manual)
  const motionProfile = useMotionProfile();

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollToPath = useCallback((path: string) => {
    requestAnimationFrame(() => {
      const section = path.split('/').pop();
      const el = document.querySelector(`#${section}`);
      if (el) getLenis()?.scrollTo(el as HTMLElement, { duration: 1.15 });
    });
  }, []);

  const handleBootComplete = (sound: boolean, resumePrevious = true) => {
    const nextPath = resumePrevious ? (session?.lastPath ?? '/neel') : '/neel';
    setSoundEnabled(sound);
    setCurrentPath(nextPath);
    updateSession({ lastPath: nextPath }); // soundEnabled not persisted
    setIsBooting(false);
    setAppState('hero');
    if (resumePrevious && nextPath !== '/neel') {
      setTimeout(() => scrollToPath(nextPath), 150);
    }
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    updateSession({ mode: m });
  };

  const handleMotionChange = (p: MotionProfile) => {
    setMotionOverride(p);
    updateSession({ motionProfile: p });
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    updateSession({ lastPath: path });
  };

  const handleRecruiterTransmission = useCallback(() => {
    handleModeChange('visitor');
    setTimeout(() => {
      const el = document.querySelector('#transmission');
      if (el) getLenis()?.scrollTo(el as HTMLElement, { duration: 1.2 });
    }, 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || !session) return null;

  // Mobile: completely different component tree
  if (isMobile) {
    return <PocketShell session={session} />;
  }

  // Recruiter mode: fast overlay, bypass boot
  if (mode === 'recruiter') {
    return (
      <>
        <Grain />
        <Cursor />
        <RecruiterPanel
          onClose={() => handleModeChange('visitor')}
          onTransmission={handleRecruiterTransmission}
        />
      </>
    );
  }

  return (
    <LenisProvider>
      <Grain />
      {motionProfile === 'full' && <ScanLine booting={isBooting} />}
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
            motionProfile={motionProfile}
          />
          <CommandTerminal
            onNavigate={handleNavigate}
            onModeChange={handleModeChange}
            currentPath={currentPath}
          />

          {/* Motion profile toggle */}
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '24px',
              zIndex: 30,
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--text-on-black)',
              display: 'flex',
              gap: '8px',
              opacity: 0.4,
            }}
          >
            {(['full', 'reduced', 'static'] as MotionProfile[]).map(p => (
              <button
                key={p}
                onClick={() => handleMotionChange(p)}
                data-cursor-hover
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  padding: 0,
                  cursor: 'pointer',
                  opacity: motionProfile === p ? 1 : 0.5,
                  textDecoration: motionProfile === p ? 'underline' : 'none',
                  textUnderlineOffset: '3px',
                  transition: 'opacity 0.15s',
                }}
              >
                [{p}]
              </button>
            ))}
          </div>

        </>
      )}

      {appState === 'booting' && (
        <Boot session={session} onComplete={handleBootComplete} />
      )}

      {appState === 'hero' && (
        <main>
          <Hero
            sessionCount={session.count}
            onNavigate={handleNavigate}
            onModeChange={handleModeChange}
          />
          <Manifesto />
          <Unreasonable />
          <Counter />
          <section id="projects">
            <NeuroFin soundEnabled={soundEnabled} />
            <Equity soundEnabled={soundEnabled} />
            <MarketTerminal soundEnabled={soundEnabled} />
          </section>
          <Identity />
          <Logs />
          <section
            id="logs-whispers"
            style={{
              background: 'var(--black)',
              padding: '0 var(--section-pad-x) var(--section-pad-y)',
              paddingLeft: 'calc(200px + var(--section-pad-x))',
            }}
          >
            <Whispers />
          </section>
          <Stack />
          <Capabilities />
          <AskNeel />
          <Transmission soundEnabled={soundEnabled} />
        </main>
      )}

      {mode === 'debug' && appState === 'hero' && (
        <DebugOverlay currentPath={currentPath} motionProfile={motionProfile} />
      )}
    </LenisProvider>
  );
}
