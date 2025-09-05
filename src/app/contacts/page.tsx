import type { Metadata } from "next";
import ContactsClient from "./ContactsClient";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты — POJ PRO",
  description:
    "Свяжитесь с компанией POJ PRO: адрес, телефоны, режим работы. Консультации и продажа средств пожарной безопасности в Ташкенте.",
  alternates: { canonical: `${SITE_URL}/contacts` },
  openGraph: {
    title: "Контакты — POJ PRO",
    description: "Адрес, телефоны и режим работы POJ PRO.",
    url: `${SITE_URL}/contacts`,
    siteName: SITE_NAME,
    type: "website",
    images: [`${SITE_URL}/OtherPics/logo.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Контакты — POJ PRO",
    description: "Адрес, телефоны и режим работы POJ PRO.",
    images: [`${SITE_URL}/OtherPics/logo.png`],
  },
};

export default function ContactsPage() {
  return <ContactsClient />;
}
