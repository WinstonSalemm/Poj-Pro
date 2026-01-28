/**
 * Скрипт для миграции данных из Product.images (JSON строка) в таблицу ProductImage
 * Запуск: node scripts/migrate-images-to-table.mjs
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function parseImages(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x.trim()) : [];
  } catch {
    return [];
  }
}

async function main() {
  console.log('🔄 Начинаем миграцию изображений из Product.images в ProductImage...\n');

  // Получаем все товары с полем images (через raw query, т.к. поле уже удалено из схемы Prisma)
  // Используем Prisma.$queryRawUnsafe для работы с полем, которого нет в схеме
  const products = await prisma.$queryRawUnsafe(`
    SELECT id, slug, images 
    FROM Product 
    WHERE images IS NOT NULL AND images != '' AND images != '[]'
  `);

  console.log(`📦 Найдено товаров с изображениями: ${products.length}\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const imageUrls = parseImages(product.images);
      
      if (imageUrls.length === 0) {
        console.log(`⏭️  Пропущен ${product.slug}: нет валидных изображений`);
        skipped++;
        continue;
      }

      // Удаляем старые изображения для этого товара (если есть)
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });

      // Создаем новые записи в ProductImage
      const imageRecords = imageUrls.map((url, index) => ({
        id: randomUUID(),
        productId: product.id,
        url: url.trim(),
        order: index,
      }));

      await prisma.productImage.createMany({
        data: imageRecords,
        skipDuplicates: true,
      });

      console.log(`✅ ${product.slug}: мигрировано ${imageUrls.length} изображений`);
      migrated++;
    } catch (error) {
      console.error(`❌ Ошибка при миграции ${product.slug}:`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Итоги миграции:');
  console.log(`   ✅ Успешно: ${migrated}`);
  console.log(`   ⏭️  Пропущено: ${skipped}`);
  console.log(`   ❌ Ошибок: ${errors}`);
  console.log('\n💡 После проверки данных выполните:');
  console.log('   ALTER TABLE `Product` DROP COLUMN `images`;');
}

main()
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
