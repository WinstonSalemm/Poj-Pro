import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.poj-pro.uz';
  return raw.replace(/\/$/, '');
}

function getArg(name: string, def?: string) {
  const m = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!m) return def;
  return m.split('=')[1] ?? def;
}

async function main() {
  const prisma = new PrismaClient();
  const SITE_URL = getSiteUrl();
  const limit = parseInt(getArg('limit', '150')!, 10) || 150;
  const outDir = path.join(process.cwd(), 'seo');
  const date = new Date();
  const stamp = date.toISOString().slice(0,10);
  const outFile = path.join(outDir, `gsc-submit-urls-${stamp}.txt`);

  const baseUrls: string[] = [
    `${SITE_URL}/`,
    `${SITE_URL}/catalog`,
    `${SITE_URL}/guide`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contacts`,
    `${SITE_URL}/documents`,
    `${SITE_URL}/documents/certificates`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/en/blog`,
    `${SITE_URL}/uz/blog`,
    // key RU categories
    `${SITE_URL}/catalog/ognetushiteli`,
    `${SITE_URL}/catalog/pozharnye_shkafy`,
    `${SITE_URL}/catalog/rukava_i_pozharnaya_armatura`,
    `${SITE_URL}/catalog/pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva`,
    `${SITE_URL}/catalog/siz`,
  ];

  // Load active products (with category)
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { isNot: null } },
    select: { slug: true, category: { select: { slug: true } } },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  const productUrls = products
    .filter(p => p.slug && p.category?.slug)
    .map(p => `${SITE_URL}/catalog/${p.category!.slug}/${p.slug}`);

  const lines = Array.from(new Set([...baseUrls, ...productUrls])).join('\n') + '\n';
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, lines, 'utf-8');

  await prisma.$disconnect();
  console.log(`✅ Wrote ${baseUrls.length + productUrls.length} URLs to ${outFile}`);
}

main().catch(async (e) => { console.error(e); process.exitCode = 1; });
