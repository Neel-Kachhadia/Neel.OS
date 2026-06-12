# NEEL.OS

NEEL.OS is a Next.js 14 portfolio runtime for Neel Kachhadia. It renders the terminal shell, project worlds, recruiter view, and server-backed query/market APIs.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment

- `GROQ_API_KEY` powers `/api/query`.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` enable market-data cache persistence.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are accepted fallback names for the same KV cache.

## Checks

```bash
npm run build
npx tsc --noEmit
```
