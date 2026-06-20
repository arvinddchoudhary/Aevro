import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AEVRO — Premium Wide-Leg Pleated Trousers',
  description:
    'Minimal. Premium. Modern. Wide-leg pleated trousers crafted for the discerning wardrobe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
