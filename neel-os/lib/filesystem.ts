export interface FSNode {
  scrollTo: string;
  label: string;
}

export const FILESYSTEM: Record<string, FSNode> = {
  '/neel':                        { scrollTo: '#hero',         label: '~' },
  '/neel/identity':               { scrollTo: '#identity',     label: 'identity.md' },
  '/neel/projects':               { scrollTo: '#projects',     label: '/projects' },
  '/neel/projects/neurofin':      { scrollTo: '#neurofin',     label: 'neurofin' },
  '/neel/projects/equity':        { scrollTo: '#equity',       label: 'equity-research' },
  '/neel/projects/market':        { scrollTo: '#market',       label: 'market-terminal' },
  '/neel/stack':                  { scrollTo: '#stack',        label: '/stack' },
  '/neel/logs':                   { scrollTo: '#logs',         label: '/logs' },
  '/neel/capabilities':           { scrollTo: '#capabilities', label: '/capabilities' },
  '/neel/transmission':           { scrollTo: '#transmission', label: 'transmission' },
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
