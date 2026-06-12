'use client';

import { useEffect, useRef, useState } from 'react';

export type UptimeFormatter = (elapsedMs: number) => string;

export function formatClockUptime(elapsedMs: number): string {
  const s = Math.floor(elapsedMs / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

export function formatDayHourMinuteUptime(elapsedMs: number): string {
  const s = Math.floor(elapsedMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ${m % 60}m`;
}

export function useUptime(
  formatter: UptimeFormatter = formatClockUptime,
  intervalMs = 1000
): string {
  const start = useRef(Date.now());
  const [uptime, setUptime] = useState(() => formatter(0));

  useEffect(() => {
    const id = setInterval(() => {
      setUptime(formatter(Date.now() - start.current));
    }, intervalMs);
    return () => clearInterval(id);
  }, [formatter, intervalMs]);

  return uptime;
}
