'use client';

import { useEffect, useRef } from 'react';
import { useMotionProfile } from '@/hooks/useMotionProfile';

export default function Grain() {
  const motionProfile = useMotionProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (motionProfile === 'static') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const scale = motionProfile === 'reduced' ? 0.35 : 0.5;
      canvas.width = Math.ceil(window.innerWidth * scale);
      canvas.height = Math.ceil(window.innerHeight * scale);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastRef.current < 150) return;
      lastRef.current = now;

      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [motionProfile]);

  if (motionProfile === 'static') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: motionProfile === 'reduced' ? 0.015 : 0.025,
      }}
    />
  );
}
