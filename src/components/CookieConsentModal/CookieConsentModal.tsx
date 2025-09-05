"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { consentGrantAll } from "@/lib/analytics/dataLayer";

export default function CookieConsentModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = document.cookie
      .split('; ')
      .some(row => row.startsWith('cookiesAccepted='));
    
    if (!hasAccepted) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set cookie to expire in 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `cookiesAccepted=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    // Update Consent Mode to granted
    try { consentGrantAll(); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-white shadow-lg rounded-xl border border-gray-200 p-4 z-50 flex flex-col sm:flex-row items-center gap-4">
      <p className="text-sm text-gray-700 flex-1">
        {t('cookieConsent.message', 'Мы используем cookie для хранения языка и содержимого корзины. Продолжая использовать сайт, вы соглашаетесь на их использование.')}
      </p>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={acceptCookies}
          className="px-4 py-2 bg-[#660000] text-white rounded-lg hover:bg-[#550000] transition-colors text-sm font-medium whitespace-nowrap"
        >
          {t('cookieConsent.accept', 'Принять')}
        </button>
        <button
          onClick={acceptCookies}
          className="px-4 py-2 border border-[#660000] text-[#660000] rounded-lg hover:bg-[#660000]/5 transition-colors text-sm font-medium whitespace-nowrap"
        >
          {t('cookieConsent.close', 'Закрыть')}
        </button>
      </div>
    </div>
  );
}
