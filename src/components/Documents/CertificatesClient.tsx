"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

export type CertificateItem = {
  name: string;
  url: string;
  size: number; // bytes
  mtime: string; // ISO
};

function formatSize(bytes: number): string {
  if (bytes == null || isNaN(bytes)) return "-";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

export default function CertificatesClient({ files }: { files: CertificateItem[] }) {
  const { t } = useTranslation("translation");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-[100px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t("certificates.title")}</h1>
        <Link href="/documents" className="text-sm underline">← {t("documents.title")}</Link>
      </div>

      {files.length === 0 ? (
        <p className="text-gray-600">{t("certificates.noFiles")}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((f) => {
            const displayName = f.name.replace(/\.pdf$/i, "");
            return (
              <li key={f.name} className="border rounded-md p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="#660000" strokeWidth="1.5" fill="none"/>
                    <path d="M14 2v6h6" stroke="#660000" strokeWidth="1.5" fill="none"/>
                    <path d="M8 14h8M8 17h8M8 11h5" stroke="#660000" strokeWidth="1.5"/>
                  </svg>
                  <div className="min-w-0">
                    <div className="truncate font-medium" title={displayName}>{displayName}</div>
                    <div className="text-xs text-gray-500">{formatSize(f.size)} · {formatDate(f.mtime)}</div>
                  </div>
                </div>
                <a
                  href={f.url}
                  download
                  className="shrink-0 inline-flex items-center gap-2 text-sm rounded-md border px-3 py-2 hover:bg-gray-50"
                  aria-label={`${t("certificates.download")} ${displayName}`}
                >
                  {t("certificates.download")}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
