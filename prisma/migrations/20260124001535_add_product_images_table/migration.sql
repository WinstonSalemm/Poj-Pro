-- CreateTable: ProductImage для хранения изображений товаров
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_productId_order_idx`(`productId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: связь ProductImage с Product
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Примечание: поле images из Product будет удалено после миграции данных
-- Запустите скрипт scripts/migrate-images-to-table.mjs для переноса данных
-- После успешной миграции данных выполните: ALTER TABLE `Product` DROP COLUMN `images`;

-- AlterTable: улучшаем ProductI18n - добавляем ограничения на длину полей
ALTER TABLE `ProductI18n` MODIFY `locale` VARCHAR(5) NOT NULL,
    MODIFY `title` VARCHAR(500) NOT NULL,
    MODIFY `summary` TEXT NULL,
    MODIFY `description` TEXT NULL;

-- CreateIndex: добавляем индексы для ProductI18n
CREATE INDEX `ProductI18n_locale_idx` ON `ProductI18n`(`locale`);
CREATE INDEX `ProductI18n_productId_idx` ON `ProductI18n`(`productId`);

-- CreateIndex: добавляем индекс для Product.isActive
CREATE INDEX `Product_isActive_idx` ON `Product`(`isActive`);

-- AlterTable: улучшаем Category.name
ALTER TABLE `Category` MODIFY `name` VARCHAR(200) NULL;

-- Примечание: индекс Category_slug_key уже существует как UNIQUE INDEX, дополнительный индекс не нужен
