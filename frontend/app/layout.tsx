import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
