import fs from 'node:fs';
import path from 'node:path';
import { getFileSizeKb } from './files';
import type { DocItem } from '@/types/content';

const ROOT = process.cwd();
const JSON_PATHS = [
  'src/imports/documents.json',
  'src/imports/certificates.json'
];
const PUBLIC_DIRS = [
  'public/documents',
  'public/certificates'
];

export async function loadDocuments(): Promise<DocItem[]> {
  for (const p of JSON_PATHS) {
    const abs = path.join(ROOT, p);
    if (fs.existsSync(abs)) {
      const data = JSON.parse(fs.readFileSync(abs, 'utf8')) as { documents?: DocItem[]; certificates?: DocItem[] };
      const arr = data.documents ?? data.certificates ?? [];
      return arr.map(n => ({ ...n, id: (n.id ?? n.href ?? crypto.randomUUID()) as string }));
    }
  }
  const found: DocItem[] = [];
  for (const dir of PUBLIC_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!/\.pdf$/i.test(f)) continue;
      const filePath = path.join(abs, f);
      const href = `/${dir.replace(/^public\//,'')}/${f}`;
      const title = f.replace(/[-_]/g,' ').replace(/\.pdf$/i,'').trim();
      found.push({
        id: href, title, href,
        category: /norm|gost|snip/i.test(f) ? 'Нормы' : 'Сертификаты',
        sizeKb: getFileSizeKb(filePath)
      });
    }
  }
  return found.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
}
