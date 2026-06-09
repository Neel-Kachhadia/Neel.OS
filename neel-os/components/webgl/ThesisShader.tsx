'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.0); }`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform float u_front;
uniform float u_snaps[6];
varying vec2 vUv;

float wave(vec2 uv, float freq, float amp, float phase, float snap) {
  float y = uv.y - 0.5;
  float w = amp * sin(freq * uv.x * 12.566 + phase * u_time);
  float result = mix(w, 0.0, snap);
  return smoothstep(0.008, 0.001, abs(y - result));
}

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(0.118, 0.227, 0.373);

  float frontX = u_front;
  float fG = smoothstep(frontX+0.02, frontX-0.01, uv.x) * (1.0 - smoothstep(frontX-0.03, frontX-0.04, uv.x));

  float freqs[6];  freqs[0]=1.0;  freqs[1]=1.7;  freqs[2]=2.3;  freqs[3]=0.8;  freqs[4]=3.1;  freqs[5]=1.4;
  float amps[6];   amps[0]=0.08;  amps[1]=0.12;  amps[2]=0.06;  amps[3]=0.15;  amps[4]=0.04;  amps[5]=0.18;
  float phases[6]; phases[0]=0.5; phases[1]=1.2;  phases[2]=0.3;  phases[3]=1.8;  phases[4]=0.7;  phases[5]=2.1;
  float opacs[6];  opacs[0]=0.4;  opacs[1]=0.5;   opacs[2]=0.35; opacs[3]=0.6;   opacs[4]=0.3;   opacs[5]=0.8;

  for(int i=0;i<6;i++) {
    float w = wave(uv, freqs[i], amps[i], phases[i], u_snaps[i]);
    vec3 wc = mix(vec3(0.118,0.227,0.373)*(1.0+opacs[i]), vec3(0.580,0.635,0.722), u_snaps[i]);
    color = mix(color, wc, w * opacs[i]);
  }

  color += vec3(0.240,0.247,0.255) * fG * 0.6;

  float cons = 1.0 - smoothstep(0.0, 0.002, abs(uv.y - 0.5));
  float resR = smoothstep(frontX+0.01, frontX-0.01, uv.x);
  color = mix(color, vec3(0.580,0.635,0.722), cons * resR * 0.9);

  gl_FragColor = vec4(color, 1.0);
}`;

interface ThesisShaderProps {
  soundEnabled?: boolean;
  autoPlay?: boolean;
  onResolved?: () => void;
}

export default function ThesisShader({ soundEnabled = false, autoPlay = false, onResolved }: ThesisShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniformsRef = useRef<{
    u_time: { value: number };
    u_front: { value: number };
    u_snaps: { value: number[] };
  } | null>(null);
  const rafRef = useRef(0);
  const frontObjRef = useRef({ front: 0 });
  const snapsRef = useRef([0, 0, 0, 0, 0, 0]);
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
      u_snaps: { value: [0, 0, 0, 0, 0, 0] },
    };
    uniformsRef.current = uniforms;

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
      uniforms.u_front.value = frontObjRef.current.front;
      uniforms.u_snaps.value = [...snapsRef.current];
      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(tick);

    const triggerResolve = () => {
      snapsRef.current = [0, 0, 0, 0, 0, 0];
      frontObjRef.current.front = 0;
      setResolved(false);

      gsap.to(frontObjRef.current, {
        front: 1,
        duration: 4.0,
        ease: 'power2.inOut',
      });

      // Stagger waveform snaps — last (index 5) snaps last
      const delays = [0.4, 0.8, 1.1, 1.5, 1.9, 2.6]; // seconds into the 4s resolve
      delays.forEach((delay, i) => {
        setTimeout(() => {
          gsap.to(snapsRef.current, { [i]: 1, duration: 0.2, ease: 'power3.in' });
          if (soundEnabled) playSnapSound(i === 5);
          if (i === 5) {
            setResolved(true);
            onResolved?.();
          }
        }, delay * 1000);
      });
    };

    if (autoPlay) {
      const loop = () => {
        triggerResolve();
        setTimeout(loop, 12000);
      };
      const t = setTimeout(loop, 1200);
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

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', cursor: autoPlay ? 'default' : 'pointer' }}
    />
  );
}

async function playSnapSound(isFinal: boolean) {
  try {
    const Tone = await import('tone');
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: isFinal ? 0.1 : 0.02, sustain: 0, release: 0 },
    }).toDestination();
    synth.volume.value = -30;
    synth.triggerAttackRelease(isFinal ? 1500 : 2000, '16n');
    setTimeout(() => synth.dispose(), 500);
  } catch { /* silent */ }
}
