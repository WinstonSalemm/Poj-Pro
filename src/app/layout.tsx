// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Viewport, Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { isProd, GA_ID, YM_ID, GTM_ID } from '@/lib/analytics';
import { I18nProvider } from '@/i18n/I18nProvider';
import { NonceProvider } from '@/context/NonceContext';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SessionProviderClient } from '@/components/auth/SessionProviderClient';
import { CartProvider } from '@/context/CartContext';
import CookieConsentModal from '@/components/CookieConsentModal/CookieConsentModal';
import CartAddToast from '@/components/Cart/CartAddToast';
import ClientWrapper from '@/app/ClientWrapper';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import Analytics from '@/components/Analytics';
import { SITE_URL } from '@/lib/site';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Base metadata (applies to pages that rely on app layout defaults)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') || undefined;
  const session = await getServerSession(authOptions);

  return (
    <html
      lang={params.locale ?? 'ru'}
      dir="ltr"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* Preconnects */}
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Early guard: fix wrongly injected CSS tags before other scripts run */}
        <Script id="fix-css-tags-early" nonce={nonce} strategy="beforeInteractive">
          {`
            try {
              // Replace any <script src="*.css"> with <link rel="stylesheet">
              document.querySelectorAll('script[src$=".css" i]').forEach(function(s){
                var href = s.getAttribute('src');
                if (!href) return;
                var l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = href;
                document.head.appendChild(l);
                s.parentNode && s.parentNode.removeChild(s);
              });
              // Fix <link rel="preload" as="script" href="*.css">
              document.querySelectorAll('link[rel="preload"][as="script" i][href$=".css" i]').forEach(function(l){
                l.setAttribute('as','style');
                var href = l.getAttribute('href');
                if (href) {
                  var sheet = document.createElement('link');
                  sheet.rel = 'stylesheet';
                  sheet.href = href;
                  document.head.appendChild(sheet);
                }
              });
            } catch (e) { /* no-op */ }
          `}
        </Script>

        {/* Google Search Console verification (optional via env) */}
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION ? (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          />
        ) : null}

        {/* GTM + Consent (prod) */}
        {isProd && GTM_ID ? (
          <Script id="gtm-init" nonce={nonce} strategy="beforeInteractive">
            {`
              (function(){
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  analytics_storage: 'denied',
                  functionality_storage: 'denied',
                  personalization_storage: 'denied',
                  security_storage: 'granted'
                });
                window.dataLayer.push({ event: 'consent_initialization' });
              })();
            `}
          </Script>
        ) : null}

        {isProd && GTM_ID ? (
          <Script id="gtm-loader" nonce={nonce} strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id=' + i + dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        ) : null}

        {/* GA4 (prod) */}
        {isProd && GA_ID ? (
          <Script
            id="ga-loader"
            nonce={nonce}
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        ) : null}
      </head>

      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Skip links: first to navigation, then to main content for predictable tab order */}
        <a
          href="#site-nav"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[1003] focus:px-3 focus:py-2 focus:bg-white focus:text-[#660000] focus:rounded focus:shadow outline-none"
        >
          Skip to navigation
        </a>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-12 focus:z-[1003] focus:px-3 focus:py-2 focus:bg-white focus:text-[#660000] focus:rounded focus:shadow outline-none"
        >
          Skip to main content
        </a>
        {/* GTM noscript (prod) */}
        {isProd && GTM_ID ? (
          <noscript>
            {`<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`}
          </noscript>
        ) : null}

        {/* GA4 init (prod) */}
        {isProd && GA_ID ? (
          <Script id="ga-init" nonce={nonce} strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        ) : null}

        {/* Yandex.Metrica (prod) */}
        {isProd && YM_ID ? (
          <Script id="ym-init" nonce={nonce} strategy="lazyOnload">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();for (var j=0; j<document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
              ym(Number('${YM_ID}'), 'init', {
                defer: true,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true
              });
            `}
          </Script>
        ) : null}

        <NonceProvider nonce={nonce}>
          <I18nProvider initialLocale={params.locale ?? 'ru'}>
            <SessionProviderClient session={session}>
              <CartProvider>
                <Header />
                <main id="main-content" className="flex-grow">{children}</main>
                <Footer />
                <CartAddToast />
                <CookieConsentModal />
                <ClientWrapper />
                {isProd && <Analytics />}
              </CartProvider>
            </SessionProviderClient>
          </I18nProvider>
        </NonceProvider>
      </body>
    </html>
  );
}
