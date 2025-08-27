// src/app/catalog/[category]/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/api"; // твоя функция локали
import T from "@/components/i18n/T";
import Price from "@/components/product/Price";
import QuantityAddToCart from "@/components/Cart/QuantityAddToCart";
import ProductSpecs from "@/components/product/ProductSpecs";
import { SeoHead } from "@/components/seo/SeoHead";
import Breadcrumbs from "@/components/Breadcrumbs";

// Включаем ISR на 60 сек
export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ProductPage({ params }: any) {
  const { id, category } = params; // ← БЕЗ await
  const locale = await getLocale();

  // 1) Тянем товар напрямую из БД по slug (если у тебя id — замени where: { id } )
  const dbProduct = await prisma.product.findUnique({
    where: { slug: id }, // либо where: { id }
    include: {
      category: { select: { id: true, name: true, slug: true } },
      i18n: {
        where: { locale },
        select: { title: true, summary: true, description: true },
      },
    },
  });

  if (!dbProduct) {
    notFound();
  }

  // 2) Парсим images (TEXT может быть JSON-массивом или одиночным URL)
  let images: string[] = [];
  if (typeof dbProduct.images === "string" && dbProduct.images.trim()) {
    try {
      const parsed = JSON.parse(dbProduct.images);
      if (Array.isArray(parsed)) images = parsed.filter(Boolean);
      else images = [dbProduct.images];
    } catch {
      images = [dbProduct.images]; // не JSON — считаем одиночным URL
    }
  }
  const mainImage = images[0] || "/OtherPics/product2photo.jpg";

  // 3) specs (JSON → записи)
  const specsEntries =
    dbProduct.specs && typeof dbProduct.specs === "object"
      ? Object.entries(dbProduct.specs as Record<string, string>)
      : [];

  // 4) Цена: Decimal → number | null
  const priceNumber =
    dbProduct.price != null ? Number(dbProduct.price as unknown as string) : null;

  // 5) i18n поля
  const i18n = dbProduct.i18n[0];
  const title = i18n?.title || dbProduct.slug;
  const summary = i18n?.summary || null;
  const description = i18n?.description || null;

  // 6) Хлебные крошки, SEO и path
  const sitePath = dbProduct.category?.slug
    ? `/catalog/${dbProduct.category.slug}/${dbProduct.slug}`
    : `/catalog/${dbProduct.slug}`;

  const desc = (summary || description || "").toString().slice(0, 160);

  const productLd = {
    "@type": "Product",
    name: title,
    image: images.filter((src) => src && src.startsWith("http")),
    description: summary || description || undefined,
    sku: dbProduct.slug,
    brand: undefined,
    offers:
      typeof priceNumber === "number"
        ? {
            "@type": "Offer",
            priceCurrency: "UZS",
            price: priceNumber,
            availability: "https://schema.org/InStock",
            url: sitePath,
          }
        : undefined,
  } as const;

  return (
    <>
      <SeoHead
        title={`${title} — ${summary ? summary : "Цена в UZS"}`}
        description={desc}
        path={sitePath}
        locale={locale}
        image={mainImage}
        structuredData={productLd}
      />
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Хлебные крошки (UI + JSON-LD) */}
          <Breadcrumbs
            items={[
              { name: "Catalog", href: "/catalog" },
              ...(dbProduct.category
                ? [
                    {
                      name: dbProduct.category.name || "",
                      href: `/catalog/${dbProduct.category.slug}`,
                    },
                  ]
                : []),
              { name: title },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Изображение + кнопки под картинкой */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="relative w-full aspect-[4/3] lg:aspect-square max-h-[60vh]">
                <Image
                  src={mainImage}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              </div>
              {/* Кнопки под изображением (мобайл первым) */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <QuantityAddToCart productId={dbProduct.id} className="flex-1" />
                <Link
                  href={`/catalog/${dbProduct.category?.slug || category}`}
                  className="flex-1 border border-gray-300 rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium !text-[#660000] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#660000]"
                >
                  <T k="common.backToCatalog" />
                </Link>
              </div>
            </div>

            {/* Инфо */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-[#660000] mb-4">
                {title}
              </h1>

              {summary && (
                <p className="text-gray-700 text-lg mb-6">{summary}</p>
              )}

              <div className="mt-6 mb-8">
                <div className="text-3xl font-bold text-[#660000]">
                  <Price price={priceNumber} />
                </div>
              </div>

              <div className="space-y-6">
                {description && (
                  <div>
                    <h2 className="text-lg !text-[#660000] font-semibold mb-2">
                      <T k="productDetail.description" />
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                      {description}
                    </div>
                  </div>
                )}

                {!!specsEntries.length && (
                  <div>
                    <h2 className="text-lg font-semibold !text-[#660000] mb-3">
                      <T k="productDetail.characteristics" />
                    </h2>
                    <ProductSpecs specs={specsEntries} />
                  </div>
                )}
              </div>

              {/* Кнопки перенесены под изображение слева */}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
