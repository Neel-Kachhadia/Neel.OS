import { NextRequest, NextResponse } from 'next/server';
import { YAHOO_SYMBOLS } from '@/lib/companies';

interface CacheEntry {
  data: unknown;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function getVercelKvCache(key: string): Promise<CacheEntry | null> {
  const config = getKvConfig();
  if (!config) return null;
  try {
    const res = await fetch(`${config.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${config.token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.result) return null;
    return JSON.parse(json.result) as CacheEntry;
  } catch {
    return null;
  }
}

async function setVercelKvCache(key: string, entry: CacheEntry, ttlMs: number) {
  const config = getKvConfig();
  if (!config) return;
  try {
    const seconds = Math.max(30, Math.ceil(ttlMs / 1000));
    await fetch(`${config.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(entry))}?EX=${seconds}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // Local memory cache remains authoritative when KV is unavailable.
  }
}

async function getCached(key: string, ttlMs: number): Promise<unknown | null> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts <= ttlMs) return entry.data;

  const kvEntry = await getVercelKvCache(key);
  if (!kvEntry) return null;
  cache.set(key, kvEntry);
  if (Date.now() - kvEntry.ts > ttlMs) return null;
  return kvEntry.data;
}

async function setCache(key: string, data: unknown, ttlMs: number) {
  const entry = { data, ts: Date.now() };
  cache.set(key, entry);
  await setVercelKvCache(key, entry, ttlMs);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: true, message: 'rate limit — 30 req/min' }, { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get('symbol')?.toUpperCase();
  const type = searchParams.get('type') ?? 'quote';
  const range = searchParams.get('range') ?? '1d';

  if (!symbol || !YAHOO_SYMBOLS[symbol]) {
    return NextResponse.json({ error: true, message: 'unknown symbol' }, { status: 400 });
  }

  const yahooSymbol = YAHOO_SYMBOLS[symbol];

  if (type === 'historical') {
    return handleHistorical(symbol, yahooSymbol, range);
  }

  return handleQuote(symbol, yahooSymbol);
}

async function handleQuote(symbol: string, yahooSymbol: string) {
  const cacheKey = `quote:${symbol}`;
  const ttl = 15 * 60 * 1000;

  const cached = await getCached(cacheKey, ttl);
  if (cached) return NextResponse.json(cached);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('no meta in response');

    const price = meta.regularMarketPrice ?? meta.previousClose;
    const previousClose = meta.previousClose ?? meta.chartPreviousClose;
    const change = price - previousClose;
    const changePct = previousClose ? (change / previousClose) * 100 : 0;
    const volume = meta.regularMarketVolume ?? 0;

    const data = { symbol, price, previousClose, change, changePct, volume, stale: false };
    await setCache(cacheKey, data, ttl);
    return NextResponse.json(data);
  } catch {
    const stale = await getCached(cacheKey, Infinity);
    if (stale) return NextResponse.json({ ...(stale as object), stale: true });
    return NextResponse.json({ error: true, message: 'price unavailable', symbol }, { status: 503 });
  }
}

async function handleHistorical(symbol: string, yahooSymbol: string, range: string) {
  const cacheKey = `hist:${symbol}:${range}`;
  const ttl = range === '1d' ? 5 * 60 * 1000 : 30 * 60 * 1000;

  const cached = await getCached(cacheKey, ttl);
  if (cached) return NextResponse.json(cached);

  const intervalMap: Record<string, string> = {
    '1d': '5m', '5d': '15m', '1mo': '1d', '3mo': '1d',
  };
  const interval = intervalMap[range] ?? '1d';

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Yahoo returned ${res.status}`);

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error('no result');

    const timestamps: number[] = result.timestamp ?? [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
    const opens: (number | null)[] = result.indicators?.quote?.[0]?.open ?? [];
    const highs: (number | null)[] = result.indicators?.quote?.[0]?.high ?? [];
    const lows: (number | null)[] = result.indicators?.quote?.[0]?.low ?? [];
    const volumes: (number | null)[] = result.indicators?.quote?.[0]?.volume ?? [];

    const points = timestamps
      .map((ts, i) => ({
        time: ts * 1000,
        close: closes[i],
        open: opens[i],
        high: highs[i],
        low: lows[i],
        volume: volumes[i],
      }))
      .filter(p => p.close != null);

    const data = { symbol, range, points };
    await setCache(cacheKey, data, ttl);
    return NextResponse.json(data);
  } catch {
    const stale = await getCached(cacheKey, Infinity);
    if (stale) return NextResponse.json({ ...(stale as object), stale: true });
    return NextResponse.json({ error: true, message: 'historical data unavailable', symbol }, { status: 503 });
  }
}
