type ToneModule = typeof import('tone');
type SynthKind = 'sine' | 'triangle' | 'square' | 'sawtooth';

let toneModule: ToneModule | null = null;
let audioReady = false;

async function loadTone(): Promise<ToneModule | null> {
  if (typeof window === 'undefined') return null;
  if (!toneModule) {
    toneModule = await import('tone');
  }
  return toneModule;
}

export async function resumeSystemAudio(): Promise<boolean> {
  const Tone = await loadTone();
  if (!Tone) return false;
  await Tone.start();
  audioReady = Tone.getContext().state === 'running';
  return audioReady;
}

function trigger(
  frequency: number,
  duration: string,
  oscillator: SynthKind,
  volume = -24
) {
  if (!audioReady || !toneModule || typeof window === 'undefined') return;

  const Tone = toneModule;
  const synth = new Tone.Synth({
    oscillator: { type: oscillator },
    envelope: {
      attack: 0.003,
      decay: 0.05,
      sustain: 0.18,
      release: 0.08,
    },
    volume,
  }).toDestination();

  synth.triggerAttackRelease(frequency, duration);
  window.setTimeout(() => synth.dispose(), 600);
}

function sequence(notes: Array<[number, number, string, SynthKind?, number?]>) {
  for (const [delay, frequency, duration, oscillator = 'sine', volume = -24] of notes) {
    window.setTimeout(() => trigger(frequency, duration, oscillator, volume), delay);
  }
}

export function playBootTick(index = 0) {
  trigger(460 + index * 28, '32n', 'square', -31);
}

export function playBootChime() {
  sequence([
    [0, 660, '32n', 'sine', -25],
    [70, 880, '32n', 'triangle', -25],
    [140, 1320, '16n', 'sine', -27],
  ]);
}

export function playCommandEnter() {
  sequence([
    [0, 148, '64n', 'square', -28],
    [35, 740, '64n', 'triangle', -30],
  ]);
}

export function playDestinationArrive() {
  sequence([
    [0, 392, '32n', 'triangle', -28],
    [70, 588, '32n', 'triangle', -27],
    [145, 784, '16n', 'sine', -29],
  ]);
}

export function playBackSound() {
  sequence([
    [0, 520, '32n', 'triangle', -29],
    [65, 260, '16n', 'sine', -28],
  ]);
}

export function playDecryptClick(isLast = false) {
  trigger(isLast ? 820 : 1220, isLast ? '16n' : '64n', 'square', isLast ? -26 : -34);
}

export function playTearBoom() {
  trigger(44, '1n', 'sine', -23);
}

export function playContactChime() {
  sequence([
    [0, 1047, '16n', 'sine', -27],
    [95, 1568, '32n', 'triangle', -30],
  ]);
}
