import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ProductData {
  id: number;
  image: string;
  name: string;
  description: string;
  short_description: string;
  price: string;
  characteristics: Record<string, string>;
  category?: string;
}

async function importProducts() {
  try {
    // Read product data from JSON files
    const ruProducts: ProductData[] = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/locales/ru/data/products.json'), 'utf-8')
    );

    const enProducts: ProductData[] = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/locales/eng/data/products.json'), 'utf-8')
    );

    const uzProducts: ProductData[] = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../src/locales/uzb/data/products.json'), 'utf-8')
    );

    // Process each product
    for (let i = 0; i < ruProducts.length; i++) {
      const ruProduct = ruProducts[i];
      const enProduct = enProducts.find(p => p.id === ruProduct.id);
      const uzProduct = uzProducts.find(p => p.id === ruProduct.id);

      if (!enProduct || !uzProduct) {
        console.warn(`Missing translations for product ${ruProduct.id}`);
        continue;
      }

      // Create or update category
      let category = null;
      if (ruProduct.category) {
        category = await prisma.category.upsert({
          where: { slug: ruProduct.category.toLowerCase().replace(/\s+/g, '-') },
          update: { name: ruProduct.category },
          create: {
            slug: ruProduct.category.toLowerCase().replace(/\s+/g, '-'),
            name: ruProduct.category
          }
        });
      }

      // Create product
      const product = await prisma.product.upsert({
        where: { id: ruProduct.id.toString() },
        update: {
          slug: `product-${ruProduct.id}`,
          price: parseFloat(ruProduct.price.replace(/\s+/g, '')),
          currency: 'UZS',
          specs: ruProduct.characteristics,
          categoryId: category?.id,
          isActive: true
        },
        create: {
          id: ruProduct.id.toString(),
          slug: `product-${ruProduct.id}`,
          price: parseFloat(ruProduct.price.replace(/\s+/g, '')),
          currency: 'UZS',
          specs: ruProduct.characteristics,
          categoryId: category?.id,
          isActive: true,
          i18n: {
            create: [
              {
                locale: 'ru',
                title: ruProduct.name,
                summary: ruProduct.short_description,
                description: ruProduct.description
              },
              {
                locale: 'en',
                title: enProduct.name,
                summary: enProduct.short_description,
                description: enProduct.description
              },
              {
                locale: 'uz',
                title: uzProduct.name,
                summary: uzProduct.short_description,
                description: uzProduct.description
              }
            ]
          }
        },
        include: { i18n: true }
      });

      console.log(`Processed product: ${ruProduct.name}`);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProducts();
