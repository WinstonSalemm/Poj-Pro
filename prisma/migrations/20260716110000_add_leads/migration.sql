CREATE TABLE `leads` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `message` TEXT NOT NULL,
  `source` VARCHAR(64) NOT NULL DEFAULT 'contact-form',
  `product_slug` VARCHAR(200) NULL,
  `delivery_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `delivery_error` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `leads_created_at_idx`(`created_at`),
  INDEX `leads_delivery_status_idx`(`delivery_status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
