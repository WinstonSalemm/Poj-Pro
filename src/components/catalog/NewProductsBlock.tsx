// src/components/catalog/NewProductsBlock.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import ProductCard from '@/components/ProductCard/ProductCard';
import type { Product } from '@/types/product';

interface FeaturedProduct {
  id: string;
  slug: string;
  title: string | null;
  summary: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  images: string[];
  image: string | null;
  category: { id: string; slug: string; name: string | null } | null;
  brand: string | null;
  stock: number;
  createdAt: string;
}

interface NewProductsBlockProps {
  type?: 'new' | 'hits' | 'discounts';
  limit?: number;
  title?: string;
  className?: string;
}

export default function NewProductsBlock({
  type = 'new',
  limit = 6,
  title,
  className = '',
}: NewProductsBlockProps) {
  const locale = useLocale();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/products/featured?type=${type}&locale=${locale}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('[NewProductsBlock] API response:', {
          success: data.success,
          productsCount: data.data?.products?.length || 0,
          type: data.data?.type,
          locale: data.data?.locale,
        });

        if (data.success && Array.isArray(data.data?.products)) {
          setProducts(data.data.products);
        } else {
          console.warn('[NewProductsBlock] Invalid response format:', data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, locale, limit]);

  // Преобразуем API формат в формат Product для ProductCard
  const mappedProducts: Product[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title || '',
    name: p.title || '',
    category: p.category?.name || p.category?.slug || '',
    image: p.image || p.images[0] || '',
    images: p.images,
    price: p.price || 0,
    description: p.description || p.summary || '',
    short_description: p.summary || '',
    brand: p.brand || undefined,
    stock: p.stock,
    currency: p.currency || undefined,
  }));

  // Отладка: логируем состояние
  useEffect(() => {
    console.log('[NewProductsBlock]', {
      loading,
      productsCount: products.length,
      mappedCount: mappedProducts.length,
      locale,
      type,
      error,
    });
  }, [loading, products.length, mappedProducts.length, locale, type, error]);

  // Если нет товаров, показываем сообщение вместо скрытия блока
  // (можно вернуть null, если нужно скрывать)
  // if (!loading && mappedProducts.length === 0) {
  //   return null;
  // }

  // Заголовок блока с поддержкой переводов
  const getBlockTitle = () => {
    if (title) return title;

    // Простые заголовки по умолчанию (можно расширить через i18n)
    const titles: Record<string, Record<'ru' | 'eng' | 'uzb', string>> = {
      new: {
        ru: 'Новые товары',
        eng: 'New Products',
        uzb: 'Yangi mahsulotlar',
      },
      hits: {
        ru: 'Хиты продаж',
        eng: 'Best Sellers',
        uzb: 'Sotuvlar yetakchilari',
      },
      discounts: {
        ru: 'Скидки',
        eng: 'Discounts',
        uzb: 'Chegirmalar',
      },
    };

    return titles[type]?.[locale] || titles[type]?.ru || 'Новые товары';
  };

  const blockTitle = getBlockTitle();

  return (
    <section className={`container-section section-y ${className}`} data-testid="new-products-block">
      <h2 className="text-2xl font-semibold text-[#660000] mb-6">
        {blockTitle}
        {process.env.NODE_ENV === 'development' && (
          <span className="ml-2 text-xs text-gray-400">
            (loading: {loading ? 'yes' : 'no'}, products: {products.length}, locale: {locale})
          </span>
        )}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-100 rounded-lg animate-pulse"
              aria-label="Loading product"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">Ошибка загрузки: {error}</div>
      ) : mappedProducts.length === 0 ? (
        <div className="text-gray-500 text-sm py-8 text-center">
          Новых товаров пока нет
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mappedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
