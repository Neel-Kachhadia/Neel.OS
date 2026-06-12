'use client';

interface RecruiterPanelProps {
  onClose: () => void;
  onTransmission?: () => void;
}

const MONO = 'var(--font-mono)';
const FG   = '#F5F0E8';
const BG   = '#0A0A0A';
const GREEN = '#4AFF91';
const DIV = 'rgba(245,240,232,0.12)';

export default function RecruiterPanel({ onClose, onTransmission }: RecruiterPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: BG,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 64px)',
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: '12px',
          color: FG,
          lineHeight: 1.6,
          maxWidth: '680px',
          width: '100%',
        }}
      >
        {/* Top border */}
        <DivLine />

        {/* Header */}
        <div style={{ padding: '20px 0', borderBottom: `1px solid ${DIV}`, marginBottom: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '9px', opacity: 0.45, letterSpacing: '0.16em', marginBottom: '6px' }}>
                CANDIDATE DOSSIER
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>
                NEEL KACHHADIA
              </div>
              <div style={{ opacity: 0.6, fontSize: '11px' }}>Systems Engineer · AI Infrastructure · Mumbai</div>
            </div>
            <div style={{ fontSize: '9px', opacity: 0.35, letterSpacing: '0.15em', alignSelf: 'flex-start', paddingTop: '4px' }}>
              CONFIDENTIAL
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: GREEN, fontSize: '11px' }}>● AVAILABLE</span>
            <span style={{ opacity: 0.5, fontSize: '10px' }}>B.Tech Y1 · DJSCE Mumbai · 2024-28</span>
          </div>
        </div>

        {/* What he builds */}
        <Section label="WHAT HE BUILDS">
          <div style={{ fontSize: '12px', lineHeight: 1.7, opacity: 0.8 }}>
            Production AI systems. Not prototypes. Not demos.
          </div>
          <div style={{ fontSize: '11px', opacity: 0.55, marginTop: '4px' }}>
            Three deployed systems running right now. One building.
          </div>
        </Section>

        {/* Systems */}
        <Section label="THE SYSTEMS">
          <SystemRow
            name="NeuroFin"
            desc="AI financial assistant"
            status="LIVE ●"
            statusColor={GREEN}
            detail="Sub-200ms latency · AWS Lambda · 3K+ users"
          />
          <SystemRow
            name="Equity Research"
            desc="Investment thesis platform"
            status="LIVE ●"
            statusColor={GREEN}
            detail="RAG + LangGraph · Live NSE/BSE data  ·  Hallucination rate reduced 40% via fine-tuning"
          />
          <SystemRow
            name="Market Terminal"
            desc="Bloomberg-grade NSE terminal"
            status="70% ◌"
            statusColor={`rgba(245,240,232,0.6)`}
            detail="Rust core · Redis · DuckDB · Options Greeks  ·  4 languages simultaneously"
          />
          <SystemRow
            name="NEEL.OS"
            desc="This system is also deployed"
            status="LIVE ●"
            statusColor={GREEN}
            detail="Next.js · Three.js · GSAP · Groq API"
          />
        </Section>

        {/* Proof */}
        <Section label="THE PROOF">
          <ProofRow title="Amazon 10K AI" detail="Top 300 · 115 countries · 10K+ submissions" />
          <ProofRow title="Mumbai Hacks 2024" detail="Shipped in 48h · 3K participants" />
          <ProofRow title="Odoo Hackathon" detail="ERP feature suite delivered end-to-end" />
        </Section>

        {/* Stack depth */}
        <Section label="STACK DEPTH">
          <StackRow label="AI/ML" items="LangGraph · RAG pipelines · LLM fine-tuning · Isolation Forest · OpenAI API · Groq" />
          <StackRow label="Backend" items="FastAPI · Python · Rust · Redis · DuckDB · PostgreSQL · Docker · AWS Lambda/EC2/S3/SNS" />
          <StackRow label="Frontend" items="React · Next.js · TypeScript · Three.js · GSAP · Recharts · Tailwind" />
          <StackRow label="Cloud" items="AWS · Vercel · Firebase · GCP" />
        </Section>

        {/* Contact */}
        <Section label="CONTACT">
          <div style={{ opacity: 0.75, fontSize: '11px', lineHeight: 1.8 }}>
            neel1234kachhadia@gmail.com
          </div>
          <div style={{ opacity: 0.55, fontSize: '10px' }}>
            github.com/Neel-Kachhadia · linkedin.com/in/neelkachhadia
          </div>
        </Section>

        {/* Actions */}
        <div
          style={{
            borderTop: `1px solid ${DIV}`,
            paddingTop: '20px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <ActionLink
            href="/resume.pdf"
            label="DOWNLOAD RESUME"
            download
            accent
          />
          <ActionLink href="https://github.com/Neel-Kachhadia" label="GITHUB" />
          <ActionLink href="https://linkedin.com/in/neelkachhadia" label="LINKEDIN" />
          <ActionLink href="mailto:neel1234kachhadia@gmail.com" label="EMAIL NOW" green />
          {onTransmission && (
            <ActionButton onClick={onTransmission} label="OPEN TRANSMISSION →" />
          )}
          <ActionButton onClick={onClose} label="ENTER SYSTEM →" />
        </div>

        {/* Last line */}
        <DivLine />
        <div
          style={{
            paddingTop: '12px',
            fontFamily: MONO,
            fontSize: '13px',
            color: FG,
            opacity: 0.6,
            fontStyle: 'italic',
            textAlign: 'center',
            paddingBottom: '24px',
          }}
        >
          "Most people his age are learning. He is shipping."
        </div>
      </div>
    </div>
  );
}

