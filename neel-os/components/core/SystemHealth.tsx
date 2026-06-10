'use client';

import { useEffect, useRef, useState } from 'react';

interface SystemHealthProps {
  sessionCount: number;
  soundEnabled: boolean;
  motionProfile: string;
  onToggleSound?: () => void;
}

export default function SystemHealth({
  sessionCount,
  soundEnabled,
  motionProfile,
  onToggleSound,
}: SystemHealthProps) {
  const [fps, setFps] = useState(60);
  const [heap, setHeap] = useState('--');
  const [uptime, setUptime] = useState('00:00:00');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const frameTimesRef = useRef<number[]>([]);
  const pageLoadRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(performance.now());

  useEffect(() => {
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) frameTimesRef.current.shift();
    };
    rafRef.current = requestAnimationFrame(tick);

    const interval = setInterval(() => {
      const times = frameTimesRef.current;
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        setFps(Math.round(1000 / avg));
      }

      if ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory) {
        const mem = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
        setHeap(Math.round(mem.usedJSHeapSize / 1048576) + 'mb');
      }

      const s = Math.floor((Date.now() - pageLoadRef.current) / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      setUptime(
        `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      );
    }, 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
    };
  }, []);

  // Detect active section for section-aware status lines
  useEffect(() => {
    const SECTIONS = ['transmission', 'neurofin', 'equity', 'market'];
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(id => {
      const el = document.querySelector(`#${id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
          else setActiveSection(prev => prev === id ? null : prev);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 30,
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        lineHeight: '1.3',
        color: 'var(--text-on-black)',
        opacity: 0.6,
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '0.05em',
      }}
    >
      <div style={{ marginBottom: '4px', opacity: 0.9 }}>SYSTEM HEALTH</div>
      <Row label="render" value="stable" />
      <Row label="fps" value={String(fps)} />
      <Row label="heap" value={heap} />
      <Row label="uptime" value={uptime} />
      <Row label="audio" value={soundEnabled ? 'enabled' : 'muted'} />
      <Row label="motion" value={motionProfile} />
      {activeSection === 'transmission' ? (
        <>
          <Row label="transmission" value="listening" vColor="var(--online)" />
          <Row label="contact" value="open" vColor="var(--online)" />
        </>
      ) : activeSection === 'neurofin' ? (
        <>
          <Row label="project-runtime" value="active" vColor="var(--online)" />
          <Row label="case-study" value="mounted" vColor="var(--online)" />
        </>
      ) : activeSection === 'equity' ? (
        <>
          <Row label="project-runtime" value="active" vColor="var(--online)" />
          <Row label="thesis-shader" value="running" vColor="var(--online)" />
        </>
      ) : activeSection === 'market' ? (
        <>
          <Row label="project-runtime" value="active" vColor="var(--online)" />
          <Row label="terminal" value="live" vColor="var(--online)" />
        </>
      ) : (
        <Row label="session" value={String(sessionCount).padStart(2, '0')} />
      )}
    </div>
  );
}

function Row({ label, value, vColor }: { label: string; value: string; vColor?: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ opacity: 0.6, minWidth: '64px' }}>{label}</span>
      <span style={{ color: vColor }}>{value}</span>
    </div>
  );
}
