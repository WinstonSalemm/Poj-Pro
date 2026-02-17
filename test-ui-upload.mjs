// UI тест загрузки изображения категории с использованием Playwright
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUIUpload() {
  console.log('🚀 Запуск UI теста загрузки изображения...\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Замедление для наглядности
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // 1. Открываем страницу
    console.log('📄 Открываю http://localhost:3000/admin-products-add...');
    await page.goto('http://localhost:3000/admin-products-add', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);

    // 2. Проверяем, нужна ли авторизация (AdminGate)
    console.log('🔐 Проверяю авторизацию...');
    const needsAuth = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    if (needsAuth) {
      console.log('⚠️  Требуется авторизация, устанавливаю adminToken...');
      await page.evaluate(() => {
        localStorage.setItem('adminToken', 'admin-ship-2025');
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    } else {
      console.log('✅ Авторизация не требуется или уже выполнена');
    }

    // 3. Ждём загрузки формы
    console.log('⏳ Ожидаю загрузки формы...');
    await page.waitForSelector('input[type="radio"][name="categoryMode"]', { timeout: 10000 });

    // 4. Выбираем "Создать новую" категорию
    console.log('📝 Выбираю "Создать новую" категорию...');
    const createNewRadio = await page.locator('input[type="radio"][name="categoryMode"]').nth(1);
    await createNewRadio.click();
    await page.waitForTimeout(1000);

    // 5. Вводим slug категории
    console.log('✏️  Ввожу slug категории: test-cat-ui-1...');
    const categorySlugInput = await page.locator('input[placeholder*="ognetushiteli"]').first();
    await categorySlugInput.fill('test-cat-ui-1');
    await page.waitForTimeout(500);

    // 6. Настраиваем перехват Network запросов
    console.log('🌐 Настраиваю перехват Network запросов...');
    let uploadResponse = null;
    let uploadRequest = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/upload')) {
        console.log('📡 Перехвачен ответ от /api/admin/upload');
        uploadResponse = {
          status: response.status(),
          url: response.url(),
          body: await response.json().catch(() => null)
        };
      }
    });

    page.on('request', (request) => {
      if (request.url().includes('/api/admin/upload')) {
        console.log('📤 Перехвачен запрос к /api/admin/upload');
        uploadRequest = {
          method: request.method(),
          url: request.url(),
          headers: request.headers()
        };
      }
    });

    // 7. Загружаем изображение категории
    console.log('📤 Загружаю изображение категории...');
    const imagePath = path.join(__dirname, 'public', 'OtherPics', 'product3photo.avif');
    console.log(`   Файл: ${imagePath}`);

    const fileInput = await page.locator('input[type="file"][id="category-image-upload"]');
    await fileInput.setInputFiles(imagePath);

    // 8. Ждём завершения загрузки
    console.log('⏳ Ожидаю завершения загрузки...');
    await page.waitForTimeout(3000); // Даём время на загрузку

    // 9. Проверяем, что загрузка завершена
    const uploadedText = await page.locator('label[for="category-image-upload"]').textContent();
    console.log(`📝 Текст после загрузки: "${uploadedText}"`);

    // 10. Делаем скриншот области с превью
    console.log('📸 Делаю скриншот области с превью...');
    await page.screenshot({ 
      path: 'screenshot-category-upload-full.png',
      fullPage: false
    });

    // Скриншот только области с превью и текстом
    const categoryImageSection = await page.locator('label[for="category-image-upload"]').locator('..').locator('..');
    await categoryImageSection.screenshot({ 
      path: 'screenshot-category-upload-preview.png'
    });

    console.log('✅ Скриншоты сохранены:');
    console.log('   - screenshot-category-upload-full.png');
    console.log('   - screenshot-category-upload-preview.png');

    // 11. Получаем путь из превью
    const previewImg = await page.locator('img[alt="Category preview"]').first();
    const previewSrc = await previewImg.getAttribute('src').catch(() => null);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
    console.log('='.repeat(80));

    // 12. Выводим информацию о Network запросе
    if (uploadRequest) {
      console.log('\n📤 REQUEST к /api/admin/upload:');
      console.log(`   Method: ${uploadRequest.method}`);
      console.log(`   URL: ${uploadRequest.url}`);
      console.log(`   Headers:`);
      console.log(`     x-admin-token: ${uploadRequest.headers['x-admin-token']}`);
      console.log(`     content-type: ${uploadRequest.headers['content-type']}`);
    }

    if (uploadResponse) {
      console.log('\n📥 RESPONSE от /api/admin/upload:');
      console.log(`   Status: ${uploadResponse.status}`);
      console.log(`   Body:`);
      console.log(JSON.stringify(uploadResponse.body, null, 4));
      
      if (uploadResponse.body && uploadResponse.body.data && uploadResponse.body.data.paths) {
        const returnedPath = uploadResponse.body.data.paths[0];
        console.log(`\n📍 Возвращённый путь: ${returnedPath}`);
        
        // Проверка на "banner"
        if (returnedPath.toLowerCase().includes('banner')) {
          console.log('   ⚠️  ВНИМАНИЕ: Путь содержит слово "banner"!');
        } else {
          console.log('   ✅ Путь НЕ содержит слово "banner"');
        }
      }
    }

    console.log('\n📺 UI ОТОБРАЖЕНИЕ:');
    console.log(`   Текст "✓ Загружено": ${uploadedText}`);
    console.log(`   Превью src: ${previewSrc || 'НЕ НАЙДЕНО'}`);

    // 13. Проверяем совпадение
    console.log('\n🔍 ПРОВЕРКА СОВПАДЕНИЯ:');
    const selectedFile = 'product3photo.avif';
    
    if (previewSrc) {
      const previewFileName = previewSrc.split('/').pop();
      console.log(`   Выбранный файл: ${selectedFile}`);
      console.log(`   Файл в превью: ${previewFileName}`);
      
      if (previewFileName.includes(selectedFile.replace('.avif', ''))) {
        console.log('   ❌ НЕ СОВПАДАЕТ (имя изменено на уникальное)');
        console.log(`   Отображается: ${previewSrc}`);
      } else {
        console.log('   ✅ Имя файла изменено (это нормально для безопасности)');
        console.log(`   Отображается: ${previewSrc}`);
      }
      
      // Проверка на "banner" в превью
      if (previewSrc.toLowerCase().includes('banner')) {
        console.log('   ⚠️  ВНИМАНИЕ: Превью содержит слово "banner"!');
      } else {
        console.log('   ✅ Превью НЕ содержит слово "banner"');
      }
    } else {
      console.log('   ❌ Превью не найдено!');
    }

    console.log('\n' + '='.repeat(80));

    // Держим браузер открытым для просмотра
    console.log('\n⏸️  Браузер остаётся открытым для просмотра (закроется через 10 секунд)...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await page.screenshot({ path: 'screenshot-error.png' });
    console.log('📸 Скриншот ошибки сохранён: screenshot-error.png');
  } finally {
    await browser.close();
    console.log('\n✅ Тест завершён');
  }
}

testUIUpload();
