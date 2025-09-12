import { fetchAPI } from "@/lib/api";
import type { CertificateItem } from "@/lib/certificates";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildPageMetadata, langFromCookieHeader } from "@/lib/metadata";

export const revalidate = 60;

type ApiResp = { certificates?: CertificateItem[]; items?: CertificateItem[] };

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get("cookie");
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    titleKey: "documents.certificatesPageTitle",
    path: "/documents/certificates",
    lang,
  });
}

export default async function CertificatesPage() {
  const resp = await fetchAPI<ApiResp>("/api/certificates");
  const list: CertificateItem[] = Array.isArray(resp?.certificates)
    ? resp.certificates!
    : Array.isArray(resp?.items)
    ? (resp.items as CertificateItem[])
    : [];

  return (
    <main className="max-w-5xl mt-[100px] mx-auto px-4 py-8">
      <h1 className="text-2xl text-[#660000] font-semibold mb-6">Сертификаты</h1>

      {list.length === 0 ? (
        <div className="text-sm text-red-600">Сертификаты не найдены.</div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((it) => (
            <li key={it.id} className="rounded-xl border !text-[#660000] p-4 hover:shadow-sm transition">
              <div className="font-medium mb-3">{it.title}</div>
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm !text-[#660000] hover:underline"
                aria-label={`Скачать ${it.title}`}
              >
                Скачать
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}