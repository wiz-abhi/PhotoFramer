import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Photo Frame Factory',
  description: 'Create and print custom photo layouts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E6F7FF" />
      </head>
      <body className={cn('font-body antialiased', inter.variable)} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
