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
        setShown(prev => [...prev, lines[i]]);
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
        const isOk    = line.includes('[OK]');
        const isWarn  = line.includes('[WARN]') || line.includes('[BUILDING]');
        const isInit  = line.startsWith('[INIT]');
        return (
          <div
            key={i}
            style={{
              color: isOk ? 'var(--online)' : isWarn ? 'var(--amber)' : 'var(--text-mono-dark)',
              opacity: isOk ? 0.9 : 1,
            }}
          >
            {line || ' '}
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
