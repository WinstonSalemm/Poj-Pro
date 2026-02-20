// Тест API категорий
const API_URL = 'https://www.poj-pro.uz';
const TOKEN = 'admin-ship-2025'; // замените на ваш токен

async function testCreateCategory() {
  console.log('Testing category creation...');
  
  const payload = {
    slug: 'test-category-' + Date.now(),
    imageData: null,
    i18n: {
      ru: 'Тестовая категория',
      eng: 'Test Category',
      uzb: 'Test Kategoriya',
    },
  };
  
  console.log('Payload:', payload);
  
  try {
    const response = await fetch(`${API_URL}/api/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': TOKEN,
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', response.status);
    
    const json = await response.json();
    console.log('Response JSON:', json);
    
    if (response.ok && json.success) {
      console.log('✅ Category created successfully!');
    } else {
      console.error('❌ Failed to create category:', json.message || json.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCreateCategory();
