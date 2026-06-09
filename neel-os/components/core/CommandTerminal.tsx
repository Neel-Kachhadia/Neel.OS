'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { parseCommand } from '@/lib/commands';
import { FILESYSTEM } from '@/lib/filesystem';
import { getLenis } from '@/lib/lenis';
import { updateSession } from '@/lib/session';
import { Mode } from '@/hooks/useMode';

interface CommandTerminalProps {
  onNavigate: (path: string) => void;
  onModeChange: (m: Mode) => void;
  currentPath: string;
}

interface HistoryEntry {
  input?: string;
  lines: string[];
}

export default function CommandTerminal({ onNavigate, onModeChange, currentPath }: CommandTerminalProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('neel_os_session');
      const s = raw ? JSON.parse(raw) : null;
      return Array.isArray(s?.commandHistory) ? s.commandHistory : [];
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const openTerminal = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !open && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        openTerminal();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) setOpen(false);
        else openTerminal();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, openTerminal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const execute = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const result = parseCommand(trimmed, currentPath);

    // Add to command history
    const newCmdHistory = [trimmed, ...cmdHistory].slice(0, 50);
    setCmdHistory(newCmdHistory);
    updateSession({ commandHistory: newCmdHistory });
    setHistIdx(-1);

    setHistory(prev => [
      ...prev,
      { input: `root@neel:${currentPath}$ ${trimmed}`, lines: result.lines },
    ]);

    // Handle actions
    if (result.action === 'navigate' && result.actionArg) {
      const node = FILESYSTEM[result.actionArg];
      if (node) {
        onNavigate(result.actionArg);
        const el = document.querySelector(node.scrollTo);
        if (el) getLenis()?.scrollTo(el as HTMLElement, { duration: 1.2 });
      }
    } else if (result.action === 'open' && result.actionArg) {
      window.open(result.actionArg, '_blank', 'noopener');
    } else if (result.action === 'mode' && result.actionArg) {
      onModeChange(result.actionArg as Mode);
    } else if (result.action === 'clear') {
      setHistory([]);
      return;
    } else if (result.action === 'hire') {
      // sudo hire-neel: render lines one by one then navigate
      let i = 0;
      const interval = setInterval(() => {
        if (i < result.lines.length) {
          setHistory(prev => {
            const last = prev[prev.length - 1];
            if (last?.input?.includes('sudo')) {
              return [...prev.slice(0, -1), { ...last, lines: result.lines.slice(0, i + 1) }];
            }
            return prev;
          });
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onNavigate('/neel/transmission');
            const node = FILESYSTEM['/neel/transmission'];
            if (node) {
              const el = document.querySelector(node.scrollTo);
              if (el) getLenis()?.scrollTo(el as HTMLElement, { duration: 1.2 });
            }
            setOpen(false);
          }, 500);
        }
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : cmdHistory[next]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion
      const paths = Object.keys(FILESYSTEM);
      const match = paths.find(p => p.startsWith(input.replace(/^cd\s+/, '/neel/')));
      if (match) setInput(`cd ${match}`);
    }
  };

  if (!open) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--text-on-black)',
          opacity: 0.3,
          pointerEvents: 'none',
          letterSpacing: '0.1em',
        }}
      >
        press / to open terminal
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(10,10,10,0.92)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'clamp(24px,5vw,80px)',
        paddingLeft: 'calc(200px + clamp(24px,5vw,80px))',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      {/* History */}
      <div
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {history.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text-on-black)',
                  opacity: 0.6,
                }}
              >
                {entry.input}
              </div>
            )}
            {entry.lines.map((line, j) => (
              <CommandLine key={j} line={line} />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          color: 'var(--text-on-black)',
          borderTop: '1px solid rgba(245,240,232,0.1)',
          paddingTop: '12px',
        }}
      >
        <span style={{ opacity: 0.5 }}>root@neel:{currentPath}$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Command input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-on-black)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: 'var(--text-on-black)',
          }}
        />
        <span
          style={{ opacity: 0.3, fontSize: '11px', cursor: 'pointer' }}
          onClick={() => setOpen(false)}
        >
          [esc]
        </span>
      </div>
    </div>
  );
}

function CommandLine({ line }: { line: string }) {
  const safeLine = line ?? '';

  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: 1.6,
        color: safeLine.includes('[OK]') ? 'var(--online)' :
          safeLine.includes('[WARN]') || safeLine.includes('[BUILDING]') ? 'var(--amber)' :
          safeLine.includes('[FAIL]') ? 'rgba(255,100,100,0.8)' :
          safeLine.includes('[FIX]') ? 'var(--online)' :
          'var(--text-mono-dark)',
      }}
    >
      {safeLine || ' '}
    </div>
  );
}
