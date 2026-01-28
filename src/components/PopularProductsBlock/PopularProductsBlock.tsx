import ProductCard from "@/components/ProductCard/ProductCard";
import { getDictionary, type Locale } from "@/i18n/server";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

// This is now a server component
export default async function PopularProductsBlock({ locale }: { locale: Locale }) {
  const dictionary = await getDictionary(locale);

  // Нормализуем локаль для БД (в БД: 'ru', 'eng', 'uzb')
  const dbLocale = locale === 'en' ? 'eng' : locale === 'uz' ? 'uzb' : 'ru';

  // Загружаем популярные товары из базы данных
  const popularProducts = await prisma.popularProduct.findMany({
    where: {
      product: {
        isActive: true,
      },
    },
    include: {
      product: {
        include: {
          i18n: {
            where: { locale: dbLocale },
            select: { locale: true, title: true, summary: true, description: true },
          },
          category: { select: { id: true, slug: true, name: true } },
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { order: 'asc' },
    take: 6, // Максимум 6 популярных товаров
  });

  // Преобразуем данные в формат Product
  const products: Product[] = popularProducts.map((pp) => {
    const product = pp.product;
    const i18nTitle = product.i18n[0]?.title || product.slug;
    
    return {
      id: product.id,
      slug: product.slug,
      title: i18nTitle,
      name: i18nTitle,
      image: product.images[0]?.url || undefined,
      images: product.images.map((img) => img.url),
      price: product.price ? Number(product.price) : 0,
      category: product.category ? {
        id: product.category.id,
        slug: product.category.slug,
        name: product.category.name || product.category.slug,
      } : undefined,
      i18n: product.i18n.map((i) => ({
        locale: i.locale,
        title: i.title,
        summary: i.summary || undefined,
        description: i.description || undefined,
      })),
    } as Product;
  });

  // Если нет популярных товаров, не показываем блок
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#660000] mb-8">
          {dictionary.popularProducts.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.slug}>
              <ProductCard product={p} showDetailsLink={false} popularVariant />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
