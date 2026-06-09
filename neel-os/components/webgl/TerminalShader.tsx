'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.0); }`;

const FRAG = `
precision highp float;
uniform float u_time;
varying vec2 vUv;

float hash(float n) { return fract(sin(n)*43758.5453); }
float hash2(vec2 p) {
  p = fract(p*vec2(443.897,441.423)); p += dot(p,p.yx+19.19);
  return fract((p.x+p.y)*p.x);
}
float dashes(vec2 uv, float speed, float density) {
  float row = floor(uv.y*60.0);
  float col = floor((uv.x+u_time*speed)*density);
  float on  = step(0.4, hash2(vec2(row,col)));
  float thin = smoothstep(0.0,0.5/60.0,fract(uv.y*60.0)) *
               smoothstep(1.0,0.5/60.0,fract(uv.y*60.0));
  return on*thin;
}
void main() {
  vec2 uv = vUv;
  float l0 = dashes(uv,0.03,80.0);
  float pulse1 = 0.5+0.5*sin(uv.x*20.0+u_time*2.0);
  float l1 = dashes(uv,0.15,40.0)*(0.6+0.4*pulse1);
  float l2 = dashes(uv,0.8,120.0);

  vec3 bg  = vec3(0.000,0.239,0.180);
  vec3 phD = vec3(0.040,0.490,0.380)*0.4;
  vec3 phB = vec3(0.040,0.816,0.604);

  vec3 color = bg;
  color += phD*l0*0.4 + phD*l1*0.65 + phB*l2*0.9;

  float alertLine = smoothstep(0.008,0.0,abs(uv.y-0.382));
  float alertA = step(fract(u_time*0.2),0.02);
  color += phB*alertLine*alertA;

  gl_FragColor = vec4(color,1.0);
}`;

export default function TerminalShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = { u_time: { value: 0 } };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const resize = () => renderer.setSize(
      canvas.parentElement?.clientWidth ?? window.innerWidth,
      canvas.parentElement?.clientHeight ?? 400
    );
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      uniforms.u_time.value = performance.now() / 1000;
      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
