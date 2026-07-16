"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { consentDenyOptional, consentGrantAll } from "@/lib/analytics/dataLayer";

const copy = {
  ru: {
    title: "Настройки cookie",
    message: "Мы используем необходимые cookie для языка и корзины, а дополнительные cookie - для аналитики.",
    accept: "Принять все",
    essentialOnly: "Только необходимые",
  },
  eng: {
    title: "Cookie settings",
    message: "We use necessary cookies for language and cart, and optional cookies for analytics.",
    accept: "Accept all",
    essentialOnly: "Necessary only",
  },
  uzb: {
    title: "Cookie sozlamalari",
    message: "Til va savat uchun zarur cookie-fayllardan, tahlil uchun esa ixtiyoriy cookie-fayllardan foydalanamiz.",
    accept: "Hammasini qabul qilish",
    essentialOnly: "Faqat zarurlari",
  },
} as const;

export default function CookieConsentModal() {
  const { currentLanguage } = useTranslation();
  const [visible, setVisible] = useState(false);
  const lang = currentLanguage === "en" ? "eng" : currentLanguage === "uz" ? "uzb" : currentLanguage;
  const text = lang === "eng" || lang === "uzb" ? copy[lang] : copy.ru;

  useEffect(() => {
    const hasDecision = document.cookie
      .split("; ")
      .some((row) => row.startsWith("cookieConsent=") || row.startsWith("cookiesAccepted="));

    if (!hasDecision) {
      setVisible(true);
    }
  }, []);

  const saveDecision = (analyticsAllowed: boolean) => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const value = analyticsAllowed ? "all" : "essential";

    document.cookie = `cookieConsent=${value}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    try {
      if (analyticsAllowed) {
        consentGrantAll();
      } else {
        consentDenyOptional();
      }
    } catch {}

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:bottom-5 sm:flex sm:items-center sm:gap-4"
      role="dialog"
      aria-live="polite"
      aria-label={text.title}
    >
      <p className="text-sm leading-5 text-gray-700 sm:flex-1">
        {text.message}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:flex-shrink-0">
        <button
          type="button"
          onClick={() => saveDecision(true)}
          className="rounded-md bg-[#660000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#550000] focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-offset-2"
        >
          {text.accept}
        </button>
        <button
          type="button"
          onClick={() => saveDecision(false)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-offset-2"
        >
          {text.essentialOnly}
        </button>
      </div>
    </div>
  );
}
