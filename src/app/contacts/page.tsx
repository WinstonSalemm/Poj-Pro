import ContactsClient from "./ContactsClient";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildPageMetadata, langFromCookieHeader } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get("cookie");
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    titleKey: "contacts.seo.title",
    descriptionKey: "contacts.seo.description",
    path: "/contacts",
    lang,
  });
}

export default function ContactsPage() {
  return <ContactsClient />;
}
