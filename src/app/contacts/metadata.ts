import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Контакты | POJ PRO",
    template: "%s | POJ PRO",
  },
  description:
    "Контакты POJ PRO: адрес, телефон, email и режим работы. Быстрая связь по вопросам пожарной безопасности и оборудования.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://pojpro.uz/contacts",
  },
  openGraph: {
    type: "website",
    url: "https://pojpro.uz/contacts",
    siteName: "POJ PRO",
    title: "Контакты | POJ PRO",
    description:
      "Адрес, телефоны и email POJ PRO. Свяжитесь с нами по вопросам поставки и монтажа средств пожарной безопасности.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "POJ PRO — Контакты" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Контакты | POJ PRO",
    description:
      "Адрес, телефоны и email POJ PRO. Свяжитесь с нами по вопросам поставки и монтажа средств пожарной безопасности.",
    images: ["/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
