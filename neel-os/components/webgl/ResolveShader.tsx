'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.0); }`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform float u_front;
uniform vec2  u_mouse;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(443.897,441.423)); p += dot(p, p.yzx+19.19);
  return fract((p.x+p.y)*p.z);
}
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
}
float fbm(vec2 p, int oct, float freq) {
  float v=0.0,a=0.5,fr=freq;
  for(int i=0;i<6;i++) { if(i>=oct) break; v+=a*noise(p*fr); fr*=2.1; a*=0.8; }
  return v;
}
void main() {
  vec2 uv = vUv;
  float y = 1.0 - uv.y;
  float resolved = smoothstep(u_front+0.01, u_front-0.01, y);
  float breathe = 0.5+0.5*sin(u_time*0.4);
  vec3 amberR = mix(vec3(0.706,0.325,0.035),vec3(0.824,0.420,0.020), breathe*0.3+fbm(uv*2.0+u_time*0.05,2,0.5)*0.2);
  float nL = fbm(uv*12.0+u_time*0.3,6,2.4);
  vec3 amberN = mix(vec3(0.573,0.250,0.000),vec3(0.706,0.325,0.035),nL);
  float trace = smoothstep(0.004,0.0,abs(y-u_front));
  vec3 copper = vec3(0.573,0.250,0.000);
  vec3 color = mix(amberN,amberR,resolved);
  color = mix(color,copper,trace*(1.0-resolved)*0.8);
  float bgM = step(0.001,u_front);
  color = mix(vec3(0.040),color,bgM);
  gl_FragColor = vec4(color,1.0);
}`;

interface ResolveShaderProps {
  onResolved?: () => void;
  autoPlay?: boolean;
}

export default function ResolveShader({ onResolved, autoPlay = false }: ResolveShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniformsRef = useRef<{ u_time: { value: number }; u_front: { value: number }; u_mouse: { value: THREE.Vector2 } } | null>(null);
  const rafRef = useRef(0);
  const frontObjRef = useRef({ front: 0 });
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time:  { value: 0 },
      u_front: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    };
    uniformsRef.current = uniforms;

    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const resize = () => renderer.setSize(canvas.parentElement?.clientWidth ?? window.innerWidth, canvas.parentElement?.clientHeight ?? 400);
    resize();
    window.addEventListener('resize', resize);

    let start = performance.now();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      uniforms.u_time.value = (performance.now() - start) / 1000;
      uniforms.u_front.value = frontObjRef.current.front;
      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Auto loop: resolve over 3s, pause 8s, reset
    if (autoPlay) {
      const loop = () => {
        frontObjRef.current.front = 0;
        setResolved(false);
        gsap.to(frontObjRef.current, {
          front: 1,
          duration: 3.0,
          ease: 'power2.inOut',
          onComplete: () => {
            setResolved(true);
            onResolved?.();
            setTimeout(loop, 8000);
          },
        });
      };
      const t = setTimeout(loop, 1000);
      return () => {
        clearTimeout(t);
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener('resize', resize);
        renderer.dispose();
        mat.dispose();
      };
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mat.dispose();
    };
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  // External trigger via data-resolve attribute
  const triggerResolve = () => {
    frontObjRef.current.front = 0;
    setResolved(false);
    gsap.to(frontObjRef.current, {
      front: 1,
      duration: 3.0,
      ease: 'power2.inOut',
      onComplete: () => {
        setResolved(true);
        onResolved?.();
      },
    });
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}
      onClick={!autoPlay ? triggerResolve : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {!autoPlay && !resolved && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'rgba(180,83,9,0.6)',
            pointerEvents: 'none',
          }}
        >
          click to resolve
        </div>
      )}
    </div>
  );
}
