'use client';

import { useEffect, useRef } from 'react';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Cursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const angle = useRef(0);
  const rpmRef = useRef(0.8);
  const dotSize = useRef(8);
  const ringSize = useRef(24);
  const isHover = useRef(false);
  const isCopy = useRef(false);
  const accentColor = useRef<string | null>(null);
  const clickAnim = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      const interactive = target.closest('button, a, [data-cursor-hover], input');
      isHover.current = !!interactive;
      isCopy.current = !!(target.closest('[data-cursor-copy]'));

      const projectEl = target.closest('[data-cursor-accent]') as HTMLElement | null;
      accentColor.current = projectEl?.dataset.cursorAccent ?? null;
    };

    const onMouseDown = () => { clickAnim.current = 1; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);

    let last = 0;
    let running = true;
    const draw = (now: number) => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(draw);
      const dt = now - last;
      last = now;

      pos.current.x += (mouse.current.x - pos.current.x) * 0.18;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.18;

      const targetDot  = isHover.current ? 12 : 8;
      const targetRing = isHover.current ? 40 : 24;
      const targetRpm  = isHover.current ? 2 : 0.8;

      dotSize.current  += (targetDot  - dotSize.current)  * 0.12;
      ringSize.current += (targetRing - ringSize.current) * 0.12;
      rpmRef.current   += (targetRpm  - rpmRef.current)   * 0.08;

      if (clickAnim.current > 0) {
        clickAnim.current = Math.max(0, clickAnim.current - dt / 150);
      }
      const clickScale = 1 - clickAnim.current * 0.5;

      // Void pulse: 1.0→1.08 on 2s sine when no interaction
      const voidPulse = !isHover.current
        ? 1 + ((Math.sin((now / 2000) * Math.PI * 2) + 1) / 2) * 0.08
        : 1;

      angle.current += (rpmRef.current / 60) * 2 * Math.PI * (dt / 1000);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const x = pos.current.x;
      const y = pos.current.y;
      const ds = dotSize.current * clickScale;
      const rs = ringSize.current * voidPulse;

      // Ring fill for project accents
      if (accentColor.current && isHover.current) {
        ctx.beginPath();
        ctx.arc(x, y, rs / 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(accentColor.current, 0.15);
        ctx.fill();
      }

      // Orbit ring
      ctx.beginPath();
      ctx.arc(x, y, rs / 2, 0, Math.PI * 2);
      ctx.strokeStyle = accentColor.current && isHover.current
        ? hexToRgba(accentColor.current, 0.7)
        : isHover.current
          ? 'rgba(255,255,255,0.6)'
          : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Satellite dot on ring
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(angle.current) * rs / 2,
        y + Math.sin(angle.current) * rs / 2,
        2, 0, Math.PI * 2
      );
      ctx.fillStyle = accentColor.current && isHover.current
        ? hexToRgba(accentColor.current, 0.8)
        : 'rgba(255,255,255,0.6)';
      ctx.fill();

      // COPY label in ring when hovering email
      if (isCopy.current) {
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText('COPY', x, y);
      }

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, ds / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10000,
      }}
    />
  );
}
