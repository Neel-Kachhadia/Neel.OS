import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register immediately when module loads (client-only guard for SSR)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power2.out' });
}

// Kept for backwards-compat — no-op if already registered
export function registerGSAP(): void {
  if (typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power2.out' });
}

export { gsap, ScrollTrigger };
