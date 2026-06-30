import type { Metadata } from 'next';
import { SiteChrome } from '../components/layout/SiteChrome';
import { AuthProvider } from '../lib/auth';
import { CartProvider } from '../lib/cart';
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
      <body className="aevro-shell">
        <AuthProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
