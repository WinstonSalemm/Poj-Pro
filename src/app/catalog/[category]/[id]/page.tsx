import Image from "next/image";
import Link from "next/link";
import { notFound } from 'next/navigation';
import { fetchAPI, getLocale } from '@/lib/api';
import T from '@/components/i18n/T';
import Price from '@/components/product/Price';
import QuantityAddToCart from '@/components/Cart/QuantityAddToCart';
import ProductSpecs from '@/components/product/ProductSpecs';
import { SeoHead } from '@/components/seo/SeoHead';
import Breadcrumbs from '@/components/Breadcrumbs';

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  summary: string | null;
  price: number | null;
  images: string[];
  specs: Record<string, string>;
  category: ProductCategory | null;
}

// Fetch product data
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const locale = await getLocale();
    const { data, error } = await fetchAPI<Product>(`/api/products/${encodeURIComponent(slug)}?locale=${locale}`);
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error in getProduct:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  // Get the product data
  const { id, category } = await params;
  const product = await getProduct(id);
  
  // Handle case where product is not found
  if (!product) {
    notFound();
  }

  // Get the first image or use a placeholder
  const mainImage = product.images?.[0] || '/OtherPics/product2photo.jpg';
  const specs = Object.entries(product.specs || {});
  const sitePath = product.category?.slug
    ? `/catalog/${product.category.slug}/${product.slug}`
    : `/catalog/${product.slug}`;
  const desc = (product.summary || product.description || '').toString().slice(0, 160);
  const priceNumber = typeof product.price === 'number' ? product.price : null;

  const productLd = {
    '@type': 'Product',
    name: product.title,
    image: product.images?.map((src) => src.startsWith('http') ? src : undefined).filter(Boolean),
    description: product.summary || product.description || undefined,
    sku: product.slug,
    brand: undefined,
    offers: priceNumber ? {
      '@type': 'Offer',
      priceCurrency: 'UZS',
      price: priceNumber,
      availability: 'https://schema.org/InStock',
      url: sitePath,
    } : undefined,
  } as const;

  return (
    <>
      <SeoHead
        title={`${product.title} — ${product.summary ? product.summary : 'Цена в UZS'}`}
        description={desc}
        path={sitePath}
        locale={await getLocale()}
        image={mainImage}
        structuredData={productLd}
      />
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs (UI + JSON-LD) */}
          <Breadcrumbs
            items={[
              { name: 'Catalog', href: '/catalog' },
              ...(product.category ? [{ name: product.category.name, href: `/catalog/${product.category.slug}` }] : []),
              { name: product.title },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="relative w-full aspect-square">
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-[#660000] mb-4">
                {product.title}
              </h1>

              {product.summary && (
                <p className="text-gray-700 text-lg mb-6">{product.summary}</p>
              )}

              <div className="mt-6 mb-8">
                <div className="text-3xl font-bold text-[#660000]"><Price price={product.price} /></div>
              </div>

              <div className="space-y-6">
                {product.description && (
                  <div>
                    <h2 className="text-lg !text-[#660000] font-semibold mb-2"><T k="productDetail.description" /></h2>
                    <div className="prose max-w-none text-gray-700">
                      {product.description}
                    </div>
                  </div>
                )}

                {specs.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold !text-[#660000] mb-3"><T k="productDetail.characteristics" /></h2>
                    <ProductSpecs specs={specs} />
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <QuantityAddToCart productId={product.id} className="flex-1" />
                <Link
                  href={`/catalog/${product.category?.slug || category}`}
                  className="flex-1 border border-gray-300 rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium !text-[#660000] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#660000]"
                >
                  <T k="common.backToCatalog" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
