import { FILESYSTEM } from './filesystem';

export interface CommandResult {
  lines: string[];
  action?: 'navigate' | 'open' | 'mode' | 'clear' | 'hire';
  actionArg?: string;
}

const GIT_LOGS: Record<string, string[]> = {
  neurofin: [
    'commit e9b3f07  reduced hallucination rate — LLM fine-tuning',
    'commit d44e221  deployed to AWS Lambda + S3 persistence',
    'commit c8f1a33  added Isolation Forest anomaly detection',
    'commit b12d445  integrated LangGraph multi-agent routing',
    'commit a9f2b11  built adaptive feedback loop',
    'commit 8c3d290  RAG pipeline for financial context retrieval',
    'commit 7a1f445  initial FastAPI microservice scaffold',
  ],
  'equity-research': [
    'commit f3c8a21  deployed on AWS EC2 with load balancing',
    'commit e1b9d33  Recharts dashboard with real-time data',
    'commit d07f2a4  fine-tuned LLM — reduced stock analysis drift',
    'commit c44b891  RAG pipeline for contextual market retrieval',
    'commit b2f3c11  multi-step LangGraph reasoning workflows',
    'commit a8e1d55  live market data ingestion from REST APIs',
    'commit 9d2b440  FastAPI microservice architecture',
  ],
  'market-terminal': [
    'commit d3f9a22  Redis tick ingestion pipeline active',
    'commit c1b8e44  DuckDB schema for historical data',
    'commit b44a991  FastAPI layer connecting Rust core',
    'commit a9f3b11  Rust core — initial architecture',
    'commit 8c2d330  system design and schema definition',
  ],
};

const NPM_INSPECT: Record<string, string[]> = {
  three: [
    'three · 0.160.0',
    '────────────────────────────────────',
    'Used in:',
    '  → NEEL.OS hero fluid simulation',
    '  → NEEL.OS state transition rendering',
    '  → Project world shader rendering (3 scenes)',
    '  → Contact section displacement ripple',
    'Why:',
    '  Single WebGL context shared across all scenes.',
    '  Custom GLSL shaders require low-level access.',
    '  State machine transitions keep rAF work isolated.',
    '  Project worlds lazy-load only when entered.',
  ],
  langgraph: [
    'langgraph · 0.1.0',
    '────────────────────────────────────',
    'Used in:',
    '  → NeuroFin: 12-specialist agent routing',
    '  → NeuroFin: adaptive feedback loop',
    '  → Equity Research: multi-step reasoning chain',
    'Why:',
    '  Graph-based agent coordination over linear chains.',
    '  Enables conditional routing between specialist agents.',
    '  Measurably reduced recommendation drift vs LangChain.',
  ],
  fastapi: [
    'fastapi · 0.110.0',
    '────────────────────────────────────',
    'Used in:',
    '  → NeuroFin: AI microservice backend',
    '  → Equity Research: market data API layer',
    'Why:',
    '  Async by default. Type-safe with Pydantic.',
    '  Stateless processing pipeline for high-frequency data.',
    '  Sub-200ms response times under concurrent load.',
  ],
};

const LS_OUTPUT: Record<string, string[]> = {
  '/neel': [
    'total 7',
    'drwxr-xr-x  README.md',
    'drwxr-xr-x  identity.md',
    'drwxr-xr-x  /projects',
    'drwxr-xr-x  /stack',
    'drwxr-xr-x  /logs',
    'drwxr-xr-x  transmission',
  ],
  '/neel/projects': [
    'total 3',
    '-rwxr-xr-x  neurofin           [DEPLOYED ●]',
    '-rwxr-xr-x  equity-research    [DEPLOYED ●]',
    '-rwxr-xr-x  market-terminal    [BUILDING ◌ 70%]',
  ],
  '/neel/logs': [
    'total 3',
    '-rw-r--r--  growth.log',
    '-rw-r--r--  failures.log',
    '-rw-r--r--  shipping.log',
  ],
  '/neel/stack': [
    'total 1',
    '-rw-r--r--  packages.json',
  ],
};

