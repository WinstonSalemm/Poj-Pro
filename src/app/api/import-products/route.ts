import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function POST() {
  console.log('Starting import...');
  try {
    // Read product data from JSON files
    const basePath = path.join(process.cwd(), 'src/locales');
    
    const ruProducts: ProductData[] = JSON.parse(
      fs.readFileSync(path.join(basePath, 'ru/data/products.json'), 'utf-8')
    );

    const enProducts: ProductData[] = JSON.parse(
      fs.readFileSync(path.join(basePath, 'eng/data/products.json'), 'utf-8')
    );

    const uzProducts: ProductData[] = JSON.parse(
      fs.readFileSync(path.join(basePath, 'uzb/data/products.json'), 'utf-8')
    );

    const results = [];

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

      // Create or update product
      const product = await prisma.product.upsert({
        where: { id: ruProduct.id.toString() },
        update: {
          slug: `product-${ruProduct.id}`,
          price: parseFloat(ruProduct.price.replace(/\s+/g, '')),
          currency: 'UZS',
          images: JSON.stringify([ruProduct.image]),
          specs: ruProduct.characteristics,
          categoryId: category?.id,
          isActive: true
        },
        create: {
          id: ruProduct.id.toString(),
          slug: `product-${ruProduct.id}`,
          price: parseFloat(ruProduct.price.replace(/\s+/g, '')),
          currency: 'UZS',
          images: JSON.stringify([ruProduct.image]),
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

      results.push({
        id: product.id,
        name: ruProduct.name,
        status: 'imported'
      });
    }

    console.log('Import completed successfully');
    return NextResponse.json({
      success: true,
      imported: results.length,
      results
    }, { status: 200 });

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', { errorMessage, stack });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Import failed',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
