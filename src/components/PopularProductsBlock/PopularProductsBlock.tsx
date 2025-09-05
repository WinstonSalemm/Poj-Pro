import ProductCard from "@/components/ProductCard/ProductCard";
import data from "@/components/PopularProductsBlock/popular.json";
import { getDictionary, type Locale } from "@/i18n/server";
import type { Product } from "@/types/product";

// Define the shape of the items in the local JSON data
type ManualItem = {
  id: string | number;
  slug: string;
  category: string;
  titles: { ru: string; en: string; uz: string };
  image?: string;
  price?: number | string;
};

// This is now a server component
export default async function PopularProductsBlock({ locale }: { locale: Locale }) {
  const dictionary = await getDictionary(locale);

  // Process product data on the server
  const products: Product[] = (data as ManualItem[]).map((item) => {
    const title = item.titles[locale] ?? item.titles.ru;
    return {
      id: item.id,
      slug: item.slug,
      title,
      name: title,
      image: item.image || "/placeholder-product.jpg",
      price: typeof item.price === "string" ? Number(item.price) || 0 : item.price ?? 0,
      category: item.category,
    } as Product;
  });

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
