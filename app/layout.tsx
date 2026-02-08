import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SuiFlow - AI-Powered Swap Aggregator',
  description: 'Best prices across all Sui DEXs + cross-chain bridging. Powered by Google Gemini AI.',
  keywords: ['Sui', 'DEX', 'swap', 'aggregator', 'DeFi', 'crypto', 'AI'],
  openGraph: {
    title: 'SuiFlow - AI-Powered Swap Aggregator',
    description: 'Get the best swap rates on Sui with AI-optimized routing',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
