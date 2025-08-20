import { PrismaClient as MysqlClient } from "@prisma/client";
import { PrismaClient as SqliteClient } from "@prisma/client-sqlite";

// MySQL (Railway) URL: возьмёт из MYSQL_URL или DATABASE_URL
const MYSQL_URL = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (!MYSQL_URL) {
  console.error("Set MYSQL_URL or DATABASE_URL to Railway MySQL URL");
  process.exit(1);
}

// Клиенты: MySQL и SQLite
const mysql = new MysqlClient({ datasources: { db: { url: MYSQL_URL } } });
const sqlite = new SqliteClient(); // url взят из prisma/schema-sqlite.prisma

async function createManyBatched(model, rows, batchSize = 300) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    if (!chunk.length) continue;
    await model.createMany({ data: chunk, skipDuplicates: true });
  }
}

async function main() {
  console.time("TRANSFER");
  console.log("From (SQLite): prisma/dev.db");
  console.log("To   (MySQL) :", MYSQL_URL);

  // Порядок из-за FK:
  // Category → Product → ProductI18n → Certificate → ProductCertificate
  // User → PromoCode → Order → OrderItem → UserPromoCode

  const categories = await sqlite.category.findMany();
  console.log("Category:", categories.length);
  await createManyBatched(mysql.category, categories);

  const products = await sqlite.product.findMany();
  console.log("Product:", products.length);
  await createManyBatched(mysql.product, products);

  const productI18n = await sqlite.productI18n.findMany();
  console.log("ProductI18n:", productI18n.length);
  await createManyBatched(mysql.productI18n, productI18n);

  const certificates = await sqlite.certificate.findMany();
  console.log("Certificate:", certificates.length);
  await createManyBatched(mysql.certificate, certificates);

  const productCertificates = await sqlite.productCertificate.findMany();
  console.log("ProductCertificate:", productCertificates.length);
  await createManyBatched(mysql.productCertificate, productCertificates);

  const users = await sqlite.user.findMany();
  console.log("User:", users.length);
  await createManyBatched(mysql.user, users);

  const promoCodes = await sqlite.promoCode.findMany();
  console.log("PromoCode:", promoCodes.length);
  await createManyBatched(mysql.promoCode, promoCodes);

  const orders = await sqlite.order.findMany();
  console.log("Order:", orders.length);
  await createManyBatched(mysql.order, orders);

  const orderItems = await sqlite.orderItem.findMany();
  console.log("OrderItem:", orderItems.length);
  await createManyBatched(mysql.orderItem, orderItems);

  const userPromoCodes = await sqlite.userPromoCode.findMany();
  console.log("UserPromoCode:", userPromoCodes.length);
  await createManyBatched(mysql.userPromoCode, userPromoCodes);

  console.timeEnd("TRANSFER");
}

main()
  .catch((e) => {
    console.error("TRANSFER FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await mysql.$disconnect();
  });
