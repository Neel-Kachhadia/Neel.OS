'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.0); }`;

const FRAG = `
precision highp float;
uniform float u_progress;
uniform vec2  u_origin;
uniform float u_seed;
varying vec2 vUv;

float hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));
  p3 += dot(p3, p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}

float voronoi(vec2 p, float seed) {
  vec2 cell = floor(p);
  vec2 fr = fract(p);
  float minD = 8.0;
  for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++) {
    vec2 n = vec2(float(x),float(y));
    vec2 pt = fract(sin(vec2(
      dot(cell+n+seed,vec2(127.1,311.7)),
      dot(cell+n+seed,vec2(269.5,183.3))
    ))*43758.5453);
    pt = 0.5+0.5*sin(6.2831*pt);
    float d = length(n+pt-fr);
    minD = min(minD,d);
  }
  return minD;
}

void main() {
  vec2 uv = vUv;
  vec2 off = uv - u_origin;
  off.x *= 1.778;
  float dist = length(off);

  float crackFront = u_progress * 2.5;
  float v = voronoi(uv*8.0+u_seed*3.1, u_seed);
  float crackEdge = smoothstep(crackFront+0.05, crackFront-0.05, dist+v*0.3);

  float fallP = smoothstep(0.4,1.0,u_progress);
  float surfAlpha = 1.0 - crackEdge*fallP;
  surfAlpha = clamp(surfAlpha,0.0,1.0);

  float edgeGlow = smoothstep(0.0,0.08,v)*crackEdge*(1.0-fallP);

  vec3 surface = vec3(0.961,0.941,0.910);
  vec3 edge    = vec3(1.0,1.0,1.0);
  vec3 color   = mix(surface,edge,edgeGlow*0.4);

  gl_FragColor = vec4(color, surfAlpha);
}
`;

interface TearShaderProps {
  progress: number; // 0→1
}

export default function TearShader({ progress }: TearShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniformsRef = useRef<{ u_progress: { value: number }; u_origin: { value: THREE.Vector2 }; u_seed: { value: number } } | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_progress: { value: 0 },
      u_origin:   { value: new THREE.Vector2(0.60, 0.45) },
      u_seed:     { value: Math.random() * 10 },
    };
    uniformsRef.current = uniforms;

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
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

  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.u_progress.value = progress;
    }
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        opacity: progress > 0 ? 1 : 0,
      }}
    />
  );
}
