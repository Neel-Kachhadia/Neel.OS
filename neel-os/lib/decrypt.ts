import { playDecryptClick } from './audio';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!?';

export type DecryptCallback = (text: string) => void;

export function decrypt(
  targetText: string,
  onUpdate: DecryptCallback,
  onComplete?: () => void,
  soundEnabled = false
) {
  const total = 800;
  const pass1End = 200;
  const pass2Duration = 600;

  const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

  // Pass 1: all chars cycle randomly at 40fps
  const pass1Timer = setInterval(() => {
    onUpdate(targetText.split('').map(() => rand()).join(''));
  }, 25);

  setTimeout(() => {
    clearInterval(pass1Timer);

    const stagger = pass2Duration / Math.max(targetText.length, 1);
    const chars = targetText.split('');

    chars.forEach((_, i) => {
      setTimeout(() => {
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

  return total;
}
// React hook helper — returns current display text
export function useDecrypt(
  targetText: string,
  trigger: boolean,
  soundEnabled = false
): string {
  return targetText; // handled via component state, this is just type export
}
