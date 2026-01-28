import { Prisma, PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import * as path from 'path';

type Locale = 'ru' | 'en' | 'uz';
type JsonProduct = {
  slug: string;
  brand?: string;
  price?: string | number;
  currency?: string;
  images?: string[];
  specs?: Record<string, unknown>;
  category?: string;
  title?: string;
  summary?: string;
  description?: string;
  certificates?: Array<{ title?: string; href: string }>;
};

const prisma = new PrismaClient();

const toFloat = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : null;
};
const imagesToJSON = (arr?: string[]) => JSON.stringify(Array.isArray(arr) ? arr : []);

async function loadFile(p: string): Promise<JsonProduct[]> {
  const txt = await readFile(p, 'utf-8');
  const data = JSON.parse(txt);
  if (!Array.isArray(data)) throw new Error(`File ${p} must contain an array`);
  return data as JsonProduct[];
}

function parseArgs() {
  // usage: npx tsx scripts/import-products.ts --ru imports/ru.json --en imports/en.json --uz imports/uz.json
  const a = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i += 2) {
    const key = a[i];
    const val = a[i + 1];
    if (!val) throw new Error(`Missing value for ${key}`);
    out[key.replace(/^--/, '')] = val;
  }
  return out as { ru?: string; en?: string; uz?: string; mode?: string };
}

async function main() {
  const args = parseArgs();
  const ruPath = args.ru ?? path.join(process.cwd(), 'imports', 'ru.json');
  const enPath = args.en ?? path.join(process.cwd(), 'imports', 'en.json');
  const uzPath = args.uz ?? path.join(process.cwd(), 'imports', 'uz.json');

  const [ru, en, uz] = await Promise.all([
    loadFile(ruPath).catch(() => []),
    loadFile(enPath).catch(() => []),
    loadFile(uzPath).catch(() => []),
  ]);

  type Pack = { ru?: JsonProduct; en?: JsonProduct; uz?: JsonProduct };
  const bySlug = new Map<string, Pack>();

  const absorb = (loc: Locale, arr: JsonProduct[]) => {
    for (const p of arr) {
      if (!p?.slug) continue;
      const ex = bySlug.get(p.slug) ?? {};
      (ex as any)[loc] = p;
      bySlug.set(p.slug, ex);
    }
  };
  absorb('ru', ru);
  absorb('en', en);
  absorb('uz', uz);

  console.log(`Found ${bySlug.size} unique slugs`);

  let upserts = 0, i18nUpserts = 0, certLinks = 0;
  const catCache = new Map<string, string>();
  const certCache = new Map<string, string>();

  for (const [slug, pack] of bySlug) {
    const base = pack.ru ?? pack.en ?? pack.uz;
    if (!base) continue;

    // category connectOrCreate
    let categoryId: string | undefined;
    if (base.category) {
      let cid = catCache.get(base.category);
      if (!cid) {
        const c = await prisma.category.upsert({
          where: { slug: base.category },
          update: {},
          create: { slug: base.category, name: base.category.replace(/[-_]+/g, ' ') },
          select: { id: true },
        });
        cid = c.id;
        catCache.set(base.category, cid);
      }
      categoryId = cid;
    }

    // product upsert
    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        brand: base.brand ?? null,
        price: toFloat(base.price),
        currency: base.currency ?? null,
        specs: (base.specs ?? {}) as Prisma.InputJsonValue,
        isActive: true,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      update: {
        brand: base.brand ?? null,
        price: toFloat(base.price),
        currency: base.currency ?? null,
        specs: (base.specs ?? {}) as Prisma.InputJsonValue,
        isActive: true,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      select: { id: true },
    });
    upserts++;

    // i18n upserts
    const writeI18n = async (locale: Locale, data?: JsonProduct) => {
      if (!data) return;
      await prisma.productI18n.upsert({
        where: { productId_locale: { productId: product.id, locale } },
        create: {
          productId: product.id,
          locale,
          title: data.title ?? `[${locale}] ${slug}`,
          summary: data.summary ?? null,
          description: data.description ?? null,
        },
        update: {
          title: data.title ?? `[${locale}] ${slug}`,
          summary: data.summary ?? null,
          description: data.description ?? null,
        },
      });
      i18nUpserts++;
    };
    await writeI18n('ru', pack.ru);
    await writeI18n('en', pack.en);
    await writeI18n('uz', pack.uz);

    // certificates (объединяем из всех локалей)
    const allCerts = [
      ...(pack.ru?.certificates ?? []),
      ...(pack.en?.certificates ?? []),
      ...(pack.uz?.certificates ?? []),
    ];
    const uniqueCerts = new Map<string, { title?: string; href: string }>();
    for (const c of allCerts) if (c?.href) uniqueCerts.set(c.href, c);

    for (const [href, c] of uniqueCerts) {
      let certId = certCache.get(href);
      if (!certId) {
        const rec = await prisma.certificate.upsert({
          where: { href },
          update: { title: c.title ?? href },
          create: { href, title: c.title ?? href },
          select: { id: true },
        });
        certId = rec.id;
        certCache.set(href, certId);
      }
      await prisma.productCertificate.upsert({
        where: { productId_certificateId: { productId: product.id, certificateId: certId } },
        update: {},
        create: { productId: product.id, certificateId: certId },
      });
      certLinks++;
    }
  }

  console.log(`✅ Done. Products upserted: ${upserts}, i18n upserts: ${i18nUpserts}, cert links: ${certLinks}`);
  console.log(`Categories: ${catCache.size}, Certificates: ${certCache.size}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
