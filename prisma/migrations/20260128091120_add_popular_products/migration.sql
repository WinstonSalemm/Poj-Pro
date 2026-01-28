/*
  Warnings:

  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ProductI18n` DROP FOREIGN KEY `ProductI18n_productId_fkey`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `images`;

-- CreateTable
CREATE TABLE `popular_products` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `popular_products_order_idx`(`order`),
    INDEX `popular_products_productId_idx`(`productId`),
    UNIQUE INDEX `popular_products_productId_key`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Category_slug_idx` ON `Category`(`slug`);

-- AddForeignKey
ALTER TABLE `ProductI18n` ADD CONSTRAINT `ProductI18n_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `popular_products` ADD CONSTRAINT `popular_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
