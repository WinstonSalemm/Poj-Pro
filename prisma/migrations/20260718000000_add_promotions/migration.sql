-- CreateTable
CREATE TABLE `promotions` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(500) NULL,
    `imageData` MEDIUMBLOB NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `ctaUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promotions_slug_key`(`slug`),
    INDEX `promotions_isActive_idx`(`isActive`),
    INDEX `promotions_sortOrder_idx`(`sortOrder`),
    INDEX `promotions_startsAt_endsAt_idx`(`startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_i18n` (
    `id` VARCHAR(191) NOT NULL,
    `promotionId` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `summary` TEXT NULL,
    `description` TEXT NULL,

    INDEX `promotion_i18n_locale_idx`(`locale`),
    INDEX `promotion_i18n_promotionId_idx`(`promotionId`),
    UNIQUE INDEX `promotion_i18n_promotionId_locale_key`(`promotionId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promotion_i18n` ADD CONSTRAINT `promotion_i18n_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
