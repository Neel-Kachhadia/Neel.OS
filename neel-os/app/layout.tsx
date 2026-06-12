import type { Metadata } from 'next';
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google';
import ErrorBoundary from '@/components/core/ErrorBoundary';
import './globals.css';

const editorialNew = Fraunces({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

const sohne = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'NEEL.OS — Neel Kachhadia',
  description: 'Portfolio of Neel Kachhadia — AI engineer building NeuroFin, Equity Research Platform, and Indian Market Terminal. B.Tech DJSCE Mumbai.',
  robots: 'index, follow',
  openGraph: {
    title: 'NEEL.OS — Neel Kachhadia',
    description: 'A living portfolio runtime. Systems deployed. Shipping fast. Mumbai.',
    type: 'website',
  },
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
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
