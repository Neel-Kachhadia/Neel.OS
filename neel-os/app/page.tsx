'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Session, initSession, updateSession } from '@/lib/session';
import { Mode } from '@/hooks/useMode';
import { MotionProfile, useMotionProfile, setMotionOverride } from '@/hooks/useMotionProfile';
import { gsap } from '@/lib/gsap';
import { playBackSound, playDestinationArrive } from '@/lib/soundEngine';

import Grain from '@/components/core/Grain';
import ScanLine from '@/components/core/ScanLine';
import SystemHealth from '@/components/core/SystemHealth';
import ModeSwitcher from '@/components/core/ModeSwitcher';
import PathIndicator from '@/components/core/PathIndicator';
import FilesystemSidebar from '@/components/core/FilesystemSidebar';
import Boot from '@/components/sections/Boot';
import Hero from '@/components/sections/Hero';

// State components lazy-loaded — only one renders at a time
const Identity      = dynamic(() => import('@/components/sections/Identity'),                     { ssr: false, loading: () => null });
const Logs          = dynamic(() => import('@/components/sections/Logs'),                         { ssr: false, loading: () => null });
const Stack         = dynamic(() => import('@/components/sections/Stack'),                        { ssr: false, loading: () => null });
const Transmission  = dynamic(() => import('@/components/sections/Transmission'),                 { ssr: false, loading: () => null });
const NeuroFin      = dynamic(() => import('@/components/sections/Projects/NeuroFin'),            { ssr: false, loading: () => null });
const Equity        = dynamic(() => import('@/components/sections/Projects/Equity'),              { ssr: false, loading: () => null });
const MarketTerminal= dynamic(() => import('@/components/sections/Projects/MarketTerminal'),      { ssr: false, loading: () => null });
const RecruiterPanel= dynamic(() => import('@/components/modes/RecruiterPanel'),                  { ssr: false, loading: () => null });
const DebugOverlay  = dynamic(() => import('@/components/modes/DebugOverlay'),                    { ssr: false, loading: () => null });
const Cursor        = dynamic(() => import('@/components/core/Cursor'),                           { ssr: false });
const PocketShell   = dynamic(() => import('@/components/mobile/PocketShell'),                    { ssr: false });

type TerminalState =
  | 'terminal-root'
  | 'neurofin'
  | 'equity'
  | 'market'
  | 'identity'
  | 'logs'
  | 'stack'
  | 'transmission';

const STATE_PATHS: Record<TerminalState, string> = {
  'terminal-root': '/neel',
  'neurofin':      '/neel/projects/neurofin',
  'equity':        '/neel/projects/equity-research',
  'market':        '/neel/projects/market-terminal',
  'identity':      '/neel/identity',
  'logs':          '/neel/logs',
  'stack':         '/neel/stack',
  'transmission':  '/neel/transmission',
};

const STATE_ACCENTS: Record<TerminalState, string> = {
  'terminal-root': 'rgba(245,240,232,0.04)',
  'neurofin':      'rgba(180,83,9,0.12)',
  'equity':        'rgba(30,58,95,0.12)',
  'market':        'rgba(255,184,0,0.08)',
  'identity':      'rgba(245,240,232,0.04)',
  'logs':          'rgba(245,240,232,0.04)',
  'stack':         'rgba(245,240,232,0.04)',
  'transmission':  'rgba(245,240,232,0.04)',
};

const PATH_TO_STATE: Record<string, TerminalState> = {
  '/neel':                         'terminal-root',
  '/neel/projects/neurofin':       'neurofin',
  '/neel/projects/equity':         'equity',
  '/neel/projects/equity-research':'equity',
  '/neel/projects/market':         'market',
  '/neel/projects/market-terminal':'market',
  '/neel/identity':                'identity',
  '/neel/logs':                    'logs',
  '/neel/stack':                   'stack',
  '/neel/transmission':            'transmission',
};

