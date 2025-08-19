import type { Metadata } from "next";

/**
 * Metadata for the About page
 */
export const metadata: Metadata = {
  title: {
    default: "About | POJ PRO",
    template: "%s | POJ PRO",
  },
  description:
    "POJ PRO — fire safety equipment supplier and installer. Learn about our mission, advantages, and contacts.",
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
    title: "About | POJ PRO",
    description:
      "POJ PRO — fire safety equipment supplier and installer. Learn about our mission, advantages, and contacts.",
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "POJ PRO — About" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | POJ PRO",
    description:
      "POJ PRO — fire safety equipment supplier and installer. Learn about our mission, advantages, and contacts.",
    images: ["/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
