import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import DocumentsClient from "./DocumentsClient";

export const metadata: Metadata = {
  title: "Документы — POJ PRO",
  description: "Ключевые нормы и регламенты по пожарной безопасности",
  alternates: { canonical: `${SITE_URL}/documents` },
  openGraph: {
    title: "Документы — POJ PRO",
    description: "Ключевые нормы и регламенты по пожарной безопасности",
    url: `${SITE_URL}/documents`,
    siteName: SITE_NAME,
    type: "website",
    images: [`${SITE_URL}/OtherPics/logo.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Документы — POJ PRO",
    description: "Ключевые нормы и регламенты по пожарной безопасности",
    images: [`${SITE_URL}/OtherPics/logo.png`],
  },
};

export default function DocumentsPage() {
  return <DocumentsClient />;
}
