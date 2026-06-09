import Lenis from 'lenis';

let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

export function initLenis(): Lenis {
  if (instance) return instance;

  instance = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.15,
  });

  return instance;
}

export function destroyLenis(): void {
  instance?.destroy();
  instance = null;
}
