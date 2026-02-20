import { PrismaClient } from '@prisma/client';

// Fallback: if DATABASE_URL is not set but MYSQL_URL exists (Railway MySQL), use it
if (!process.env.DATABASE_URL && process.env.MYSQL_URL) {
  process.env.DATABASE_URL = process.env.MYSQL_URL;
}

// Улучшаем DATABASE_URL для Railway MySQL: добавляем параметры подключения если их нет
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway') && !process.env.DATABASE_URL.includes('?')) {
  // Добавляем параметры подключения для Railway MySQL
  // connect_timeout=30 - таймаут подключения 30 секунд
  // socket_timeout=30 - таймаут сокета 30 секунд
  // pool_timeout=30 - таймаут пула 30 секунд
  process.env.DATABASE_URL += '?sslaccept=accept_invalid_certs&connection_limit=10&connect_timeout=30&socket_timeout=30&pool_timeout=30';
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' 
      ? ['error', 'query'] 
      : ['warn', 'error', 'query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}