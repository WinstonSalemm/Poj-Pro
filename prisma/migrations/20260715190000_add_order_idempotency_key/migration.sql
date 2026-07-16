ALTER TABLE `Order`
  ADD COLUMN `idempotency_key` VARCHAR(64) NULL;

CREATE UNIQUE INDEX `Order_idempotency_key_key`
  ON `Order`(`idempotency_key`);
