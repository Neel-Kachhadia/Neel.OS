'use client';

const FG = '#F5F0E8';
const BG = '#0A0A0A';
const GREEN = '#4AFF91';
const AMBER = '#B45309';
const MONO = 'var(--font-mono)';

const IDENTITY_BLOCKS = [
  {
    label: 'WHOAMI',
    lines: [
      'Neel Kachhadia',
      'Electronics & Telecommunication | DJSCE Mumbai | 2024-2028',
      'Honours in VLSI',
    ],
  },
  {
    label: 'SIGNAL',
    lines: [
      'Builds interfaces that behave like systems.',
      'Deployed, not prototyped. Running, not described.',
    ],
  },
  {
    label: 'PRIORITIES',
    lines: [
      'production-grade AI pipelines',
      'frontend systems that think',
      'performance as a design decision',
      'shipping before most people have planned',
    ],
  },
  {
    label: 'ACTIVE PROCESSES',
    lines: [
      'NeuroFin: AI financial assistant [LIVE]',
      'Equity Research Platform [LIVE]',
      'Indian Market Terminal [IN PROGRESS]',
      'NEEL.OS: this system [YOU ARE HERE]',
    ],
  },
  {
    label: 'LOCATION',
    lines: [
      'Mumbai. Available. Shipping.',
    ],
  },
];

function separator(length = 64) {
  return '-'.repeat(length);
}

export default function Identity() {
  return (
    <section
      id="identity"
      style={{
        background: BG,
        color: FG,
        padding: '80px 48px 40px calc(200px + 48px)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          fontSize: '13px',
          color: FG,
          lineHeight: 1.6,
          marginBottom: '20px',
        }}
      >
        root@neel:/identity $ cat identity.md
      </div>

      <div
        style={{
          fontSize: '11px',
          color: AMBER,
          letterSpacing: '0.12em',
          marginBottom: '14px',
        }}
      >
        IDENTITY MODULE
      </div>

      <div style={{ color: 'rgba(180,83,9,0.3)', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '960px' }}>
        {'='.repeat(96)}
      </div>

      <div style={{ marginTop: '28px', maxWidth: '760px' }}>
        {IDENTITY_BLOCKS.map((block, blockIndex) => (
          <div key={block.label} style={{ marginBottom: blockIndex === IDENTITY_BLOCKS.length - 1 ? 0 : '26px' }}>
            <div
              style={{
                fontSize: '10px',
                color: AMBER,
                letterSpacing: '0.14em',
                marginBottom: '10px',
                opacity: 0.85,
              }}
            >
              {block.label} {separator(38)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {block.lines.map((line, lineIndex) => {
                const isStatus = line.includes('[LIVE]') || line.includes('[YOU ARE HERE]');
                const isProgress = line.includes('[IN PROGRESS]');
                const prefix = block.label === 'WHOAMI' && lineIndex === 0
                  ? '#'
                  : block.label === 'SIGNAL'
                    ? '>'
                    : '$';

                return (
                  <div
                    key={line}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '22px minmax(0, 1fr)',
                      columnGap: '8px',
                      fontSize: lineIndex === 0 && block.label === 'WHOAMI' ? '16px' : '13px',
                      lineHeight: 1.6,
                      color: isStatus ? GREEN : isProgress ? AMBER : FG,
                      opacity: lineIndex === 0 && block.label === 'WHOAMI' ? 0.95 : 0.78,
                    }}
                  >
                    <span style={{ color: AMBER, opacity: 0.75 }}>{prefix}</span>
                    <span>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
