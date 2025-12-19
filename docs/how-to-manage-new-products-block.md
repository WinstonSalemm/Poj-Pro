# Как управлять блоком "Новые товары"

## 📍 Где находится блок

Блок добавлен в двух местах:

1. **Главная страница каталога** (`/catalog`) - `src/components/CatalogView.tsx` (строка ~359)
2. **Страницы категорий** (`/catalog/[category]`) - `src/app/catalog/[category]/page.tsx` (строка ~337)

## 🎛️ Основные настройки

### 1. Изменить количество товаров

Измени параметр `limit`:

```tsx
// Показать 8 товаров вместо 6
<NewProductsBlock type="new" limit={8} />

// Показать 4 товара
<NewProductsBlock type="new" limit={4} />
```

**Ограничение**: максимум 20 товаров (защита от перегрузки)

### 2. Изменить заголовок блока

**Вариант 1**: Кастомный заголовок для конкретного места

```tsx
<NewProductsBlock type="new" limit={6} title="Специальные предложения" />
```

**Вариант 2**: Изменить переводы заголовков в компоненте

Открой `src/components/catalog/NewProductsBlock.tsx` и найди функцию `getBlockTitle()` (около строки 99):

```typescript
const titles: Record<string, Record<"ru" | "eng" | "uzb", string>> = {
  new: {
    ru: "Новые товары", // ← Измени здесь
    eng: "New Products", // ← И здесь
    uzb: "Yangi mahsulotlar", // ← И здесь
  },
  // ...
};
```

### 3. Изменить критерии "новых товаров"

Открой `src/app/api/products/featured/route.ts` и найди секцию `case 'new':` (около строки 56):

#### Вариант A: Изменить период (например, 7 дней вместо 30)

```typescript
case 'new':
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // ← Измени 30 на 7

  const recentCount = await prisma.product.count({
    where: {
      ...baseWhere,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  if (recentCount > 0) {
    whereClause = {
      ...baseWhere,
      createdAt: { gte: sevenDaysAgo }, // ← И здесь
    };
  } else {
    whereClause = baseWhere;
  }
  orderBy = { createdAt: 'desc' };
  break;
```

#### Вариант B: Добавить поле `isNew` в БД (более точное управление)

**Шаг 1**: Добавь поле в Prisma схему

Открой `prisma/schema.prisma` и добавь поле:

```prisma
model Product {
  // ... существующие поля
  isNew     Boolean   @default(false)  // ← Добавь это поле
  createdAt DateTime  @default(now())
  // ...
}
```

**Шаг 2**: Создай миграцию

```bash
npx prisma migrate dev --name add_is_new_field
```

**Шаг 3**: Обнови API логику

В `src/app/api/products/featured/route.ts`:

```typescript
case 'new':
  // Используем поле isNew ИЛИ товары за последние 30 дней
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  whereClause = {
    ...baseWhere,
    OR: [
      { isNew: true },  // ← Товары с флагом isNew
      { createdAt: { gte: thirtyDaysAgo } }, // ← Или созданные за 30 дней
    ],
  };
  orderBy = { createdAt: 'desc' };
  break;
```

**Шаг 4**: Управляй через админку или SQL

```sql
-- Пометить товар как новый
UPDATE Product SET isNew = true WHERE id = 'товар-id';

-- Убрать пометку
UPDATE Product SET isNew = false WHERE id = 'товар-id';

-- Пометить все товары за последние 7 дней
UPDATE Product SET isNew = true WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 4. Добавить блок на другие страницы

Просто добавь компонент в нужное место:

```tsx
import NewProductsBlock from "@/components/catalog/NewProductsBlock";

// В твоём компоненте:
<NewProductsBlock type="new" limit={6} />;
```

**Примеры мест для добавления**:

- На главной странице (`src/app/page.tsx`)
- На странице конкретного товара
- В сайдбаре
- В футере

### 5. Добавить другие типы блоков

#### A. Блок "Хиты продаж"

```tsx
<NewProductsBlock type="hits" limit={4} />
```

**Настройка логики** в `src/app/api/products/featured/route.ts`:

```typescript
case 'hits':
  // Вариант 1: Последние обновленные
  whereClause = baseWhere;
  orderBy = { updatedAt: 'desc' };
  break;

  // Вариант 2: Товары с наибольшим stock
  // whereClause = baseWhere;
  // orderBy = { stock: 'desc' };
  // break;

  // Вариант 3: Добавить поле isPopular в БД (аналогично isNew)
  // whereClause = { ...baseWhere, isPopular: true };
  // orderBy = { updatedAt: 'desc' };
  // break;
