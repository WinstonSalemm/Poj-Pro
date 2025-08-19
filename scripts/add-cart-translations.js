const fs = require('fs');
const path = require('path');

// Define the cart translations for each language
const cartTranslations = {
  ru: {
    cart: {
      title: 'Корзина',
      loading: 'Загрузка корзины...',
      emptyTitle: 'Ваша корзина пуста',
      emptyDescription: 'Похоже, вы еще не добавили товары в корзину.',
      removeConfirm: 'Удалить этот товар из корзины?',
      remove: 'Удалить',
      decreaseQuantity: 'Уменьшить количество',
      increaseQuantity: 'Увеличить количество',
      quantity: 'Количество',
      price: 'Цена',
      total: 'Итого',
      subtotal: 'Промежуточный итог',
      continueShopping: 'Продолжить покупки',
      clearCart: 'Очистить корзину',
      orderSummary: 'Сводка заказа',
      checkout: 'Оформить заказ',
      shippingNote: 'Доставка и налоги рассчитываются при оформлении заказа',
      needHelp: 'Нужна помощь?',
      contactUs: 'Позвоните нам по телефону',
      returnPolicy: 'Условия возврата',
      addToCart: 'В корзину',
      adding: 'Добавляем...',
      addedToCart: 'Добавлено!',
      inCart: 'В корзине',
      product: 'Товар'
    }
  },
  eng: {
    cart: {
      title: 'Shopping Cart',
      loading: 'Loading your cart...',
      emptyTitle: 'Your cart is empty',
      emptyDescription: 'Looks like you haven\'t added any products to your cart yet.',
      removeConfirm: 'Remove this item from cart?',
      remove: 'Remove',
      decreaseQuantity: 'Decrease quantity',
      increaseQuantity: 'Increase quantity',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      subtotal: 'Subtotal',
      continueShopping: 'Continue Shopping',
      clearCart: 'Clear Shopping Cart',
      orderSummary: 'Order Summary',
      checkout: 'Proceed to Checkout',
      shippingNote: 'Shipping & taxes calculated at checkout',
      needHelp: 'Need help or have questions?',
      contactUs: 'Call Customer Service at',
      returnPolicy: 'See our return policy',
      addToCart: 'Add to Cart',
      adding: 'Adding...',
      addedToCart: 'Added!',
      inCart: 'In Cart',
      product: 'Product'
    }
  },
  uzb: {
    cart: {
      title: 'Savat',
      loading: 'Savat yuklanmoqda...',
      emptyTitle: 'Savingiz bo\'sh',
      emptyDescription: 'Siz hali mahsulot qo\'shmadingiz.',
      removeConfirm: 'Ushbu mahsulotni savatdan o\'chirishni xohlaysizmi?',
      remove: 'O\'chirish',
      decreaseQuantity: 'Miqdorni kamaytirish',
      increaseQuantity: 'Miqdorni oshirish',
      quantity: 'Miqdor',
      price: 'Narx',
      total: 'Jami',
      subtotal: 'Jami',
      continueShopping: 'Xaridni davom etish',
      clearCart: 'Savatni tozalash',
      orderSummary: 'Buyurtma xulosasi',
      checkout: 'Buyurtma berish',
      shippingNote: 'Yetkazib berish va soliqlar buyurtma berishda hisoblanadi',
      needHelp: 'Yordam kerakmi?',
      contactUs: 'Mijozlarga xizmat ko\'rsatish xizmatiga murojaat qiling',
      returnPolicy: 'Qaytarish shartlarini ko\'rish',
      addToCart: 'Savatga qo\'shish',
      adding: 'Qo\'shilmoqda...',
      addedToCart: 'Qo\'shildi!',
      inCart: 'Savatchada',
      product: 'Mahsulot'
    }
  }
};

// Function to update translations
function updateTranslations() {
  Object.entries(cartTranslations).forEach(([lang, translations]) => {
    const filePath = path.join(
      __dirname, 
      '..',
      'src',
      'locales', 
      lang, 
      'translation.json'
    );
    
    try {
      // Read the existing translations
      const existingTranslations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Merge the existing translations with the new cart translations
      const updatedTranslations = {
        ...existingTranslations,
        ...translations
      };
      
      // Write the updated translations back to the file
      fs.writeFileSync(
        filePath, 
        JSON.stringify(updatedTranslations, null, 2) + '\n',
        'utf8'
      );
      
      console.log(`✅ Updated translations for ${lang}`);
    } catch (error) {
      console.error(`❌ Error updating ${lang} translations:`, error.message);
    }
  });
  
  console.log('✅ All translations updated successfully!');
}

// Run the update function
updateTranslations();
