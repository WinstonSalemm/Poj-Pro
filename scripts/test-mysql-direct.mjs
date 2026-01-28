import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Загружаем .env файл вручную
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Убираем кавычки если есть
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
  console.log('✅ .env файл загружен');
} catch (e) {
  console.warn('⚠️  Не удалось загрузить .env файл:', e.message);
}

const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL не установлен!');
  process.exit(1);
}

// Парсим DATABASE_URL
// Формат: mysql://user:password@host:port/database
const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('❌ Неверный формат DATABASE_URL:', dbUrl);
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('🔍 Параметры подключения:');
console.log('  Хост:', host);
console.log('  Порт:', port);
console.log('  Пользователь:', user);
console.log('  База данных:', database);
console.log('  Пароль:', '****');

const config = {
  host,
  port: parseInt(port),
  user,
  password,
  database,
  ssl: false, // Попробуем без SSL сначала
  connectTimeout: 30000,
  enableKeepAlive: false,
  multipleStatements: false,
};

console.log('\n📝 Конфигурация подключения:');
console.log('  SSL:', config.ssl);
console.log('  Таймаут:', config.connectTimeout, 'мс');

console.log('\n🔌 Попытка подключения...');

try {
  const connection = await mysql.createConnection(config);
  console.log('✅ Подключение установлено!');
  
  // Простой запрос
  const [rows] = await connection.execute('SELECT 1 as test, NOW() as server_time, DATABASE() as current_db');
  console.log('📊 Результат запроса:', rows);
  
  // Версия MySQL
  const [versionRows] = await connection.execute('SELECT VERSION() as version');
  console.log('📦 Версия MySQL:', versionRows[0].version);
  
  // Список таблиц
  const [tables] = await connection.execute(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = ?
    ORDER BY TABLE_NAME
  `, [database]);
  console.log('\n📋 Таблицы в базе данных:');
  console.table(tables);
  
  await connection.end();
  console.log('\n✅ Все проверки завершены успешно!');
  
} catch (error) {
  console.error('\n❌ ОШИБКА подключения:');
  console.error('Название:', error.name);
  console.error('Код:', error.code);
  console.error('Сообщение:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Сервер отклонил подключение. Возможные причины:');
    console.error('  - MySQL сервер не запущен');
    console.error('  - Неверный хост или порт');
    console.error('  - Файрвол блокирует подключение');
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('\n💡 Ошибка доступа. Возможные причины:');
    console.error('  - Неверные учётные данные (логин/пароль)');
    console.error('  - Пользователь не имеет доступа к базе данных');
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    console.error('\n💡 База данных не найдена. Возможные причины:');
    console.error('  - База данных не существует');
    console.error('  - Неверное имя базы данных');
  } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    console.error('\n💡 Проблема с сетью. Возможные причины:');
    console.error('  - Хост недоступен');
    console.error('  - Проблемы с DNS');
    console.error('  - Railway сервис выключен или удалён');
  }
  
  process.exit(1);
}
