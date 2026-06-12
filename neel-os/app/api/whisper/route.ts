import { NextRequest, NextResponse } from 'next/server';

interface Whisper {
  text: string;
  city: string;
  timestamp: number;
}

const MAX_WHISPERS = 30;
const MAX_CHARS = 40;

let memoryWhispers: Whisper[] = [
  { text: 'this system is alive', city: 'Mumbai', timestamp: Date.now() - 86400000 },
  { text: 'ships before i plan', city: 'Bangalore', timestamp: Date.now() - 43200000 },
  { text: 'the tear got me', city: 'Delhi', timestamp: Date.now() - 3600000 },
];

const postMap = new Map<string, number>();

async function getWhispers(): Promise<Whisper[]> {
  return memoryWhispers;
}

async function saveWhispers(whispers: Whisper[]): Promise<void> {
  memoryWhispers = whispers;
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

  const blocked = ['fuck', 'shit', 'ass', 'bitch', 'dick'];
  if (blocked.some(w => text.toLowerCase().includes(w))) {
    return NextResponse.json({ error: 'noted. cleaner next time.' }, { status: 400 });
  }

  const city = req.headers.get('x-vercel-ip-city') ?? 'somewhere';

  const whisper: Whisper = { text, city, timestamp: Date.now() };
  const existing = await getWhispers();
  const updated = [whisper, ...existing].slice(0, MAX_WHISPERS);
  await saveWhispers(updated);
  postMap.set(ip, Date.now());

  return NextResponse.json({ ok: true });
}
