import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { baseUrl, createMetadata } from '@/lib/metadata';
import './globals.css';
import type { Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

export const metadata = createMetadata({
  title: {
    template: '%s | Easy Shadcn',
    default: 'Easy Shadcn',
  },
  description: 'Use Shadcn UI with ease',
  metadataBase: baseUrl,
});

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#fff' },
  ],
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${geist.variable} ${mono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
