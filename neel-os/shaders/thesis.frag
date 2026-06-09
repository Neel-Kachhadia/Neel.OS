precision highp float;

uniform float u_time;
uniform float u_front;          // 0→1 left-to-right resolution front
uniform float u_snaps[8];       // per-waveform snap progress 0→1
uniform vec2  u_mouse;

varying vec2 vUv;

float waveform(vec2 uv, float freq, float amp, float phase, float snap) {
  float y = uv.y - 0.5;
  // Pre-snap: chaotic waveform
  float wave = amp * sin(freq * uv.x * 12.566 + phase * u_time);
  // Post-snap: collapse to y=0
  float result = mix(wave, 0.0, snap);
  float dist = abs(y - result);
  return smoothstep(0.008, 0.001, dist);
}

void main() {
  vec2 uv = vUv;

  vec3 color = vec3(0.118, 0.227, 0.373); // #1E3A5F cold-blue bg

  // Resolution front: cold white bar moving left-to-right
  float frontX = u_front;
  float frontGlow = smoothstep(frontX + 0.02, frontX - 0.01, uv.x);
  frontGlow *= (1.0 - smoothstep(frontX - 0.03, frontX - 0.04, uv.x));

  // 6 waveforms — varying freq, amp, phase
  float[6] freqs  = float[6](1.0, 1.7, 2.3, 0.8, 3.1, 1.4);
  float[6] amps   = float[6](0.08, 0.12, 0.06, 0.15, 0.04, 0.18);
  float[6] phases = float[6](0.5,  1.2,  0.3,  1.8,  0.7,  2.1);
  float[6] opacs  = float[6](0.4,  0.5,  0.35, 0.6,  0.3,  0.8);

  for (int i = 0; i < 6; i++) {
    float snap = u_snaps[i];
    float w = waveform(uv, freqs[i], amps[i], phases[i], snap);

    // Pre-snap: cold blue waveform
    vec3 waveColor = mix(
      vec3(0.118, 0.227, 0.373) * (1.0 + opacs[i]),
      vec3(0.580, 0.635, 0.722), // #94A3B8 steel
      snap
    );

    color = mix(color, waveColor, w * opacs[i]);
  }

  // Front highlight
  color += vec3(0.240, 0.247, 0.255) * frontGlow * 0.6;

  // Post-resolve single consensus line
  float consensus = 1.0 - smoothstep(0.0, 0.002, abs(uv.y - 0.5));
  float resolvedRegion = smoothstep(frontX + 0.01, frontX - 0.01, uv.x);
  vec3 steelLine = vec3(0.580, 0.635, 0.722); // #94A3B8
  color = mix(color, steelLine, consensus * resolvedRegion * 0.9);

  gl_FragColor = vec4(color, 1.0);
}
