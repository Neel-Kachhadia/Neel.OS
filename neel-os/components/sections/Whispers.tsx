'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface Whisper {
  text: string;
  city: string;
  timestamp: number;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Whispers() {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animsRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    fetch('/api/whisper')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setWhispers(data); })
      .catch(() => { /* silent */ });
  }, []);

  useEffect(() => {
    if (!containerRef.current || whispers.length === 0) return;
    const items = containerRef.current.querySelectorAll('[data-whisper]');

    // Kill old anims
    animsRef.current.forEach(a => a.kill());
    animsRef.current = [];

    items.forEach((el) => {
      const xDrift = (Math.random() - 0.5) * 40;
      const yDrift = (Math.random() - 0.5) * 20;
      const dur = 8 + Math.random() * 7;

      const tween = gsap.to(el, {
        x: xDrift,
        y: yDrift,
        duration: dur,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      animsRef.current.push(tween);
    });

    return () => animsRef.current.forEach(a => a.kill());
  }, [whispers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch('/api/whisper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.trim() }),
    });

    if (res.status === 429) {
      setRateLimited(true);
    } else if (res.ok) {
      setSubmitted(true);
      setInput('');
      // Refresh whispers
      fetch('/api/whisper').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setWhispers(data);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        minHeight: '200px',
        padding: '40px 0',
      }}
    >
      {/* Floating whispers */}
      {whispers.slice(0, 12).map((w, i) => (
        <div
          key={i}
          data-whisper
          style={{
            position: 'absolute',
            left: `${10 + (i % 4) * 22}%`,
            top: `${(Math.floor(i / 4)) * 60 + 20}px`,
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            lineHeight: 1.3,
            color: 'var(--text-mono-dark)',
            opacity: 0.35,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.35')}
        >
          // {w.text} &nbsp;&nbsp; [{w.city} · {timeAgo(w.timestamp)}]
        </div>
      ))}

      {/* Input */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: `${Math.ceil(Math.min(whispers.length, 12) / 4) * 60 + 40}px` }}>
        {!submitted && !rateLimited && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-mono-dark)',
                opacity: 0.5,
              }}
            >
              [+ leave a note]
            </span>
            <input
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 40))}
              placeholder="40 chars max"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(245,240,232,0.2)',
                color: 'var(--text-on-black)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                outline: 'none',
                padding: '4px 0',
                width: '200px',
                caretColor: 'var(--text-on-black)',
              }}
            />
          </form>
        )}
        {submitted && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-mono-dark)', opacity: 0.5 }}>
            noted.
          </span>
        )}
        {rateLimited && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-mono-dark)', opacity: 0.5 }}>
            one whisper per day
          </span>
        )}
      </div>
    </div>
  );
}
