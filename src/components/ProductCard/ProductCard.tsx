"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/i18n/useTranslation";
import type { Product as CanonicalProduct } from "@/types/product";
import { trackAddToCart } from "@/components/analytics/events";
import { evSelectItem } from "@/lib/analytics/dataLayer";

// ключи переводов
const TRANSLATION_KEYS = {
  viewDetails: "productCard.viewDetails" as const,
  addToCart: "productCard.addToCart" as const,
  unnamed: "productCard.unnamed" as const,
} as const;

// Используем канонический тип продукта во всём приложении
export type Product = CanonicalProduct;

function parsePriceUZS(price: string | number | undefined): number {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const n = Number(String(price).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const PLACEHOLDER_IMG = "/OtherPics/product2photo.jpg";
const BLUR_DATA =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+";

// Normalize image URLs: prefix bare filenames with /ProductImages/ and ensure leading slash.
function normalizeImageUrl(u?: string): string {
  if (!u) return PLACEHOLDER_IMG;
  let s = String(u).trim();
  if (!s) return PLACEHOLDER_IMG;
  // keep external/data/blob URLs as-is
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  // strip leading ./ and public/ prefixes
  s = s.replace(/^\.\/+/, "");
  s = s.replace(/^public[\\/]/i, "");
  // if it's a bare filename without any slashes, prefix ProductImages
  if (!/[\\/]/.test(s)) s = `ProductImages/${s}`;
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  showDetailsLink?: boolean;
  popularVariant?: boolean;
  listId?: string;
  listName?: string;
  priority?: boolean;
}

const ProductCard = memo(function ProductCard({ product, onClick, showDetailsLink = true, popularVariant = false, listId, listName, priority = false }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  // безопасно достаём локализованный заголовок из product.i18n по текущему языку
  // Важно: в БД используются коды 'ru', 'eng', 'uzb', а в i18n могут быть 'ru', 'en', 'uz'
  const normLangForDB = (lang?: string) => {
    const s = (lang || '').toLowerCase();
    // Нормализуем для поиска в БД (где хранятся 'eng', 'uzb', 'ru')
    if (s === 'en' || s === 'eng') return 'eng';
    if (s === 'uz' || s === 'uzb') return 'uzb';
    return 'ru';
  };
  const dbLocale = normLangForDB(i18n?.language);
  const i18nTitle = (() => {
    const i18nArr = product.i18n;
    if (!Array.isArray(i18nArr)) return undefined;
    // Ищем перевод для текущей локали в формате БД
    const match = i18nArr.find((tr) => tr?.locale === dbLocale);
    // Если нет перевода для текущей локали, используем русский как fallback
    const fallback = i18nArr.find((tr) => tr?.locale === 'ru');
    const title = match?.title ?? fallback?.title ?? i18nArr[0]?.title;
    return typeof title === 'string' && title.trim() ? String(title) : undefined;
  })();

  const titleText =
    (typeof product.title === "string" && product.title.trim()) ||
    (typeof product.name === "string" && product.name.trim()) ||
    (typeof i18nTitle === "string" && i18nTitle.trim()) ||
    (product.slug ? String(product.slug) : "") ||
    t(TRANSLATION_KEYS.unnamed, "Без названия");

  const priceNum = parsePriceUZS(product.price);

  // ЕДИНАЯ ссылка на страницу товара (используем slug категории если доступен)
  const categoryPart =
    (typeof product.category === 'object' ? product.category?.slug : undefined)
    ?? (typeof product.category === 'string' ? product.category : undefined);
  const detailsHref = categoryPart
    ? `/catalog/${encodeURIComponent(String(categoryPart))}/${encodeURIComponent(String(product.slug))}`
    : `/catalog/${encodeURIComponent(String(product.slug))}`;
  

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const primary = (product.image && product.image) || (Array.isArray(product.images) && product.images[0]) || undefined;
    const imageUrl = normalizeImageUrl(primary);
    addItem(product.id, priceNum, titleText, imageUrl);
    try {
      trackAddToCart({
        item_id: product.id,
        item_name: titleText,
        price: priceNum,
        quantity: 1,
        currency: 'UZS',
      });
    } catch {}
  };

  const onQtyChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setQty(digits ? Math.max(1, Number(digits)) : 1);
  };
  const onQtyKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const ok = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "Tab", "Enter"];
    if (ok.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const dec = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setQty((q) => Math.max(1, q - 1)); };
  const inc = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setQty((q) => q + 1); };

  const highlightCls = popularVariant ? 'ring-1 ring-[#660000]/20' : '';
  return (
    <div
      onClick={() => onClick?.(product)}
      className={`group relative bg-white rounded-2xl p-3 md:p-4 border border-gray-200 hover:border-[#660000]/50 hover:bg-gray-50 hover:shadow-md transition-[border-color,background-color,box-shadow] duration-300 ${highlightCls}`}
    >
      {/* изображение */}
      <div className="relative w-full overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <Image
          src={normalizeImageUrl((product.image && product.image) || (Array.isArray(product.images) && product.images[0]) || undefined)}
          alt={`${titleText} — купить в Ташкенте`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 transform-gpu group-hover:scale-105"
          loading={priority ? undefined : "lazy"}
          placeholder="blur"
          blurDataURL={BLUR_DATA}
          quality={75}
          fetchPriority={priority ? "high" : "auto"}
        />
        {/* Быстрое действие: в корзину */}
        <button
          onClick={addToCart}
          aria-label="Add to cart"
          className="absolute top-2 right-2 z-10 rounded-full border border-[#660000] text-[#660000] bg-white/90 backdrop-blur px-3 py-1 text-xs shadow-sm hover:bg-[#660000] hover:text-white transition-colors"
          data-testid="product-card-add"
        >
          +
        </button>
      </div>

      {/* заголовок */}
      <h3
        className="mt-2 font-semibold text-[#660000] line-clamp-3 min-h-[3.6rem] text-[0.9rem] md:text-[0.95rem] leading-tight break-words"
        title={titleText}
      >
        {titleText}
      </h3>

      {/* цена */}
      <div className="mt-1 min-h-[1.2rem] text-xs text-gray-600">
        {priceNum > 0 ? `${priceNum.toLocaleString("ru-UZ")} UZS` : ""}
      </div>

      {/* действия */}
      <div className="mt-3 flex flex-col gap-2">
        {showDetailsLink && (
          <Link
            href={detailsHref}
            className="block w-full text-center rounded-xl border border-gray-300 text-[#660000] py-2 hover:bg-[#660000]/5"
            aria-label={titleText}
            onClick={() => {
              try {
                evSelectItem({
                  items: [{ id: product.id, name: titleText, price: priceNum, quantity: 1, category: typeof product.category === 'object' ? (product.category?.slug || product.category?.name) : (product.category || undefined) }],
                  list_id: listId,
                  list_name: listName,
                });
              } catch {}
            }}
          >
            {t(TRANSLATION_KEYS.viewDetails, "Подробнее")}
          </Link>
        )}

        <button
          onClick={addToCart}
          className="w-full rounded-xl py-2 font-medium bg-[#660000] text-white hover:bg-[#8B0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#660000]/40 transition-colors duration-200"
          data-testid="product-card-add"
        >
          {t(TRANSLATION_KEYS.addToCart, "В корзину")}
        </button>

        <div
          className="pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto w-full flex items-center justify-center">
            <div className="inline-flex items-center rounded-full border border-gray-300 px-2 py-1 text-[#660000]">
              <button
                onClick={dec}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#660000]/5"
                aria-label="Уменьшить количество"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={onQtyChange}
                onKeyDown={onQtyKeyDown}
                className="w-10 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Количество"
              />
              <button
                onClick={inc}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#660000]/5"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
