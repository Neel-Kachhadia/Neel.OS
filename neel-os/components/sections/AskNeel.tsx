'use client';

import { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUERIES = [
  "How does NeuroFin's anomaly detection work?",
  "Why LangGraph over LangChain for the agent routing?",
  "What does the resolve shader represent technically?",
  "How did you reduce hallucinations in stock analysis?",
  "Why Rust for the market terminal core?",
  "How does the adaptive feedback loop work?",
  "What's the architecture behind the RAG pipeline?",
  "Why stateless processing for financial data?",
  "How does the risk scoring system validate outputs?",
  "What was the hardest engineering decision in NeuroFin?",
];

function getRandomSuggestions(n: number): string[] {
  const shuffled = [...SUGGESTED_QUERIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function AskNeel() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions] = useState(() => getRandomSuggestions(3));
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const submit = async (q: string) => {
    const text = q.trim();
    if (!text || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setResponse('');
    setError('');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        if (res.status === 429) {
          setError('rate limit — 10 queries per hour');
        } else if (res.status === 503) {
          setError('api not configured');
        } else {
          setError(err.error ?? 'system error');
        }
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        setError('connection failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(query);
    setQuery('');
  };

  return (
    <section
      id="query"
      style={{
        background: 'var(--black)',
        padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
        paddingRight: 'var(--section-pad-x)',
        minHeight: '80vh',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-mono-dark)',
          marginBottom: '8px',
        }}
      >
        NEEL.OS &nbsp;·&nbsp; QUERY INTERFACE &nbsp;·&nbsp;{' '}
        <span style={{ color: 'var(--online)' }}>ONLINE</span>
      </div>
      <div
        style={{
          borderBottom: '1px solid rgba(245,240,232,0.15)',
          marginBottom: '32px',
        }}
      />

      {/* Suggestions */}
      {!response && !loading && (
        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              data-cursor-hover
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-mono-dark)',
                opacity: 0.5,
                cursor: 'pointer',
                padding: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '1')}
              onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '0.5')}
            >
              → {s}
            </button>
          ))}
        </div>
      )}

      {/* Response */}
      {(response || loading || error) && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.7,
            color: error ? 'rgba(255,100,100,0.7)' : 'var(--text-on-black)',
            maxWidth: '720px',
            marginBottom: '32px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error
            ? `error: ${error}`
            : response + (loading ? '▊' : '')
          }
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-mono-dark)',
          borderBottom: '1px solid rgba(245,240,232,0.15)',
          paddingBottom: '8px',
          maxWidth: '720px',
        }}
      >
        <span>root@neel:~$</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="query the system..."
          aria-label="Ask Neel a question"
          disabled={loading}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-on-black)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: 'var(--text-on-black)',
            opacity: loading ? 0.5 : 1,
          }}
        />
      </form>
    </section>
  );
}
