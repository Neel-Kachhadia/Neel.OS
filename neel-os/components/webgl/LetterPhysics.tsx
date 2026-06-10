'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const LETTERS = ['N', 'E', 'E', 'L', ' ', 'K', 'A', 'C', 'H', 'H', 'A', 'D', 'I', 'A'];
const LINE1 = ['N', 'E', 'E', 'L'];
const LINE2 = ['K', 'A', 'C', 'H', 'H', 'A', 'D', 'I', 'A'];

interface LetterPhysicsProps {
  mouseVelocity: number;
}

export default function LetterPhysics({ mouseVelocity }: LetterPhysicsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const domLetters = useRef<HTMLDivElement[]>([]);
  const bodies = useRef<CANNON.Body[]>([]);
  const worldRef = useRef<CANNON.World | null>(null);
  const animRef = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const mouseVelRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const seed = Date.now() % 1000;
    const rand = (i: number) => {
      const x = Math.sin(seed + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    // Cannon world
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -120, 0) });
    world.broadphase = new CANNON.NaiveBroadphase();
    worldRef.current = world;

    // Floor
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(new CANNON.Plane());
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    floorBody.position.set(0, -300, 0);
    world.addBody(floorBody);

    // Create DOM letter elements + physics bodies
    const allLetters = [...LINE1, ...LINE2];
    allLetters.forEach((char, i) => {
      const el = document.createElement('div');
      el.textContent = char;
      el.style.cssText = `
        position: absolute;
        font-family: var(--font-display);
        font-size: clamp(80px, 12vw, 160px);
        line-height: 1;
        color: var(--text-primary);
        font-weight: 300;
        letter-spacing: -0.02em;
        animation: breathe 4s ease-in-out infinite;
        animation-delay: ${rand(i + 50) * -4}s;
        user-select: none;
        pointer-events: none;
        will-change: transform;
      `;
      container.appendChild(el);
      domLetters.current.push(el);

      // Physics body per letter
      const w = 60 + rand(i) * 20;
      const h = 80;
      const body = new CANNON.Body({
        mass: 1,
        linearDamping: 0.4,
        angularDamping: 0.6,
      });
      body.addShape(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, 5)));
      body.position.set(
        (rand(i + 1) - 0.5) * 300,
        500 + rand(i + 2) * 400,
        rand(i + 3) * 5 - 2.5
      );
      body.quaternion.setFromEuler(
        0, 0,
        (rand(i + 4) - 0.5) * 0.4
      );
      // restitution is set via material in cannon-es
      world.addBody(body);
      bodies.current.push(body);
    });

    let last = performance.now();
    const tickRef: { current: ((now: number) => void) | null } = { current: null };
    let physicsSleeping = false;
    let settledFrames = 0;

    const onMouse = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (physicsSleeping && mouseVelRef.current > 1) {
        physicsSleeping = false;
        settledFrames = 0;
        last = performance.now();
        animRef.current = requestAnimationFrame(tickRef.current!);
      }
    };
    window.addEventListener('mousemove', onMouse);

    const tick = (now: number) => {
      animRef.current = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      world.step(1 / 60, dt, 3);

      // Apply mouse force
      const mx = mousePos.current.x - window.innerWidth / 2;
      const my = -(mousePos.current.y - window.innerHeight / 2);
      const force = mouseVelRef.current * 60;

      bodies.current.forEach((body) => {
        const bx = body.position.x;
        const by = body.position.y;
        const dx = bx - mx;
        const dy = by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150 && force > 2) {
          const mag = (force / (dist + 1)) * 0.3;
          body.applyImpulse(
            new CANNON.Vec3(dx * mag, dy * mag, 0),
            new CANNON.Vec3(0, 0, 0)
          );
        }
      });

      // Sync DOM
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      bodies.current.forEach((body, i) => {
        const el = domLetters.current[i];
        if (!el) return;
        const x = body.position.x + cx;
        const y = cy - body.position.y;
        const angle = body.quaternion.z * 2;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad) translate(-50%, -50%)`;
      });

      // Physics sleep: stop rAF after all bodies settle
      const allSettled = bodies.current.every(b =>
        b.velocity.length() < 0.1 && b.angularVelocity.length() < 0.1
      );
      if (allSettled) {
        settledFrames++;
        if (settledFrames > 30) {
          cancelAnimationFrame(animRef.current);
          physicsSleeping = true;
        }
      } else {
        settledFrames = 0;
      }
    };
    tickRef.current = tick;
    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouse);
      domLetters.current.forEach(el => el.remove());
      domLetters.current = [];
      bodies.current = [];
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mouseVelRef.current = mouseVelocity;
  }, [mouseVelocity]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { font-variation-settings: 'wght' 300; }
          50%       { font-variation-settings: 'wght' 800; }
        }
      `}</style>
    </div>
  );
}
