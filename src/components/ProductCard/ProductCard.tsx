"use client";

import Link from "next/link";
import Image from "next/image";
import { IMG_SIZES } from '@/lib/imageSizes';
import { memo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "react-i18next";
import type { Product as CanonicalProduct } from "@/types/product";
import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import cls from './ProductCard.module.css';

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

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  showDetailsLink?: boolean;
}

const ProductCard = memo(function ProductCard({ product, onClick, showDetailsLink = true }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  // безопасно достаём локализованный заголовок из product.i18n по текущему языку
  const normLang = (lang?: string) => {
    const s = (lang || '').toLowerCase();
    if (s === 'en' || s === 'eng') return 'en';
    if (s === 'uz' || s === 'uzb') return 'uz';
    return 'ru';
  };
  const currentLang = normLang(i18n?.language);
  const i18nTitle = (() => {
    const i18nArr = product.i18n;
    if (!Array.isArray(i18nArr)) return undefined;
    const match = i18nArr.find((tr) => tr?.locale === currentLang);
    const title = match?.title ?? i18nArr[0]?.title;
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
    const imageUrl = product.image || '/OtherPics/placeholder.png';
    addItem(product.id, priceNum, titleText, imageUrl);
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

  const priceStr = formatUZS(product.price);

  return (
    <Card className={cls.card} data-testid="product-card">
      <div onClick={() => onClick?.(product)} className={cls.root}>
        {/* image */}
        <Link href={detailsHref} aria-label={titleText} className={cls.imgWrap}>
          <div className="aspect-square">
            <Image
              src={product.image || '/OtherPics/placeholder.png'}
              alt={titleText}
              fill
              sizes={IMG_SIZES.card}
              priority={false}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </Link>

        <div className={cls.body}>
          <h3 className={cls.title}>{titleText}</h3>
          <div className={cls.price}>{priceStr}</div>
          <div className={cls.actions}>
            {showDetailsLink && (
              <Link href={detailsHref} aria-label={titleText} className={cls.detailsLink}>
                <Button variant="secondary">{t(TRANSLATION_KEYS.viewDetails, "Подробнее")}</Button>
              </Link>
            )}
            <div className={cls.qtyRow} onClick={(e) => e.stopPropagation()}>
              <button onClick={dec} className={cls.qtyBtn} aria-label="Уменьшить количество">−</button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={onQtyChange}
                onKeyDown={onQtyKeyDown}
                className={cls.qtyInput}
                aria-label="Количество"
              />
              <button onClick={inc} className={cls.qtyBtn} aria-label="Увеличить количество">+</button>
            </div>
            <Button onClick={addToCart} variant="primary">{t(TRANSLATION_KEYS.addToCart, "В корзину")}</Button>
          </div>
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;

function formatUZS(val?: string | number) {
  if (val == null) return "";
  const n = typeof val === "number" ? val : Number(String(val).replace(/[^\d]/g, ""));
  return n ? new Intl.NumberFormat("ru-RU").format(n).replace(/\s/g, "\u00A0") + " UZS" : "";
}
