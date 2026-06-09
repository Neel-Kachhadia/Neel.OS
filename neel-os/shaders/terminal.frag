precision highp float;

uniform float u_time;
uniform float u_alert;  // 0 or 1 — fires ~every 5s

varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453); }

float hash2(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

// Horizontal dash pattern
float dashes(vec2 uv, float speed, float density) {
  float row = floor(uv.y * 60.0);
  float col = floor((uv.x + u_time * speed) * density);
  float on  = step(0.4, hash2(vec2(row, col)));
  float thin = smoothstep(0.0, 0.5/60.0, fract(uv.y * 60.0)) *
               smoothstep(1.0, 0.5/60.0, fract(uv.y * 60.0));
  return on * thin;
}

void main() {
  vec2 uv = vUv;

  // Layer 0: DuckDB — nearly still, dense lines
  float l0 = dashes(uv, 0.03, 80.0);
  // Layer 1: Options chain — medium pulses
  float pulse1 = 0.5 + 0.5 * sin(uv.x * 20.0 + u_time * 2.0);
  float l1 = dashes(uv, 0.15, 40.0) * (0.6 + 0.4 * pulse1);
  // Layer 2: Redis ticks — fast surface
  float l2 = dashes(uv, 0.8, 120.0);

  vec3 bg      = vec3(0.000, 0.239, 0.180); // #003D2E
  vec3 phDim   = vec3(0.040, 0.490, 0.380) * 0.4; // phosphor dimmed
  vec3 phBright= vec3(0.040, 0.816, 0.604); // #0AD09A phosphor

  vec3 color = bg;
  color += phDim   * l0 * 0.4;
  color += phDim   * l1 * 0.65;
  color += phBright* l2 * 0.9;

  // Alert: brightening at 38.2% (Fibonacci)
  float alertY = 0.382;
  float alertDist = abs(uv.y - alertY);
  float alertLine = smoothstep(0.008, 0.0, alertDist);
  // Alert fires when fract(u_time*0.2) < 0.02
  float alertActive = step(fract(u_time * 0.2), 0.02);
  color += phBright * alertLine * alertActive;

  gl_FragColor = vec4(color, 1.0);
}
