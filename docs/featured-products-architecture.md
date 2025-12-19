# Архитектура блока "Новые товары" и других featured-блоков

## Обзор

Реализована масштабируемая архитектура для отображения специальных блоков товаров (новые, хиты, скидки) с использованием переводов из MySQL, а не из i18n.

## Компоненты

### 1. API Endpoint: `/api/products/featured`

**Файл**: `src/app/api/products/featured/route.ts`

**Параметры запроса**:

- `type` - тип блока: `new` | `hits` | `discounts` (по умолчанию: `new`)
- `locale` - локаль: `ru` | `eng` | `uzb` (поддерживает алиасы `en` → `eng`, `uz` → `uzb`)
- `limit` - количество товаров (по умолчанию: 6, максимум: 20)

**Пример запроса**:

```
GET /api/products/featured?type=new&locale=ru&limit=6
```

**Логика определения новых товаров**:

- Товары, созданные за последние 30 дней (`createdAt >= now() - 30 days`)
- Сортировка по дате создания (новые первыми)

**Кеширование**:

- Использует `withApiCache` middleware
- Ключ кеша: `featured:{type}:{locale}:{limit}`
- TTL: 60 секунд, stale-while-revalidate: 120 секунд

### 2. Хук: `useLocale`

**Файл**: `src/hooks/useLocale.ts`

**Функции**:

- `useLocale()` - возвращает локаль в формате БД (`ru` | `eng` | `uzb`)
- `useLocaleNext()` - возвращает локаль в формате Next.js (`ru` | `en` | `uz`)

**Использование**:

```tsx
const locale = useLocale(); // 'ru' | 'eng' | 'uzb'
```

### 3. Компонент: `NewProductsBlock`

**Файл**: `src/components/catalog/NewProductsBlock.tsx`

**Props**:

- `type?: 'new' | 'hits' | 'discounts'` - тип блока (по умолчанию: `'new'`)
- `limit?: number` - количество товаров (по умолчанию: 6)
- `title?: string` - кастомный заголовок (опционально)
- `className?: string` - дополнительные CSS классы

**Особенности**:

- Автоматически получает текущую локаль через `useLocale()`
- Загружает переводы из MySQL через API
- Поддерживает переводы заголовков для всех языков
- Показывает skeleton loader во время загрузки
- Скрывается, если товаров нет

**Использование**:

```tsx
<NewProductsBlock type="new" limit={6} />
<NewProductsBlock type="hits" limit={4} />
<NewProductsBlock type="discounts" limit={8} title="Специальные предложения" />
```

## Интеграция

### На странице каталога

**Файл**: `src/app/catalog/[category]/page.tsx`

Компонент добавлен после основного блока товаров:

```tsx
{
  /* Products grid */
}
<CategoryProductsClient
  products={products}
  rawCategory={rawCategory}
  lang={locale}
/>;

{
  /* New Products Block */
}
<NewProductsBlock type="new" limit={6} />;
```

## Расширение для других типов

### Добавление нового типа (например, "Акции")

1. **Обновить тип в API**:

```typescript
type FeaturedType = "new" | "hits" | "discounts" | "promotions";
```

2. **Добавить логику в API endpoint**:

```typescript
case 'promotions':
  whereClause = {
    ...baseWhere,
    // Условия для акций
  };
  orderBy = { createdAt: 'desc' };
  break;
```

3. **Добавить переводы заголовков в компонент**:

```typescript
promotions: {
  ru: 'Акции',
  eng: 'Promotions',
  uzb: 'Aksiyalar',
},
```

4. **Использовать компонент**:

```tsx
<NewProductsBlock type="promotions" limit={8} />
```

## Добавление поля `isNew` в БД (опционально)

Если нужно более точное управление новыми товарами:

1. **Миграция Prisma**:

```prisma
model Product {
  // ... существующие поля
  isNew Boolean @default(false)
}
```

2. **Обновить API**:

```typescript
case 'new':
  whereClause = {
    ...baseWhere,
    OR: [
      { isNew: true },
      { createdAt: { gte: thirtyDaysAgo } },
    ],
  };
  break;
```

## Преимущества архитектуры

1. ✅ **Масштабируемость** - легко добавлять новые типы блоков
2. ✅ **Переводы из БД** - не дублирует тексты в i18n
3. ✅ **Автоматическое обновление** - товары обновляются при изменении в БД
4. ✅ **Кеширование** - оптимизированная производительность
5. ✅ **Типобезопасность** - полная поддержка TypeScript
6. ✅ **Реактивность** - автоматически реагирует на смену языка

## Производительность

- API endpoint кешируется на 60 секунд
- Компонент загружает данные только при монтировании и смене языка
- Skeleton loader улучшает UX во время загрузки
- Максимальный лимит товаров: 20 (защита от перегрузки)
