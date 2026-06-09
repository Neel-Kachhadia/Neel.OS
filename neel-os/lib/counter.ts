const BASE = 3847392;
const sessionStart = Date.now();

export function getCount(): number {
  const elapsed = (Date.now() - sessionStart) / 1000;
  const avgRate = 0.4;
  const noise =
    Math.sin(elapsed * 0.7) * 0.3 +
    Math.sin(elapsed * 1.3) * 0.2;
  return Math.floor(BASE + elapsed * avgRate * (1 + noise));
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatTimeAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
