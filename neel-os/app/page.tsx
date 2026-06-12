'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Session, initSession, updateSession } from '@/lib/session';
import { Mode } from '@/hooks/useMode';
import { MotionProfile, useMotionProfile, setMotionOverride } from '@/hooks/useMotionProfile';
import { gsap } from '@/lib/gsap';
import { playBackSound, playDestinationArrive } from '@/lib/soundEngine';

import Boot from '@/components/sections/Boot';
import Hero from '@/components/sections/Hero';

const Grain         = dynamic(() => import('@/components/core/Grain'),                           { ssr: false, loading: () => null });
const ScanLine      = dynamic(() => import('@/components/core/ScanLine'),                        { ssr: false, loading: () => null });
const SystemHealth  = dynamic(() => import('@/components/core/SystemHealth'),                    { ssr: false, loading: () => null });
const ModeSwitcher  = dynamic(() => import('@/components/core/ModeSwitcher'),                    { ssr: false, loading: () => null });
const PathIndicator = dynamic(() => import('@/components/core/PathIndicator'),                   { ssr: false, loading: () => null });
const FilesystemSidebar = dynamic(() => import('@/components/core/FilesystemSidebar'),           { ssr: false, loading: () => null });
const CommandTerminal = dynamic(() => import('@/components/core/CommandTerminal'),               { ssr: false, loading: () => null });
const Identity      = dynamic(() => import('@/components/sections/Identity'),                     { ssr: false, loading: () => null });
const Logs          = dynamic(() => import('@/components/sections/Logs'),                         { ssr: false, loading: () => null });
const Stack         = dynamic(() => import('@/components/sections/Stack'),                        { ssr: false, loading: () => null });
const Transmission  = dynamic(() => import('@/components/sections/Transmission'),                 { ssr: false, loading: () => null });
const NeuroFin      = dynamic(() => import('@/components/sections/Projects/NeuroFin'),            { ssr: false, loading: () => null });
const Equity        = dynamic(() => import('@/components/sections/Projects/Equity'),              { ssr: false, loading: () => null });
const MarketTerminal= dynamic(() => import('@/components/sections/Projects/MarketTerminal'),      { ssr: false, loading: () => null });
const RecruiterPanel= dynamic(() => import('@/components/modes/RecruiterPanel'),                  { ssr: false, loading: () => null });
const ChatWorld     = dynamic(() => import('@/components/sections/ChatWorld'),                     { ssr: false, loading: () => null });
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
  | 'transmission'
  | 'chat';

const STATE_PATHS: Record<TerminalState, string> = {
  'terminal-root': '/neel',
  'neurofin':      '/neel/projects/neurofin',
  'equity':        '/neel/projects/equity-research',
  'market':        '/neel/projects/market-terminal',
  'identity':      '/neel/identity',
  'logs':          '/neel/logs',
  'stack':         '/neel/stack',
  'transmission':  '/neel/transmission',
  'chat':          '/neel/chat',
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
  'chat':          'rgba(74,255,145,0.06)',
};

const PATH_TO_STATE: Record<string, TerminalState> = {
  '/neel':                         'terminal-root',
  '/neel/projects/neurofin':       'neurofin',
  '/neel/projects/equity-research':'equity',
  '/neel/projects/market':         'market',
  '/neel/projects/market-terminal':'market',
  '/neel/identity':                'identity',
  '/neel/logs':                    'logs',
  '/neel/stack':                   'stack',
  '/neel/transmission':            'transmission',
  '/neel/chat':                    'chat',
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
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recruiterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStateRef = useRef<TerminalState>('terminal-root');
  const motionProfile = useMotionProfile();

  const clearPageTimers = useCallback(() => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    if (recruiterTimeoutRef.current) {
      clearTimeout(recruiterTimeoutRef.current);
      recruiterTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearPageTimers, [clearPageTimers]);

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
    if (newState === 'chat') prevStateRef.current = termState;
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
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => {
          flashTimeoutRef.current = null;
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

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    updateSession({ mode: m });
  }, []);

  const handleNavigate = useCallback((path: string) => {
    const state = PATH_TO_STATE[path];
    if (state) transitionTo(state);
    else {
      setCurrentPath(path);
      updateSession({ lastPath: path });
    }
  }, [transitionTo]);

  const handleMotionChange = useCallback((p: MotionProfile) => {
    setMotionOverride(p);
    updateSession({ motionProfile: p });
  }, []);

  const handleRecruiterTransmission = useCallback(() => {
    handleModeChange('visitor');
    if (recruiterTimeoutRef.current) clearTimeout(recruiterTimeoutRef.current);
    recruiterTimeoutRef.current = setTimeout(() => {
      recruiterTimeoutRef.current = null;
      transitionTo('transmission');
    }, 150);
  }, [handleModeChange, transitionTo]);

  const handleRecruiterClose = useCallback(() => {
    handleModeChange('visitor');
  }, [handleModeChange]);

  const handleChatExit = useCallback(() => {
    transitionTo(prevStateRef.current);
  }, [transitionTo]);

  const handleRecruiterChat = useCallback(() => {
    handleModeChange('visitor');
    if (recruiterTimeoutRef.current) clearTimeout(recruiterTimeoutRef.current);
    recruiterTimeoutRef.current = setTimeout(() => {
      recruiterTimeoutRef.current = null;
      transitionTo('chat');
    }, 150);
  }, [handleModeChange, transitionTo]);

  const handleStateChange = useCallback((state: string) => {
    if (state in STATE_PATHS) transitionTo(state as TerminalState);
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
          onClose={handleRecruiterClose}
          onTransmission={handleRecruiterTransmission}
          onChat={handleRecruiterChat}
        />
      </>
    );
  }

  const isProject = termState === 'neurofin' || termState === 'equity' || termState === 'market';
  const isChat = termState === 'chat';
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
          {termState !== 'terminal-root' && !isProject && !isChat && <PathIndicator path={currentPath} />}
          <SystemHealth
            sessionCount={session.count}
            soundEnabled={soundEnabled}
            motionProfile={motionProfile}
            activeState={termState}
          />
          <CommandTerminal
            currentPath={currentPath}
            onNavigate={handleNavigate}
            onModeChange={handleModeChange}
            terminalState={termState}
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
          {termState !== 'terminal-root' && !isProject && !isChat && (
            <div
              style={{
                position: 'fixed',
                bottom: '72px',
                left: 'calc(200px + 24px)',
                zIndex: 30,
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                lineHeight: 1.4,
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
              onStateChange={handleStateChange}
            />
          )}
          {termState === 'neurofin' && (
            <NeuroFin soundEnabled={soundEnabled} onStateChange={handleStateChange} />
          )}
          {termState === 'equity' && (
            <Equity soundEnabled={soundEnabled} onStateChange={handleStateChange} />
          )}
          {termState === 'market' && (
            <MarketTerminal soundEnabled={soundEnabled} onStateChange={handleStateChange} />
          )}
          {termState === 'identity' && <Identity />}
          {termState === 'logs' && <Logs />}
          {termState === 'stack' && <Stack />}
          {termState === 'transmission' && <Transmission soundEnabled={soundEnabled} />}
          {termState === 'chat' && <ChatWorld onExit={handleChatExit} soundEnabled={soundEnabled} />}
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
  chat:     '#4AFF91',
};
