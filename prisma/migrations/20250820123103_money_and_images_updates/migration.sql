-- AlterTable
ALTER TABLE `Order` MODIFY `total` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `OrderItem` MODIFY `price` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `price` DECIMAL(12, 2) NULL,
    MODIFY `images` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `promo_codes` MODIFY `minOrderAmount` DECIMAL(65, 30) NULL;
