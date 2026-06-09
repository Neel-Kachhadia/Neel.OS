precision highp float;

uniform float u_time;
uniform float u_front;   // 0→1 top-to-bottom resolve front, GSAP-driven
uniform vec2  u_mouse;

varying vec2 vUv;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0,0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p, int octaves, float freq) {
  float v = 0.0, amp = 0.5, f = freq;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    v += amp * noise(p * f);
    f *= 2.1;
    amp *= 0.8;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  // Flip Y so front descends top-to-bottom
  float y = 1.0 - uv.y;

  // Resolve front: sharp smoothstep with 0.02 width
  float frontY = u_front;
  float resolved = smoothstep(frontY + 0.01, frontY - 0.01, y);

  // Above front (resolved): smooth breathing amber
  float breathe = 0.5 + 0.5 * sin(u_time * 0.4);
  vec3 amberResolved = mix(
    vec3(0.706, 0.325, 0.035),  // #B45309 amber
    vec3(0.824, 0.420, 0.020),  // lighter amber
    breathe * 0.3 + fbm(uv * 2.0 + u_time * 0.05, 2, 0.5) * 0.2
  );

  // Below front (noise): granular high-frequency noise
  float noiseLow = fbm(uv * 12.0 + u_time * 0.3, 6, 2.4);
  vec3 amberNoise = mix(
    vec3(0.573, 0.250, 0.000),  // #924000 copper-dark
    vec3(0.706, 0.325, 0.035),
    noiseLow
  );

  // Copper trace line: 2px at front position, lingers
  float traceWidth = 0.004;
  float trace = smoothstep(traceWidth, 0.0, abs(y - frontY));
  vec3 copper = vec3(0.573, 0.250, 0.000); // #924000

  vec3 color = mix(amberNoise, amberResolved, resolved);
  color = mix(color, copper, trace * (1.0 - resolved) * 0.8);

  // Background: black
  float bgMask = step(0.001, u_front); // only show after front starts
  color = mix(vec3(0.040, 0.040, 0.040), color, bgMask);

  gl_FragColor = vec4(color, 1.0);
}
