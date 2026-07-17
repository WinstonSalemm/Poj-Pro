-- AlterTable
ALTER TABLE `users` ADD COLUMN `personal_promo_code` VARCHAR(8) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_personal_promo_code_key` ON `users`(`personal_promo_code`);
