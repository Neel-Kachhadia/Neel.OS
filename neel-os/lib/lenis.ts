import Lenis from 'lenis';

let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

export function initLenis(): Lenis {
  if (instance) return instance;

  instance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  return instance;
}

export function destroyLenis(): void {
  instance?.destroy();
  instance = null;
}
