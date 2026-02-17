-- CreateTable
CREATE TABLE `CategoryI18n` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `name` VARCHAR(200) NOT NULL,

    INDEX `CategoryI18n_locale_idx`(`locale`),
    INDEX `CategoryI18n_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `CategoryI18n_categoryId_locale_key`(`categoryId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CategoryI18n` ADD CONSTRAINT `CategoryI18n_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
