import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ImportItem {
  id: number;
  name?: string;
  description?: string;
  short_description?: string;
}

function sanitize(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

async function main() {
  const importPath = path.join(process.cwd(), 'imports', 'uz.json');
  if (!fs.existsSync(importPath)) {
    console.error(`❌ File not found: ${importPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(importPath, 'utf-8');
  const items: ImportItem[] = JSON.parse(raw);

  let updated = 0;
  let skippedMissingProduct = 0;
  let skippedNoTexts = 0;

  for (const it of items) {
    const productId = String(it.id);
    // Ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      skippedMissingProduct++;
      console.warn(`⚠️  Product not found in DB, id=${productId}`);
      continue;
    }

    const title = sanitize(it.name) ?? product.slug; // fallback to slug
    const summary = sanitize(it.short_description);
    const description = sanitize(it.description);

    if (!title && !summary && !description) {
      skippedNoTexts++;
      continue;
    }

    await prisma.productI18n.upsert({
      where: {
        productId_locale: {
          productId: productId,
          locale: 'uz',
        },
      },
      update: {
        title: title || product.slug,
        summary,
        description,
      },
      create: {
        productId: productId,
        locale: 'uz',
        title: title || product.slug,
        summary,
        description,
      },
    });

    updated++;
    if (updated % 50 === 0) {
      console.log(`...updated ${updated} items so far`);
    }
  }

  console.log(`✅ Uzbek i18n update complete. Updated: ${updated}, Missing products: ${skippedMissingProduct}, No text: ${skippedNoTexts}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