export function parseCommand(input: string, currentPath = '/neel'): CommandResult {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case 'help':
      return { lines: HELP_OUTPUT };

    case 'pwd':
      return { lines: [currentPath] };

    case 'whoami':
      return { lines: IDENTITY_LINES, action: 'navigate', actionArg: '/neel/identity' };

    case 'ls': {
      const requestedPath = args[0] || '.';
      const normalized = normalizePath(requestedPath, currentPath);
      const output = LS_OUTPUT[normalized] || [`ls: ${requestedPath}: No such file or directory`];
      return { lines: output };
    }

    case 'cd': {
      const path = args[0];
      if (!path) return { lines: ['cd: missing path'] };
      const normalized = normalizePath(path, currentPath);
      if (!FILESYSTEM[normalized]) return { lines: [`cd: ${path}: No such directory`] };
      return { lines: [`→ ${normalized}`], action: 'navigate', actionArg: normalized };
    }

    case 'cat': {
      const file = args[0];
      if (!file) return { lines: ['cat: missing filename'] };
      if (file === 'resume.pdf') return { lines: ['Downloading resume...'], action: 'open', actionArg: '/resume.pdf' };
      if (file === 'identity.md') return { lines: IDENTITY_LINES, action: 'navigate', actionArg: '/neel/identity' };
      return { lines: catFile(file) };
    }

    case 'run': {
      const project = normalizeProject(args[0]);
      if (!project) return { lines: ['run: specify project (neurofin | equity | market)'] };
      return { lines: runProject(project), action: 'navigate', actionArg: `/neel/projects/${project}` };
    }

    case 'git': {
      if (args[0] === 'log') {
        const proj = normalizeProject(args[1]);
        if (!proj) return { lines: ['git log: specify project'] };
        const log = GIT_LOGS[proj] || GIT_LOGS[`${proj}-research`] || [`git: no log for project '${proj}'`];
        return { lines: [`git log --project ${proj}`, '', ...log] };
      }
      return { lines: [`git: unknown subcommand '${args[0]}'`] };
    }

    case 'npm': {
      if (args[0] === 'inspect') {
        const pkg = args[1];
        if (!pkg) return { lines: ['npm inspect: specify package'] };
        const info = NPM_INSPECT[pkg] || [`npm inspect: package '${pkg}' not found in stack`];
        return { lines: [`$ npm inspect ${pkg}`, '', ...info] };
      }
      return { lines: [`npm: unknown subcommand '${args[0]}'`] };
    }

    case 'open': {
      const target = args[0];
      if (target === 'github') return { lines: ['Opening GitHub...'], action: 'open', actionArg: 'https://github.com/Neel-Kachhadia' };
      if (target === 'linkedin') return { lines: ['Opening LinkedIn...'], action: 'open', actionArg: 'https://linkedin.com/in/neelkachhadia' };
      return { lines: [`open: unknown target '${target}'`] };
    }

    case '/logs':
      return { lines: ['Opening /neel/logs...'], action: 'navigate', actionArg: '/neel/logs' };

    case '/stack':
      return { lines: ['Opening /neel/stack...'], action: 'navigate', actionArg: '/neel/stack' };

    case 'ssh': {
      if (args[0] === 'transmission') {
        return { lines: ['Connecting to transmission...'], action: 'navigate', actionArg: '/neel/transmission' };
      }
      return { lines: [`ssh: unknown host '${args[0]}'`] };
    }

    case 'debug': {
      if (args[0] === 'on') return { lines: ['Debug mode enabled.'], action: 'mode', actionArg: 'debug' };
      if (args[0] === 'off') return { lines: ['Debug mode disabled.'], action: 'mode', actionArg: 'visitor' };
      return { lines: ['debug: use debug on / debug off'] };
    }

    case 'recruiter': {
      if (args[0] === 'mode') return { lines: ['Switching to recruiter view...'], action: 'mode', actionArg: 'recruiter' };
      return { lines: ["recruiter: did you mean 'recruiter mode'?"] };
    }

    case 'chat':
      return { lines: ['Opening chat interface...'], action: 'navigate', actionArg: '/neel/chat' };

    case 'clear':
      return { lines: [], action: 'clear' };

    case 'sudo': {
      if (args[0] === 'hire-neel') {
        return { lines: HIRE_SEQUENCE, action: 'hire' };
      }
      return { lines: [`sudo: command not found: ${args.join(' ')}`] };
    }

    default:
      return {
        lines: [
          `command not found: ${trimmed}`,
          "type 'help' to see available commands",
        ],
      };
  }
}

