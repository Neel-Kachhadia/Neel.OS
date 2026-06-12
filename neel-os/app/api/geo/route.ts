import { NextRequest, NextResponse } from 'next/server';
import TAX_SYSTEMS from '@/lib/taxData';
import { GEO_CACHE_CONTROL } from '@/lib/constants';

interface GeoCacheEntry { country: string; ts: number }

const geoCache = new Map<string, GeoCacheEntry>();
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const VALID_KEYS = new Set(Object.keys(TAX_SYSTEMS));
const TTL = 3_600_000; // 1 hour
const CACHE_HEADERS = { 'Cache-Control': GEO_CACHE_CONTROL, Vary: 'x-forwarded-for' };

function geoJson(country: string): NextResponse {
  return NextResponse.json({ country }, { headers: CACHE_HEADERS });
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + TTL });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return geoJson('IN');
  }

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < TTL) {
    return geoJson(cached.country);
  }

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error('geo fetch failed');
    const data = await res.json();
    const code = String(data.country_code ?? '').toUpperCase();
    const country = VALID_KEYS.has(code) ? code : 'IN';
    geoCache.set(ip, { country, ts: Date.now() });
    return geoJson(country);
  } catch {
    return geoJson('IN');
  }
}
