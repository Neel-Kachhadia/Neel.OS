import { gsap } from 'gsap';

if (typeof window !== 'undefined') {
  gsap.defaults({ ease: 'power2.out' });
}

export function registerGSAP(): void {
  if (typeof window === 'undefined') return;
  gsap.defaults({ ease: 'power2.out' });
}

export { gsap };
