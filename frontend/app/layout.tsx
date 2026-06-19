import type { Metadata } from 'next';
import { Header } from '../components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'AEVRO',
  description: 'Premium clothing brand.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
