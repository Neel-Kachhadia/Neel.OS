'use client';

interface Project {
  id: string;
  name: string;
  status: 'DEPLOYED' | 'BUILDING';
  pct?: number;
  stack: string;
  description: string;
  bgColor: string;
  accentColor: string;
}

const PROJECTS: Project[] = [
  {
    id: 'neurofin',
    name: 'NeuroFin',
    status: 'DEPLOYED',
    stack: 'React · Python · LangGraph · AWS Lambda · S3',
    description: '12-specialist agent routing. Isolation Forest anomaly detection. Sub-200ms latency.',
    bgColor: 'linear-gradient(160deg, #0A0A0A 0%, #3D1A00 100%)',
    accentColor: '#B45309',
  },
  {
    id: 'equity',
    name: 'Equity Research Platform',
    status: 'DEPLOYED',
    stack: 'React · FastAPI · LangGraph · AWS EC2/S3',
    description: 'Live market data ingestion. Multi-step LangGraph reasoning. RAG pipelines.',
    bgColor: 'linear-gradient(160deg, #0A0A0A 0%, #0D1F35 100%)',
    accentColor: '#94A3B8',
  },
  {
    id: 'market',
    name: 'Indian Market Terminal',
    status: 'BUILDING',
    pct: 70,
    stack: 'Rust · FastAPI · Redis · DuckDB',
    description: 'Professional NSE research terminal. Live tick ingestion. Options Greeks in progress.',
    bgColor: 'linear-gradient(160deg, #0A0A0A 0%, #001A13 100%)',
    accentColor: '#0AD09A',
  },
];

export default function MobileProject() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      {PROJECTS.map((p) => (
        <div
          key={p.id}
          style={{
            background: p.bgColor,
            padding: '28px 20px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 6vw, 32px)',
                fontWeight: 700,
                color: 'var(--text-on-black)',
                letterSpacing: '-0.02em',
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: p.status === 'DEPLOYED' ? 'var(--online)' : p.accentColor,
                letterSpacing: '0.1em',
              }}
            >
              {p.status === 'BUILDING' ? `[${p.pct}%]` : '[LIVE]'}
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--text-on-black)',
              opacity: 0.65,
              lineHeight: 1.6,
              marginBottom: '12px',
            }}
          >
            {p.description}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-mono-dark)',
              opacity: 0.5,
              lineHeight: 1.4,
            }}
          >
            {p.stack}
          </div>

          {p.status === 'BUILDING' && (
            <div
              style={{
                marginTop: '16px',
                height: '2px',
                background: 'rgba(245,240,232,0.1)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${p.pct}%`,
                  background: p.accentColor,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
