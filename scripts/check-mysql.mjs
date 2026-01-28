import { PrismaClient } from '@prisma/client';

// Проверка переменных окружения
console.log('🔍 Проверка переменных окружения...');
if (!process.env.DATABASE_URL && !process.env.MYSQL_URL) {
  console.error('❌ ОШИБКА: DATABASE_URL или MYSQL_URL не установлены!');
  process.exit(1);
}

let dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

// Пробуем разные варианты подключения
const originalUrl = dbUrl;
const variants = [
  originalUrl, // Оригинальный URL
  originalUrl + (originalUrl.includes('?') ? '&' : '?') + 'sslaccept=accept_invalid_certs',
  originalUrl + (originalUrl.includes('?') ? '&' : '?') + 'connection_limit=5&connect_timeout=30',
];

console.log('✅ DATABASE_URL найден:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Скрываем пароль
console.log('\n🔧 Пробуем разные варианты подключения...\n');

async function checkConnection() {
  for (let i = 0; i < variants.length; i++) {
    const testUrl = variants[i];
    console.log(`\n📝 Вариант ${i + 1}/${variants.length}: ${testUrl.replace(/:[^:@]+@/, ':****@')}`);
    
    try {
      // Создаём клиент Prisma для каждого варианта
      const prisma = new PrismaClient({
        log: ['error'],
        datasources: {
          db: {
            url: testUrl,
          },
        },
      });
      
      console.log('🔌 Проверка подключения к MySQL...');
      
      // Простой запрос для проверки подключения
      const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as server_time, DATABASE() as current_db`;
      console.log('✅ Подключение успешно!');
      console.log('📊 Результат:', result);
      
      // Если подключение успешно, используем этот URL для дальнейших проверок
      dbUrl = testUrl;
      process.env.DATABASE_URL = testUrl;
      
      await prisma.$disconnect();
      
      // Создаём новый клиент с рабочим URL для полной проверки
      const workingPrisma = new PrismaClient({
        log: ['info', 'warn', 'error'],
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      });
      
      await performFullCheck(workingPrisma);
      await workingPrisma.$disconnect();
      return; // Успешно подключились, выходим
      
    } catch (error) {
      console.error(`❌ Вариант ${i + 1} не сработал:`, error.message);
      if (i === variants.length - 1) {
        // Последний вариант не сработал, выводим полную ошибку
        throw error;
      }
    }
  }
}

async function performFullCheck(prisma) {
  try {
    
    // Проверка версии MySQL
    const version = await prisma.$queryRaw`SELECT VERSION() as version`;
    console.log('📦 Версия MySQL:', version);
    
    // Проверка существующих таблиц
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `;
    console.log('\n📋 Таблицы в базе данных:');
    console.table(tables);
    
    // Проверка статуса миграций
    console.log('\n🔄 Проверка статуса миграций...');
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        ORDER BY finished_at DESC 
        LIMIT 10
      `;
      console.log('✅ Последние миграции:');
      console.table(migrations);
    } catch (e) {
      console.warn('⚠️  Не удалось получить информацию о миграциях:', e.message);
    }
    
    // Проверка основных таблиц
    console.log('\n🔍 Проверка основных таблиц...');
    const tableChecks = [
      { name: 'users', query: prisma.user.count() },
      { name: 'products', query: prisma.product.count() },
      { name: 'orders', query: prisma.order.count() },
      { name: 'categories', query: prisma.category.count() },
    ];
    
    for (const { name, query } of tableChecks) {
      try {
        const count = await query;
        console.log(`  ✅ ${name}: ${count} записей`);
      } catch (e) {
        console.error(`  ❌ ${name}: ошибка - ${e.message}`);
      }
    }
    
    console.log('\n✅ Все проверки завершены успешно!');
    
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    await checkConnection();
  } catch (error) {
    console.error('\n❌ ОШИБКА подключения к базе данных:');
    console.error('Название:', error.name);
    console.error('Код:', error.code);
    console.error('Сообщение:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Возможные причины:');
      console.error('  - MySQL сервер не запущен');
      console.error('  - Неверный хост или порт в DATABASE_URL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Возможные причины:');
      console.error('  - Неверные учётные данные (логин/пароль)');
      console.error('  - Пользователь не имеет доступа к базе данных');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Возможные причины:');
      console.error('  - База данных не существует');
      console.error('  - Неверное имя базы данных в DATABASE_URL');
    }
    
    process.exit(1);
  }
}

main();
