'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform float u_velocity;
varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5,fr=1.0;
  for(int i=0;i<4;i++){v+=a*noise(p*fr);fr*=2.1;a*=0.5;}
  return v;
}
void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(u_resolution.x/u_resolution.y,1.0);
  vec2 mo = uv - u_mouse;
  mo.x *= asp.x/asp.y;
  float md = length(mo);
  float mi = smoothstep(0.3,0.0,md)*u_velocity*0.8;
  vec2 d = uv + normalize(mo+0.001)*mi*(-0.04);
  float t = u_time*0.08;
  vec2 q = vec2(fbm(d*2.0+vec2(0.0,t)),fbm(d*2.0+vec2(3.1,t+1.7)));
  float f = fbm(d*1.5+q*0.8+vec2(t*0.3));
  vec3 base = vec3(0.961,0.941,0.910);
  vec3 ink  = vec3(0.040,0.040,0.040);
  float inkAmt = smoothstep(0.38,0.58,f)*0.18;
  inkAmt += clamp(u_velocity*0.6,0.0,1.0)*0.08;
  gl_FragColor = vec4(mix(base,ink,inkAmt),1.0);
}
`;

interface HeroFluidProps {
  velocity: number;
}

export default function HeroFluid({ velocity }: HeroFluidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    material: null as THREE.ShaderMaterial | null,
    animId: 0,
    mouse: new THREE.Vector2(0.5, 0.5),
    targetMouse: new THREE.Vector2(0.5, 0.5),
  });
  const velocityRef = useRef(velocity);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    s.renderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time:       { value: 0 },
      u_mouse:      { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_velocity:   { value: 0 },
    };

    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    s.material = material;

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      s.targetMouse.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight
      );
    };
    window.addEventListener('mousemove', onMouse);

    let last = performance.now();
    const tick = (now: number) => {
      s.animId = requestAnimationFrame(tick);
      const dt = (now - last) / 1000;
      last = now;

      // Lerp mouse
      s.mouse.x += (s.targetMouse.x - s.mouse.x) * 0.06;
      s.mouse.y += (s.targetMouse.y - s.mouse.y) * 0.06;

      uniforms.u_time.value += dt;
      uniforms.u_mouse.value.copy(s.mouse);
      uniforms.u_velocity.value += (velocityRef.current - uniforms.u_velocity.value) * 0.1;

      renderer.render(scene, camera);
    };
    s.animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(s.animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
      material.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
