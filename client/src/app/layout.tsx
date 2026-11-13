import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import './globals.css';
import '../base.css';
import '../styles.css';
import '../more-pages.css';
import '../critical-views.css';
import '../auth-experience.css';

export const metadata: Metadata = {
  title: 'Chatra — Real people. Brighter conversations.',
  description:
    'A social home for creators, communities, and meaningful connections across Africa and beyond.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0b1522',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
