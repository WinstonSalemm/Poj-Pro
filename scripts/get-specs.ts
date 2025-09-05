// scripts/get-specs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching products from the database...');
  const products = await prisma.product.findMany({
    select: {
      specs: true,
    },
  });

  if (!products.length) {
    console.log('No products found.');
    return;
  }

  console.log(`Found ${products.length} products. Processing specs...`);

  const specKeys = new Set<string>();
  const specValues = new Set<string>();

  for (const product of products) {
    if (product.specs && typeof product.specs === 'object') {
      const specs = product.specs as Record<string, any>;
      for (const [key, value] of Object.entries(specs)) {
        if (key) {
          specKeys.add(String(key).trim());
        }
        if (value !== null && value !== undefined) {
          specValues.add(String(value).trim());
        }
      }
    }
  }

  console.log('\n--- Unique Spec Keys ---');
  console.log(Array.from(specKeys).join('\n'));

  console.log('\n--- Unique Spec Values ---');
  console.log(Array.from(specValues).join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
