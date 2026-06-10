'use client';

interface RecruiterPanelProps {
  onClose: () => void;
  onTransmission?: () => void;
}

export default function RecruiterPanel({ onClose, onTransmission }: RecruiterPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--section-pad-x)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-on-black)',
          lineHeight: 1.6,
          maxWidth: '640px',
          width: '100%',
        }}
      >
        <div
          style={{
            borderTop: '1px solid rgba(245,240,232,0.15)',
            borderBottom: '1px solid rgba(245,240,232,0.15)',
            padding: '24px 0',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>
            NEEL KACHHADIA
          </div>
          <div style={{ opacity: 0.6, marginBottom: '2px' }}>B.Tech Electronics &amp; Telecom · DJSCE Mumbai</div>
          <div style={{ opacity: 0.6, marginBottom: '2px' }}>2024–2028 · Honours in VLSI</div>
          <div style={{ marginTop: '12px', color: 'var(--online)', fontSize: '11px' }}>
            ● AVAILABLE FOR: internships, research, projects
          </div>
        </div>

        <Section label="DEPLOYED SYSTEMS">
          <ProjectRow name="NeuroFin"         status="LIVE"   pct={100} />
          <ProjectRow name="Equity Research"  status="LIVE"   pct={100} />
          <ProjectRow name="Market Terminal"  status="70%"    pct={70}  />
        </Section>

        <Section label="STACK">
          <div style={{ opacity: 0.7, lineHeight: 1.8 }}>
            Python · React · LangGraph · FastAPI<br />
            TypeScript · Next.js · AWS · Three.js · Rust
          </div>
        </Section>

        <Section label="ACHIEVEMENTS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Achievement
              title="Amazon 10,000 AI Ideas Challenge"
              detail="Top 300 · 115 countries · 10,000+ submissions"
            />
            <Achievement
              title="Mumbai Hacks 2024"
              detail="Shipped AI product · 3,000+ participants · 300+ teams"
            />
            </div>
        </Section>

        <div
          style={{
            borderTop: '1px solid rgba(245,240,232,0.15)',
            paddingTop: '20px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/resume.pdf" label="RESUME.PDF" download />
          <Link href="https://github.com/Neel-Kachhadia" label="GITHUB" />
          <Link href="https://linkedin.com/in/neelkachhadia" label="LINKEDIN" />
          {onTransmission && (
            <button
              onClick={onTransmission}
              data-cursor-hover
              style={{
                background: 'none',
                border: '1px solid rgba(245,240,232,0.25)',
                color: 'var(--online)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '6px 14px',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                opacity: 0.9,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '1')}
              onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '0.9')}
            >
              [OPEN TRANSMISSION →]
            </button>
          )}
          <button
            onClick={onClose}
            data-cursor-hover
            style={{
              background: 'none',
              border: '1px solid rgba(245,240,232,0.25)',
              color: 'var(--text-on-black)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '6px 14px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              opacity: 0.7,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '1')}
            onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '0.7')}
          >
            [BACK TO SYSTEM]
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          fontSize: '9px',
          letterSpacing: '0.15em',
          opacity: 0.4,
          marginBottom: '12px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ProjectRow({ name, status, pct }: { name: string; status: string; pct: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '8px',
        fontSize: '11px',
      }}
    >
      <span style={{ minWidth: '160px', opacity: 0.85 }}>{name}</span>
      <span
        style={{
          color: pct === 100 ? 'var(--online)' : 'var(--text-mono-dark)',
          opacity: pct === 100 ? 1 : 0.6,
        }}
      >
        [{status}]
      </span>
    </div>
  );
}

function Achievement({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <div style={{ opacity: 0.85 }}>{title}</div>
      <div style={{ opacity: 0.5, fontSize: '10px', marginTop: '2px' }}>{detail}</div>
    </div>
  );
}

function Link({ href, label, download }: { href: string; label: string; download?: boolean }) {
  return (
    <a
      href={href}
      target={download ? '_self' : '_blank'}
      rel={download ? undefined : 'noopener noreferrer'}
      download={download ? true : undefined}
      data-cursor-hover
      style={{
        color: 'var(--text-on-black)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.08em',
        opacity: 0.6,
        border: '1px solid rgba(245,240,232,0.2)',
        padding: '6px 14px',
        transition: 'opacity 0.15s',
        textDecoration: 'none',
        display: 'inline-block',
      }}
      onMouseEnter={e => ((e.target as HTMLElement).style.opacity = '1')}
      onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '0.6')}
    >
      [{label}]
    </a>
  );
}