const HIRE_SEQUENCE = [
  '[sudo] password for visitor: ████████',
  'Checking permissions...',
  '...',
  'Permission granted.',
  'Initiating transmission channel...',
  'ssh neel@transmission connected.',
];

const IDENTITY_LINES = [
  '# Neel Kachhadia',
  '',
  'Electronics & Telecommunication · DJSCE Mumbai · 2024–2028',
  'Honours in VLSI',
  '',
  'I build interfaces that behave like systems.',
  'Deployed, not prototyped. Running, not described.',
  '',
  'I care about:',
  '  → production-grade AI pipelines',
  '  → frontend systems that think',
  '  → performance as a design decision',
  '  → shipping before most people have planned',
  '',
  'Currently building:',
  '  → NeuroFin: AI financial assistant [LIVE]',
  '  → Equity Research Platform [LIVE]',
  '  → Indian Market Terminal [IN PROGRESS]',
  '  → NEEL.OS: this system [YOU ARE HERE]',
  '',
  'Mumbai. Available. Shipping.',
];

const HELP_OUTPUT = [
  'NEEL.OS — available commands',
  '──────────────────────────────────────────────────────────',
  'navigation',
  '  ls [path]          list directory contents',
  '  cd [path]          change directory',
  '  cat [file]         read file contents',
  '',
  'projects',
  '  run neurofin       execute NeuroFin case study',
  '  run equity         execute Equity Research case study',
  '  run market         execute Market Terminal case study',
  '  git log [project]  view project commit history',
  '',
  'stack',
  '  npm inspect [pkg]  inspect package usage and reasoning',
  '',
  'system',
  '  whoami             read identity.md',
  '  debug on/off       toggle debug mode',
  '  recruiter mode     switch to recruiter view',
  '  clear              clear terminal output',
  '',
  'external',
  '  open github        open GitHub profile',
  '  open linkedin      open LinkedIn profile',
  '  cat resume.pdf     download resume',
  '',
  'explore',
  '  chat               open chat interface',
  '',
  'contact',
  '  ssh transmission   open transmission channel',
  '  sudo hire-neel     ...',
  '',
  '──────────────────────────────────────────────────────────',
];

function normalizePath(path: string, currentPath: string): string {
  if (!path || path === '.' || path === './') return currentPath;
  if (path === '~' || path === '/' || path === '/neel') return '/neel';

  const raw = path.startsWith('/')
    ? path
    : `${currentPath.replace(/\/$/, '')}/${path}`;

  const parts = raw.split('/').filter(Boolean);
  const normalized: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }

  const withRoot = normalized[0] === 'neel' ? normalized : ['neel', ...normalized];
  const resolved = `/${withRoot.join('/')}`;
  const aliases: Record<string, string> = {
    '/neel/projects/market': '/neel/projects/market-terminal',
  };
  return aliases[resolved] ?? resolved;
}

function normalizeProject(project?: string): string | undefined {
  if (!project) return undefined;
  if (project === 'equity') return 'equity-research';
  if (project === 'market') return 'market-terminal';
  return project;
}

