-- Per-locale promotion images (RU / ENG / UZB)
ALTER TABLE `promotion_i18n` ADD COLUMN `image` VARCHAR(500) NULL;

-- Backfill: copy legacy single Promotion.image into each locale row
UPDATE `promotion_i18n` AS pi
INNER JOIN `promotions` AS p ON p.`id` = pi.`promotionId`
SET pi.`image` = p.`image`
WHERE pi.`image` IS NULL AND p.`image` IS NOT NULL AND p.`image` <> '';
