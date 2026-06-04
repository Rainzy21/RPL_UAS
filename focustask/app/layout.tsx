import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FocusTask — Productivity Dashboard',
  description: 'Manage tasks, run Pomodoro sessions, and track your productivity with FocusTask.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d0d11" />
      </head>
      <body>{children}</body>
    </html>
  );
}
