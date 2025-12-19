import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildPageMetadata, langFromCookieHeader } from "@/lib/metadata";
import DocumentsClient from "./DocumentsClient";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get("cookie");
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    titleKey: "documents.title",
    descriptionKey: "documents.meta_description",
    path: "/documents",
    lang,
    keywords: ['документы', 'сертификаты', 'лицензии', 'POJ PRO', 'пожарная безопасность'],
  });
}

export default function DocumentsPage() {
  return <DocumentsClient />;
}
