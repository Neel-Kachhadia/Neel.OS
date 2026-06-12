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
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  // Boot sequence — 80ms stagger
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(id);
        setBootDone(true);
      }
    }, 80);
    return () => clearInterval(id);
  }, []);

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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  const runBoot = useCallback(() => {
    setBootLines([]);
    setBootDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(id);
        setBootDone(true);
      }
    }, 80);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const lower = trimmed.toLowerCase();
    if (lower === 'exit' || lower === 'back') { onExit(); return; }
    if (lower === 'clear') { setMessages([]); runBoot(); return; }

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const history = messagesRef.current.slice(-18);
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, history }),
      });

      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.status === 503 ? 'API not configured — GROQ_API_KEY missing.' : 'Query failed. Try again.',
        }]);
        setStreaming(false);
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
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setStreaming(false);
      setStreamingText('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [streaming, onExit, runBoot]);

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
            onClick={onExit}
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
              <div style={{ fontSize: '13px', lineHeight: 1.6, marginTop: '4px' }}>
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
            <span style={{ opacity: 0.85 }}>{streamingText}</span>
            <span style={{ color: GREEN }}>▋</span>
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
          <span>← exit chat</span>
          <span>[esc] to exit</span>
        </div>
      </div>
    </section>
  );
}

function BootLine({ text }: { text: string }) {
  const okIdx = text.indexOf('[OK]');
  if (okIdx !== -1) {
    return (
      <span>
        <span style={{ color: FG, opacity: 0.6 }}>{text.slice(0, okIdx)}</span>
        <span style={{ color: GREEN }}>[OK]</span>
        {text.slice(okIdx + 4)}
      </span>
    );
  }
  return <span style={{ opacity: 0.75 }}>{text}</span>;
}
