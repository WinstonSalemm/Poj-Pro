import { Prisma, PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import * as path from 'path';
import iconv from 'iconv-lite';

type Locale = 'ru' | 'en' | 'uz';

type PlainProduct = {
  id?: number | string;
  slug?: string;
  image?: string;
  images?: string[];
  name?: string;
  description?: string;
  short_description?: string;
  price?: string | number;
  characteristics?: Record<string, unknown>;
  category?: string;
  brand?: string;
};

type ByLocale = { ru?: PlainProduct; en?: PlainProduct; uz?: PlainProduct };

const prisma = new PrismaClient();

function parseArgs() {
  const a = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < a.length; i += 2) {
    const k = a[i], v = a[i + 1];
    if (!k) break;
    if (v && !v.startsWith('-')) out[k.replace(/^--/, '')] = v;
    else { i--; }
  }
  return {
    ru: out.ru ?? path.join(process.cwd(), 'imports', 'ru.json'),
    en: out.en ?? path.join(process.cwd(), 'imports', 'en.json'),
    uz: out.uz ?? path.join(process.cwd(), 'imports', 'uz.json'),
    currency: out.currency ?? 'UZS',
  };
}

async function loadArray(p: string): Promise<PlainProduct[]> {
  try {
    const buf = await readFile(p); // читаем без кодировки
    let text = buf.toString('utf8');

    // простая эвристика «моджибейка»: куча символов Ð/Ñ/Ã и нет кириллицы
    const bad = (text.match(/[ÐÑÃ]/g) || []).length;
    const cyr = (text.match(/[А-Яа-яЁё]/g) || []).length;
    if (bad > 16 && cyr === 0) {
      text = iconv.decode(buf, 'win1251'); // windows-1251 -> utf8
    }

    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error(`File ${p} is not an array`);
    return data as PlainProduct[];
  } catch (e: unknown) {
    console.warn('loadArray fallback/skip:', p, e instanceof Error ? e.message : String(e));
    return [];
  }
}


const toFloat = (v: unknown) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = Number(v.replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const imagesToJSON = (p: PlainProduct) => {
  if (Array.isArray(p.images)) return JSON.stringify(p.images);
  if (typeof p.image === 'string' && p.image.trim().length) return JSON.stringify([p.image.trim()]);
  return JSON.stringify([]);
};

const cyrMap: Record<string, string> = {
  ё:'yo',й:'i',ц:'ts',у:'u',к:'k',е:'e',н:'n',г:'g',ш:'sh',щ:'sch',з:'z',х:'h',ъ:'',ф:'f',ы:'y',
  в:'v',а:'a',п:'p',р:'r',о:'o',л:'l',д:'d',ж:'zh',э:'e',я:'ya',ч:'ch',с:'s',м:'m',и:'i',т:'t',
  ь:'',б:'b',ю:'yu'
};
function slugifyName(name?: string) {
  if (!name) return '';
  let s = name.trim().toLowerCase();
  s = s.replace(/[а-яё]/g, (c) => cyrMap[c] ?? c);
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
  return s;
}
function stableKey(p: PlainProduct): string {
  if (p.slug) return `slug:${p.slug}`;
  if (p.id !== undefined && p.id !== null) return `id:${String(p.id)}`;
  return `name:${slugifyName(p.name)}`;
}
function finalSlug(p: PlainProduct): string {
  if (p.slug) return p.slug;
  const base =
    (p.category ? slugifyName(p.category) + '-' : '') +
    (p.id !== undefined && p.id !== null ? String(p.id) : slugifyName(p.name));
  return base && base !== '-' ? base : `p-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
}

async function main() {
  const args = parseArgs();
  const [ru, en, uz] = await Promise.all([loadArray(args.ru), loadArray(args.en), loadArray(args.uz)]);

  const map = new Map<string, ByLocale>();
  const absorb = (loc: Locale, arr: PlainProduct[]) => {
    for (const p of arr) {
      const key = stableKey(p);
      const ex = map.get(key) ?? {} as ByLocale;
      ex[loc] = p;
      map.set(key, ex);
    }
  };
  absorb('ru', ru);
  absorb('en', en);
  absorb('uz', uz);

  console.log(`Found ${map.size} unique keys`);

  let upProducts = 0, upI18n = 0;
  const links = 0;
  const catCache = new Map<string, string>();
  const certCache = new Map<string, string>();

  for (const [, pack] of map) {
    const base = pack.ru ?? pack.en ?? pack.uz;
    if (!base) continue;

    let categoryId: string | undefined;
    if (base.category) {
      let cid = catCache.get(base.category);
      if (!cid) {
        const rec = await prisma.category.upsert({
          where: { slug: base.category },
          update: {},
          create: { slug: base.category, name: base.category.replace(/[-_]+/g, ' ') },
          select: { id: true },
        });
        cid = rec.id; catCache.set(base.category, cid);
      }
      categoryId = cid;
    }

    const slug = finalSlug(base);
    const price = toFloat(base.price);
    const product = await prisma.product.upsert({
      where: { slug },
      create: {
        slug,
        brand: base.brand ?? null,
        price,
        currency: args.currency,
        images: imagesToJSON(base),
        specs: base.characteristics ? (base.characteristics as Prisma.InputJsonValue) : Prisma.JsonNull,
        isActive: true,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      update: {
        brand: base.brand ?? null,
        price,
        currency: args.currency,
        images: imagesToJSON(base),
        specs: base.characteristics ? (base.characteristics as Prisma.InputJsonValue) : Prisma.JsonNull,
        isActive: true,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      select: { id: true },
    });
    upProducts++;

    const writeI18n = async (loc: Locale, p?: PlainProduct) => {
      if (!p) return;
      await prisma.productI18n.upsert({
        where: { productId_locale: { productId: product.id, locale: loc } },
        create: {
          productId: product.id,
          locale: loc,
          title: p.name ?? `[${loc}] ${slug}`,
          summary: p.short_description ?? null,
          description: p.description ?? null,
        },
        update: {
          title: p.name ?? `[${loc}] ${slug}`,
          summary: p.short_description ?? null,
          description: p.description ?? null,
        },
      });
      upI18n++;
    };
    await writeI18n('ru', pack.ru);
    await writeI18n('en', pack.en);
    await writeI18n('uz', pack.uz);
  }

  console.log(`✅ Done. Products upserted: ${upProducts}, i18n upserts: ${upI18n}, cert links: ${links}`);
  console.log(`Categories: ${catCache.size}, Certificates: ${certCache.size}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