function catFile(file: string): string[] {
  const name = file.replace(/^\/neel\//, '').replace(/^\//, '');
  switch (name) {
    case 'identity.md': return IDENTITY_LINES;
    case 'logs/growth.log': return GROWTH_LOG;
    case 'logs/failures.log': return FAILURES_LOG;
    case 'logs/shipping.log': return SHIPPING_LOG;
    default: return [`cat: ${file}: No such file or directory`];
  }
}

function runProject(project: string): string[] {
  const map: Record<string, string[]> = {
    neurofin: [
      'root@neel:/projects$ run neurofin --case-study',
      '',
      '[INIT] Loading problem statement.............. [OK]',
      '[INIT] Mounting market data pipeline.......... [OK]',
      '[INIT] Starting LangGraph agent system........ [OK]',
      '[INIT] Loading Isolation Forest module........ [OK]',
      '[INIT] Compiling React frontend............... [OK]',
      '[INIT] Verifying AWS Lambda deployment........ [OK]',
      '[INIT] Connecting SNS alert pipeline.......... [OK]',
      '',
      'Opening case study...',
    ],
    'equity-research': [
      'root@neel:/projects$ run equity-research --case-study',
      '',
      '[INIT] Mounting live market data streams...... [OK]',
      '[INIT] Loading LangGraph reasoning chain...... [OK]',
      '[INIT] Starting RAG pipeline.................. [OK]',
      '[INIT] Calibrating LLM parameters............. [OK]',
      '[INIT] Connecting REST data APIs.............. [OK]',
      '[INIT] Compiling React dashboard.............. [OK]',
      '',
      'Opening case study...',
    ],
    'market-terminal': [
      'root@neel:/projects$ run market-terminal --case-study',
      '',
      '[INIT] Loading Rust core...................... [OK]',
      '[INIT] Starting FastAPI layer................. [OK]',
      '[INIT] Connecting Redis pipeline.............. [OK]',
      '[INIT] Mounting DuckDB schema................. [OK]',
      '[WARN] Options engine......................... [BUILDING]',
      '[WARN] IV surface module...................... [BUILDING]',
      '[WARN] Tauri shell............................ [BUILDING]',
      '',
      'System partially operational. Case study loading...',
    ],
  };
  return map[project] || [`run: unknown project '${project}'`];
}

const GROWTH_LOG = [
  '[2024.08] Started B.Tech — Electronics & Telecom, DJSCE Mumbai',
  '[2024.09] Began building. First deployed system: NeuroFin prototype.',
  '[2024.11] Mumbai Hacks 2024 — shipped full-stack AI product',
  '           3,000+ participants. 300+ teams. Shipped in 48 hours.',
  '[2024.12] NeuroFin v1 live — budgeting, investments, tax, goals',
  '[2025.02] Amazon 10,000 AI Ideas Challenge',
  '           Top 300 semi-finalist from 115 countries, 10,000+ submissions',
  '           Built and deployed prototype on AWS Free Tier for judging',
  '[2025.04] Equity Research Platform deployed',
  '           Live market data. LangGraph reasoning. RAG pipelines.',
  '[2025.06] Odoo Hackathon — ERP feature suite, end-to-end',
  '[2025.09] Indian Market Terminal — architecture phase',
  '           Rust + Python + Redis + DuckDB + Options Greeks',
  '[2026.01] NEEL.OS — portfolio became the proof',
];

const FAILURES_LOG = [
  '[FAIL] NeuroFin v1 — too many features at once',
  '[FAIL] Poor latency under concurrent load',
  '[FIX]  Isolated agent pipeline into discrete modules',
  '[FIX]  Added Redis caching layer',
  '[LEARNED] Performance is a feature, not an afterthought',
  '',
  '[FAIL] First portfolio — overdesigned, zero substance',
  '[FAIL] Scattered effects with no organizing principle',
  '[FIX]  Rebuilt around filesystem concept',
  '[FIX]  Every element serves the concept or is cut',
  '[LEARNED] Visual effects without clear UX is noise',
  '',
  '[FAIL] Early LLM outputs — high hallucination rate',
  '[FAIL] Stock analysis outputs were unreliable',
  '[FIX]  Fine-tuned behavior, added RAG grounding',
  '[FIX]  Isolation Forest for anomaly validation',
  '[LEARNED] Demonstration beats description. Every time.',
  '',
  '[FAIL] Tried to explain intelligence in portfolio',
  '[FAIL] Descriptions of systems are not systems',
  '[FIX]  Built the portfolio as a running system',
  '[LEARNED] If you have to explain it, you haven\'t built it yet',
];

const SHIPPING_LOG = [
  '[2024] NeuroFin — conversational AI for personal finance',
  '       React · Python · LangGraph · AWS Lambda · S3',
  '       Sub-200ms latency under concurrent load',
  '',
  '[2025] Equity Research Platform',
  '       React · FastAPI · LangGraph · AWS EC2/S3',
  '       Live market data · RAG pipelines · Recharts dashboard',
  '',
  '[2025] Mentora — AI mentor-mentee matching platform',
  '       Next.js 14 · TypeScript · Prisma · PostgreSQL · OpenAI',
  '       Real-time bidirectional chat · LLM-powered matching',
  '',
  '[2026] NEEL.OS — living portfolio runtime',
  '       Next.js 14 · Three.js · GSAP · Tone.js · Groq API',
  '       You are inside this one right now',
];
