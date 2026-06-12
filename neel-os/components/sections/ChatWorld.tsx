'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const BG = '#0A0A0A';
const FG = '#F5F0E8';
const GREEN = '#4AFF91';
const MONO = 'var(--font-mono)';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWorldProps {
  onExit: () => void;
  soundEnabled?: boolean;
}

const BOOT_LINES = [
  'Connecting to NEEL.OS query interface...  [OK]',
  'Loading context: identity, projects, stack...  [OK]',
  'Streaming via Groq (llama-3.3-70b)...  [OK]',
  '',
  'NEEL.OS is ready. Ask me anything.',
  '',
  'Suggested:',
  '  > Tell me about NeuroFin',
  '  > What stack does Neel use?',
  '  > How does the equity research platform work?',
  '  > What is Neel working on right now?',
];

export default function ChatWorld({ onExit }: ChatWorldProps) {
  const [mounted, setMounted] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  messagesRef.current = messages;

  // Mounted guard — first effect
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      abortRef.current?.abort();
    };
  }, []);

  // Boot sequence — fires once mounted becomes true
  useEffect(() => {
    if (!mounted) return;
    setBootLines([]);
    setBootDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i]; // capture by value — React 18 batches interval callbacks
        setBootLines(prev => [...prev, line]);
        i++;
      } else {
        clearInterval(id);
        setBootDone(true);
      }
    }, 80);
    return () => clearInterval(id);
  }, [mounted]);

  useEffect(() => {
    if (bootDone) inputRef.current?.focus();
  }, [bootDone]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bootLines, messages, streamingText]);

  // Escape to exit
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        abortRef.current?.abort();
        onExit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mounted, onExit]);

  const runBoot = useCallback(() => {
    setBootLines([]);
    setBootDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i]; // capture by value — React 18 batches interval callbacks
        setBootLines(prev => [...prev, line]);
        i++;
      } else {
        clearInterval(id);
        setBootDone(true);
      }
    }, 80);
    return () => clearInterval(id);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const lower = trimmed.toLowerCase();
    if (lower === 'exit' || lower === 'back') {
      abortRef.current?.abort();
      onExit();
      return;
    }
    if (lower === 'clear') { setMessages([]); runBoot(); return; }

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const history = messagesRef.current.slice(-18);
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    setStreamingText('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.status === 503 ? 'API not configured — GROQ_API_KEY missing.' : 'Query failed. Try again.',
        }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingText(full);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: full }]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      abortRef.current = null;
      setStreaming(false);
      setStreamingText('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [streaming, onExit, runBoot]);

  // SSR guard — after all hooks
  if (!mounted) return null;

  return (
    <section
      id="chat"
      style={{
        background: BG,
        height: '100vh',
        color: FG,
        fontFamily: MONO,
        padding: '80px 48px 0 calc(200px + 48px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          fontSize: '13px',
          letterSpacing: '0.08em',
          color: FG,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '960px',
        }}>
          <span>NEEL.OS  ·  CHAT INTERFACE  ·  <span style={{ color: GREEN }}>ONLINE ●</span></span>
          <button
            onClick={() => { abortRef.current?.abort(); onExit(); }}
            data-cursor-hover
            style={{
              background: 'none',
              border: 'none',
              color: FG,
              fontFamily: MONO,
              fontSize: '12px',
              cursor: 'pointer',
              opacity: 0.5,
              padding: 0,
              letterSpacing: '0.05em',
            }}
          >
            ← exit chat
          </button>
        </div>
        <div style={{ color: 'rgba(148,163,184,0.3)', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '8px' }}>
          {'━'.repeat(120)}
        </div>
      </div>

      {/* Scrollable history */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '20px',
          paddingBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {bootLines.map((line, i) => (
          <div key={`boot-${i}`} style={{ fontSize: '13px', lineHeight: 1.7 }}>
            {line === '' ? <div style={{ height: '8px' }} /> : <BootLine text={line} />}
          </div>
        ))}

        {messages.map((msg, i) => (
          <div key={`msg-${i}`} style={{ marginTop: '8px' }}>
            {msg.role === 'user' ? (
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: FG }}>
                root@neel:~/chat $ {msg.content}
              </div>
            ) : (
              <div
                style={{
                  fontSize: '13px',
                  lineHeight: 1.6,
                  marginTop: '4px',
                  animation: 'chatMsgIn 0.22s ease-out both',
                }}
              >
                <span style={{ color: GREEN }}>NEEL.OS</span>
                {'  '}
                <span style={{ opacity: 0.85 }}>{msg.content}</span>
              </div>
            )}
          </div>
        ))}

        {streaming && (
          <div style={{ fontSize: '13px', lineHeight: 1.6, marginTop: '8px' }}>
            <span style={{ color: GREEN }}>NEEL.OS</span>
            {'  '}
            {!streamingText ? (
              <span style={{ opacity: 0.5 }}>
                <span style={{ display: 'inline-block', animation: 'chatDot 1.2s 0.0s ease-in-out infinite' }}>●</span>
                <span style={{ display: 'inline-block', animation: 'chatDot 1.2s 0.2s ease-in-out infinite', marginLeft: '5px' }}>●</span>
                <span style={{ display: 'inline-block', animation: 'chatDot 1.2s 0.4s ease-in-out infinite', marginLeft: '5px' }}>●</span>
              </span>
            ) : (
              <span>
                {streamingText.split(/(\s+)/).map((chunk, i) => (
                  <span
                    key={i}
                    style={{ animation: 'chatWordIn 0.14s ease-out both', opacity: 0.85 }}
                  >
                    {chunk}
                  </span>
                ))}
                <span style={{ color: GREEN, animation: 'chatCursorBlink 0.7s step-end infinite' }}>▋</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Separator + input */}
      <div style={{ flexShrink: 0, paddingBottom: '24px' }}>
        <div style={{ color: 'rgba(148,163,184,0.2)', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '12px' }}>
          {'─'.repeat(80)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: FG }}>
          <span style={{ opacity: 0.7, whiteSpace: 'nowrap' }}>root@neel:~/chat $</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              const val = input;
              setInput('');
              sendMessage(val);
            }}
            disabled={!bootDone}
            aria-label="Chat input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: FG,
              fontFamily: MONO,
              fontSize: '13px',
              caretColor: GREEN,
            }}
          />
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.3, display: 'flex', justifyContent: 'space-between', letterSpacing: '0.05em' }}>
          <span>type &apos;exit&apos; or &apos;clear&apos; to reset</span>
          <span>[esc] to exit</span>
        </div>
      </div>
      <style>{`
        @keyframes chatCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes chatWordIn {
          from { opacity: 0; }
          to { opacity: 0.85; }
        }
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.15; }
          40% { opacity: 0.85; }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function BootLine({ text }: { text: string }) {
  const safe = text ?? '';
  const okIdx = safe.indexOf('[OK]');
  if (okIdx !== -1) {
    return (
      <span>
        <span style={{ color: FG, opacity: 0.6 }}>{safe.slice(0, okIdx)}</span>
        <span style={{ color: GREEN }}>[OK]</span>
        {safe.slice(okIdx + 4)}
      </span>
    );
  }
  return <span style={{ opacity: 0.75 }}>{safe}</span>;
}
