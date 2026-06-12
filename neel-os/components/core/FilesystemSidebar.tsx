'use client';

import { FILESYSTEM } from '@/lib/filesystem';

interface FilesystemSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface TreeItem {
  path: string;
  display: string;
  indent: number;
  isDir: boolean;
  status?: string;
}

const TREE_ITEMS: TreeItem[] = [
  { path: '/neel', display: '/neel', indent: 0, isDir: true },
  { path: '/neel', display: '├── README.md', indent: 1, isDir: false },
  { path: '/neel/identity', display: '├── identity.md', indent: 1, isDir: false },
  { path: '/neel/projects', display: '├── /projects', indent: 1, isDir: true },
  { path: '/neel/projects/neurofin', display: '│   ├── neurofin', indent: 2, isDir: false, status: '[DEPLOYED ●]' },
  { path: '/neel/projects/equity', display: '│   ├── equity-research', indent: 2, isDir: false, status: '[DEPLOYED ●]' },
  { path: '/neel/projects/market', display: '│   └── market-terminal', indent: 2, isDir: false, status: '[BUILDING ◌]' },
  { path: '/neel/stack', display: '├── /stack', indent: 1, isDir: true },
  { path: '/neel/logs', display: '├── /logs', indent: 1, isDir: true },
  { path: '/neel/transmission', display: '└── transmission', indent: 1, isDir: false },
];

export default function FilesystemSidebar({ currentPath, onNavigate }: FilesystemSidebarProps) {
  const navigate = (path: string) => {
    if (!FILESYSTEM[path]) return;
    onNavigate(path);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '200px',
        height: '100vh',
        paddingTop: '80px',
        paddingLeft: '20px',
        zIndex: 20,
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        lineHeight: '1.8',
        color: 'var(--text-on-black)',
        overflowY: 'auto',
        pointerEvents: 'auto',
      }}
    >
      {TREE_ITEMS.map((item, i) => {
        const isActive = currentPath === item.path;
        const hasTarget = FILESYSTEM[item.path] !== undefined;

        return (
          <div
            key={i}
            onClick={() => hasTarget && navigate(item.path)}
            data-cursor-hover={hasTarget ? true : undefined}
            style={{
              opacity: isActive ? 1 : 0.4,
              cursor: hasTarget ? 'pointer' : 'default',
              color: isActive ? 'var(--online)' : 'inherit',
              whiteSpace: 'nowrap',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { if (hasTarget) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = isActive ? '1' : '0.4'; }}
          >
            <span>{item.display}</span>
            {item.status && (
              <span style={{ opacity: 0.7, color: item.status.includes('●') ? 'var(--online)' : 'inherit' }}>
                {item.status}
              </span>
            )}
            {isActive && <span style={{ color: 'var(--online)' }}>●</span>}
          </div>
        );
      })}
    </div>
  );
}
