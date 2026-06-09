import { NextRequest, NextResponse } from 'next/server';

// In-memory whispers for dev — swap to Vercel KV in production
// KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN in .env.local

interface Whisper {
  text: string;
  city: string;
  timestamp: number;
}

const WHISPERS_KEY = 'neel_os_whispers';
const MAX_WHISPERS = 30;
const MAX_CHARS = 40;

// In-memory fallback (resets on restart — use Vercel KV for persistence)
let memoryWhispers: Whisper[] = [
  { text: 'this system is alive', city: 'Mumbai', timestamp: Date.now() - 86400000 },
  { text: 'ships before i plan', city: 'Bangalore', timestamp: Date.now() - 43200000 },
  { text: 'the tear got me', city: 'Delhi', timestamp: Date.now() - 3600000 },
];

// Rate limit: 1 per IP per 24h
const postMap = new Map<string, number>();

async function getWhispers(): Promise<Whisper[]> {
  // Vercel KV: install @vercel/kv and uncomment to enable persistence
  // if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  //   const { kv } = await import('@vercel/kv');
  //   const stored = await kv.get(WHISPERS_KEY) as Whisper[] | null;
  //   return stored ?? memoryWhispers;
  // }
  return memoryWhispers;
}

async function saveWhispers(whispers: Whisper[]): Promise<void> {
  memoryWhispers = whispers;
  // Vercel KV: install @vercel/kv and uncomment to enable persistence
  // if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  //   const { kv } = await import('@vercel/kv');
  //   await kv.set(WHISPERS_KEY, whispers);
  // }
}

export async function GET() {
  const whispers = await getWhispers();
  return NextResponse.json(whispers);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  const lastPost = postMap.get(ip);
  if (lastPost && Date.now() - lastPost < 86400000) {
    return NextResponse.json({ error: 'one whisper per day' }, { status: 429 });
  }

  let text: string;
  try {
    const body = await req.json();
    text = String(body.text ?? '').slice(0, MAX_CHARS).trim();
    if (!text) throw new Error('empty');
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Basic profanity filter — expand as needed
  const blocked = ['fuck', 'shit', 'ass', 'bitch', 'dick'];
  if (blocked.some(w => text.toLowerCase().includes(w))) {
    return NextResponse.json({ error: 'noted. cleaner next time.' }, { status: 400 });
  }

  // Approximate city from headers
  const city = req.headers.get('x-vercel-ip-city') ?? 'somewhere';

  const whisper: Whisper = { text, city, timestamp: Date.now() };
  const existing = await getWhispers();
  const updated = [whisper, ...existing].slice(0, MAX_WHISPERS);
  await saveWhispers(updated);
  postMap.set(ip, Date.now());

  return NextResponse.json({ ok: true });
}
