import AppProviders from '@app/(frontend)/providers';
import '../../styles/style.css';
import AppLayout from '@components/AppLayout';
import Script from 'next/script';
import LocalFont from 'next/font/local';
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistMono = LocalFont({
  src: '../../../public/fonts/GeistMono[wght].woff2',
  variable: '--font-geist-mono',
  preload: false,
});

export const metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://drivexstore.shop'
      : 'http://localhost:3000'
  ),
  title: "Drive X Store",
  description:
    "Drive X is a gaming marketplace for buying and selling game accounts, items, and digital gaming products.",
  keywords: [
    "Drive X",
    "Drive X Store",
    "game accounts",
    "game items",
    "gaming marketplace",
    "digital game store",
  ],
  openGraph: {
    title: "Drive X Store",
    description:
      "A trusted gaming marketplace for game accounts, items, and digital gaming products.",
    type: "website",
    siteName: "Drive X Store",
    url: "https://drivexstore.shop",
    images: [
      {
        url: "/images/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Drive X Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drive X Store",
    description:
      "Shop game accounts, items, and digital gaming products at Drive X Store.",
    images: ["/images/og-image.jpeg"],
  },
};

export default function RootLayout({ children }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://drivexstore.shop/#website',
    url: 'https://drivexstore.shop',
    name: 'Drive X Store',
    inLanguage: 'en',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://drivexstore.shop/#organization',
    name: 'Drive X Store',
    url: 'https://drivexstore.shop',
    logo: 'https://drivexstore.shop/images/og-image.jpeg',
  };

  const navigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    '@id': 'https://drivexstore.shop/#navigation',
    name: 'Drive X Store Navigation',
    url: 'https://drivexstore.shop',
    hasPart: [
      { '@type': 'WebPage', name: 'Home', url: 'https://drivexstore.shop/' },
      { '@type': 'WebPage', name: 'About', url: 'https://drivexstore.shop/about' },
      { '@type': 'WebPage', name: 'Work', url: 'https://drivexstore.shop/work' },
    ],
  };
  const themeScript = `
    (function(){
      try {
        var t = localStorage.getItem('theme');
        if (t) {
          document.documentElement.setAttribute('data-theme', t);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } catch(e) {}
    })()
  `;

  return (
    <html lang="en" className={geistMono.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://eu-assets.i.posthog.com" />
        <link rel="stylesheet" href="https://use.typekit.net/tdy7azi.css" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body data-transition-phase="idle">
        <AppProviders>
          <AppLayout>
            {children}
            <SpeedInsights />
          </AppLayout>
        </AppProviders>
        
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="navigation-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
        />
      </body>
    </html>
  );
}
