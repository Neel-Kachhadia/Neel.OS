import { NextRequest, NextResponse } from 'next/server';
import { YAHOO_SYMBOLS } from '@/lib/companies';

interface CacheEntry {
  data: unknown;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function getCached(key: string, ttlMs: number): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) return null;
  return entry.data;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
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

  const cached = getCached(cacheKey, ttl);
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
    setCache(cacheKey, data);
    return NextResponse.json(data);
  } catch {
    const stale = getCached(cacheKey, Infinity);
    if (stale) return NextResponse.json({ ...(stale as object), stale: true });
    return NextResponse.json({ error: true, message: 'price unavailable', symbol }, { status: 503 });
  }
}

async function handleHistorical(symbol: string, yahooSymbol: string, range: string) {
  const cacheKey = `hist:${symbol}:${range}`;
  const ttl = range === '1d' ? 5 * 60 * 1000 : 30 * 60 * 1000;

  const cached = getCached(cacheKey, ttl);
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
    setCache(cacheKey, data);
    return NextResponse.json(data);
  } catch {
    const stale = getCached(cacheKey, Infinity);
    if (stale) return NextResponse.json({ ...(stale as object), stale: true });
    return NextResponse.json({ error: true, message: 'historical data unavailable', symbol }, { status: 503 });
  }
}
