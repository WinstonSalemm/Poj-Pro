import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const [cats, prods, users] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count(),
  ]);
  console.log(JSON.stringify({ cats, prods, users }, null, 2));
}

main()
  .catch((e) => {
    console.error('SANITY FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
