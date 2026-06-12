import { playDecryptClick } from './soundEngine';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!?';

export type DecryptCallback = (text: string) => void;

export function decrypt(
  targetText: string,
  onUpdate: DecryptCallback,
  onComplete?: () => void,
  soundEnabled = false
): () => void {
  const pass1End = 200;
  const pass2Duration = 600;
  const timers: ReturnType<typeof setTimeout>[] = [];

  const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];
  const schedule = (callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      const idx = timers.indexOf(id);
      if (idx !== -1) timers.splice(idx, 1);
      callback();
    }, delay);
    timers.push(id);
  };

  const pass1Timer = setInterval(() => {
    onUpdate(targetText.split('').map(() => rand()).join(''));
  }, 25);

  schedule(() => {
    clearInterval(pass1Timer);

    const stagger = pass2Duration / Math.max(targetText.length, 1);
    const chars = targetText.split('');

    chars.forEach((_, i) => {
      schedule(() => {
        const locked = targetText.slice(0, i + 1);
        const cycling = targetText.slice(i + 1).split('').map(() => rand()).join('');
        onUpdate(locked + cycling);

        if (soundEnabled) {
          const isLast = i === targetText.length - 1;
          playDecryptClick(isLast);
        }

        if (i === targetText.length - 1 && onComplete) {
          onComplete();
        }
      }, i * stagger);
    });
  }, pass1End);

  return () => {
    clearInterval(pass1Timer);
    timers.forEach(clearTimeout);
    timers.length = 0;
  };
}
