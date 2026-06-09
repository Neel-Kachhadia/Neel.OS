'use client';

import { usePathname } from 'next/navigation';

export default function PathDisplay() {
  const path = usePathname();
  return (
    <span style={{ color: 'rgba(255,100,100,0.7)' }}>
      {path}
    </span>
  );
}
