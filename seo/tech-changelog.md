# Технический changelog — SEO и Core Web Vitals (2025‑09‑16)

Ниже перечислены внедрённые изменения, влияющие на индексацию, SEO и Core Web Vitals. Указаны файлы и основные места правок.

## 1) H1 и структура
- `src/app/page.tsx`
  - Обновлён H1 (RU) строго по ТЗ: «Огнетушители и противопожарное оборудование в Ташкенте — POJ PRO» (верхняя секция `<h1>`).
  - Добавлен JSON‑LD `LocalBusinessJsonLd` под героем.
- `src/app/catalog/[category]/page.tsx`
  - Уникальный H1 для каждой категории: расчёт `h1Title` и вывод `<h1>` (блок контейнера). Добавлен тематический `<h2>` под H1.
- `src/app/catalog/[category]/[id]/page.tsx`
  - H1 товара = локализованное название товара (`<h1>{title}</h1>` в правой колонке карточки).

## 2) LCP/CLS/FID
- `src/components/Hero/HeroBanner.tsx`
  - LCP: SSR‑картинка героя c `priority` и `fetchPriority="high"`; фиксированная высота контейнера; overlay‑монтаж слайдера (Hydration‑safe).
  - Контейнер помечен классом `hero-lcp-frame` для критического CSS.
- `src/app/layout.tsx`
  - Добавлены preconnect к CDN: `cdn.poj-pro.uz`, `poj-pro.uz`, `www.poj-pro.uz`, `placehold.co`.
  - Preload above‑the‑fold изображений: `/OtherPics/product1photo.png`, `/ProductImages/Op-4.png`.
  - Встроен минимальный критический CSS (inline `<style>`) для стабилизации высоты героя (исключение CLS).
- `src/components/Hero/HeroOverlayClient.tsx`
  - Динамический импорт `ImageSlider` (client‑only) для код‑сплита и снижения TBT/INP.
- `src/components/ImageSlider/ImageSlider.tsx`
  - Добавлен режим `variant="overlay"`.
  - Анимация слайдов — чистый crossfade без scale, убраны паддинги у изображений, `sizes="100vw"`.
  - Таймер/паузинг и управление сохранены; устранены микродёргания.
- `src/components/home/HomeSectionsClient.tsx`
  - Удалён дубликат слайдера ниже по странице; оставлены About/Popular/Category/Map.

## 3) Промо‑баннер и адаптив
- `src/components/Promo/AutumnPromo.tsx`
  - Создан промо‑баннер ОП‑4 под героем. Фон: фирменный, мобильная верстка picture‑on‑top, контент слева.
  - Выделение цены — в одной строке через дефис в заголовке (сдержанная плашка).
  - Изображение заменено на корректное: `/ProductImages/Op-4.png`.

## 4) JSON‑LD и микроразметка
- `src/app/page.tsx`
  - Подключён `LocalBusinessJsonLd` (главная) в дополнение к `Organization` и `WebSite`.
- `src/app/contacts/page.tsx`
  - Добавлены `BreadcrumbJsonLd` и `LocalBusinessJsonLd`.
- `src/app/catalog/[category]/page.tsx`
  - Имеются `BreadcrumbList` и `CollectionPage` (через JsonLd‑helpers) — сохранено, плюс `<h2>` с ключами.
- `src/app/catalog/[category]/[id]/page.tsx`
  - Схема `Product`/`Offer` и `BreadcrumbList` уже присутствует — сохранено.

## 5) Кэширование/сжатие/изображения
- `next.config.mjs`
  - В продакшне: `Cache-Control: public, max-age=31536000, immutable` для статики, `_next/static`, шрифтов/изображений.
  - `compress: true` — Gzip/Brotli.
  - `images.formats: ['image/webp', 'image/avif']`, `minimumCacheTTL: 31536000`.
  - Code splitting в продакшне: `optimization.splitChunks` (vendor/common/react), `usedExports` и `sideEffects=false`.

## 6) Дополнительно
- Карты (Leaflet) — динамический импорт в `HomeSectionsClient` → секция `MapSection` грузится только на клиенте (снижение веса initial bundle).
- На страницах каталога и карточек зафиксированы контейнеры изображений (`aspect-*`, фиксированные размеры/высота контейнеров) — снижение CLS.

## Рекомендации к аудиту
1. Пересобрать и запустить:
   - `npm run build`
   - `npm run start:win`
2. Lighthouse (mobile/desktop):
   - Цели: LCP ≤ 2.5s, CLS ≤ 0.1, INP/FID ≤ 100ms, Perf ≥ 85/90, SEO ≥ 90.
3. Если LCP всё ещё высок:
   - Заменить первый кадр героя на AVIF/WebP‑ассет и/или сделать H1 доминирующим LCP‑элементом.

## Верификация уникальности
- title/description/H1 не дублируются: главная, категории, карточки — проверено логикой формирования заголовков.
