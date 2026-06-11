export interface FSNode {
  target: string;
  label: string;
}

export const FILESYSTEM: Record<string, FSNode> = {
  '/neel':                        { target: '#hero',         label: '~' },
  '/neel/identity':               { target: '#identity',     label: 'identity.md' },
  '/neel/projects':               { target: '#projects',     label: '/projects' },
  '/neel/projects/neurofin':      { target: '#neurofin',     label: 'neurofin' },
  '/neel/projects/equity':        { target: '#equity',       label: 'equity-research' },
  '/neel/projects/market':        { target: '#market',       label: 'market-terminal' },
  '/neel/stack':                  { target: '#stack',        label: '/stack' },
  '/neel/logs':                   { target: '#logs',         label: '/logs' },
  '/neel/capabilities':           { target: '#capabilities', label: '/capabilities' },
  '/neel/transmission':           { target: '#transmission', label: 'transmission' },
};

export const FILESYSTEM_TREE = `
/neel
├── README.md
├── identity.md
├── /projects
│   ├── neurofin           [DEPLOYED ●]
│   ├── equity-research    [DEPLOYED ●]
│   └── market-terminal    [BUILDING ◌ 70%]
├── /stack
│   └── packages.json
├── /logs
│   ├── growth.log
│   ├── failures.log
│   └── shipping.log
├── /performance
│   └── budget.md
└── transmission
`.trim();
