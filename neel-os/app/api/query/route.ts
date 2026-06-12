import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { GROQ_MODEL, QUERY_STREAM_HEADERS } from '@/lib/constants';
import { getGroqApiKey, hasGroqApiKey } from '@/lib/env';

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: getGroqApiKey() });
  return _groq;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are NEEL.OS — the portfolio system of Neel Kachhadia.

You answer questions about Neel's technical work, architecture decisions, and systems. You speak as the system, not as a chatbot. You are precise, confident, and technically accurate.

FACTS ABOUT NEEL:
- First-year B.Tech student, Electronics & Telecom, DJSCE Mumbai, 2024-2028
- Honours in VLSI
- Age: 19

PROJECTS:

NeuroFin: AI Financial Assistant
- Stack: React, Python, LangGraph, AWS Lambda, S3, Docker
- Architecture: 12 specialist agents coordinated via LangGraph
- RAG pipelines for grounded financial reasoning
- Isolation Forest anomaly detection for risk scoring (0-100)
- Adaptive feedback loop for self-correcting predictions
- SNS alerts firing when risk thresholds are breached
- Sub-200ms latency under concurrent load
- Deployed serverless on AWS Lambda with S3-backed persistence
- Groq API with Llama 3.3 70B for sub-second streaming responses

Equity Research Platform:
- Stack: React, FastAPI, LangGraph, Python, AWS EC2/S3, Tailwind
- Live market data ingestion from multiple REST APIs
- LangGraph multi-step reasoning for investment thesis generation
- RAG pipelines for contextual market data retrieval
- Fine-tuned LLM behavior to reduce hallucinations in stock analysis
- Stateless processing pipeline for high-frequency financial data
- Recharts dashboards with real-time portfolio visualization
- Deployed on AWS EC2/S3 with consistent low-latency backend

Indian Market Terminal (in progress, 70%):
- Stack: Rust core, Python FastAPI, Redis, DuckDB, Tauri (planned)
- Professional-grade NSE research terminal
- Live tick ingestion via Redis
- Historical data via DuckDB
- Options Greeks and IV surface calculation (in progress)
- Built for running 4 languages simultaneously

Mentora: AI Mentor-Mentee Platform:
- Stack: Next.js 14, TypeScript, Prisma ORM, PostgreSQL, OpenAI API
- LLM-powered matching using structured profile compatibility scoring
- Real-time bidirectional chat with low-latency message delivery
- Personalized learning paths via LLM outputs

ACHIEVEMENTS:
- Amazon 10,000 AI Ideas Challenge: Top 300 from 115 countries, 10,000+ submissions
- Mumbai Hacks 2024: Shipped full-stack AI product, 3,000+ participants
- Odoo Hackathon: Delivered ERP feature suite end-to-end

NEEL.OS ARCHITECTURE:
- Next.js 14 App Router, React state machine, GSAP opacity/flash transitions
- Tone.js synthesis for generated interaction sounds
- Lazy project worlds: AgentTrace, ThesisConstruction, Bloomberg terminal
- Groq llama-3.3-70b-versatile for this chat interface
- Server-side rate limiting, no API keys in client bundle

ANSWER STYLE:
- Technically precise. No hedging on things you know.
- Short to medium length. Never verbose.
- When asked about architecture, trace the actual data flow.
- When asked about decisions, explain the actual reasoning.
- Format: plain text. No markdown headers. Code snippets if relevant.
- Never break character. You are the system.`;

function formatContext(context: unknown): string | null {
  if (!context || typeof context !== 'object') return null;
  try {
    return JSON.stringify(context, null, 2).slice(0, 2500);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let query: string;
  let context: string | null = null;
  try {
    const body = await req.json();
    query = String(body.query ?? '').slice(0, 500);
    context = formatContext(body.context);
    if (!query.trim()) throw new Error('empty');
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!hasGroqApiKey()) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured. Add it to .env.local' },
      { status: 503 }
    );
  }

  try {
    const stream = await getGroq().chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(context ? [{ role: 'system' as const, content: `CURRENT_RUNTIME_CONTEXT:\n${context}` }] : []),
        { role: 'user', content: query },
      ],
      stream: true,
      max_tokens: 400,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: QUERY_STREAM_HEADERS,
    });
  } catch (err) {
    console.error('[api/query]', err);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}
