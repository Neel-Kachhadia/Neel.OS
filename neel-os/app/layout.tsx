import type { Metadata } from 'next';
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Proxy for Editorial New (variable weight 200-800 serif)
// Swap: place EditorialNew-Variable.woff2 in public/fonts/ and switch to localFont
const editorialNew = Fraunces({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'block',
  preload: true,
});

// Proxy for Söhne (body copy humanist sans)
// Swap: place Sohne-Regular.woff2 in public/fonts/ and switch to localFont
const sohne = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'block',
  preload: true,
});

// JetBrains Mono — all terminal/mono text
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'block',
  preload: true,
});

export const metadata: Metadata = {
  title: 'NEEL.OS',
  description: 'A living portfolio runtime by Neel Kachhadia.',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${editorialNew.variable} ${sohne.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
