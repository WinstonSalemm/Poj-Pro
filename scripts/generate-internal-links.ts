/*
  Replace placeholders in markdown articles with locale-aware internal links.
  Placeholders:
   - [[CATEGORY:slug]] -> /{locale}/catalog/{slug}
   - [[PRODUCT:slug]] -> /{locale}/catalog/ognetushiteli/{slug}
   - [[ARTICLE:slug]] -> /{locale}/blog/{slug}

  Usage:
   - tsx scripts/generate-internal-links.ts --dir content/articles --locales ru,uz,en
*/

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const dirArg = args.find((a) => a.startsWith('--dir='));
const localesArg = args.find((a) => a.startsWith('--locales='));

const ROOT = process.cwd();
const CONTENT_DIR = path.resolve(ROOT, dirArg ? dirArg.split('=')[1] : 'content/articles');
const LOCALES = (localesArg ? localesArg.split('=')[1] : 'ru,uz,en').split(',');

function replacePlaceholders(md: string, locale: string) {
  return md
    .replace(/\[\[CATEGORY:([a-z0-9\-_/]+)\]\]/gi, (_m, slug) => `/${locale}/catalog/${slug}`)
    .replace(/\[\[PRODUCT:([a-z0-9\-_/]+)\]\]/gi, (_m, slug) => `/${locale}/catalog/ognetushiteli/${slug}`)
    .replace(/\[\[ARTICLE:([a-z0-9\-_/]+)\]\]/gi, (_m, slug) => `/${locale}/blog/${slug}`);
}

function processFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // For multilingual content inside single file, we replace per-locale blocks by scoping lines with locales
  let out = raw;
  for (const loc of LOCALES) {
    // naive approach: replace placeholders in the whole file per locale pass
    out = replacePlaceholders(out, loc);
  }
  fs.writeFileSync(filePath, out, 'utf8');
  console.log(`Processed ${path.relative(ROOT, filePath)}`);
}

function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile() && p.endsWith('.md')) processFile(p);
  }
}

if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`Directory not found: ${CONTENT_DIR}`);
  process.exit(1);
}

walk(CONTENT_DIR);

export {};
