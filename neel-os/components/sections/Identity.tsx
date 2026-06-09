'use client';

const IDENTITY = `# Neel Kachhadia

Electronics & Telecommunication · DJSCE Mumbai · 2024–2028
Honours in VLSI

I build interfaces that behave like systems.
Deployed, not prototyped. Running, not described.

I care about:
  → production-grade AI pipelines
  → frontend systems that think
  → performance as a design decision
  → shipping before most people have planned

Currently building:
  → NeuroFin: AI financial assistant [LIVE]
  → Equity Research Platform [LIVE]
  → Indian Market Terminal [IN PROGRESS]
  → NEEL.OS: this system [YOU ARE HERE]

Mumbai. Available. Unreasonable.`;

export default function Identity() {
  return (
    <section
      id="identity"
      style={{
        background: 'var(--offwhite)',
        padding: 'var(--section-pad-y) calc(200px + var(--section-pad-x))',
        paddingRight: 'var(--section-pad-x)',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
          marginBottom: '32px',
        }}
      >
        cat /neel/identity.md
      </div>

      <pre
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          maxWidth: '640px',
        }}
      >
        {IDENTITY}
      </pre>
    </section>
  );
}
