"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

type Item = { id: number; title: string; href: string };

export default function CertificatesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/certificates');
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        } else {
          console.error('Failed to fetch certificates');
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (isLoading) {
    return (
      <main className="max-w-5xl mt-[100px] mx-auto px-4 py-8">
        <div>{t("common.loading")}</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mt-[100px] mx-auto px-4 py-8">
      <h1 className="text-2xl text-[#660000] font-semibold mb-6">{t("documents.certificatesTitle")}</h1>

      {items.length === 0 ? (
        <div className="text-sm text-red-600">
          {t("documents.certificatesEmpty")}
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <li key={it.id} className="rounded-xl border !text-[#660000] p-4 hover:shadow-sm transition">
              <div className="font-medium mb-3">{it.title}</div>
              <a
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm !text-[#660000] hover:underline"
                aria-label={`${t("documents.download")} ${it.title}`}
              >
                {t("documents.download")}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}