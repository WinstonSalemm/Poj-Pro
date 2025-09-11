import type { Metadata } from "next";

/**
 * Metadata for the About page
 */
export const metadata: Metadata = {
  title: {
    default: "О компании | POJ PRO",
    template: "%s | POJ PRO",
  },
  description:
    "POJ PRO — поставщик и инсталлятор средств пожарной безопасности. Узнайте о нашей миссии, преимуществах и контактах.",
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "POJ PRO",
    "fire safety",
    "огнетушители",
    "yong'in xavfsizligi",
    "Ташкент",
  ],
  alternates: {
    canonical: "https://pojpro.uz/about"
  },
  openGraph: {
    type: "website",
    url: "https://pojpro.uz/about",
    siteName: "POJ PRO",
    title: "О компании | POJ PRO",
    description:
      "POJ PRO — поставщик и инсталлятор средств пожарной безопасности. Узнайте о нашей миссии, преимуществах и контактах.",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "POJ PRO — О компании" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "О компании | POJ PRO",
    description:
      "POJ PRO — поставщик и инсталлятор средств пожарной безопасности. Узнайте о нашей миссии, преимуществах и контактах.",
    images: ["/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