```

#### B. Блок "Скидки"

```tsx
<NewProductsBlock type="discounts" limit={8} />
```

**Настройка логики** (нужно добавить поле `discountPrice` в БД):

```typescript
case 'discounts':
  whereClause = {
    ...baseWhere,
    discountPrice: { not: null }, // Товары со скидкой
  };
  orderBy = { createdAt: 'desc' };
  break;
```

#### C. Создать новый тип (например, "Акции")

**Шаг 1**: Обнови тип в API

В `src/app/api/products/featured/route.ts`:

```typescript
type FeaturedType = "new" | "hits" | "discounts" | "promotions"; // ← Добавь
```

**Шаг 2**: Добавь логику

```typescript
case 'promotions':
  // Твоя логика для акций
  whereClause = {
    ...baseWhere,
    // Например, товары с определенным тегом или категорией
    // OR: [
    //   { category: { slug: 'special-offers' } },
    //   { tags: { has: 'promotion' } },
    // ],
  };
  orderBy = { createdAt: 'desc' };
  break;
```

**Шаг 3**: Добавь переводы заголовков

В `src/components/catalog/NewProductsBlock.tsx`:

```typescript
const titles: Record<string, Record<"ru" | "eng" | "uzb", string>> = {
  // ...
  promotions: {
    ru: "Акции",
    eng: "Promotions",
    uzb: "Aksiyalar",
  },
};
```

**Шаг 4**: Используй

```tsx
<NewProductsBlock type="promotions" limit={8} />
```

## 🔧 Продвинутые настройки

### Изменить период автоматического определения новых товаров

В `src/app/api/products/featured/route.ts`, строка ~58:

```typescript
// Текущее: 30 дней
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

// Измени на нужное количество дней:
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // 7 дней
```

### Изменить кеширование

В `src/app/api/products/featured/route.ts`, строка ~145:

```typescript
headers: {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  // s-maxage=60 - кеш на 60 секунд
  // stale-while-revalidate=120 - показывать старый кеш до 120 секунд
}
```

### Скрыть блок, если товаров нет

В `src/components/catalog/NewProductsBlock.tsx`, раскомментируй строки 94-96:

```typescript
// Если нет товаров, не показываем блок
if (!loading && mappedProducts.length === 0) {
  return null;
}
```

## 📝 Примеры использования

### Пример 1: Блок на главной странице

В `src/app/page.tsx`:

```tsx
import NewProductsBlock from "@/components/catalog/NewProductsBlock";

export default async function HomePage() {
  return (
    <main>
      {/* Другой контент */}

      <NewProductsBlock type="new" limit={8} title="Новинки каталога" />
    </main>
  );
}
```

### Пример 2: Несколько блоков на одной странице

```tsx
<NewProductsBlock type="new" limit={6} />
<NewProductsBlock type="hits" limit={4} />
<NewProductsBlock type="discounts" limit={8} />
```

### Пример 3: Блок с кастомным стилем

```tsx
<NewProductsBlock type="new" limit={6} className="bg-gray-50 py-8" />
```

## 🐛 Отладка

### Проверить, что блок работает

1. Открой консоль браузера (F12)
2. Ищи логи:
   - `[NewProductsBlock]` - состояние компонента
   - `[/api/products/featured]` - ответ API

### Проверить API напрямую

Открой в браузере:

```
http://localhost:3000/api/products/featured?type=new&locale=ru&limit=6
```

Должен вернуться JSON с массивом товаров.

### Проверить, есть ли новые товары в БД

```sql
-- Товары за последние 30 дней
SELECT id, slug, createdAt
FROM Product
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND isActive = true
ORDER BY createdAt DESC
LIMIT 10;
```

## ✅ Чеклист для добавления нового типа блока

- [ ] Добавить тип в `type FeaturedType` в API
- [ ] Добавить `case` в `switch` в API
- [ ] Добавить переводы заголовков в компоненте
- [ ] Протестировать API endpoint
- [ ] Добавить компонент на страницу
- [ ] Проверить работу на всех языках

## 🎯 Рекомендации

1. **Для точного управления**: Используй поле `isNew` в БД вместо автоматического определения по дате
2. **Для производительности**: Не ставь `limit` больше 10-12 товаров
3. **Для UX**: Всегда показывай skeleton loader во время загрузки
4. **Для SEO**: Блок автоматически использует переводы из БД, что хорошо для SEO
