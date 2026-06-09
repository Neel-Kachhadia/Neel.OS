precision highp float;

uniform float u_progress;  // 0→1 over 1.0s
uniform vec2  u_origin;    // (0.60, 0.45)
uniform float u_seed;

varying vec2 vUv;

// Voronoi distance
float voronoi(vec2 p, float seed) {
  vec2 cell = floor(p);
  vec2 frac = fract(p);
  float minDist = 8.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = fract(sin(
        (cell + neighbor + seed * 7.3) * mat2(127.1, 311.7, 269.5, 183.3)
      ) * 43758.5453);
      point = 0.5 + 0.5 * sin(seed + 6.2831 * point);
      vec2 diff = neighbor + point - frac;
      float d = length(diff);
      minDist = min(minDist, d);
    }
  }
  return minDist;
}

void main() {
  vec2 uv = vUv;

  // Aspect-corrected distance from origin
  float aspect = 16.0 / 9.0;
  vec2 offset = uv - u_origin;
  offset.x *= aspect;
  float dist = length(offset);

  // Pass 1 (0-0.4): crack propagates outward
  float crackFront = u_progress * 2.5; // front travels fast
  float crack = voronoi(uv * 8.0 + u_seed * 3.1, u_seed);
  float crackEdge = smoothstep(crackFront + 0.05, crackFront - 0.05, dist + crack * 0.3);

  // Pass 2 (0.4-1.0): fragments fall
  float fallProgress = smoothstep(0.4, 1.0, u_progress);
  float fragGravity = fallProgress * 0.08 * (0.5 + crack);

  // Fragment displacement
  vec2 fragOffset = vec2(
    (fract(uv.x * 12.0 + u_seed) - 0.5) * fallProgress * 0.02,
    fragGravity
  );

  // Surface alpha: tears away as progress advances
  float surfaceAlpha = 1.0 - crackEdge * fallProgress;
  surfaceAlpha = clamp(surfaceAlpha, 0.0, 1.0);

  // Crack edge highlight
  float edgeGlow = smoothstep(0.0, 0.08, crack) * crackEdge * (1.0 - fallProgress);

  vec3 surface = vec3(0.961, 0.941, 0.910); // off-white
  vec3 edge    = vec3(1.0, 1.0, 1.0);

  vec3 color = mix(surface, edge, edgeGlow * 0.4);

  gl_FragColor = vec4(color, surfaceAlpha);
}
