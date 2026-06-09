import * as THREE from 'three';

export class WebGLContext {
  renderer: THREE.WebGLRenderer;
  camera: THREE.OrthographicCamera;
  private animId: number = 0;
  private callbacks: Map<string, (t: number, dt: number) => void> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
  }

  // Register a tick callback for a named scene
  register(name: string, cb: (t: number, dt: number) => void) {
    this.callbacks.set(name, cb);
  }

  unregister(name: string) {
    this.callbacks.delete(name);
  }

  start() {
    let last = performance.now();
    const tick = (now: number) => {
      this.animId = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      const t = now / 1000;
      this.callbacks.forEach(cb => cb(t, dt));
    };
    this.animId = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.animId);
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize.bind(this));
    this.renderer.dispose();
  }
}

let instance: WebGLContext | null = null;

export function getWebGLContext(): WebGLContext | null {
  return instance;
}

export function initWebGLContext(canvas: HTMLCanvasElement): WebGLContext {
  if (instance) return instance;
  instance = new WebGLContext(canvas);
  instance.start();
  return instance;
}

export function destroyWebGLContext(): void {
  instance?.dispose();
  instance = null;
}
