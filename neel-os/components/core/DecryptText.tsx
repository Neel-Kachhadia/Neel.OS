'use client';

import { useEffect, useRef, useState } from 'react';
import { decrypt } from '@/lib/decrypt';

interface DecryptTextProps {
  text: string;
  trigger?: boolean; // re-run when this flips true
  soundEnabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function DecryptText({
  text,
  trigger = true,
  soundEnabled = false,
  style,
  className,
}: DecryptTextProps) {
  const [display, setDisplay] = useState(text);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!trigger || hasRun.current) return;
    hasRun.current = true;
    decrypt(text, setDisplay, undefined, soundEnabled);
  }, [trigger, text, soundEnabled]);

  return (
    <span style={style} className={className}>
      {display}
    </span>
  );
}
