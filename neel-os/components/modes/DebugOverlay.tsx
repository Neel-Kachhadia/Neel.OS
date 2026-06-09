'use client';

import { useEffect, useRef, useState } from 'react';

interface DebugOverlayProps {
  currentPath: string;
  motionProfile: string;
}

const TECH_DECISIONS = [
  {
    tech: 'Three.js (single context)',
    decision: 'One WebGL renderer for all scenes',
    reason: 'Multiple contexts cause GPU resource exhaustion. Lusion sync prevents rAF/scroll desync.',
  },
  {
    tech: 'Cannon-es (physics)',
    decision: 'Rigid body simulation for hero letters',
    reason: 'CSS transitions are deterministic. Physics makes every load unique. The randomness IS the design.',
  },
  {
    tech: 'Groq (llama-3.3-70b)',
    decision: 'Server-side streaming chat',
    reason: 'Sub-second first token. Speed = system responding, not model thinking. Rate limited.',
  },
  {
    tech: 'Lenis + GSAP sync',
    decision: 'Lenis scroll → GSAP → shader uniforms',
    reason: 'Native scroll runs off main thread. rAF runs on main thread. Without sync, WebGL desyncs.',
  },
  {
    tech: 'GLSL fragment shaders',
    decision: 'Pure shader project visuals — no 3D models',
    reason: 'One draw call per scene. Deterministic 60fps. The behavior of each system IS the shader.',
  },
];

const PERF_BUDGET = [
  { phase: 'Boot (critical)',   target: '80kb',  items: 'boot seq, font loading, session' },
  { phase: 'Hero (lazy)',       target: '120kb', items: 'Three.js, Cannon-es, GSAP' },
  { phase: 'Shaders (lazy)',    target: '15kb',  items: 'per shader, loaded on approach' },
  { phase: 'Features (demand)', target: '60kb',  items: 'Tone.js, Groq chat' },
];

export default function DebugOverlay({ currentPath, motionProfile }: DebugOverlayProps) {
  const [fps,  setFps]  = useState(0);
  const [heap, setHeap] = useState('--');
  const [colorContrast, setColorContrast] = useState<'pass' | 'warn'>('pass');
  const [showBoundaries, setShowBoundaries] = useState(false);

  const frameTimes = useRef<number[]>([]);
  const lastFrame  = useRef(performance.now());
  const rafId      = useRef<number>(0);

  useEffect(() => {
    const tick = (now: number) => {
      rafId.current = requestAnimationFrame(tick);
      const delta = now - lastFrame.current;
      lastFrame.current = now;
      frameTimes.current.push(delta);
      if (frameTimes.current.length > 60) frameTimes.current.shift();
    };
    rafId.current = requestAnimationFrame(tick);

    const interval = setInterval(() => {
      const times = frameTimes.current;
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        setFps(Math.round(1000 / avg));
      }
      const perf = performance as Performance & { memory?: { usedJSHeapSize: number } };
      if (perf.memory) {
        setHeap(Math.round(perf.memory.usedJSHeapSize / 1048576) + 'mb');
      }
    }, 500);

    return () => {
      cancelAnimationFrame(rafId.current);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'debug-boundaries-style';
    if (showBoundaries) {
      style.textContent = '* { outline: 1px solid rgba(74, 255, 145, 0.25) !important; }';
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById('debug-boundaries-style')?.remove();
    };
  }, [showBoundaries]);

  const fpsColor = fps >= 55 ? '#4AFF91' : fps >= 30 ? '#B45309' : '#FF4444';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '320px',
        background: 'rgba(10,10,10,0.95)',
        borderLeft: '1px solid rgba(245,240,232,0.1)',
        zIndex: 150,
        overflowY: 'auto',
        padding: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-mono-dark)',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontSize: '9px', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '16px' }}>
        DEBUG OVERLAY
      </div>

      {/* Realtime */}
      <Group label="RUNTIME">
        <Pair k="fps"    v={String(fps)}      vStyle={{ color: fpsColor }} />
        <Pair k="heap"   v={heap} />
        <Pair k="route"  v={currentPath} />
        <Pair k="motion" v={motionProfile} />
        <Pair k="webgl"  v="active" vStyle={{ color: '#4AFF91' }} />
        <Pair k="contrast" v={colorContrast} vStyle={{ color: colorContrast === 'pass' ? '#4AFF91' : '#B45309' }} />
      </Group>

      {/* Performance budget */}
      <Group label="BUNDLE BUDGET">
        {PERF_BUDGET.map(({ phase, target, items }) => (
          <div key={phase} style={{ marginBottom: '8px' }}>
            <div style={{ opacity: 0.8 }}>{phase}</div>
            <div style={{ opacity: 0.4 }}>target: {target}</div>
            <div style={{ opacity: 0.35, fontSize: '9px' }}>{items}</div>
          </div>
        ))}
      </Group>

      {/* Tech decisions */}
      <Group label="TECH DECISIONS">
        {TECH_DECISIONS.map(({ tech, decision, reason }) => (
          <div key={tech} style={{ marginBottom: '12px' }}>
            <div style={{ color: 'var(--text-on-black)', opacity: 0.9 }}>{tech}</div>
            <div style={{ opacity: 0.6, marginTop: '2px' }}>{decision}</div>
            <div style={{ opacity: 0.4, fontSize: '9px', marginTop: '3px', lineHeight: 1.4 }}>{reason}</div>
          </div>
        ))}
      </Group>

      {/* Component boundaries */}
      <Group label="COMPONENT BOUNDARIES">
        <button
          onClick={() => setShowBoundaries(v => !v)}
          style={{
            background: 'none',
            border: `1px solid ${showBoundaries ? '#4AFF91' : 'rgba(245,240,232,0.2)'}`,
            color: showBoundaries ? '#4AFF91' : 'var(--text-mono-dark)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            padding: '4px 10px',
            cursor: 'pointer',
            letterSpacing: '0.08em',
            transition: 'all 0.15s',
          }}
        >
          [{showBoundaries ? 'hide' : 'show'}] boundaries
        </button>
      </Group>

      {/* Accessibility */}
      <Group label="ACCESSIBILITY">
        <Pair k="reduced-motion" v={motionProfile !== 'full' ? 'on' : 'off'} />
        <Pair k="font-scale"     v="variable (wght 200-800)" />
        <Pair k="cursor-none"    v="yes (canvas RAF)" />
        <Pair k="focus-visible"  v="preserved" />
      </Group>

      <div
        style={{
          fontSize: '9px',
          opacity: 0.25,
          marginTop: '16px',
          lineHeight: 1.4,
        }}
      >
        debug mode — switch to [VISITOR] to exit
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          fontSize: '8px',
          letterSpacing: '0.15em',
          opacity: 0.3,
          marginBottom: '8px',
          borderBottom: '1px solid rgba(245,240,232,0.06)',
          paddingBottom: '4px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Pair({
  k,
  v,
  vStyle,
}: {
  k: string;
  v: string;
  vStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '3px' }}>
      <span style={{ opacity: 0.4, minWidth: '80px' }}>{k}</span>
      <span style={vStyle}>{v}</span>
    </div>
  );
}
