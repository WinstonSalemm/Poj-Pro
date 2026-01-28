import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as fs from 'fs/promises';
import * as path from 'path';

type Locale = 'ru' | 'en' | 'uz';

type ProductJsonData = {
  slug: string;
  brand?: string;
  price?: number | string;          // <- допускаем number ИЛИ string
  currency?: string;
  images?: string[];                // <- массив путей в JSON
  specs?: Record<string, unknown>;
  category?: string;                // slug категории
  title?: string;
  summary?: string;
  description?: string;
  certificates?: Array<{ title?: string; href: string }>;
};

const prisma = new PrismaClient();

// utils
const toFloat = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : null;
};
const imagesToJSON = (arr?: string[]) => JSON.stringify(Array.isArray(arr) ? arr : []);
const readJSON = async <T>(p: string): Promise<T> => JSON.parse(await fs.readFile(p, 'utf-8'));

async function loadProducts(locale: Locale): Promise<ProductJsonData[]> {
  const p = path.join(process.cwd(), 'src', 'data', 'products', `${locale}.json`);
  try { return await readJSON<ProductJsonData[]>(p); }
  catch { return []; }
}

// removed unused hashPassword helper

async function seedUsers() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const tenMinutesAgo  = new Date(now.getTime() - 10 * 60 * 1000);

  const password1     = await hash('password123', 12);
  const adminPassword = await hash('admin123', 12);

  await Promise.all([
    prisma.user.upsert({
      where: { email: 'test1@example.com' },
      update: {
        name: 'Test User 1',
        password: password1,
        isAdmin: false,
        lastActive: now,
      },
      create: {
        email: 'test1@example.com',
        name: 'Test User 1',
        password: password1,
        isAdmin: false,
        lastActive: now,
      },
    }),
    prisma.user.upsert({
      where: { email: 'test2@example.com' },
      update: {
        name: 'Test User 2',
        password: password1,
        isAdmin: false,
        lastActive: fiveMinutesAgo,
      },
      create: {
        email: 'test2@example.com',
        name: 'Test User 2',
        password: password1,
        isAdmin: false,
        lastActive: fiveMinutesAgo,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        name: 'Admin User',
        password: adminPassword,
        isAdmin: true,
        lastActive: tenMinutesAgo,
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        isAdmin: true,
        lastActive: tenMinutesAgo,
      },
    }),
  ]);

  console.log('✓ Test users upserted');
}


async function seedProducts() {
  console.log('Loading product data…');
  const [ru, en, uz] = await Promise.all([
    loadProducts('ru'),
    loadProducts('en'),
    loadProducts('uz'),
  ]);

  type Pack = Record<Locale, ProductJsonData | undefined>;
  const bySlug = new Map<string, Pack>();

  const absorb = (loc: Locale, arr: ProductJsonData[]) => {
    for (const it of arr) {
      if (!it?.slug) continue;
      const ex: Pack = bySlug.get(it.slug) ?? { ru: undefined, en: undefined, uz: undefined };
      ex[loc] = it;
      bySlug.set(it.slug, ex);
    }
  };
  absorb('ru', ru); absorb('en', en); absorb('uz', uz);

  console.log(`Found ${bySlug.size} unique slugs`);

  // Чистим аккуратно (в правильном порядке ссылок)
  await prisma.productCertificate.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.productI18n.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  let created = 0;
  const catCache = new Map<string, string>();   // category slug -> id
  const certCache = new Map<string, string>();  // cert href     -> id

  for (const [slug, pack] of bySlug) {
    const base = pack.ru ?? pack.en ?? pack.uz;
    if (!base) continue;

    // category
    let categoryId: string | undefined;
    if (base.category) {
      const slugCat = base.category;
      let cid = catCache.get(slugCat);
      if (!cid) {
        const c = await prisma.category.upsert({
          where: { slug: slugCat },
          update: {},
          create: { slug: slugCat, name: slugCat.replace(/[-_]+/g, ' ') },
          select: { id: true },
        });
        cid = c.id;
        catCache.set(slugCat, cid);
      }
      categoryId = cid;
    }

    // upsert product (images -> JSON string, price -> Float)
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
        ...(categoryId ? { category: { connect: { id: categoryId } } } : { category: { disconnect: true } }),
      },
      select: { id: true }
    });

    // i18n upsert (ru/en/uz)
    const writeI18n = async (locale: Locale, data?: ProductJsonData) => {
      if (!data) return;
      const key = { productId_locale: { productId: product.id, locale } } as const;
      await prisma.productI18n.upsert({
        where: key,
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
    };
    await writeI18n('ru', pack.ru);
    await writeI18n('en', pack.en);
    await writeI18n('uz', pack.uz);

    // certificates (href уникален)
    const certs = base.certificates ?? [];
    for (const c of certs) {
      if (!c?.href) continue;
      let certId = certCache.get(c.href);
      if (!certId) {
        const rec = await prisma.certificate.upsert({
          where: { href: c.href },
          update: { title: c.title ?? c.href },
          create: { href: c.href, title: c.title ?? c.href },
          select: { id: true },
        });
        certId = rec.id;
        certCache.set(c.href, certId);
      }
      await prisma.productCertificate.upsert({
        where: { productId_certificateId: { productId: product.id, certificateId: certId } },
        update: {},
        create: { productId: product.id, certificateId: certId },
      });
    }

    // метрика created/updated: раз у нас upsert после полной очистки,
    // считаем всё как created (для простоты)
    created++;
  }

  console.log(`Seeded products: ${created} created`);
  console.log(`Total categories: ${catCache.size}`);
  console.log(`Total certificates: ${certCache.size}`);
}

async function main() {
  console.log('Starting database seeding…');
  await seedUsers();
  console.log('✓ Test users seeded');
  await seedProducts();
  console.log('✓ Database seeding completed');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
