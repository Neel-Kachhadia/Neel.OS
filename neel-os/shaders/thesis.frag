precision highp float;

uniform float u_time;
uniform float u_front;
uniform float u_snaps[8];
uniform vec2  u_mouse;

varying vec2 vUv;

float waveform(vec2 uv, float freq, float amp, float phase, float snap) {
  float y = uv.y - 0.5;
  float wave = amp * sin(freq * uv.x * 12.566 + phase * u_time);
  float result = mix(wave, 0.0, snap);
  float dist = abs(y - result);
  return smoothstep(0.008, 0.001, dist);
}

// Uniform arrays cannot be indexed with non-constant expressions on strict WebGL 1 drivers.
float getSnap(int idx) {
  if(idx==0) return u_snaps[0];
  if(idx==1) return u_snaps[1];
  if(idx==2) return u_snaps[2];
  if(idx==3) return u_snaps[3];
  if(idx==4) return u_snaps[4];
  return u_snaps[5];
}

void main() {
  vec2 uv = vUv;

  vec3 color = vec3(0.118, 0.227, 0.373);

  float frontX = u_front;
  float frontGlow = smoothstep(frontX + 0.02, frontX - 0.01, uv.x);
  frontGlow *= (1.0 - smoothstep(frontX - 0.03, frontX - 0.04, uv.x));

  // GLSL ES 1.00 compatible array initialization (no float[6](...) syntax)
  float freqs[6];  freqs[0]=1.0;  freqs[1]=1.7;  freqs[2]=2.3;  freqs[3]=0.8;  freqs[4]=3.1;  freqs[5]=1.4;
  float amps[6];   amps[0]=0.08;  amps[1]=0.12;  amps[2]=0.06;  amps[3]=0.15;  amps[4]=0.04;  amps[5]=0.18;
  float phases[6]; phases[0]=0.5; phases[1]=1.2;  phases[2]=0.3;  phases[3]=1.8;  phases[4]=0.7;  phases[5]=2.1;
  float opacs[6];  opacs[0]=0.4;  opacs[1]=0.5;   opacs[2]=0.35; opacs[3]=0.6;   opacs[4]=0.3;   opacs[5]=0.8;

  for (int i = 0; i < 6; i++) {
    float snap = getSnap(i);
    float w = waveform(uv, freqs[i], amps[i], phases[i], snap);

    vec3 waveColor = mix(
      vec3(0.118, 0.227, 0.373) * (1.0 + opacs[i]),
      vec3(0.580, 0.635, 0.722),
      snap
    );

    color = mix(color, waveColor, w * opacs[i]);
  }

  color += vec3(0.240, 0.247, 0.255) * frontGlow * 0.6;

  float consensus = 1.0 - smoothstep(0.0, 0.002, abs(uv.y - 0.5));
  float resolvedRegion = smoothstep(frontX + 0.01, frontX - 0.01, uv.x);
  vec3 steelLine = vec3(0.580, 0.635, 0.722);
  color = mix(color, steelLine, consensus * resolvedRegion * 0.9);

  gl_FragColor = vec4(color, 1.0);
}
