'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

// Replace with your Yandex Metrika ID
const YM_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '';
const YM_ID_NUM = Number(YM_ID);

// Only initialize in production
const isProduction = process.env.NODE_ENV === 'production';

export default function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isProduction || !window.ym || !YM_ID_NUM) return;

    // Track page view when URL changes
    window.ym(YM_ID_NUM, 'hit', window.location.href);
  }, [pathname, searchParams]);

  if (!isProduction || !YM_ID_NUM) {
    return null;
  }

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${Number(YM_ID) || 0}, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true
        });
      `}
    </Script>
  );
}
