"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard/ProductCard";
import { ErrorBoundary } from "react-error-boundary";
import { sortProductsAsc } from "@/lib/sortProducts";

type ProductCharacteristics = Record<
  string,
  string | string[] | number | boolean | undefined
>;

export interface Product {
  id: string | number;
  slug: string;
  title?: string;          // для ProductCard
  name?: string;           // совместимость со старым JSON
  category?: string;
  categorySlug?: string;
  image?: string;
  price: string | number;
  description?: string;
  short_description?: string;
  characteristics?: ProductCharacteristics;
}

const fallbackName = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeLanguage = (lang?: string): "ru" | "en" | "uz" => {
  if (!lang) return "ru";
  const l = lang.toLowerCase();
  if (l.startsWith("en") || l === "eng") return "en";
  if (l.startsWith("uz") || l === "uzb") return "uz";
  return "ru";
};

// нормализация названия категории → slug с подчёркиваниями
const toSlug = (s: string) => {
  const tr: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .replace(/[ъь]/g, "")
    .split("")
    .map((ch) => tr[ch] ?? ch)
    .join("")
    .replace(/[\s\-–—]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div role="alert" className="p-4 bg-red-50 rounded-lg">
    <p className="text-red-700 font-bold">Something went wrong:</p>
    <pre className="text-red-600 whitespace-pre-wrap">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
    >
      Try again
    </button>
  </div>
);

export default function CatalogCategoryPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  // client params
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();

  const rawCategory = decodeURIComponent(params?.category ?? "");
  const categorySlug = useMemo(() => toSlug(rawCategory), [rawCategory]);

  const sort = (searchParams?.get("sort") ??
    "") as "price-asc" | "price-desc" | "name-asc" | "name-desc" | "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const lang = normalizeLanguage(i18n.language);

  // заголовок категории из словаря (или «красивим» slug)
  const categoryTitle = useMemo(() => {
    const dict = t("categories", { returnObjects: true, defaultValue: {} }) as
      | Record<string, string>
      | undefined;
    return dict?.[rawCategory] || fallbackName(rawCategory);
  }, [t, rawCategory]);

  // Загрузка товаров через API
  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);

      try {
        if (!categorySlug) throw new Error("Category is empty");
        if (process.env.NODE_ENV !== "production") {
          console.log("[catalog] locale=%s, category=%s", lang, categorySlug);
        }

        const apiUrl = `/api/categories/${encodeURIComponent(categorySlug)}?locale=${lang}`;
        console.log('Fetching from:', apiUrl);
        
        console.log('Making API request to:', apiUrl);
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }).catch((error: unknown) => {
          console.error('Network error:', error);
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Network error: ${message}`);
        });

        if (!alive) return;
        
        console.log('Response status:', response.status, response.statusText);
        
        // Clone the response before reading it
        const responseClone = response.clone();
        
        if (!response.ok) {
          try {
            const errorData = await responseClone.json().catch(() => ({}));
            console.error('API Error Response:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              error: errorData
            });
            throw new Error(
              errorData?.message || 
              `API request failed with status ${response.status}: ${response.statusText}`
            );
          } catch (e) {
            const errorText = await responseClone.text();
            console.error('Failed to parse error response. Raw response:', errorText, e);
            if (errorText.trim().startsWith('<!DOCTYPE')) {
              throw new Error('Server returned HTML error page. The API route might be misconfigured.');
            }
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 200)}`);
          }
        }

        const data = await response.json();
        const items = data.products || [];

        const formatted: Product[] = items.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          name: item.title,
          category: item.category?.name || "",
          categorySlug: item.category?.slug || categorySlug,
          image: item.image || '',
          price: item.price || 0,
          description: item.description,
          short_description: item.description,
          characteristics: {}
        }));

        setProducts(formatted);
      } catch (e: unknown) {
        if (!alive) return;
        console.error(e);
        const message = e instanceof Error ? e.message : String(e);
        setError(t("errors.loadingProducts") || message || "Failed to load products");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [lang, categorySlug, t]);

  // Поиск
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        (p.title || p.name || "").toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Сортировка
  const sortedProducts = useMemo(() => {
    // Определяем, находимся ли мы в категории огнетушителей
    const effectiveCat = (filteredProducts[0]?.categorySlug || categorySlug || '').toString().toLowerCase();

    // Парсер вместимости огнетушителя из названия/кода модели
    const parseExtWeight = (title?: string): number => {
      if (!title) return Number.POSITIVE_INFINITY;
      const s = title.toLowerCase();
      // Нормализуем запятые в числа
      const norm = s.replace(/,(\d)/g, ".$1");
      // Шаблоны: ОП-2, ОУ-3.5, OP-4, OU-5, 2 кг, 5kg
      const cyr = norm.replace(/[ё]/g, 'e');
      // 1) OP/ОП(з)? или OU/OY/ОУ + '-' + число (например OP(з)-2)
      const m1 = cyr.match(/\b(([oо][pп])|([oо][uuyу]))(?:\([^)]*\))?\s*[-–—]?\s*(\d+(?:\.\d+)?)\b/);
      if (m1) return parseFloat(m1[4]);
      // 2) число + (kg|кг)
      const m2 = cyr.match(/\b(\d+(?:\.\d+)?)\s*(kg|кг)\b/);
      if (m2) return parseFloat(m2[1]);
      // 3) первое число в строке как fallback
      const m3 = cyr.match(/\b(\d+(?:\.\d+)?)\b/);
      if (m3) return parseFloat(m3[1]);
      return Number.POSITIVE_INFINITY;
    };

    // Кастомная сортировка по умолчанию для огнетушителей:
    // 1) Группы в порядке: ОП -> ОУ -> МПП -> прочее (перезарядка входит в «прочее»)
    // 2) Внутри группы по весу (в кг) по возрастанию
    // 3) При равенстве — по названию
    const isExtinguishers = /extinguisher/.test(effectiveCat) || /ognetush/.test(effectiveCat);

    const parseTypeRank = (title?: string): number => {
      if (!title) return 3;
      const s = title.toLowerCase();
      // Нормализуем тире и пробелы
      const norm = s.replace(/[–—]/g, '-');
      // Типы: ОП/OP, ОУ/OU/OY, МПП/ММП/MPP, прочее
      if (/(^|\b)(op|о\s*п)(\b|\()/.test(norm)) return 0; // ОП / OP (включая ОП(з))
      if (/(^|\b)(ou|oy|о\s*у)\b|(^|\b)о[\s-]*у\b/.test(norm)) return 1; // ОУ / OU / OY
      if (/(^|\b)(mpp|mmpp|ммп|мпп)\b|(^|\b)мпп\b|(^|\b)ммп\b/.test(norm)) return 2; // МПП / ММП / MPP
      // Перезарядка теперь без отдельного приоритета — пойдёт в «прочее»
      return 3; // прочее
    };

    const withDefaultSort = isExtinguishers
      ? [...filteredProducts].sort((a, b) => {
          const ta = parseTypeRank(a.title || a.name);
          const tb = parseTypeRank(b.title || b.name);
          if (ta !== tb) return ta - tb;

          const wa = parseExtWeight(a.title || a.name);
          const wb = parseExtWeight(b.title || b.name);

          // Для ОП применяем приоритетный порядок по списку размеров (как вы попросили)
          if (ta === 0) {
            const order = [2, 3, 4, 5, 6, 8, 10, 20, 25, 30, 35, 40, 50, 70, 100];
            const ia = order.indexOf(wa);
            const ib = order.indexOf(wb);
            const aa: [number, number, number, string] = [ia === -1 ? 1 : 0, ia === -1 ? Number.POSITIVE_INFINITY : ia, wa, (a.title || a.name || '')];
            const bb: [number, number, number, string] = [ib === -1 ? 1 : 0, ib === -1 ? Number.POSITIVE_INFINITY : ib, wb, (b.title || b.name || '')];
            if (aa[0] !== bb[0]) return aa[0] - bb[0];
            if (aa[1] !== bb[1]) return aa[1] - bb[1];
            if (aa[2] !== bb[2]) return aa[2] - bb[2];
            return aa[3].localeCompare(bb[3]);
          }

          // Для ОУ/OY и МПП/ММП — просто по весу по возрастанию
          if (wa !== wb) return wa - wb;
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        })
      : sortProductsAsc(filteredProducts);
    
    // Если выбран другой тип сортировки - применяем его поверх кастомной
    if (!sort) return withDefaultSort;
    
    return [...withDefaultSort].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case "price-desc":
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case "name-asc":
          return (a.title || a.name || "").localeCompare(b.title || b.name || "");
        case "name-desc":
          return (b.title || b.name || "").localeCompare(a.title || a.name || "");
        default:
          return 0;
      }
    });
  }, [filteredProducts, sort]);

  const handleResetError = useCallback(() => {
    setError(null);
    setLoading(true);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleResetError}>
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="max-w-[1280px] mx-auto px-4 py-10 mt-[100px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#660000]">
              {categoryTitle}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow max-w-[400px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t("search.placeholder", "Search products...")}
                  className="w-full px-4 py-2.5 text-[#660000] rounded-xl border border-[#660000] bg-white hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-opacity-50 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#660000] hover:text-[#4d0000]"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                className="px-6 py-2.5 text-[#660000] rounded-xl border border-[#660000] bg-white hover:bg-[#fafafa] hover:shadow-md transition-all duration-200 whitespace-nowrap flex items-center justify-center cursor-pointer gap-2"
                onClick={() => router.push("/catalog")}
              >
                <span>←</span>
                <span>{t("catalog.backToCategories", "Back to Categories")}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#660000]" />
            </div>
          ) : error ? (
            <div className="max-w-2xl bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              <div className="font-semibold mb-1">
                {t("errors.loadingError", "Loading Error")}
              </div>
              <p className="whitespace-pre-wrap text-sm">{error}</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                {t("catalog.noProductsFound", "No products found.")}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-[#660000] hover:underline"
                >
                  {t("search.clearSearch", "Clear search")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={`${product.id}-${lang}`} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </ErrorBoundary>
  );
}
