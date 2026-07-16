import type { Metadata } from 'next';
import { SiteChrome } from '../components/layout/SiteChrome';
import { BackendActivityPing } from '../components/system/BackendActivityPing';
import { AuthProvider } from '../lib/auth';
import { CartProvider } from '../lib/cart';
import {
  absoluteUrl,
  defaultOgImage,
  defaultSeoDescription,
  siteName,
  siteUrl,
} from '../lib/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: 'AEVRO — Refined Trousers and Modern Essentials',
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  keywords: [
    'AEVRO',
    'refined trousers',
    'modern essentials',
    'premium clothing',
    'tailored trousers',
    'minimal fashion',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AEVRO — Refined Trousers and Modern Essentials',
    description: defaultSeoDescription,
    url: absoluteUrl('/'),
    siteName,
    images: [
      {
        url: absoluteUrl(defaultOgImage),
        width: 1200,
        height: 630,
        alt: 'AEVRO refined trousers and modern essentials',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AEVRO — Refined Trousers and Modern Essentials',
    description: defaultSeoDescription,
    images: [absoluteUrl(defaultOgImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="aevro-shell">
        <BackendActivityPing />
        <AuthProvider>
          <CartProvider>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
