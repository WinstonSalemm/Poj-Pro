import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

type Lang = 'ru'|'en'|'uz';
type Raw = { slug: string };

const db = new PrismaClient();

async function readJson(lang: Lang): Promise<Raw[]> {
  const p = path.join(process.cwd(), 'src/data/products', `${lang}.json`);
  try {
    const raw = await fs.readFile(p, 'utf-8');
    return JSON.parse(raw) as Raw[];
  } catch (error) {
    console.error(`Error reading ${p}:`, error);
    return [];
  }
}

async function main() {
  console.log('Starting comparison between DB and JSON files...');
  
  const [ru, en, uz] = await Promise.all([
    readJson('ru'),
    readJson('en'),
    readJson('uz')
  ]);
  
  const jsonSlugs = new Set<string>();
  for (const it of [...ru, ...en, ...uz]) {
    if (it?.slug) {
      jsonSlugs.add(it.slug);
    }
  }

  console.log(`Found ${jsonSlugs.size} unique product slugs in JSON files`);
  
  try {
    const dbRows = await db.product.findMany({ 
      select: { slug: true },
      where: { isActive: true }
    });
    
    const dbSlugs = new Set(dbRows.map(r => r.slug));
    console.log(`Found ${dbSlugs.size} active products in database`);

    const missingInDb = [...jsonSlugs].filter(s => !dbSlugs.has(s));
    const missingInJson = [...dbSlugs].filter(s => !jsonSlugs.has(s));

    console.log('\n=== Comparison Results ===');
    console.log(`JSON total (unique slugs): ${jsonSlugs.size}`);
    console.log(`DB total (active): ${dbSlugs.size}`);
    
    console.log(`\nMissing in DB (${missingInDb.length}):`);
    if (missingInDb.length > 0) {
      console.log(missingInDb.slice(0, 10).join(', '));
      if (missingInDb.length > 10) {
        console.log(`... and ${missingInDb.length - 10} more`);
      }
    } else {
      console.log('None');
    }

    console.log(`\nMissing in JSON (${missingInJson.length}):`);
    if (missingInJson.length > 0) {
      console.log(missingInJson.slice(0, 10).join(', '));
      if (missingInJson.length > 10) {
        console.log(`... and ${missingInJson.length - 10} more`);
      }
    } else {
      console.log('None');
    }

    if (missingInDb.length === 0 && missingInJson.length === 0) {
      console.log('\n✅ DB and JSON are in sync!');
      process.exit(0);
    } else {
      console.log('\n❌ Differences found between DB and JSON');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during comparison:', error);
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
