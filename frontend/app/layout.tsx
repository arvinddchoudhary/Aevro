import type { Metadata } from 'next';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
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
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
