"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { isProd } from '@/lib/analytics';

// Defer non-critical client widgets to reduce initial JS and TBT
const AnalyticsLazy = dynamic(() => import('@/components/Analytics'), { ssr: false });
const CookieConsentModalLazy = dynamic(() => import('@/components/CookieConsentModal/CookieConsentModal'), { ssr: false });
const ClientWrapperLazy = dynamic(() => import('@/app/ClientWrapper'), { ssr: false });
const CartAddToastLazy = dynamic(() => import('@/components/Cart/CartAddToast'), { ssr: false });
const CreatorModalLazy = dynamic(() => import('@/components/CreatorModal/CreatorModal'), { ssr: false });

export default function ClientWidgets() {
  return (
    <>
      <CartAddToastLazy />
      <CookieConsentModalLazy />
      <CreatorModalLazy />
      <ClientWrapperLazy />
      {isProd && <AnalyticsLazy />}
    </>
  );
}
