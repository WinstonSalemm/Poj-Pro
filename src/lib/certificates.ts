import fs from 'node:fs/promises';
import path from 'node:path';

export type CertificateItem = { id: string; title: string; href: string };

function titleFromFileName(name: string) {
  const base = name.replace(/\.[a-z0-9]+$/i, '');
  return base
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export async function loadCertificates(): Promise<CertificateItem[]> {
  // 1) Try to import JSON list from src/imports/certificates.json
  try {
    // Dynamic import allows optional presence
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mod = await import('@/imports/certificates.json');
    const raw: unknown = (mod as { default?: unknown }).default ?? (mod as unknown);
    const list = raw as Array<{ title: string; href: string }>;
    if (Array.isArray(list) && list.length) {
      return list.map((it, idx) => ({
        id: `json-${idx}`,
        title: String(it.title || `Certificate ${idx + 1}`),
        href: String(it.href).startsWith('/') ? String(it.href) : `/${String(it.href)}`,
      }));
    }
  } catch {
    // File may not exist — that's OK
  }

  // 2) Fallback: scan public/certificates directory for PDFs
  const dir = path.join(process.cwd(), 'public', 'certificates');
  try {
    const files = await fs.readdir(dir);
    const pdfs = files.filter((f) => /\.(pdf)$/i.test(f));
    return pdfs.map((file, idx) => ({
      id: `fs-${idx}`,
      title: titleFromFileName(file),
      href: `/certificates/${file}`,
    }));
  } catch {
    // Directory missing — return empty list
    return [];
  }
}
