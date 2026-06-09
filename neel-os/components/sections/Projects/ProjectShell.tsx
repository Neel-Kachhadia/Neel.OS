'use client';

import { useEffect, useRef, useState } from 'react';

interface ProjectShellProps {
  lines: string[];
  onComplete?: () => void;
}

export default function ProjectShell({ lines, onComplete }: ProjectShellProps) {
  const [shown, setShown] = useState<string[]>([]);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown([]);
    doneRef.current = false;
    let i = 0;
    const iv = setInterval(() => {
      if (i < lines.length) {
        const line = lines[i] ?? '';
        setShown(prev => [...prev, line]);
        i++;
      } else {
        clearInterval(iv);
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete?.();
        }
      }
    }, 160);
    return () => clearInterval(iv);
  }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: 1.6,
        color: 'var(--text-mono-dark)',
        whiteSpace: 'pre-wrap',
        margin: 0,
      }}
    >
      {shown.map((line, i) => {
        const safeLine = line ?? '';
        const isOk    = safeLine.includes('[OK]');
        const isWarn  = safeLine.includes('[WARN]') || safeLine.includes('[BUILDING]');
        return (
          <div
            key={i}
            style={{
              color: isOk ? 'var(--online)' : isWarn ? 'var(--amber)' : 'var(--text-mono-dark)',
              opacity: isOk ? 0.9 : 1,
            }}
          >
            {safeLine || ' '}
          </div>
        );
      })}
      {shown.length < lines.length && (
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '13px',
            background: 'var(--text-mono-dark)',
            verticalAlign: 'middle',
            animation: 'blink 1s step-end infinite',
          }}
        />
      )}
      <style>{`@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }`}</style>
    </pre>
  );
}
