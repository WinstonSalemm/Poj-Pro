import fs from 'fs';
import path from 'path';

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

function exportProducts() {
  try {
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

    const products = ruProducts.map(ruProduct => {
      const enProduct = enProducts.find(p => p.id === ruProduct.id);
      const uzProduct = uzProducts.find(p => p.id === ruProduct.id);

      return {
        id: ruProduct.id.toString(),
        slug: `product-${ruProduct.id}`,
        price: parseFloat(ruProduct.price.replace(/\s+/g, '')),
        currency: 'UZS',
        images: JSON.stringify([ruProduct.image]),
        specs: ruProduct.characteristics,
        isActive: true,
        i18n: [
          {
            locale: 'ru',
            title: ruProduct.name,
            summary: ruProduct.short_description,
            description: ruProduct.description
          },
          {
            locale: 'en',
            title: enProduct?.name || ruProduct.name,
            summary: enProduct?.short_description || ruProduct.short_description,
            description: enProduct?.description || ruProduct.description
          },
          {
            locale: 'uz',
            title: uzProduct?.name || ruProduct.name,
            summary: uzProduct?.short_description || ruProduct.short_description,
            description: uzProduct?.description || ruProduct.description
          }
        ]
      };
    });

    // Save to file
    const outputPath = path.join(process.cwd(), 'prisma', 'seed', 'products.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`✅ Exported ${products.length} products to ${outputPath}`);
    console.log('You can now import this file using Prisma Studio:');
    console.log('1. Open Prisma Studio: npx prisma studio');
    console.log('2. Go to the Product model');
    console.log('3. Click "Add record" and paste the content');

  } catch (error) {
    console.error('Export error:', error);
  }
}

exportProducts();
