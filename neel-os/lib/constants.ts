export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export const GEO_CACHE_CONTROL = 'public, s-maxage=3600';
export const MARKET_DATA_CACHE_CONTROL = 'public, s-maxage=900, stale-while-revalidate=1800';

export const QUERY_STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
} as const;