export default function Home() {
  const [mounted,      setMounted]      = useState(false);
  const [session,      setSession]      = useState<Session | null>(null);
  const [booting,      setBooting]      = useState(true);
  const [termState,    setTermState]    = useState<TerminalState>('terminal-root');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mode,         setMode]         = useState<Mode>('visitor');
  const [currentPath,  setCurrentPath]  = useState('/neel');
  const [isMobile,     setIsMobile]     = useState(false);
  const [flashColor,   setFlashColor]   = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const motionProfile = useMotionProfile();

  useEffect(() => {
    const s = initSession();
    setSession(s);
    setBooting(true);
    setSoundEnabled(false);
    setMode((s.mode as Mode) ?? 'visitor');
    setCurrentPath(s.lastPath ?? '/neel');
    setMounted(true);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const transitionTo = useCallback((newState: TerminalState) => {
    if (transitioning.current || newState === termState) return;
    transitioning.current = true;

    const container = containerRef.current;
    const path = STATE_PATHS[newState];
    setCurrentPath(path);
    updateSession({ lastPath: path });

    if (soundEnabled) {
      if (newState === 'terminal-root') playBackSound();
      else playDestinationArrive();
    }

    if (!container || motionProfile === 'static') {
      setTermState(newState);
      transitioning.current = false;
      return;
    }

    const accent = STATE_ACCENTS[newState];
    gsap.to(container, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        setFlashColor(accent);
        setTermState(newState);
        window.setTimeout(() => {
          setFlashColor(null);
          gsap.to(container, {
            opacity: 1,
            duration: 0.2,
            ease: 'power2.inOut',
            onComplete: () => { transitioning.current = false; },
          });
        }, 50);
      },
    });
  }, [termState, motionProfile, soundEnabled]);

  const handleBootComplete = useCallback((sound: boolean, resumePrevious = true) => {
    setSoundEnabled(sound);
    if (!resumePrevious) {
      setTermState('terminal-root');
      setCurrentPath('/neel');
      updateSession({ lastPath: '/neel' });
    } else {
      const restoredState = PATH_TO_STATE[currentPath] ?? 'terminal-root';
      setTermState(restoredState);
    }
    setBooting(false);
  }, [currentPath]);

  const handleModeChange = (m: Mode) => {
    setMode(m);
    updateSession({ mode: m });
  };

  const handleNavigate = useCallback((path: string) => {
    const state = PATH_TO_STATE[path];
    if (state) transitionTo(state);
    else {
      setCurrentPath(path);
      updateSession({ lastPath: path });
    }
  }, [transitionTo]);

  const handleMotionChange = (p: MotionProfile) => {
    setMotionOverride(p);
    updateSession({ motionProfile: p });
  };

  const handleRecruiterTransmission = useCallback(() => {
    handleModeChange('visitor');
    setTimeout(() => transitionTo('transmission'), 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionTo]);

  if (!mounted || !session) return null;

  if (isMobile) {
    return (
      <PocketShell
        session={session}
        mode={mode}
        onModeChange={handleModeChange}
      />
    );
  }

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

  const isProject = termState === 'neurofin' || termState === 'equity' || termState === 'market';
  const isOffWhite = termState === 'identity';

  return (
    <>
      <Grain />
      {motionProfile === 'full' && !booting && <ScanLine booting={false} />}
      <Cursor />

      {/* Boot screen */}
      {booting && (
        <Boot session={session} onComplete={handleBootComplete} />
      )}

      {/* Permanent chrome — shown after boot */}
      {!booting && (
        <>
          <FilesystemSidebar currentPath={currentPath} onNavigate={handleNavigate} />
          <ModeSwitcher mode={mode} onChange={handleModeChange} />
          {termState !== 'terminal-root' && <PathIndicator path={currentPath} />}
          <SystemHealth
            sessionCount={session.count}
            soundEnabled={soundEnabled}
            motionProfile={motionProfile}
            activeState={termState}
          />

          {/* Back button for non-root states */}
          {termState !== 'terminal-root' && (
            <button
              onClick={() => transitionTo('terminal-root')}
              data-cursor-hover
              style={{
                position: 'fixed',
                top: '24px',
                left: 'calc(200px + 24px)',
                zIndex: 100,
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: isOffWhite ? 'rgba(10,10,10,0.5)' : isProject ? STATE_BACK_COLOR[termState] : 'rgba(245,240,232,0.5)',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              ← exit
            </button>
          )}

          {/* Motion profile toggle */}
          {termState !== 'terminal-root' && (
            <div
              style={{
                position: 'fixed',
                bottom: '46px',
                left: 'calc(200px + 24px)',
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
          )}
        </>
      )}

      {/* State container — GSAP fades this */}
      {!booting && (
        <div
          ref={containerRef}
          style={{
            position: 'fixed',
            inset: 0,
            overflow: 'auto',
            background: 'var(--black)',
          }}
        >
          {termState === 'terminal-root' && (
            <Hero
              sessionCount={session.count}
              soundEnabled={soundEnabled}
              onNavigate={handleNavigate}
              onModeChange={handleModeChange}
              onStateChange={s => transitionTo(s as TerminalState)}
            />
          )}
          {termState === 'neurofin' && (
            <NeuroFin soundEnabled={soundEnabled} />
          )}
          {termState === 'equity' && (
            <Equity soundEnabled={soundEnabled} />
          )}
          {termState === 'market' && (
            <MarketTerminal soundEnabled={soundEnabled} />
          )}
          {termState === 'identity' && <Identity />}
          {termState === 'logs' && <Logs />}
          {termState === 'stack' && <Stack />}
          {termState === 'transmission' && <Transmission soundEnabled={soundEnabled} />}
        </div>
      )}

      {flashColor && !booting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            pointerEvents: 'none',
            background: flashColor,
          }}
        />
      )}

      {mode === 'debug' && !booting && (
        <DebugOverlay currentPath={currentPath} motionProfile={motionProfile} />
      )}
    </>
  );
}

const STATE_BACK_COLOR: Partial<Record<TerminalState, string>> = {
  neurofin: '#B45309',
  equity:   '#94A3B8',
  market:   '#FFB800',
};
