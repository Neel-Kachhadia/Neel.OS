let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!audioContext) audioContext = new AudioContextCtor();
  return audioContext;
}

export async function resumeSystemAudio(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  try {
    const Tone = await import('tone');
    await Tone.start();
  } catch {
    // Native Web Audio still provides the core system sounds.
  }

  return ctx.state === 'running';
}

function playOscillator(
  frequency: number,
  duration: number,
  volume = 0.08,
  type: OscillatorType = 'sine'
) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playBootChime() {
  playOscillator(880, 0.08, 0.06, 'sine');
  window.setTimeout(() => playOscillator(1320, 0.06, 0.035, 'triangle'), 70);
}

export function playDecryptClick(isLast = false) {
  playOscillator(isLast ? 800 : 1200, isLast ? 0.08 : 0.025, isLast ? 0.045 : 0.025, 'square');
}

export function playTearBoom() {
  playOscillator(40, 1.2, 0.12, 'sine');
}

export function playContactChime() {
  playOscillator(1047, 0.2, 0.04, 'sine');
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
