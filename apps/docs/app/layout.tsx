import { Inter as FontSans } from 'next/font/google';
import type { Metadata } from 'next';
import MainNav from '@/components/main-nav';

import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Simple Shadcn',
  description: 'Use shadcn/ui easy',
  keywords: [
    'Next.js',
    'React',
    'Tailwind CSS',
    'Server Components',
    'Radix UI',
    'Simple Radix UI',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontSans.variable}>
        <MainNav />
        {children}
      </body>
    </html>
  );
}