function DivLine() {
  return <div style={{ height: '1px', background: DIV, width: '100%' }} />;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${DIV}`, padding: '16px 0' }}>
      <div style={{ fontSize: '9px', letterSpacing: '0.15em', opacity: 0.45, marginBottom: '10px' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SystemRow({ name, desc, status, statusColor, detail }: {
  name: string; desc: string; status: string; statusColor: string; detail: string
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.95 }}>{name}</span>
        <span style={{ fontSize: '11px', opacity: 0.55 }}>{desc}</span>
        <span style={{ fontSize: '10px', color: statusColor, marginLeft: 'auto' }}>[{status}]</span>
      </div>
      <div style={{ fontSize: '10px', opacity: 0.55, marginTop: '2px', lineHeight: 1.5 }}>{detail}</div>
    </div>
  );
}

function ProofRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', opacity: 0.85 }}>{title}</span>
      <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '12px' }}>{detail}</span>
    </div>
  );
}

function StackRow({ label, items }: { label: string; items: string }) {
  return (
    <div style={{ marginBottom: '6px', display: 'flex', gap: '12px' }}>
      <span style={{ fontSize: '10px', opacity: 0.45, minWidth: '60px' }}>{label}</span>
      <span style={{ fontSize: '10px', opacity: 0.7, lineHeight: 1.6 }}>{items}</span>
    </div>
  );
}

function ActionLink({ href, label, download, accent, green }: {
  href: string; label: string; download?: boolean; accent?: boolean; green?: boolean
}) {
  const borderColor = green ? '#4AFF91' : 'rgba(245,240,232,0.3)';
  const color = green ? '#4AFF91' : FG;
  return (
    <a
      href={href}
      target={download ? '_self' : '_blank'}
      rel={download ? undefined : 'noopener noreferrer'}
      download={download ? 'Neel_Kachhadia_Resume.pdf' : undefined}
      data-cursor-hover
      style={{
        color,
        fontFamily: MONO,
        fontSize: '10px',
        letterSpacing: '0.08em',
        border: `1px solid ${borderColor}`,
        padding: '6px 14px',
        textDecoration: 'none',
        display: 'inline-block',
        opacity: 0.85,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
    >
      [{label}]
    </a>
  );
}

function ActionButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      data-cursor-hover
      style={{
        background: 'none',
        border: `1px solid rgba(245,240,232,0.25)`,
        color: FG,
        fontFamily: MONO,
        fontSize: '10px',
        padding: '6px 14px',
        cursor: 'pointer',
        letterSpacing: '0.08em',
        opacity: 0.7,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
    >
      [{label}]
    </button>
  );
}
