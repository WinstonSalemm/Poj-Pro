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
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const YM_ID = process.env.NEXT_PUBLIC_YM_ID;
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
        {/* GTM (Head) */}
        {GTM_ID ? (
          <Script id="gtm-head" nonce={nonce} strategy="afterInteractive">{`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
              j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}</Script>
        ) : null}

        {/* GA4 loader (only if GA_ID provided). Using GTM is preferred, but we keep direct GA load if used */}
        {GA_ID ? (
          <Script
            id="ga4-loader"
            nonce={nonce}
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* GTM (noscript) */}
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}

        {/* GA4 Init (if present) */}
        {GA_ID ? (
          <Script id="ga4-init" nonce={nonce} strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: true });
          `}</Script>
        ) : null}

        {/* Yandex.Metrika */}
        {YM_ID ? (
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
      </body>
    </html>
  );
}
