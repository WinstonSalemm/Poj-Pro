import type { Metadata } from "next";

// Minimal metadata; the localized title/description are provided by about/layout.tsx generateMetadata
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};
