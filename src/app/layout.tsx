// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { I18nProvider } from '@/i18n/I18nProvider';
import { getDictionary, normalizeLocale } from '@/i18n/server';
import { CartProvider } from '@/context/CartContext';
import { SessionProviderClient } from '@/components/auth/SessionProviderClient';
import CookieConsentModal from '@/components/CookieConsentModal/CookieConsentModal';
import ClientWrapper from '@/app/ClientWrapper';
import CartAddToast from '@/components/Cart/CartAddToast';
import Script from 'next/script';
import Analytics from '@/components/Analytics';
import { Toaster } from 'react-hot-toast';
import { GA_ID, YM_ID, isProd } from '@/lib/analytics';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'POJ PRO',
  description: 'Пожарное оборудование и средства безопасности',
  keywords: [
    'пожарное оборудование',
    'средства пожаротушения',
    'огнетушители',
    'пожарные краны',
    'пожарная сигнализация',
    'пожарная безопасность',
    'Ташкент',
    'Узбекистан',
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') || undefined;
  // Analytics IDs are read from module: GA_ID, YM_ID; enabled only in prod
  // Prefer i18next cookie set by the client, with fallbacks for legacy names
  const rawLocale =
    cookieStore.get('i18next')?.value ||
    cookieStore.get('lang')?.value ||
    cookieStore.get('i18n')?.value ||
    'ru';
  const initialLocale = normalizeLocale(rawLocale);
  const messages = await getDictionary(initialLocale);

  const session = await getServerSession(authOptions);

  return (
    <html lang={initialLocale} dir="ltr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* GA4 loader (production only) */}
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
        {/* GA4 Init (production only) */}
        {isProd && GA_ID ? (
          <Script id="ga-init" nonce={nonce} strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: false });
          `}</Script>
        ) : null}

        {/* Yandex.Metrica (production only) */}
        {isProd && YM_ID ? (
          <>
            <Script id="ym-init" nonce={nonce} strategy="afterInteractive">{`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();for (var j=0; j<document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

              ym(Number('${YM_ID}'), 'init', {
                defer: true,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
              });
            `}</Script>
            <noscript>
              <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: 'absolute', left: '-9999px' }} alt="" />
            </noscript>
          </>
        ) : null}
        <I18nProvider initialLocale={initialLocale} messages={messages}>
          <SessionProviderClient session={session}>
            <CartProvider>
              <ClientWrapper>{children}</ClientWrapper>
              <CartAddToast />
            </CartProvider>
            <CookieConsentModal />
          </SessionProviderClient>
        </I18nProvider>
        <Analytics />
        <Toaster position="top-right" gutter={8} toastOptions={{
          style: { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' },
          success: { iconTheme: { primary: '#10B981', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#ffffff' } }
        }} />
      </body>
    </html>
  );
}
