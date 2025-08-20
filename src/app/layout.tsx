// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { I18nProvider } from '@/i18n/I18nProvider';
import { getDictionary, normalizeLocale } from '@/i18n/server';
import { CartProvider } from '@/context/CartContext';
import { SessionProviderClient } from '@/components/auth/SessionProviderClient';
import CookieConsentModal from '@/components/CookieConsentModal/CookieConsentModal';
import ClientWrapper from '@/app/ClientWrapper';
import CartAddToast from '@/components/Cart/CartAddToast';

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
  const rawLocale = cookieStore.get('lang')?.value || 'ru';
  const initialLocale = normalizeLocale(rawLocale);
  const messages = await getDictionary(initialLocale);

  const session = await getServerSession(authOptions);

  return (
    <html lang={initialLocale} dir="ltr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <I18nProvider initialLocale={initialLocale} messages={messages}>
          <SessionProviderClient session={session}>
            <CartProvider>
              <ClientWrapper>{children}</ClientWrapper>
              <CartAddToast />
            </CartProvider>
            <CookieConsentModal />
          </SessionProviderClient>
        </I18nProvider>
      </body>
    </html>
  );
}
