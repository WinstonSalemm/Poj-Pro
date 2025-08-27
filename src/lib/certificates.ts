import fs from 'node:fs/promises';
import path from 'node:path';

export type CertificateItem = { id: string; title: string; href: string };
type CertJSONItem = { title: string; href: string };

function isCertArray(input: unknown): input is CertJSONItem[] {
  return Array.isArray(input) && input.every(it =>
    it && typeof it === 'object' &&
    typeof (it as Record<string, unknown>).title === 'string' &&
    typeof (it as Record<string, unknown>).href === 'string'
  );
}

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
  // 1) Try to read JSON list from imports/certificates.json if it exists
  const jsonPath = path.join(process.cwd(), 'imports', 'certificates.json');
  try {
    const buf = await fs.readFile(jsonPath, 'utf8');
    const parsedUnknown: unknown = JSON.parse(buf);
    if (isCertArray(parsedUnknown) && parsedUnknown.length > 0) {
      return parsedUnknown.map((it, idx) => ({
        id: `json-${idx}`,
        title: it.title || `Certificate ${idx + 1}`,
        href: it.href.startsWith('/') ? it.href : `/${it.href}`,
      }));
    }
  } catch {
    // File may not exist or be invalid — that's OK, continue to fallback
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
