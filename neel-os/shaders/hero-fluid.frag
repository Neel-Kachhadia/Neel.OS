precision highp float;

uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform float u_velocity;

varying vec2 vUv;

// Value noise
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

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p * freq);
    freq *= 2.1;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

  // Mouse repulsion — ink pushed by cursor
  vec2 mouseOffset = uv - u_mouse;
  mouseOffset.x *= aspect.x / aspect.y;
  float mouseDist = length(mouseOffset);
  float mouseInfluence = smoothstep(0.3, 0.0, mouseDist) * u_velocity * 0.8;

  vec2 displaced = uv;
  displaced += normalize(mouseOffset + 0.001) * mouseInfluence * -0.04;

  // Slow fluid drift
  float t = u_time * 0.08;
  vec2 q = vec2(
    fbm(displaced * 2.0 + vec2(0.0, t)),
    fbm(displaced * 2.0 + vec2(3.1, t + 1.7))
  );

  float f = fbm(displaced * 1.5 + q * 0.8 + vec2(t * 0.3));

  // Off-white base with dark ink
  vec3 base   = vec3(0.961, 0.941, 0.910); // #F5F0E8
  vec3 ink    = vec3(0.040, 0.040, 0.040); // #0A0A0A

  float inkAmt = smoothstep(0.38, 0.58, f) * 0.18;

  // Velocity thickening: fluid thickens 30-40px/frame range
  float viscosity = clamp(u_velocity * 0.6, 0.0, 1.0);
  inkAmt += viscosity * 0.08;

  vec3 color = mix(base, ink, inkAmt);

  gl_FragColor = vec4(color, 1.0);
}
